import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Factory,
  Play,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  UserCheck,
  TrendingDown,
  TrendingUp,
  Percent,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const SewingQueue = () => {
  const { user } = useAuth();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [startingId, setStartingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const fetchSewingQueue = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getSewingQueue();
      setQueue(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch sewing queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSewingQueue();
  }, []);

  const handleStartSewing = async (orderId) => {
    setStartingId(orderId);
    setError('');
    setSuccessMsg('');

    try {
      const result = await api.startSewing(orderId);
      setSuccessMsg(`Assembly line successfully started for Order ${result.order?.order_no || orderId}!`);
      // Refresh sewing queue
      await fetchSewingQueue();
    } catch (err) {
      setError(err.message || 'Failed to initiate sewing assembly');
    } finally {
      setStartingId(null);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="main-content">
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#059669' }}>
              Assembly Floor Gate
            </span>
            <span style={{ color: '#94a3b8' }}>•</span>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>QC-Verified Cut Part Gatekeeper Queue</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.025em' }}>
            Sewing Queue Terminal
          </h1>
        </div>

        <button onClick={fetchSewingQueue} className="btn btn-outline" title="Refresh Queue">
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

      {/* Security Isolation Notice */}
      <div style={{
        padding: '0.875rem 1.25rem',
        borderRadius: '8px',
        backgroundColor: '#f0fdf4',
        border: '1px solid #bbf7d0',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <Factory size={20} color="#059669" />
        <div style={{ fontSize: '0.85rem', color: '#166534' }}>
          <strong>Query Isolation Active:</strong> Only verified batches (`status = 'VERIFIED'`) released by QC Cutting Verifiers can enter the Sewing Floor. Unverified, pending, or rejected batches are strictly isolated at the database level.
        </div>
      </div>

      {/* Queue Table Card */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#0f172a' }}>
              Batches Released to Sewing Floor ({queue.length})
            </span>
          </div>
          <span className="badge badge-green">Ready for Production</span>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3.5rem', color: '#64748b' }}>
              Querying isolated sewing queue from database...
            </div>
          ) : queue.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem', color: '#64748b' }}>
              <CheckCircle2 size={40} color="#10b981" style={{ margin: '0 auto 0.75rem' }} />
              <div style={{ fontWeight: 600, color: '#334155', fontSize: '1.05rem' }}>
                No verified batches waiting in queue.
              </div>
              <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                Batches must first be cut by the Cutting Supervisor and approved in the Verifier Terminal.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {queue.map((order) => {
                const isExpanded = expandedId === order.id;
                const wastage = order.wastage_pct !== null && order.wastage_pct !== undefined
                  ? parseFloat(order.wastage_pct)
                  : null;
                const wastageCap = parseFloat(order.wastage_cap);
                const isWastageExceeded = wastage !== null && wastage > wastageCap;

                return (
                  <div
                    key={order.id}
                    style={{
                      borderBottom: '1px solid #e2e8f0',
                      padding: '1.5rem',
                      transition: 'background-color 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                          <span className="mono" style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                            {order.order_no}
                          </span>
                          <span className="badge badge-green">VERIFIED BATCH</span>
                          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                            Recipe: <strong>{order.recipe_name}</strong> ({order.recipe_code})
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.85rem', color: '#475569', marginTop: '0.5rem' }}>
                          <div>
                            Target Output: <strong style={{ color: '#0f172a' }}>{order.target_qty} garments</strong>
                          </div>
                          <div>
                            Fabric Roll ID: <span className="mono" style={{ color: '#0f172a' }}>{order.fabric_roll_id}</span>
                          </div>
                          <div>
                            Fabric Used: <strong>{parseFloat(order.actual_fabric_yds).toFixed(2)} yds</strong>
                          </div>
                        </div>

                        {/* Attribution & Wastage Metadata */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1.5rem',
                          marginTop: '0.875rem',
                          padding: '0.625rem 0.875rem',
                          backgroundColor: '#f8fafc',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                          fontSize: '0.8rem'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#334155' }}>
                            <UserCheck size={14} color="#2563eb" />
                            Verified By: <strong>{order.verifier_name || 'Authorized Verifier'}</strong>
                          </div>

                          {order.verified_at && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#64748b' }}>
                              <Calendar size={14} />
                              {new Date(order.verified_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          )}

                          {wastage !== null && (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              fontWeight: 600,
                              color: isWastageExceeded ? '#b91c1c' : '#047857'
                            }}>
                              <Percent size={14} />
                              Fabric Wastage: {wastage.toFixed(2)}%
                              <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 400 }}>
                                (Cap: {wastageCap}%)
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Action: Start Sewing Assembly */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                        <button
                          type="button"
                          onClick={() => handleStartSewing(order.id)}
                          disabled={startingId === order.id}
                          className="btn btn-primary"
                          style={{
                            backgroundColor: '#059669',
                            borderColor: '#059669',
                            padding: '0.75rem 1.25rem',
                            fontSize: '0.95rem'
                          }}
                        >
                          <Play size={16} />
                          {startingId === order.id ? 'Starting Line...' : 'Start Sewing Assembly'}
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleExpand(order.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#2563eb',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                        >
                          {isExpanded ? (
                            <>Hide Verified Parts <ChevronUp size={14} /></>
                          ) : (
                            <>Inspect Verified Parts ({order.items?.length || 0}) <ChevronDown size={14} /></>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Piece Counts Breakdown */}
                    {isExpanded && order.items && (
                      <div style={{
                        marginTop: '1.25rem',
                        padding: '1rem',
                        backgroundColor: '#ffffff',
                        border: '1.5px solid #d1fae5',
                        borderRadius: '8px'
                      }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#065f46', marginBottom: '0.5rem' }}>
                          Verified Cut Part Inventory:
                        </div>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                          gap: '0.75rem'
                        }}>
                          {order.items.map((it) => (
                            <div
                              key={it.component_id}
                              style={{
                                padding: '0.625rem',
                                backgroundColor: '#f0fdf4',
                                borderRadius: '6px',
                                border: '1px solid #bbf7d0',
                                fontSize: '0.8rem'
                              }}
                            >
                              <div style={{ fontWeight: 600, color: '#0f172a' }}>{it.component_name}</div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                                <span style={{ color: '#64748b' }}>Expected: {it.expected_qty}</span>
                                <span className="mono" style={{ fontWeight: 700, color: '#059669' }}>
                                  Counted: {it.actual_qty} pcs
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
