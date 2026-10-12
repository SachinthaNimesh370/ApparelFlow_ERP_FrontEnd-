import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { X, Layers, Clock, ShieldCheck, CheckCircle2, XCircle, AlertCircle, Calendar } from 'lucide-react';

export const OrderDetailModal = ({ orderId, onClose }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (orderId) {
      setLoading(true);
      setError('');
      api.getOrder(orderId)
        .then((data) => setOrder(data))
        .catch((err) => setError(err.message || 'Failed to load order details'))
        .finally(() => setLoading(false));
    }
  }, [orderId]);

  if (!orderId) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '720px' }}>
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={20} color="#1e40af" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
              Production Batch Specification & Audit Trail
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

        <div className="card-body" style={{ overflowY: 'auto', maxHeight: 'calc(90vh - 120px)' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
              Loading batch specifications...
            </div>
          ) : error ? (
            <div style={{ padding: '1rem', backgroundColor: '#fef2f2', color: '#991b1b', borderRadius: '6px' }}>
              {error}
            </div>
          ) : order ? (
            <div>
              {/* Batch Metadata Header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '1rem',
                backgroundColor: '#f8fafc',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                marginBottom: '1.5rem'
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Order Number</div>
                  <div className="mono" style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>{order.order_no}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Recipe (BOM)</div>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{order.recipe_name} ({order.recipe_code})</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Target Quantity</div>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{order.target_qty} units</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Fabric Roll & Usage</div>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{order.fabric_roll_id} • {parseFloat(order.actual_fabric_yds).toFixed(2)} yds</div>
                </div>
              </div>

              {/* Component Pieces */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>
                  Component Multiplier Breakdown & Verified Counts
                </h4>
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Component Part</th>
                        <th>BOM Multiplier</th>
                        <th>Expected</th>
                        <th>Actual Count</th>
                        <th>QC Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items?.map((item) => (
                        <tr key={item.id}>
                          <td style={{ fontWeight: 600 }}>{item.component_name}</td>
                          <td className="mono">{item.pieces_per_garment} pcs/unit</td>
                          <td className="mono" style={{ fontWeight: 700, color: '#1e40af' }}>{item.expected_qty} pcs</td>
                          <td className="mono" style={{ fontWeight: 700 }}>
                            {item.actual_qty !== null ? `${item.actual_qty} pcs` : '—'}
                          </td>
                          <td>
                            {item.status === 'GREEN' && <span className="badge badge-green">Match</span>}
                            {item.status === 'YELLOW' && <span className="badge badge-yellow">Excess</span>}
                            {item.status === 'RED' && <span className="badge badge-red">Shortage</span>}
                            {!item.status && <span className="badge" style={{ backgroundColor: '#f1f5f9' }}>Pending</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Immutable Audit Trail Section */}
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <ShieldCheck size={18} color="#059669" />
                  Immutable Server-Side Audit Trail (`verification_logs`)
                </h4>

                {order.logs && order.logs.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {order.logs.map((log) => (
                      <div
                        key={log.id}
                        style={{
                          padding: '0.875rem 1rem',
                          backgroundColor: log.decision === 'APPROVED' ? '#f0fdf4' : '#fef2f2',
                          border: '1px solid',
                          borderColor: log.decision === 'APPROVED' ? '#bbf7d0' : '#fecaca',
                          borderRadius: '8px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                          <span style={{
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            color: log.decision === 'APPROVED' ? '#166534' : '#991b1b'
                          }}>
                            Decision: {log.decision}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {new Date(log.created_at).toLocaleString()}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#334155' }}>
                          QC Verifier: <strong>{log.verifier_name || `User #${log.verifier_id}`}</strong>
                        </div>
                        {log.wastage_pct !== null && log.wastage_pct !== undefined && (
                          <div style={{ fontSize: '0.8rem', color: '#166534', marginTop: '0.25rem' }}>
                            Fabric Wastage Recorded: <strong>{log.wastage_pct}%</strong>
                          </div>
                        )}
                        {log.rejection_note && (
                          <div style={{ fontSize: '0.8rem', color: '#991b1b', marginTop: '0.25rem', fontStyle: 'italic' }}>
                            Mandatory Note: "{log.rejection_note}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '1rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', color: '#64748b', fontSize: '0.85rem', textAlign: 'center' }}>
                    No audit logs recorded yet. Batch has not been processed through QC decision.
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        <div className="card-header" style={{ justifyContent: 'flex-end', backgroundColor: '#ffffff' }}>
          <button type="button" onClick={onClose} className="btn btn-outline">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
