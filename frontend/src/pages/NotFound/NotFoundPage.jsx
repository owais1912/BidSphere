import React from 'react';
import { Link } from 'react-router-dom';
import { Gavel, Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="container" style={{ textAlign: 'center', padding: 'var(--space-16) var(--space-4)', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-full)', background: 'var(--color-bg-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', marginBottom: 'var(--space-4)' }}>
        <Gavel size={32} />
      </div>
      <h1 style={{ fontFamily: 'var(--font-display, serif)', fontSize: 'var(--font-4xl)', fontWeight: 700, color: 'var(--color-text)', marginBottom: 'var(--space-2)' }}>
        404
      </h1>
      <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 600, color: 'var(--color-text)', marginBottom: 'var(--space-2)' }}>
        Page Not Found
      </h2>
      <p style={{ color: 'var(--color-text-muted)', maxWidth: 460, marginBottom: 'var(--space-6)' }}>
        The lot or page you're searching for might have been concluded, removed, or never existed in the catalog.
      </p>
      <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
        <Link to="/" className="btn btn-primary">
          <Home size={16} /> Return to Home
        </Link>
        <Link to="/auctions" className="btn btn-outline">
          Explore Auctions
        </Link>
      </div>
    </div>
  );
}
