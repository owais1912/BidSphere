import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Gavel, Tag, ArrowRight } from 'lucide-react';
import { formatCurrency, formatRelativeTime, getStatusBadgeClass } from '../../utils/helpers';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&auto=format';

export default function AuctionCard({ auction }) {
  const {
    id, productTitle, productImageUrl, category,
    currentHighestBid, startingPrice, bidCount,
    endTime, status, minimumNextBid
  } = auction;

  const displayPrice = currentHighestBid ?? startingPrice;
  const priceLabel = currentHighestBid ? 'Current Bid' : 'Starting at';

  return (
    <article className="auction-card">
      <Link to={`/auctions/${id}`} className="auction-card-image-link" tabIndex="-1" aria-hidden="true">
        <img
          src={productImageUrl || FALLBACK_IMAGE}
          alt={productTitle}
          className="auction-card-image"
          onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
          loading="lazy"
        />
      </Link>

      <div className="auction-card-body">
        <div className="auction-card-header">
          <div>
            <span className="auction-card-category">
              <Tag size={11} style={{ display: 'inline', marginRight: 4 }} />
              {category?.name}
            </span>
            <Link to={`/auctions/${id}`} className="auction-card-title-link">
              <h3 className="auction-card-title">{productTitle}</h3>
            </Link>
          </div>
          <span className={`badge badge-${status?.toLowerCase()}`}>
            {status?.charAt(0) + status?.slice(1).toLowerCase()}
          </span>
        </div>

        <div className="auction-card-price-row">
          <div>
            <div className="auction-price-label">{priceLabel}</div>
            <div className="auction-price-value">
              ₹{formatCurrency(displayPrice)}
            </div>
          </div>
          {currentHighestBid && (
            <div className="text-right">
              <div className="auction-price-label">Next bid</div>
              <div className="auction-price-starting">₹{formatCurrency(minimumNextBid)}</div>
            </div>
          )}
        </div>

        <div className="auction-card-meta">
          <div className="auction-card-meta-item">
            <Gavel size={12} />
            {bidCount} bid{bidCount !== 1 ? 's' : ''}
          </div>
          {status === 'ACTIVE' && endTime && (
            <div className="auction-card-meta-item">
              <Clock size={12} />
              Ends {formatRelativeTime(endTime)}
            </div>
          )}
          {status === 'SCHEDULED' && (
            <div className="auction-card-meta-item text-muted">
              Starts {formatRelativeTime(auction.startTime)}
            </div>
          )}
          {status === 'ENDED' && (
            <div className="auction-card-meta-item text-muted">
              Ended
            </div>
          )}
        </div>
      </div>

      <div className="auction-card-footer">
        <Link to={`/auctions/${id}`} className="btn btn-secondary btn-sm btn-full">
          View Auction <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  );
}
