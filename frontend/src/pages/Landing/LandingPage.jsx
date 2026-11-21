import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, Gavel, TrendingUp, Shield, Cpu, Watch, Archive, BookOpen, Home, Gamepad2 } from 'lucide-react';
import AuctionCard from '../../components/AuctionCard/AuctionCard';
import { auctionApi } from '../../api/services';
import './LandingPage.css';

const CATEGORY_ICONS = {
  'Electronics': Cpu,
  'Watches & Accessories': Watch,
  'Collectibles': Archive,
  'Books': BookOpen,
  'Home & Furniture': Home,
  'Gaming': Gamepad2,
};

const STEPS = [
  {
    number: '01',
    title: 'Discover an Item',
    desc: 'Browse hundreds of auction listings. Search by category, price, or time remaining to find exactly what you\'re looking for.',
  },
  {
    number: '02',
    title: 'Place a Bid',
    desc: 'Register for free and place your bid. The minimum bid is shown clearly. Your bid is validated in real time on our servers.',
  },
  {
    number: '03',
    title: 'Win the Auction',
    desc: 'When the auction closes, the highest valid bid wins. The winner is determined fairly and transparently by our system.',
  },
];

const CATEGORIES = [
  { name: 'Electronics', icon: 'Electronics', desc: 'Cameras, gadgets, computers' },
  { name: 'Watches & Accessories', icon: 'Watches & Accessories', desc: 'Timepieces and fashion' },
  { name: 'Collectibles', icon: 'Collectibles', desc: 'Antiques and memorabilia' },
  { name: 'Books', icon: 'Books', desc: 'Rare editions and prints' },
  { name: 'Home & Furniture', icon: 'Home & Furniture', desc: 'Vintage home decor' },
  { name: 'Gaming', icon: 'Gaming', desc: 'Consoles and gear' },
];

export default function LandingPage() {
  const [featured, setFeatured] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  useEffect(() => {
    auctionApi.getFeatured()
      .then(res => setFeatured(res.data))
      .catch(() => setFeatured([]))
      .finally(() => setLoadingFeatured(false));
  }, []);

  return (
    <div className="landing">
      {/* ── HERO ── */}
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-text">
            <span className="label-overline">The Online Auction Marketplace</span>
            <h1 className="hero-heading serif">
              Find something<br />worth bidding on.
            </h1>
            <p className="hero-desc">
              BidSphere connects buyers and sellers in a transparent, 
              fair auction environment. Browse real listings, place real bids, 
              and win items you love.
            </p>
            <div className="hero-actions">
              <Link to="/auctions" className="btn btn-primary btn-lg">
                Explore Auctions <ArrowRight size={18} />
              </Link>
              <Link to="/auctions/create" className="btn btn-secondary btn-lg">
                Start Selling
              </Link>
            </div>
          </div>
          <div className="hero-image-wrapper">
            <img
              src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=700&auto=format&q=80"
              alt="Auction item — professional camera"
              className="hero-image"
            />
            <div className="hero-image-badge">
              <Gavel size={14} />
              Live Auctions
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURED AUCTIONS ── */}
      <section className="section section-featured">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="label-overline">Live Right Now</span>
              <h2 className="section-title" style={{ marginTop: 4 }}>Featured Auctions</h2>
            </div>
            <Link to="/auctions" className="btn btn-ghost btn-sm">
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {loadingFeatured ? (
            <div className="featured-skeleton-grid">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="featured-skeleton">
                  <div className="skeleton" style={{ height: 200 }} />
                  <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div className="skeleton" style={{ height: 14, width: '60%' }} />
                    <div className="skeleton" style={{ height: 20, width: '85%' }} />
                    <div className="skeleton" style={{ height: 14, width: '40%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : featured.length === 0 ? (
            <div className="empty-state">
              <Gavel size={40} className="empty-state-icon" />
              <h3>No active auctions yet</h3>
              <p>Be the first to create an auction listing on BidSphere.</p>
              <Link to="/auctions/create" className="btn btn-primary">Create Auction</Link>
            </div>
          ) : (
            <div className="auctions-grid">
              {featured.slice(0, 8).map(auction => (
                <AuctionCard key={auction.id} auction={auction} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="section section-categories">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="label-overline">Browse by Type</span>
              <h2 className="section-title" style={{ marginTop: 4 }}>Categories</h2>
            </div>
          </div>
          <div className="categories-grid">
            {CATEGORIES.map(cat => {
              const Icon = CATEGORY_ICONS[cat.icon] || Archive;
              return (
                <Link
                  key={cat.name}
                  to={`/auctions?category=${encodeURIComponent(cat.name)}`}
                  className="category-tile"
                >
                  <div className="category-tile-icon">
                    <Icon size={22} strokeWidth={1.75} />
                  </div>
                  <div className="category-tile-text">
                    <div className="category-tile-name">{cat.name}</div>
                    <div className="category-tile-desc">{cat.desc}</div>
                  </div>
                  <ArrowRight size={16} className="category-tile-arrow" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="section section-how">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="label-overline">The Process</span>
              <h2 className="section-title" style={{ marginTop: 4 }}>How It Works</h2>
            </div>
          </div>
          <div className="steps-grid">
            {STEPS.map((step, i) => (
              <div key={i} className="step">
                <div className="step-number">{step.number}</div>
                <div className="step-title">{step.title}</div>
                <p className="step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SELLER CTA ── */}
      <section className="section-cta">
        <div className="container">
          <div className="cta-inner">
            <div className="cta-text">
              <h2 className="cta-title serif">Have something to sell?</h2>
              <p className="cta-desc">
                Create an auction listing in minutes. Set your starting price, 
                duration, and let the market decide the value.
              </p>
            </div>
            <Link to="/auctions/create" className="btn btn-primary btn-lg">
              Create Your Listing <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
