import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { auctionApi } from '../../api/services';
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
  Clock,
  ShieldCheck,
  User,
  AlertCircle,
  Trophy,
  ArrowLeft,
  Tag,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Gavel,
} from 'lucide-react';
import './AuctionDetailPage.css';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80';

export default function AuctionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();

  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Bid form state
  const [bidAmount, setBidAmount] = useState('');
  const [bidSubmitting, setBidSubmitting] = useState(false);
  const [bidError, setBidError] = useState('');
  const [cancelSubmitting, setCancelSubmitting] = useState(false);
  const [acceptSubmitting, setAcceptSubmitting] = useState(false);

  // Time remaining calculation
  const [timeLeft, setTimeLeft] = useState('');

  const loadAuctionData = useCallback(async () => {
    try {
      const [auctionRes, bidsRes] = await Promise.all([
        auctionApi.getById(id),
        auctionApi.getBids(id),
      ]);
      setAuction(auctionRes.data);
      setBids(bidsRes.data);
      if (auctionRes.data.minimumNextBid) {
        setBidAmount(String(auctionRes.data.minimumNextBid));
      }
    } catch (err) {
      console.error('Error fetching auction details:', err);
      setError('Could not load auction details. It might not exist or has been removed.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadAuctionData();
  }, [loadAuctionData]);

  // Countdown timer effect
  useEffect(() => {
    if (!auction || auction.status !== 'ACTIVE') return;

    function updateCountdown() {
      const end = new Date(auction.endTime).getTime();
      const now = new Date().getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('Auction ended');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m left`);
      } else {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s left`);
      }
    }

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [auction]);

  async function handlePlaceBid(e) {
    e.preventDefault();
    setBidError('');

    if (!bidAmount || isNaN(parseFloat(bidAmount))) {
      setBidError('Please enter a valid bid amount');
      return;
    }

    const numBid = parseFloat(bidAmount);
    if (numBid < parseFloat(auction.minimumNextBid)) {
      setBidError(`Bid must be at least ₹${formatCurrency(auction.minimumNextBid)}`);
      return;
    }

    setBidSubmitting(true);
    try {
      await auctionApi.placeBid(id, { amount: numBid });
      toast.success(`Bid of ₹${formatCurrency(numBid)} placed successfully!`);
      // Reload auction data to reflect updated highest bid & history
      await loadAuctionData();
    } catch (err) {
      setBidError(getErrorMessage(err));
    } finally {
      setBidSubmitting(false);
    }
  }

  async function handleCancelAuction() {
    if (!window.confirm('Are you sure you want to cancel this auction listing? This cannot be undone.')) {
      return;
    }

    setCancelSubmitting(true);
    try {
      await auctionApi.cancel(id);
      toast.success('Auction cancelled successfully');
      await loadAuctionData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setCancelSubmitting(false);
    }
  }

  async function handleAcceptBid() {
    const highestBidVal = auction.currentHighestBid || auction.startingPrice;
    const bidderName = bids[0]?.bidderName || 'the leading bidder';
    const msg = `Are you sure you want to sell this item to ${bidderName} for ₹${formatCurrency(highestBidVal)} and conclude the auction now?`;
    if (!window.confirm(msg)) {
      return;
    }

    setAcceptSubmitting(true);
    try {
      await auctionApi.acceptBid(id);
      toast.success(`Congratulations! Auction sold to ${bidderName} for ₹${formatCurrency(highestBidVal)}!`);
      await loadAuctionData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setAcceptSubmitting(false);
    }
  }

  function handleQuickIncrement(inc) {
    const base = parseFloat(auction.minimumNextBid || auction.startingPrice || 0);
    setBidAmount(String(base + inc));
    setBidError('');
  }

  if (loading) {
    return (
      <div className="container auction-detail-loading">
        <div className="detail-skeleton">
          <div className="skeleton-box skeleton-image"></div>
          <div className="skeleton-box skeleton-info"></div>
        </div>
      </div>
    );
  }

  if (error || !auction) {
    return (
      <div className="container auction-detail-error">
        <div className="error-card">
          <AlertCircle size={48} className="error-icon" />
          <h2>Auction Not Found</h2>
          <p>{error || "The auction you're looking for doesn't exist or is unavailable."}</p>
          <Link to="/auctions" className="btn btn-primary mt-4">
            <ArrowLeft size={16} /> Back to Auctions
          </Link>
        </div>
      </div>
    );
  }

  const isSeller = Boolean(user && user.id === auction.seller?.id);
  const isAuctionActive = auction.status === 'ACTIVE';
  const isAuctionEnded = auction.status === 'ENDED';
  const isAuctionCancelled = auction.status === 'CANCELLED';
  const isAuctionUpcoming = auction.status === 'UPCOMING';

  // Calculate Bid Confidence Indicator for current viewer
  let bidConfidence = null;
  const userBids = bids.filter(
    (b) => user && (b.bidderId === user.id || b.bidderName === user.fullName || b.bidderName?.startsWith(user.fullName?.split(' ')[0]))
  );

  if (isAuthenticated && !isSeller && userBids.length > 0) {
    if (isAuctionActive) {
      const isUserLeading =
        bids.length > 0 &&
        user &&
        (bids[0].bidderId === user.id || bids[0].bidderName === user.fullName || bids[0].bidderName?.startsWith(user.fullName?.split(' ')[0]));
      bidConfidence = isUserLeading ? 'LEADING' : 'OUTBID';
    } else if (isAuctionEnded) {
      const won =
        auction.result &&
        ((auction.result.winnerId && auction.result.winnerId === user.id) ||
          (auction.result.winnerName &&
            (auction.result.winnerName === user.fullName ||
              auction.result.winnerName?.startsWith(user.fullName?.split(' ')[0]))));
      if (won) {
        bidConfidence = 'WON';
      } else if (auction.result?.winnerName || auction.result?.winnerId) {
        bidConfidence = 'LOST';
      } else {
        bidConfidence = 'ENDED — NO WINNER';
      }
    }
  } else if (isAuctionEnded && auction.bidCount === 0) {
    bidConfidence = 'ENDED — NO WINNER';
  }

  return (
    <div className="auction-detail-page">
      <div className="container">
        {/* Navigation Breadcrumb */}
        <div className="detail-breadcrumb">
          <Link to="/auctions" className="breadcrumb-link">
            <ArrowLeft size={16} /> Back to All Auctions
          </Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-category">{auction.category?.name}</span>
        </div>

        {/* Main Grid: Left Image & Details, Right Bidding Box */}
        <div className="detail-layout">
          {/* Left Column: Product Showcase */}
          <div className="detail-media-column">
            <div className="detail-image-card">
              <span className={`status-badge-floating ${getStatusBadgeClass(auction.status)}`}>
                {auction.status}
              </span>
              <img
                src={auction.productImageUrl || FALLBACK_IMAGE}
                alt={auction.productTitle}
                className="detail-main-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = FALLBACK_IMAGE;
                }}
              />
            </div>

            {/* Description Card */}
            <div className="detail-description-card">
              <h2 className="section-title">Item Description</h2>
              <div className="description-text">{auction.productDescription}</div>

              <div className="auction-specs-grid">
                <div className="spec-item">
                  <span className="spec-label">Category</span>
                  <span className="spec-value">{auction.category?.name || 'General'}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Listing Created</span>
                  <span className="spec-value">{formatDateTime(auction.createdAt)}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Auction Starts</span>
                  <span className="spec-value">{formatDateTime(auction.startTime)}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Auction Ends</span>
                  <span className="spec-value">{formatDateTime(auction.endTime)}</span>
                </div>
              </div>
            </div>

            {/* Seller Information */}
            <div className="detail-seller-card">
              <div className="seller-avatar">
                <User size={24} />
              </div>
              <div className="seller-info">
                <span className="seller-label">Listed by</span>
                <span className="seller-name">{auction.seller?.fullName || 'Verified Seller'}</span>
                {isSeller && <span className="seller-badge-you">(You)</span>}
              </div>
              <div className="seller-trust-badge">
                <ShieldCheck size={18} /> Verified Seller
              </div>
            </div>
          </div>

          {/* Right Column: Bidding Controls & History */}
          <div className="detail-action-column">
            <div className="detail-action-card">
              <h1 className="detail-title">{auction.productTitle}</h1>

              {/* Status & Countdown Bar */}
              <div className="detail-status-bar">
                <div className="countdown-display">
                  <Clock size={18} className="countdown-icon" />
                  <span className="countdown-text">
                    {isAuctionActive
                      ? timeLeft || 'Active'
                      : isAuctionEnded
                      ? 'Auction Ended'
                      : isAuctionCancelled
                      ? 'Auction Cancelled'
                      : 'Upcoming Auction'}
                  </span>
                </div>
                <div className="bid-count-badge">
                  {auction.bidCount} {auction.bidCount === 1 ? 'bid placed' : 'bids placed'}
                </div>
              </div>

              {/* BID CONFIDENCE INDICATOR */}
              {bidConfidence && (
                <div
                  className={`bid-confidence-panel confidence-${
                    bidConfidence === 'ENDED — NO WINNER' ? 'ended-no-winner' : bidConfidence.toLowerCase()
                  }`}
                >
                  <div className="confidence-badge-row">
                    <span className="confidence-panel-title">Bid Confidence Indicator</span>
                    <span
                      className={`confidence-pill confidence-${
                        bidConfidence === 'ENDED — NO WINNER' ? 'no-winner' : bidConfidence.toLowerCase()
                      }`}
                    >
                      {bidConfidence === 'LEADING' && '● LEADING'}
                      {bidConfidence === 'OUTBID' && '▲ OUTBID'}
                      {bidConfidence === 'WON' && '★ WON'}
                      {bidConfidence === 'LOST' && '✕ LOST'}
                      {bidConfidence === 'ENDED — NO WINNER' && '— ENDED — NO WINNER'}
                    </span>
                  </div>
                  <p className="confidence-description">
                    {bidConfidence === 'LEADING' && 'Your bid is currently the highest valid bid.'}
                    {bidConfidence === 'OUTBID' &&
                      'Another user has placed a higher valid bid. Enter a new bid below to regain the lead.'}
                    {bidConfidence === 'WON' && 'The auction has ended and you are the winner!'}
                    {bidConfidence === 'LOST' &&
                      `The auction has ended and ${auction.result?.winnerName || 'another bidder'} has won.`}
                    {bidConfidence === 'ENDED — NO WINNER' && 'The auction ended without any bids.'}
                  </p>
                </div>
              )}

              {/* Price Overview */}
              <div className="price-overview-box">
                <div className="price-primary">
                  <span className="price-label">
                    {auction.currentHighestBid ? 'Current Highest Bid' : 'Starting Bid'}
                  </span>
                  <span className="price-amount">
                    ₹{formatCurrency(auction.currentHighestBid || auction.startingPrice)}
                  </span>
                </div>

                {isAuctionActive && (
                  <div className="price-sub-info">
                    <div className="sub-info-row">
                      <span>Minimum Next Bid:</span>
                      <strong>₹{formatCurrency(auction.minimumNextBid)}</strong>
                    </div>
                    <div className="sub-info-row">
                      <span>Bid Increment:</span>
                      <strong>₹{formatCurrency(auction.minimumBidIncrement)}</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* WINNER ANNOUNCEMENT IF ENDED */}
              {isAuctionEnded && (
                <div className="auction-winner-banner">
                  <Trophy size={28} className="trophy-icon" />
                  <div className="winner-details">
                    <span className="winner-label">Auction Completed</span>
                    {auction.result?.winnerName ? (
                      <p className="winner-text">
                        Won by <strong>{auction.result.winnerName}</strong> for{' '}
                        <strong>₹{formatCurrency(auction.result.finalAmount || auction.currentHighestBid)}</strong>!
                      </p>
                    ) : (
                      <p className="winner-text">Auction concluded with no bids meeting reserve.</p>
                    )}
                  </div>
                </div>
              )}

              {/* CANCELLED BANNER */}
              {isAuctionCancelled && (
                <div className="auction-cancelled-banner">
                  <XCircle size={24} />
                  <span>This auction listing was cancelled by the seller or administrator.</span>
                </div>
              )}

              {/* BIDDING INTERACTION FORM */}
              {isAuctionActive && (
                <div className="bidding-form-container">
                  {!isAuthenticated ? (
                    <div className="auth-required-box">
                      <p className="auth-prompt-text">You must be signed in to place a bid on this item.</p>
                      <div className="auth-prompt-buttons">
                        <Link
                          to="/login"
                          state={{ from: { pathname: `/auctions/${id}` } }}
                          className="btn btn-primary btn-full"
                        >
                          Sign In to Bid
                        </Link>
                        <Link to="/register" className="btn btn-outline btn-full">
                          Create Free Account
                        </Link>
                      </div>
                    </div>
                  ) : isSeller ? (
                    <div className="seller-notice-box">
                      <AlertCircle size={20} />
                      <div>
                        <strong>You are the seller</strong>
                        <p>Platform rules strictly prohibit sellers from placing bids on their own listings.</p>
                      </div>
                      {auction.bidCount === 0 && (
                        <button
                          type="button"
                          className="btn btn-outline btn-sm cancel-auction-btn mt-3"
                          onClick={handleCancelAuction}
                          disabled={cancelSubmitting}
                        >
                          {cancelSubmitting ? 'Cancelling…' : 'Cancel Auction Listing'}
                        </button>
                      )}

                      {auction.bidCount > 0 && (
                        <div className="seller-accept-bid-panel mt-4">
                          <div className="accept-panel-header">
                            <span className="accept-badge">Active Offer</span>
                            <h4 className="accept-heading">Sell to Current Highest Bidder</h4>
                          </div>
                          <p className="accept-subtext">
                            Leading bid of <strong>₹{formatCurrency(auction.currentHighestBid)}</strong> placed by <strong>{bids[0]?.bidderName || 'Highest Bidder'}</strong>.
                            You can choose to accept this offer and end the auction immediately.
                          </p>
                          <button
                            type="button"
                            className="btn btn-primary btn-full btn-lg mt-3 sell-now-btn"
                            onClick={handleAcceptBid}
                            disabled={acceptSubmitting}
                          >
                            <Gavel size={18} />
                            {acceptSubmitting
                              ? 'Finalizing Sale…'
                              : `Sell Now for ₹${formatCurrency(auction.currentHighestBid)}`}
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <form onSubmit={handlePlaceBid} className="place-bid-form">
                      <label htmlFor="bid-amount" className="form-label form-label-required">
                        Your Bid Amount (₹)
                      </label>

                      <div className="bid-input-group">
                        <span className="currency-prefix">₹</span>
                        <input
                          id="bid-amount"
                          type="number"
                          step="1"
                          min={auction.minimumNextBid}
                          className={`form-input bid-input ${bidError ? 'error' : ''}`}
                          value={bidAmount}
                          onChange={(e) => {
                            setBidAmount(e.target.value);
                            setBidError('');
                          }}
                          placeholder={`Min ₹${formatCurrency(auction.minimumNextBid)}`}
                          disabled={bidSubmitting}
                        />
                      </div>

                      {/* Quick Increment Buttons */}
                      <div className="quick-bid-buttons">
                        <span className="quick-bid-label">Quick add:</span>
                        <button
                          type="button"
                          className="quick-btn"
                          onClick={() => handleQuickIncrement(500)}
                        >
                          +₹500
                        </button>
                        <button
                          type="button"
                          className="quick-btn"
                          onClick={() => handleQuickIncrement(1000)}
                        >
                          +₹1,000
                        </button>
                        <button
                          type="button"
                          className="quick-btn"
                          onClick={() => handleQuickIncrement(5000)}
                        >
                          +₹5,000
                        </button>
                      </div>

                      {bidError && (
                        <div className="bid-error-message">
                          <AlertCircle size={16} /> {bidError}
                        </div>
                      )}

                      <button
                        type="submit"
                        className="btn btn-primary btn-full btn-lg mt-3"
                        disabled={bidSubmitting}
                      >
                        {bidSubmitting ? 'Submitting Bid…' : `Place Bid of ₹${formatCurrency(bidAmount || 0)}`}
                      </button>

                      <p className="bid-terms-note">
                        By bidding, you commit to purchase this item at your offered price if you win.
                      </p>
                    </form>
                  )}
                </div>
              )}
            </div>

            {/* Bidding History Table */}
            <div className="bid-history-card">
              <div className="bid-history-header">
                <h3 className="history-title">Bid History</h3>
                <span className="history-badge">{bids.length} entries</span>
              </div>

              {bids.length === 0 ? (
                <div className="history-empty">
                  <p>No bids have been placed yet. Be the first to bid!</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="bid-history-table">
                    <thead>
                      <tr>
                        <th>Bidder</th>
                        <th>Amount</th>
                        <th className="text-right">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bids.map((b, index) => (
                        <tr key={b.id || index} className={index === 0 ? 'leading-bid-row' : ''}>
                          <td>
                            <div className="bidder-cell">
                              <User size={14} />
                              <span>{b.bidderName || 'Anonymous'}</span>
                              {index === 0 && <span className="highest-badge">Leading</span>}
                            </div>
                          </td>
                          <td className="bid-amount-cell">₹{formatCurrency(b.amount)}</td>
                          <td className="text-right bid-time-cell">
                            {formatRelativeTime(b.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
