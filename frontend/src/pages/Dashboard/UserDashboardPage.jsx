import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { userApi, auctionApi } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  formatCurrency,
  formatRelativeTime,
  formatDateTime,
  getStatusBadgeClass,
  getErrorMessage,
} from '../../utils/helpers';
import {
  TrendingUp,
  Package,
  Gavel,
  User,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
  PlusCircle,
  Trophy,
  ExternalLink,
} from 'lucide-react';
import './UserDashboardPage.css';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80';

export default function UserDashboardPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam === 'listings' || tabParam === 'profile' ? tabParam : 'bids');
  const [bids, setBids] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    setLoading(true);
    setError(null);
    try {
      const [bidsRes, listingsRes] = await Promise.all([
        userApi.getMyBids(),
        userApi.getMyListings(),
      ]);
      setBids(bidsRes.data || []);
      setListings(listingsRes.data || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load your dashboard activity. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelListing(auctionId) {
    if (!window.confirm('Are you sure you want to cancel this auction listing?')) {
      return;
    }
    try {
      await auctionApi.cancel(auctionId);
      toast.success('Auction cancelled');
      loadDashboardData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function handleAcceptBid(auctionId, title, highestBid) {
    if (!window.confirm(`Are you sure you want to accept the leading bid of ₹${formatCurrency(highestBid)} and conclude the auction for "${title}" now?`)) {
      return;
    }
    try {
      await auctionApi.acceptBid(auctionId);
      toast.success('Congratulations! Item sold and auction concluded!');
      loadDashboardData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <div className="user-dashboard-page">
      <div className="container">
        {/* Welcome Header */}
        <div className="dashboard-hero">
          <div className="dashboard-user-meta">
            <div className="user-big-avatar">
              <User size={32} />
            </div>
            <div>
              <div className="user-greeting-row">
                <h1 className="dashboard-title">Welcome, {user?.fullName}</h1>
                <span className="badge badge-primary">{user?.role}</span>
              </div>
              <p className="dashboard-subtitle">{user?.email}</p>
            </div>
          </div>

          <div className="dashboard-hero-actions">
            <Link to="/auctions/create" className="btn btn-primary">
              <PlusCircle size={16} /> Create Auction
            </Link>
            <Link to="/auctions" className="btn btn-outline">
              <Gavel size={16} /> Explore Bidding
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="dashboard-stats-grid">
          <div className="stat-card">
            <div className="stat-icon-wrapper stat-bids">
              <TrendingUp size={22} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Auctions Bid On</span>
              <span className="stat-value">{bids.length}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper stat-listings">
              <Package size={22} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Active Listings</span>
              <span className="stat-value">
                {listings.filter((l) => l.status === 'ACTIVE').length}
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper stat-total">
              <Gavel size={22} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Total Listings Created</span>
              <span className="stat-value">{listings.length}</span>
            </div>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="dashboard-tabs">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'bids' ? 'active' : ''}`}
            onClick={() => setActiveTab('bids')}
          >
            <TrendingUp size={16} />
            <span>My Bids ({bids.length})</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'listings' ? 'active' : ''}`}
            onClick={() => setActiveTab('listings')}
          >
            <Package size={16} />
            <span>My Listings ({listings.length})</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={16} />
            <span>Account Profile</span>
          </button>
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="dashboard-loading">
            <div className="spinner"></div>
            <p>Loading your activity…</p>
          </div>
        ) : error ? (
          <div className="alert alert-error my-6">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        ) : (
          <div className="tab-pane">
            {/* 1. MY BIDS TAB */}
            {activeTab === 'bids' && (
              <div className="activity-card">
                {bids.length === 0 ? (
                  <div className="empty-tab-state">
                    <TrendingUp size={40} className="empty-icon" />
                    <h3>You haven't placed any bids yet</h3>
                    <p>Explore live auctions and place your first bid on unique items.</p>
                    <Link to="/auctions" className="btn btn-primary mt-4">
                      Browse Auctions
                    </Link>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="dashboard-table">
                      <thead>
                        <tr>
                          <th>Auction Item</th>
                          <th>Your Highest Bid</th>
                          <th>Current Highest Bid</th>
                          <th>Bid Confidence Indicator</th>
                          <th>Auction Status</th>
                          <th className="text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bids.map((b) => (
                          <tr key={b.auctionId}>
                            <td>
                              <div className="item-cell">
                                <img
                                  src={b.productImageUrl || FALLBACK_IMAGE}
                                  alt={b.productTitle}
                                  className="item-thumb"
                                  onError={(e) => {
                                    e.target.src = FALLBACK_IMAGE;
                                  }}
                                />
                                <span className="item-title">{b.productTitle}</span>
                              </div>
                            </td>
                            <td className="font-semibold">
                              ₹{formatCurrency(b.myHighestBid)}
                            </td>
                            <td className="font-semibold text-primary">
                              ₹{formatCurrency(b.currentHighestBid)}
                            </td>
                            <td>
                              {b.bidConfidenceStatus === 'LEADING' && (
                                <span className="confidence-pill confidence-leading" title="Your bid is currently the highest valid bid.">
                                  ● LEADING
                                </span>
                              )}
                              {b.bidConfidenceStatus === 'OUTBID' && (
                                <span className="confidence-pill confidence-outbid" title="Another user has placed a higher valid bid.">
                                  ▲ OUTBID
                                </span>
                              )}
                              {b.bidConfidenceStatus === 'WON' && (
                                <span className="confidence-pill confidence-won" title="The auction has ended and you are the winner!">
                                  ★ WON
                                </span>
                              )}
                              {b.bidConfidenceStatus === 'LOST' && (
                                <span className="confidence-pill confidence-lost" title="The auction has ended and another user has won.">
                                  ✕ LOST
                                </span>
                              )}
                              {(b.bidConfidenceStatus === 'ENDED_NO_WINNER' || b.bidConfidenceStatus === 'ENDED — NO WINNER') && (
                                <span className="confidence-pill confidence-no-winner" title="The auction ended without any bids.">
                                  — ENDED — NO WINNER
                                </span>
                              )}
                              {(!b.bidConfidenceStatus || (b.bidConfidenceStatus !== 'LEADING' && b.bidConfidenceStatus !== 'OUTBID' && b.bidConfidenceStatus !== 'WON' && b.bidConfidenceStatus !== 'LOST' && b.bidConfidenceStatus !== 'ENDED_NO_WINNER' && b.bidConfidenceStatus !== 'ENDED — NO WINNER')) && (
                                b.isLeading ? (
                                  <span className="confidence-pill confidence-leading">● LEADING</span>
                                ) : (
                                  <span className="confidence-pill confidence-outbid">▲ OUTBID</span>
                                )
                              )}
                            </td>
                            <td>
                              <span className={`badge ${getStatusBadgeClass(b.status)}`}>
                                {b.status}
                              </span>
                            </td>
                            <td className="text-right">
                              <Link
                                to={`/auctions/${b.auctionId}`}
                                className="btn btn-outline btn-sm"
                              >
                                View Item <ArrowRight size={14} />
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* 2. MY LISTINGS TAB */}
            {activeTab === 'listings' && (
              <div className="activity-card">
                {listings.length === 0 ? (
                  <div className="empty-tab-state">
                    <Package size={40} className="empty-icon" />
                    <h3>No auction listings created yet</h3>
                    <p>Have an item to sell? Reach eager buyers by creating an auction today.</p>
                    <Link to="/auctions/create" className="btn btn-primary mt-4">
                      Create Your First Listing
                    </Link>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="dashboard-table">
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th>Starting Price</th>
                          <th>Current Highest</th>
                          <th>Bids</th>
                          <th>Status</th>
                          <th>Winner / End</th>
                          <th className="text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {listings.map((l) => (
                          <tr key={l.id}>
                            <td>
                              <div className="item-cell">
                                <img
                                  src={l.productImageUrl || FALLBACK_IMAGE}
                                  alt={l.productTitle}
                                  className="item-thumb"
                                  onError={(e) => {
                                    e.target.src = FALLBACK_IMAGE;
                                  }}
                                />
                                <div>
                                  <span className="item-title">{l.productTitle}</span>
                                  <span className="item-cat-sub">{l.category?.name}</span>
                                </div>
                              </div>
                            </td>
                            <td>₹{formatCurrency(l.startingPrice)}</td>
                            <td className="font-semibold">
                              {l.currentHighestBid ? `₹${formatCurrency(l.currentHighestBid)}` : '—'}
                            </td>
                            <td>{l.bidCount || 0}</td>
                            <td>
                              <span className={`badge ${getStatusBadgeClass(l.status)}`}>
                                {l.status}
                              </span>
                            </td>
                            <td>
                              {l.status === 'ENDED' ? (
                                l.result?.winnerName ? (
                                  <span className="winner-tag">
                                    <Trophy size={12} /> {l.result.winnerName}
                                  </span>
                                ) : (
                                  <span className="text-muted">No winner</span>
                                )
                              ) : (
                                <span className="text-muted">{formatDateTime(l.endTime)}</span>
                              )}
                            </td>
                            <td className="text-right table-actions">
                              <Link
                                to={`/auctions/${l.id}`}
                                className="btn btn-outline btn-sm"
                              >
                                View
                              </Link>
                              {l.status === 'ACTIVE' && l.bidCount > 0 && (
                                <button
                                  type="button"
                                  className="btn btn-sm"
                                  style={{ backgroundColor: 'var(--color-success)', color: '#fff', borderColor: 'var(--color-success)', fontWeight: 600 }}
                                  onClick={() => handleAcceptBid(l.id, l.productTitle, l.currentHighestBid)}
                                >
                                  Sell Now (₹{formatCurrency(l.currentHighestBid)})
                                </button>
                              )}
                              {l.status === 'ACTIVE' && l.bidCount === 0 && (
                                <button
                                  type="button"
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleCancelListing(l.id)}
                                >
                                  Cancel
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* 3. PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="profile-details-card">
                <h3 className="section-title">Account Profile</h3>
                <div className="profile-grid">
                  <div className="profile-field">
                    <span className="field-label">Full Name</span>
                    <span className="field-value">{user?.fullName}</span>
                  </div>
                  <div className="profile-field">
                    <span className="field-label">Email Address</span>
                    <span className="field-value">{user?.email}</span>
                  </div>
                  <div className="profile-field">
                    <span className="field-label">Account Role</span>
                    <span className="field-value">
                      <span className="badge badge-primary">{user?.role}</span>
                    </span>
                  </div>
                  <div className="profile-field">
                    <span className="field-label">Member Since</span>
                    <span className="field-value">{formatDateTime(user?.createdAt)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
