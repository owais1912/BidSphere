import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, FileText, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import './LegalPages.css';

export function PrivacyPolicyPage() {
  return (
    <div className="legal-page">
      <div className="container container-md">
        <div className="legal-header">
          <div className="legal-icon"><Shield size={28} /></div>
          <h1 className="legal-title">Privacy Policy</h1>
          <p className="legal-meta">Last updated: October 2026 · BidSphere Academic Platform</p>
        </div>

        <div className="legal-content">
          <section>
            <h2>1. Information We Collect</h2>
            <p>
              BidSphere collects basic registration credentials including your full name, email address, and encrypted password hashes. When participating in the auction marketplace, bid timestamps, amounts, and listing details are recorded in our relational database to facilitate auction mechanics.
            </p>
          </section>

          <section>
            <h2>2. How Information is Used</h2>
            <p>
              Your data is exclusively used to authenticate sessions, compute bidding increments, verify winning bids upon lot conclusion, and provide an account dashboard reflecting your personal listings and active bids.
            </p>
          </section>

          <section>
            <h2>3. Data Protection & Security</h2>
            <p>
              Passwords are cryptographically secured using industry-standard BCrypt hashing with salt rounds. Communication is secured via stateless JSON Web Tokens (JWT). We do not sell or monetize personal data.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export function TermsOfUsePage() {
  return (
    <div className="legal-page">
      <div className="container container-md">
        <div className="legal-header">
          <div className="legal-icon"><FileText size={28} /></div>
          <h1 className="legal-title">Terms of Service</h1>
          <p className="legal-meta">Effective Date: October 2026</p>
        </div>

        <div className="legal-content">
          <section>
            <h2>1. Binding Bids & Commitments</h2>
            <p>
              By placing a bid on any active auction on BidSphere, you acknowledge and agree that your bid constitutes a binding commitment to purchase the item at the stated figure should you emerge as the winning bidder upon auction conclusion.
            </p>
          </section>

          <section>
            <h2>2. Seller Obligations & Early Sale</h2>
            <p>
              Sellers represent that items listed are described accurately and in good faith. Sellers may choose to conclude an active auction early by accepting the current highest bid at any point before expiration using the "Sell to Bidder" feature.
            </p>
          </section>

          <section>
            <h2>3. Anti-Shill & Integrity Safeguards</h2>
            <p>
              Sellers are strictly barred from placing bids on their own listings. Fraudulent manipulation or circumventing platform rules will result in immediate account suspension by platform administrators.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export function ContactPage() {
  return (
    <div className="legal-page">
      <div className="container container-md">
        <div className="legal-header">
          <div className="legal-icon"><Mail size={28} /></div>
          <h1 className="legal-title">Contact & Support</h1>
          <p className="legal-meta">We are here to assist with any questions regarding auctions or your account</p>
        </div>

        <div className="contact-card">
          <h2>Get in Touch</h2>
          <p>
            Have an inquiry about an auction lot, seller onboarding, or platform technical architecture? Contact our academic project support team:
          </p>

          <div className="contact-details-grid">
            <div className="contact-item">
              <span className="contact-label">Technical Support</span>
              <span className="contact-val">support@bidsphere.local</span>
            </div>
            <div className="contact-item">
              <span className="contact-label">Admin Desk</span>
              <span className="contact-val">admin@bidsphere.com</span>
            </div>
            <div className="contact-item">
              <span className="contact-label">Response Time</span>
              <span className="contact-val">Within 24 hours</span>
            </div>
            <div className="contact-item">
              <span className="contact-label">Project Repository</span>
              <span className="contact-val">BidSphere Academic Portfolio</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
