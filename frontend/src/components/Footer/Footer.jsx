import React from 'react';
import { Link } from 'react-router-dom';
import { Gavel } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">
            <div className="logo-mark">
              <Gavel size={16} strokeWidth={2.5} />
            </div>
            <span className="logo-text">BidSphere</span>
          </div>
          <p className="footer-tagline">
            A fair, transparent online auction marketplace for buyers and sellers.
          </p>
        </div>

        <div className="footer-links">
          <div className="footer-col">
            <div className="footer-col-title">Platform</div>
            <Link to="/auctions">Browse Auctions</Link>
            <Link to="/auctions/create">Create Auction</Link>
            <Link to="/how-it-works">How It Works</Link>
          </div>
          <div className="footer-col">
            <div className="footer-col-title">Account</div>
            <Link to="/login">Sign In</Link>
            <Link to="/register">Register</Link>
            <Link to="/dashboard">Dashboard</Link>
          </div>
          <div className="footer-col">
            <div className="footer-col-title">Legal</div>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Use</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <span className="footer-copy">
            © {new Date().getFullYear()} BidSphere. Academic project — not a commercial service.
          </span>
          <span className="footer-stack">
            Built with Spring Boot · React · MySQL
          </span>
        </div>
      </div>
    </footer>
  );
}
