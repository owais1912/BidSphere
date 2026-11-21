import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/services';
import { useToast } from '../../context/ToastContext';
import {
  formatCurrency,
  formatDateTime,
  getStatusBadgeClass,
  getErrorMessage,
} from '../../utils/helpers';
import {
  ShieldAlert,
  Users,
  Package,
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Gavel,
  Search,
  ExternalLink,
  Clock,
} from 'lucide-react';
import './AdminDashboardPage.css';

export default function AdminDashboardPage() {
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'auctions'
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingExpired, setProcessingExpired] = useState(false);

  // Search filters
  const [userSearch, setUserSearch] = useState('');
  const [auctionSearch, setAuctionSearch] = useState('');

  async function handleCloseExpiredNow() {
    setProcessingExpired(true);
    try {
      await adminApi.closeExpiredAuctions();
      toast.success('Expired auctions closed and winners finalized!');
      loadAllAdminData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setProcessingExpired(false);
    }
  }

  useEffect(() => {
    loadAllAdminData();
  }, []);

  async function loadAllAdminData() {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, usersRes, auctionsRes] = await Promise.all([
        adminApi.getDashboard(),
        adminApi.getUsers(),
        adminApi.getAuctions(),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setAuctions(auctionsRes.data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      setError('Failed to load administrative data. Please verify your permissions.');
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleUserStatus(userId, currentStatus) {
    const action = currentStatus ? 'disable' : 'enable';
    if (!window.confirm(`Are you sure you want to ${action} this user account?`)) {
      return;
    }

    try {
      await adminApi.updateUserStatus(userId, !currentStatus);
      toast.success(`User successfully ${action}d`);
      // Update local state
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, enabled: !currentStatus } : u))
      );
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function handleRemoveAuction(auctionId) {
    if (!window.confirm('Are you sure you want to cancel and remove this auction?')) {
      return;
    }

    try {
      await adminApi.removeAuction(auctionId);
      toast.success('Auction cancelled by administrator');
      // Update local state
      setAuctions((prev) =>
        prev.map((a) => (a.id === auctionId ? { ...a, status: 'CANCELLED' } : a))
      );
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredAuctions = auctions.filter(
    (a) =>
      a.productTitle.toLowerCase().includes(auctionSearch.toLowerCase()) ||
      a.seller?.fullName?.toLowerCase().includes(auctionSearch.toLowerCase())
  );

  return (
    <div className="admin-dashboard-page">
      <div className="container">
        {/* Header */}
        <div className="admin-header">
          <div className="admin-title-row">
            <div className="admin-badge-icon">
              <ShieldAlert size={24} />
            </div>
            <div>
              <h1 className="admin-title">Administration Panel</h1>
              <p className="admin-subtitle">
                System operations, user account management, and auction moderation
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="admin-stat-icon users-icon">
              <Users size={24} />
            </div>
            <div className="admin-stat-info">
              <span className="admin-stat-label">Total Users</span>
              <span className="admin-stat-val">{stats?.totalUsers || users.length}</span>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon auctions-icon">
              <Package size={24} />
            </div>
            <div className="admin-stat-info">
              <span className="admin-stat-label">Total Auctions</span>
              <span className="admin-stat-val">{stats?.totalAuctions || auctions.length}</span>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon active-icon">
              <Activity size={24} />
            </div>
            <div className="admin-stat-info">
              <span className="admin-stat-label">Active Auctions</span>
              <span className="admin-stat-val">
                {stats?.activeAuctions || auctions.filter((a) => a.status === 'ACTIVE').length}
              </span>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon ended-icon">
              <Gavel size={24} />
            </div>
            <div className="admin-stat-info">
              <span className="admin-stat-label">Concluded Auctions</span>
              <span className="admin-stat-val">
                {stats?.endedAuctions || auctions.filter((a) => a.status === 'ENDED').length}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="admin-tabs">
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            User Management ({users.length})
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'auctions' ? 'active' : ''}`}
            onClick={() => setActiveTab('auctions')}
          >
            Auction Moderation ({auctions.length})
          </button>
        </div>

        {loading ? (
          <div className="admin-loading">
            <div className="spinner"></div>
            <p>Loading administration data…</p>
          </div>
        ) : error ? (
          <div className="alert alert-error my-6">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        ) : (
          <div className="admin-content-card">
            {/* 1. OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="overview-section">
                <h2 className="admin-section-heading">System Health & Summary</h2>
                <div className="overview-summary-grid">
                  <div className="summary-box">
                    <span className="summary-title">Platform Status</span>
                    <span className="summary-val status-healthy">
                      <CheckCircle size={18} /> Operational
                    </span>
                    <p className="summary-note">All services and background schedulers are executing normally.</p>
                  </div>
                  <div className="summary-box">
                    <span className="summary-title">Security & Roles</span>
                    <span className="summary-val">Role-Based Access Control (RBAC)</span>
                    <p className="summary-note">Stateless JWT authentication with bcrypt password hashing.</p>
                  </div>
                  <div className="summary-box">
                    <span className="summary-title">Auction Lifecycle Daemon</span>
                    <span className="summary-val">Active (60s tick interval)</span>
                    <p className="summary-note">Automatically marks ended auctions and determines winning bidders.</p>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm mt-3"
                      onClick={handleCloseExpiredNow}
                      disabled={processingExpired}
                      style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                    >
                      <Clock size={14} /> {processingExpired ? 'Processing…' : 'Process Expired Auctions Now'}
                    </button>
                  </div>
                </div>

                <div className="recent-activity-preview mt-8">
                  <h3 className="admin-subheading">Recently Registered Users</h3>
                  <div className="table-responsive">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>User</th>
                          <th>Role</th>
                          <th>Joined</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.slice(0, 5).map((u) => (
                          <tr key={u.id}>
                            <td>
                              <strong>{u.fullName}</strong>
                              <span className="table-subtext">{u.email}</span>
                            </td>
                            <td>
                              <span className="badge badge-primary">{u.role}</span>
                            </td>
                            <td>{formatDateTime(u.createdAt)}</td>
                            <td>
                              <span className={`badge ${u.enabled ? 'badge-success' : 'badge-danger'}`}>
                                {u.enabled ? 'Active' : 'Disabled'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 2. USERS MANAGEMENT TAB */}
            {activeTab === 'users' && (
              <div className="users-management-section">
                <div className="table-header-tools">
                  <div className="admin-search-wrapper">
                    <Search size={16} className="search-icon" />
                    <input
                      type="text"
                      placeholder="Search users by name or email…"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <span className="records-count">{filteredUsers.length} Users</span>
                </div>

                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>User Profile</th>
                        <th>Role</th>
                        <th>Created Date</th>
                        <th>Status</th>
                        <th className="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => (
                        <tr key={u.id}>
                          <td>#{u.id}</td>
                          <td>
                            <strong>{u.fullName}</strong>
                            <span className="table-subtext">{u.email}</span>
                          </td>
                          <td>
                            <span className="badge badge-primary">{u.role}</span>
                          </td>
                          <td>{formatDateTime(u.createdAt)}</td>
                          <td>
                            <span className={`badge ${u.enabled ? 'badge-success' : 'badge-danger'}`}>
                              {u.enabled ? 'Enabled' : 'Disabled'}
                            </span>
                          </td>
                          <td className="text-right">
                            {u.role !== 'ADMIN' && (
                              <button
                                type="button"
                                className={`btn btn-sm ${u.enabled ? 'btn-danger' : 'btn-outline'}`}
                                onClick={() => handleToggleUserStatus(u.id, u.enabled)}
                              >
                                {u.enabled ? 'Disable Account' : 'Enable Account'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 3. AUCTIONS MODERATION TAB */}
            {activeTab === 'auctions' && (
              <div className="auctions-management-section">
                <div className="table-header-tools">
                  <div className="admin-search-wrapper">
                    <Search size={16} className="search-icon" />
                    <input
                      type="text"
                      placeholder="Search auctions by title or seller…"
                      value={auctionSearch}
                      onChange={(e) => setAuctionSearch(e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <span className="records-count">{filteredAuctions.length} Listings</span>
                </div>

                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Listing</th>
                        <th>Seller</th>
                        <th>Current Price</th>
                        <th>Bids</th>
                        <th>Status</th>
                        <th className="text-right">Moderation Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAuctions.map((a) => (
                        <tr key={a.id}>
                          <td>#{a.id}</td>
                          <td>
                            <strong>{a.productTitle}</strong>
                            <span className="table-subtext">{a.category?.name}</span>
                          </td>
                          <td>{a.seller?.fullName}</td>
                          <td className="font-semibold">
                            ₹{formatCurrency(a.currentHighestBid || a.startingPrice)}
                          </td>
                          <td>{a.bidCount || 0}</td>
                          <td>
                            <span className={`badge ${getStatusBadgeClass(a.status)}`}>
                              {a.status}
                            </span>
                          </td>
                          <td className="text-right admin-actions-col">
                            <Link
                              to={`/auctions/${a.id}`}
                              className="btn btn-outline btn-sm"
                              target="_blank"
                            >
                              <ExternalLink size={14} /> View
                            </Link>
                            {a.status !== 'CANCELLED' && (
                              <button
                                type="button"
                                className="btn btn-danger btn-sm"
                                onClick={() => handleRemoveAuction(a.id)}
                              >
                                Cancel / Remove
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
