import React from 'react';
import { Link } from 'react-router-dom';
import {
  Gavel,
  ShieldCheck,
  TrendingUp,
  Clock,
  CheckCircle2,
  DollarSign,
  Package,
  ArrowRight,
} from 'lucide-react';
import './HowItWorksPage.css';

export default function HowItWorksPage() {

  return (
    <div className="how-it-works-page">
      <div className="container">
        {/* Hero */}
        <div className="hiw-hero">
          <div className="hiw-badge">Platform Architecture & Guidelines</div>
          <h1 className="hiw-title">How BidSphere Works</h1>
          <p className="hiw-subtitle">
            A transparent, fair, and reliable marketplace designed for discerning collectors, enthusiasts, and verified sellers.
          </p>
        </div>

        {/* Two Pathways: Buyers & Sellers */}
        <div className="hiw-pathways-grid">
          {/* Pathway 1: Buyers */}
          <div className="pathway-card">
            <div className="pathway-header">
              <div className="pathway-icon buyer-icon">
                <TrendingUp size={24} />
              </div>
              <h2 className="pathway-title">For Buyers & Collectors</h2>
            </div>
            <p className="pathway-desc">
              Bid with absolute confidence on curated items with verified provenance and transparent bidding histories.
            </p>

            <div className="steps-list">
              <div className="step-item">
                <div className="step-number">01</div>
                <div className="step-content">
                  <h3 className="step-heading">Create Your Account</h3>
                  <p className="step-body">
                    Register in seconds. Get instant access to live auctions, watchlist tracking, and detailed seller profiles.
                  </p>
                </div>
              </div>

              <div className="step-item">
                <div className="step-number">02</div>
                <div className="step-content">
                  <h3 className="step-heading">Place Competitive Bids</h3>
                  <p className="step-body">
                    Enter your offer. The system calculates minimum required increments and ensures your bids are recorded atomically.
                  </p>
                </div>
              </div>

              <div className="step-item">
                <div className="step-number">03</div>
                <div className="step-content">
                  <h3 className="step-heading">Monitor Standing</h3>
                  <p className="step-body">
                    Track your status in real-time from your dashboard with "Leading" vs "Outbid" status indicators.
                  </p>
                </div>
              </div>

              <div className="step-item">
                <div className="step-number">04</div>
                <div className="step-content">
                  <h3 className="step-heading">Win & Finalize</h3>
                  <p className="step-body">
                    When the clock expires or the seller accepts your offer early, claim your win and connect for fulfillment.
                  </p>
                </div>
              </div>
            </div>

            <Link to="/auctions" className="btn btn-primary btn-full mt-6">
              Explore Active Auctions <ArrowRight size={16} />
            </Link>
          </div>

          {/* Pathway 2: Sellers */}
          <div className="pathway-card">
            <div className="pathway-header">
              <div className="pathway-icon seller-icon">
                <Package size={24} />
              </div>
              <h2 className="pathway-title">For Sellers & Merchants</h2>
            </div>
            <p className="pathway-desc">
              List high-value items, set your reserve and minimum bid increments, and reach thousands of motivated bidders.
            </p>

            <div className="steps-list">
              <div className="step-item">
                <div className="step-number">01</div>
                <div className="step-content">
                  <h3 className="step-heading">Publish Your Listing</h3>
                  <p className="step-body">
                    Provide detailed item specifications, high-resolution imagery, starting reserve, and bidding duration.
                  </p>
                </div>
              </div>

              <div className="step-item">
                <div className="step-number">02</div>
                <div className="step-content">
                  <h3 className="step-heading">Watch Live Bidding</h3>
                  <p className="step-body">
                    Observe competitive bidding as collectors drive item value up past your starting price.
                  </p>
                </div>
              </div>

              <div className="step-item">
                <div className="step-number">03</div>
                <div className="step-content">
                  <h3 className="step-heading">Sell to Bidder Early</h3>
                  <p className="step-body">
                    Don't want to wait for the timer? Use the <strong>"Sell Now"</strong> feature to accept the current highest bid at any time.
                  </p>
                </div>
              </div>

              <div className="step-item">
                <div className="step-number">04</div>
                <div className="step-content">
                  <h3 className="step-heading">Automatic Settlement</h3>
                  <p className="step-body">
                    Concluded auctions permanently record winner credentials and final winning amounts in your dashboard.
                  </p>
                </div>
              </div>
            </div>

            <Link to="/auctions/create" className="btn btn-outline btn-full mt-6">
              List an Item for Auction <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Feature Safeguards Banner */}
        <div className="safeguards-section">
          <h2 className="safeguards-title">Core Marketplace Guarantees</h2>
          <div className="safeguards-grid">
            <div className="safeguard-box">
              <ShieldCheck size={28} className="safeguard-icon" />
              <h4>Zero Shill Bidding</h4>
              <p>Sellers are mathematically and programmatically barred from bidding on their own listings.</p>
            </div>
            <div className="safeguard-box">
              <Clock size={28} className="safeguard-icon" />
              <h4>Automated Scheduling</h4>
              <p>Reliable background daemons resolve expired lots every 60 seconds without manual delay.</p>
            </div>
            <div className="safeguard-box">
              <Gavel size={28} className="safeguard-icon" />
              <h4>Enforced Increments</h4>
              <p>Anti-sniping increment checks ensure every new bid represents meaningful, valid value growth.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
