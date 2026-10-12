import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Save,
  Check,
  Ban,
  FileText,
  HelpCircle,
  Layers
} from 'lucide-react';

export const VerifierTerminal = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [countsMap, setCountsMap] = useState({});
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [savingCounts, setSavingCounts] = useState(false);
  const [processingDecision, setProcessingDecision] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Rejection modal state
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionNote, setRejectionNote] = useState('');
  const [rejectionError, setRejectionError] = useState('');

  const fetchPendingOrders = async () => {
    setLoadingOrders(true);
    try {
      const data = await api.getOrders('PENDING_VERIFICATION');
      setOrders(data);
      if (data.length > 0 && !selectedOrderId) {
        setSelectedOrderId(data[0].id);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch pending verification orders');
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchPendingOrders();
  }, []);

  const loadOrderDetail = async (id) => {
    setLoadingDetail(true);
    setError('');
    setSuccessMsg('');
    try {
      const data = await api.getOrder(id);
      setCurrentOrder(data);

      // Populate countsMap from items
      const map = {};
      data.items.forEach((item) => {
        map[item.component_id] = item.actual_qty !== null && item.actual_qty !== undefined
          ? item.actual_qty.toString()
          : '';
      });
      setCountsMap(map);
    } catch (err) {
      setError(err.message || 'Failed to fetch batch details');
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    if (selectedOrderId) {
      loadOrderDetail(selectedOrderId);
    }
  }, [selectedOrderId]);

  const handleCountChange = (componentId, value) => {
    // Defensive input guard: reject negative values
    if (value !== '' && !/^\d+$/.test(value)) return;
    setCountsMap((prev) => ({
      ...prev,
      [componentId]: value
    }));
  };

  // Evaluate traffic light status for a component
  const getComponentStatus = (item) => {
    const rawVal = countsMap[item.component_id];
    if (rawVal === '' || rawVal === undefined) return 'UNCOUNTED';
    const actual = parseInt(rawVal, 10);
    const expected = item.expected_qty;

    if (actual === expected) return 'GREEN';
    if (actual > expected) return 'YELLOW';
    return 'RED'; // Shortage
  };

  // Check if any component has a shortage or is uncounted
  const checkGatekeeperStatus = () => {
    if (!currentOrder || !currentOrder.items || currentOrder.items.length === 0) {
      return { canApprove: false, reason: 'No components in order' };
    }

    let hasUncounted = false;
    let hasShortage = false;

    for (const item of currentOrder.items) {
      const status = getComponentStatus(item);
      if (status === 'UNCOUNTED') hasUncounted = true;
      if (status === 'RED') hasShortage = true;
    }

    if (hasUncounted) {
      return { canApprove: false, reason: 'All cut parts must have verified physical counts entered' };
    }
    if (hasShortage) {
      return { canApprove: false, reason: 'DEFECT SHORTAGE DETECTED: Batch cannot enter Sewing Queue with component shortages' };
    }

    return { canApprove: true, reason: 'All components match or exceed expected counts' };
  };

  const gatekeeper = checkGatekeeperStatus();

  // Save counts to server (PUT /orders/:id/counts)
  const handleSaveCounts = async () => {
    if (!currentOrder) return;
    setSavingCounts(true);
    setError('');
    setSuccessMsg('');

    try {
      const countsPayload = currentOrder.items.map((item) => {
        const val = countsMap[item.component_id];
        return {
          component_id: item.component_id,
          actual_qty: val !== '' ? parseInt(val, 10) : 0
        };
      });

      await api.updateCounts(currentOrder.id, countsPayload);
      setSuccessMsg('Physical component counts saved successfully!');
      // Reload order detail to sync server state
      await loadOrderDetail(currentOrder.id);
    } catch (err) {
      setError(err.message || 'Failed to save component counts');
    } finally {
      setSavingCounts(false);
    }
  };

  // Approve batch (POST /orders/:id/approve)
  const handleApprove = async () => {
    if (!gatekeeper.canApprove || !currentOrder) return;
    setProcessingDecision(true);
    setError('');
    setSuccessMsg('');

    try {
      // First ensure latest counts are saved
      await handleSaveCounts();

      const result = await api.approveOrder(currentOrder.id);
      setSuccessMsg(`Batch successfully verified! Released to Sewing Queue (Fabric Wastage: ${result.wastage_pct}%).`);
      // Refresh pending orders list
      await fetchPendingOrders();
      if (orders.length > 1) {
        const nextOrder = orders.find((o) => o.id !== currentOrder.id);
        if (nextOrder) setSelectedOrderId(nextOrder.id);
      } else {
        setSelectedOrderId(null);
        setCurrentOrder(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to approve batch');
    } finally {
      setProcessingDecision(false);
    }
  };

  // Reject batch (POST /orders/:id/reject)
  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    setRejectionError('');

    if (!rejectionNote.trim()) {
      setRejectionError('A rejection note is mandatory under factory QC standard operating procedures');
      return;
    }

    setProcessingDecision(true);
    try {
      await api.rejectOrder(currentOrder.id, rejectionNote.trim());
      setIsRejectModalOpen(false);
      setRejectionNote('');
      setSuccessMsg('Batch rejected and returned to Cutting Supervisor with defect note.');
      await fetchPendingOrders();
      if (orders.length > 1) {
        const nextOrder = orders.find((o) => o.id !== currentOrder.id);
        if (nextOrder) setSelectedOrderId(nextOrder.id);
      } else {
        setSelectedOrderId(null);
        setCurrentOrder(null);
      }
    } catch (err) {
      setRejectionError(err.message || 'Failed to reject batch');
    } finally {
      setProcessingDecision(false);
    }
  };

  return (
    <div className="main-content">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#d97706' }}>
              Quality Control Station
            </span>
            <span style={{ color: '#94a3b8' }}>•</span>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Traffic-Light Matrix & Hard-Stop Gatekeeper</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.025em' }}>
            Cutting Verification Terminal
          </h1>
        </div>

        <button onClick={fetchPendingOrders} className="btn btn-outline" title="Refresh Pending Orders">
          <RefreshCw size={16} /> Refresh Queue
        </button>
      </div>

      {error && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#fef2f2',
          border: '1px solid #fca5a5',
          borderRadius: '8px',
          color: '#991b1b',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#ecfdf5',
          border: '1px solid #a7f3d0',
          borderRadius: '8px',
          color: '#065f46',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <CheckCircle2 size={20} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Grid: Queue on Left, Verification Terminal on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 2.5fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left Column: Pending Orders List */}
        <div className="card">
          <div className="card-header">
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
              Awaiting Verification ({orders.length})
            </span>
          </div>
          <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '70vh', overflowY: 'auto' }}>
            {loadingOrders ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b', fontSize: '0.875rem' }}>
                Scanning QC queue...
              </div>
            ) : orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#64748b', fontSize: '0.875rem' }}>
                <CheckCircle2 size={32} color="#10b981" style={{ margin: '0 auto 0.5rem' }} />
                No batches pending QC. All current cutting orders verified!
              </div>
            ) : (
              orders.map((ord) => {
                const isSelected = selectedOrderId === ord.id;
                return (
                  <button
                    key={ord.id}
                    onClick={() => setSelectedOrderId(ord.id)}
                    style={{
                      border: '1.5px solid',
                      borderColor: isSelected ? '#1e40af' : '#e2e8f0',
                      backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                      borderRadius: '8px',
                      padding: '0.875rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="mono" style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>
                        {ord.order_no}
                      </span>
                      <span className="badge badge-pending" style={{ fontSize: '0.65rem' }}>
                        Pending
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginTop: '0.25rem' }}>
                      {ord.recipe_name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                      Target: {ord.target_qty} units • Roll: {ord.fabric_roll_id}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Physical Verification Workspace */}
        {currentOrder ? (
          <div className="card">
            <div className="card-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="mono" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                    {currentOrder.order_no}
                  </span>
                  <span className="badge badge-pending">QC Station In-Progress</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
                  Recipe: <strong>{currentOrder.recipe_name}</strong> ({currentOrder.recipe_code}) • Target Batch: <strong>{currentOrder.target_qty} garments</strong>
                </div>
              </div>

              <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#64748b' }}>
                <div>Fabric Roll: <strong className="mono">{currentOrder.fabric_roll_id}</strong></div>
                <div>Actual Used: <strong>{currentOrder.actual_fabric_yds} yds</strong></div>
              </div>
            </div>

            <div className="card-body">
              {/* Gatekeeper Hard Stop Banner */}
              <div style={{
                padding: '1rem 1.25rem',
                borderRadius: '8px',
                border: '1.5px solid',
                borderColor: gatekeeper.canApprove ? '#10b981' : '#ef4444',
                backgroundColor: gatekeeper.canApprove ? '#ecfdf5' : '#fef2f2',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {gatekeeper.canApprove ? (
                    <CheckCircle2 size={24} color="#059669" />
                  ) : (
                    <ShieldAlert size={24} color="#dc2626" />
                  )}
                  <div>
                    <div style={{
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      color: gatekeeper.canApprove ? '#065f46' : '#991b1b'
                    }}>
                      {gatekeeper.canApprove ? 'GATEKEEPER GATE CLEAR: Ready for Release' : 'SERVER-ENFORCED HARD STOP ACTIVE'}
                    </div>
                    <div style={{
                      fontSize: '0.825rem',
                      color: gatekeeper.canApprove ? '#047857' : '#b91c1c'
                    }}>
                      {gatekeeper.reason}
                    </div>
                  </div>
                </div>

                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '9999px',
                  backgroundColor: gatekeeper.canApprove ? '#d1fae5' : '#fee2e2',
                  color: gatekeeper.canApprove ? '#065f46' : '#991b1b'
                }}>
                  {gatekeeper.canApprove ? 'APPROVAL PERMITTED' : 'APPROVAL BLOCKED'}
                </span>
              </div>

              {/* Component Counting Table */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                    Component-by-Component Physical Part Verification
                  </h4>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Traffic light flags derived automatically on piece entry
                  </span>
                </div>

                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Cut Part Component</th>
                        <th>Pieces / Garment</th>
                        <th>Expected Pieces</th>
                        <th style={{ width: '160px' }}>Actual Count</th>
                        <th>QC Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentOrder.items?.map((item) => {
                        const status = getComponentStatus(item);
                        const actualVal = countsMap[item.component_id] || '';

                        return (
                          <tr key={item.id}>
                            <td>
                              <span style={{ fontWeight: 600, color: '#0f172a' }}>
                                {item.component_name}
                              </span>
                            </td>
                            <td>
                              <span className="mono">{item.pieces_per_garment} pcs/unit</span>
                            </td>
                            <td>
                              <span className="mono" style={{ fontWeight: 700, color: '#1e40af' }}>
                                {item.expected_qty} pcs
                              </span>
                            </td>
                            <td>
                              <input
                                type="text"
                                inputMode="numeric"
                                placeholder="0"
                                value={actualVal}
                                onChange={(e) => handleCountChange(item.component_id, e.target.value)}
                                style={{
                                  fontWeight: 700,
                                  fontSize: '1rem',
                                  textAlign: 'center',
                                  padding: '0.45rem'
                                }}
                              />
                            </td>
                            <td>
                              {status === 'GREEN' && (
                                <span className="badge badge-green">
                                  <Check size={12} /> Green (Match)
                                </span>
                              )}
                              {status === 'YELLOW' && (
                                <span className="badge badge-yellow">
                                  <AlertTriangle size={12} /> Yellow (Excess)
                                </span>
                              )}
                              {status === 'RED' && (
                                <span className="badge badge-red">
                                  <Ban size={12} /> Red (Shortage)
                                </span>
                              )}
                              {status === 'UNCOUNTED' && (
                                <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#64748b' }}>
                                  Uncounted
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Bar */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid #e2e8f0',
                paddingTop: '1.25rem',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <button
                  type="button"
                  onClick={handleSaveCounts}
                  className="btn btn-outline"
                  disabled={savingCounts || processingDecision}
                >
                  <Save size={16} /> {savingCounts ? 'Saving...' : 'Save Physical Counts'}
                </button>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {/* Reject Batch Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setRejectionError('');
                      setIsRejectModalOpen(true);
                    }}
                    className="btn btn-danger"
                    disabled={processingDecision}
                  >
                    <XCircle size={16} /> Reject Batch
                  </button>

                  {/* Approve Batch Button (Disabled strictly when gatekeeper blocks) */}
                  <button
                    type="button"
                    onClick={handleApprove}
                    className="btn btn-success"
                    disabled={!gatekeeper.canApprove || processingDecision}
                    id="btn-approve-batch"
                    title={!gatekeeper.canApprove ? gatekeeper.reason : 'Approve batch and hand off to Sewing Queue'}
                  >
                    <CheckCircle2 size={16} /> {processingDecision ? 'Releasing...' : 'Approve Batch (Pass QC)'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="card" style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>
            <Layers size={48} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#334155' }}>
              No Batch Selected
            </h3>
            <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Select a cutting batch from the pending queue on the left to perform component physical counts.
            </p>
          </div>
        )}
      </div>

      {/* Mandatory Rejection Reason Modal */}
      {isRejectModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="card-header" style={{ backgroundColor: '#fef2f2', borderBottomColor: '#fee2e2' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#991b1b', fontWeight: 700 }}>
                <AlertTriangle size={20} />
                <span>Reject Batch & Return to Supervisor</span>
              </div>
            </div>

            <form onSubmit={handleRejectSubmit}>
              <div className="card-body">
                <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '1rem' }}>
                  Under factory quality control SOP, rejecting a cutting batch requires a mandatory reason note documenting component shortages or defect observations:
                </p>

                {rejectionError && (
                  <p className="error-text" style={{ marginBottom: '0.75rem' }}>
                    {rejectionError}
                  </p>
                )}

                <div style={{ marginBottom: '1rem' }}>
                  <label htmlFor="rejection-note" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.375rem' }}>
                    Mandatory Rejection Note *
                  </label>
                  <textarea
                    id="rejection-note"
                    rows="4"
                    placeholder="e.g. Defect shortage: Cuffs short by 5 pcs due to fabric roll flaw. Returned for re-cutting."
                    value={rejectionNote}
                    onChange={(e) => setRejectionNote(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="card-header" style={{ justifyContent: 'flex-end', gap: '0.75rem', backgroundColor: '#ffffff' }}>
                <button
                  type="button"
                  onClick={() => setIsRejectModalOpen(false)}
                  className="btn btn-outline"
                  disabled={processingDecision}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-danger"
                  disabled={processingDecision}
                >
                  {processingDecision ? 'Submitting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
