import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { X, Layers, AlertCircle, Calculator, CheckCircle2 } from 'lucide-react';

export const CreateOrderModal = ({ isOpen, onClose, onOrderCreated }) => {
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState('');
  const [targetQty, setTargetQty] = useState('50');
  const [fabricRollId, setFabricRollId] = useState('FAB-ROLL-882');
  const [actualFabricYds, setActualFabricYds] = useState('92.5');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      api.getRecipes()
        .then((data) => {
          setRecipes(data);
          if (data.length > 0 && !selectedRecipeId) {
            setSelectedRecipeId(data[0].id.toString());
          }
        })
        .catch((err) => {
          setError('Failed to load recipes: ' + err.message);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentRecipe = recipes.find((r) => r.id.toString() === selectedRecipeId);

  // Validate defensive input guards (Section 11)
  const validate = () => {
    const errors = {};
    if (!selectedRecipeId) errors.recipe = 'Please select a production recipe';

    if (!targetQty || !/^\d+$/.test(targetQty) || parseInt(targetQty, 10) <= 0) {
      errors.targetQty = 'Target batch quantity must be a positive whole number';
    }

    if (!fabricRollId.trim()) {
      errors.fabricRollId = 'Fabric Roll ID is required (e.g. FAB-ROLL-882)';
    }

    if (!actualFabricYds || isNaN(parseFloat(actualFabricYds)) || parseFloat(actualFabricYds) <= 0) {
      errors.actualFabricYds = 'Actual fabric used must be a positive number in yards';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        recipe_id: parseInt(selectedRecipeId, 10),
        target_qty: parseInt(targetQty, 10),
        fabric_roll_id: fabricRollId.trim(),
        actual_fabric_yds: parseFloat(actualFabricYds)
      };

      const result = await api.createOrder(payload);
      onOrderCreated(result.order);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create cutting order');
    } finally {
      setLoading(false);
    }
  };

  const parsedQty = parseInt(targetQty, 10) || 0;
  const expectedFabric = currentRecipe && parsedQty > 0 ? (parsedQty * currentRecipe.std_fabric_yards).toFixed(2) : '0';

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '680px' }}>
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={20} color="#1e40af" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
              Create New Cutting Batch
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="card-body" style={{ overflowY: 'auto', flex: 1, maxHeight: 'calc(90vh - 140px)' }}>
            {error && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                backgroundColor: '#fef2f2',
                border: '1px solid #fca5a5',
                borderRadius: '6px',
                color: '#991b1b',
                fontSize: '0.875rem',
                marginBottom: '1rem'
              }}>
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {/* Recipe Selection */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label htmlFor="recipe-select" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.375rem' }}>
                Production Recipe (Bill of Materials) *
              </label>
              <select
                id="recipe-select"
                value={selectedRecipeId}
                onChange={(e) => setSelectedRecipeId(e.target.value)}
              >
                {recipes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.recipe_code}) — Category: {r.category} | Std: {r.std_fabric_yards} yds/pc | Cap: {r.wastage_cap}%
                  </option>
                ))}
              </select>
              {fieldErrors.recipe && <p className="error-text">{fieldErrors.recipe}</p>}
            </div>

            {/* Batch Inputs Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label htmlFor="target-qty" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.375rem' }}>
                  Target Batch Quantity (units) *
                </label>
                <input
                  id="target-qty"
                  type="text"
                  inputMode="numeric"
                  placeholder="e.g. 50"
                  value={targetQty}
                  onChange={(e) => setTargetQty(e.target.value)}
                />
                {fieldErrors.targetQty && <p className="error-text">{fieldErrors.targetQty}</p>}
              </div>

              <div>
                <label htmlFor="fabric-roll" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.375rem' }}>
                  Fabric Roll ID *
                </label>
                <input
                  id="fabric-roll"
                  type="text"
                  placeholder="e.g. FAB-ROLL-882"
                  value={fabricRollId}
                  onChange={(e) => setFabricRollId(e.target.value)}
                />
                {fieldErrors.fabricRollId && <p className="error-text">{fieldErrors.fabricRollId}</p>}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="fabric-yards" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.375rem' }}>
                Actual Fabric Used (yards) *
              </label>
              <input
                id="fabric-yards"
                type="number"
                step="0.01"
                placeholder="e.g. 92.50"
                value={actualFabricYds}
                onChange={(e) => setActualFabricYds(e.target.value)}
              />
              <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                Expected Fabric: <strong>{expectedFabric} yards</strong> ({parsedQty} units × {currentRecipe?.std_fabric_yards || 0} yds/pc)
              </span>
              {fieldErrors.actualFabricYds && <p className="error-text">{fieldErrors.actualFabricYds}</p>}
            </div>

            {/* DYNAMIC COMPONENT MULTIPLIER ENGINE PREVIEW */}
            {currentRecipe && currentRecipe.components && (
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1.5px solid #e2e8f0',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.75rem', color: '#1e40af', fontWeight: 700, fontSize: '0.875rem' }}>
                  <Calculator size={16} />
                  <span>Dynamic Component Multiplier Engine (Real-Time BOM Derivation)</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {currentRecipe.components.map((c) => {
                    const expectedParts = parsedQty * c.pieces_per_garment;
                    return (
                      <div
                        key={c.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          backgroundColor: '#ffffff',
                          padding: '0.5rem 0.75rem',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.85rem'
                        }}
                      >
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>
                          {c.component_name} <span style={{ color: '#64748b', fontWeight: 400 }}>({c.pieces_per_garment} pcs/garment)</span>
                        </span>
                        <span className="mono" style={{ fontWeight: 700, color: '#1e40af', backgroundColor: '#eff6ff', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                          {expectedParts} pcs expected
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="card-header" style={{ justifyContent: 'flex-end', gap: '0.75rem', backgroundColor: '#ffffff' }}>
            <button type="button" onClick={onClose} className="btn btn-outline" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting Order...' : 'Submit to QC Terminal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
