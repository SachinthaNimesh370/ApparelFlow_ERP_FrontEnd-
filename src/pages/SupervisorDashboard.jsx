import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CreateOrderModal } from '../components/CreateOrderModal';
import { OrderDetailModal } from '../components/OrderDetailModal';
import { Scissors, Plus, Clock, CheckCircle2, XCircle, Eye, RefreshCw, AlertTriangle } from 'lucide-react';

export const SupervisorDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getOrders();
      setOrders(data);
    } catch (err) {
      setError(err.message || 'Failed to load cutting orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleOrderCreated = (newOrder) => {
    fetchOrders();
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'ALL') return true;
    return o.status === statusFilter;
  });

  const counts = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'PENDING_VERIFICATION').length,
    verified: orders.filter((o) => o.status === 'VERIFIED' || o.status === 'SEWING_STARTED').length,
    rejected: orders.filter((o) => o.status === 'REJECTED').length
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING_VERIFICATION':
        return <span className="badge badge-pending">Pending QC</span>;
      case 'VERIFIED':
        return <span className="badge badge-green">Verified</span>;
      case 'SEWING_STARTED':
        return <span className="badge badge-purple">Sewing Active</span>;
      case 'REJECTED':
        return <span className="badge badge-red">Rejected</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="main-content">
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#1e40af' }}>
              Cutting Department
            </span>
            <span style={{ color: '#94a3b8' }}>•</span>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Operations & Recipe Multiplier Engine</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.025em' }}>
            Cutting Batch Management
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={fetchOrders} className="btn btn-outline" title="Refresh Orders">
            <RefreshCw size={16} />
          </button>
          {user?.role === 'cutting_supervisor' && (
            <button onClick={() => setIsCreateOpen(true)} className="btn btn-primary" id="btn-create-order">
              <Plus size={18} /> New Cutting Batch
            </button>
          )}
        </div>
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

      {/* Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
            Total Production Batches
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>
            {counts.total}
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e40af', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Clock size={14} /> Pending Verification
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1e40af', marginTop: '0.25rem' }}>
            {counts.pending}
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#065f46', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <CheckCircle2 size={14} /> QC Verified Batches
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#059669', marginTop: '0.25rem' }}>
            {counts.verified}
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #ef4444' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#991b1b', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <XCircle size={14} /> Rejected / Shortage
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#dc2626', marginTop: '0.25rem' }}>
            {counts.rejected}
          </div>
        </div>
      </div>

      {/* Filter Tabs & Orders Table */}
      <div className="card">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['ALL', 'PENDING_VERIFICATION', 'VERIFIED', 'REJECTED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '0.4rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid',
                  borderColor: statusFilter === st ? '#1e40af' : '#cbd5e1',
                  backgroundColor: statusFilter === st ? '#eff6ff' : '#ffffff',
                  color: statusFilter === st ? '#1e40af' : '#475569',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {st === 'ALL' ? 'All Batches' : st.replace('_', ' ')}
              </button>
            ))}
          </div>

          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Showing {filteredOrders.length} batches
          </span>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Order No</th>
                <th>Recipe (BOM)</th>
                <th>Target Qty</th>
                <th>Fabric Roll</th>
                <th>Actual Fabric</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    Loading production batches...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    No cutting batches found. Click "+ New Cutting Batch" to create one.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <span className="mono" style={{ fontWeight: 700, color: '#0f172a' }}>
                        {order.order_no}
                      </span>
                    </td>
                    <td>
                      <div>
                        <span style={{ fontWeight: 600 }}>{order.recipe_name}</span>
                        <span className="mono" style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>
                          {order.recipe_code}
                        </span>
                      </div>
                    </td>
                    <td>
                      <strong>{order.target_qty}</strong> <span style={{ color: '#64748b' }}>units</span>
                    </td>
                    <td>
                      <span className="mono">{order.fabric_roll_id}</span>
                    </td>
                    <td>
                      {parseFloat(order.actual_fabric_yds).toFixed(2)} yds
                    </td>
                    <td>
                      {getStatusBadge(order.status)}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {new Date(order.created_at).toLocaleString()}
                    </td>
                    <td>
                      <button
                        onClick={() => setSelectedOrderId(order.id)}
                        className="btn btn-outline"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                      >
                        <Eye size={14} /> Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateOrderModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onOrderCreated={handleOrderCreated}
      />

      <OrderDetailModal
        orderId={selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
      />
    </div>
  );
};
