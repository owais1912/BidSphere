import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Gavel, User, ChevronDown, Menu, X, LogOut, LayoutDashboard, List, Plus, Heart, ShieldCheck } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setMenuOpen(false);
    navigate('/');
  };

  const navLinkClass = ({ isActive }) => `nav-link ${isActive ? 'nav-link--active' : ''}`;

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={() => setMenuOpen(false)}>
          <div className="logo-mark">
            <Gavel size={18} strokeWidth={2.5} />
          </div>
          <span className="logo-text">BidSphere</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="navbar-nav" role="navigation" aria-label="Main navigation">
          <NavLink to="/auctions" className={navLinkClass}>Browse Auctions</NavLink>
          <NavLink to="/categories" className={navLinkClass}>Categories</NavLink>
          <NavLink to="/how-it-works" className={navLinkClass}>How It Works</NavLink>
        </nav>

        {/* Desktop Auth */}
        <div className="navbar-actions">
          {isAuthenticated ? (
            <>
              <NavLink to="/auctions/create" className="btn btn-secondary btn-sm">
                <Plus size={15} />
                Create Auction
              </NavLink>
              <div className="user-menu-wrapper" ref={userMenuRef}>
                <button
                  className="user-menu-trigger"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  aria-expanded={userMenuOpen}
                  aria-label="User menu"
                >
                  <div className="user-avatar">
                    {user?.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <span className="user-name">{user?.fullName?.split(' ')[0]}</span>
                  <ChevronDown size={14} className={`chevron ${userMenuOpen ? 'chevron--open' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="user-menu-dropdown" role="menu">
                    <div className="user-menu-header">
                      <div className="user-menu-name">{user?.fullName}</div>
                      <div className="user-menu-email">{user?.email}</div>
                    </div>
                    <div className="user-menu-divider" />
                    <Link to="/dashboard" className="user-menu-item" role="menuitem" onClick={() => setUserMenuOpen(false)}>
                      <LayoutDashboard size={15} /> Dashboard
                    </Link>
                    <Link to="/dashboard?tab=bids" className="user-menu-item" role="menuitem" onClick={() => setUserMenuOpen(false)}>
                      <Heart size={15} /> My Bids
                    </Link>
                    <Link to="/dashboard?tab=listings" className="user-menu-item" role="menuitem" onClick={() => setUserMenuOpen(false)}>
                      <List size={15} /> My Listings
                    </Link>
                    {isAdmin && (
                      <>
                        <div className="user-menu-divider" />
                        <Link to="/admin" className="user-menu-item user-menu-item--admin" role="menuitem" onClick={() => setUserMenuOpen(false)}>
                          <ShieldCheck size={15} /> Admin Dashboard
                        </Link>
                      </>
                    )}
                    <div className="user-menu-divider" />
                    <button className="user-menu-item user-menu-item--danger" role="menuitem" onClick={handleLogout}>
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="navbar-mobile-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu" role="dialog" aria-label="Mobile navigation">
          <nav className="mobile-menu-nav">
            <NavLink to="/auctions" className={navLinkClass} onClick={() => setMenuOpen(false)}>Browse Auctions</NavLink>
            <NavLink to="/how-it-works" className={navLinkClass} onClick={() => setMenuOpen(false)}>How It Works</NavLink>
            {isAuthenticated ? (
              <>
                <NavLink to="/dashboard" className={navLinkClass} onClick={() => setMenuOpen(false)}>Dashboard</NavLink>
                <NavLink to="/dashboard?tab=bids" className={navLinkClass} onClick={() => setMenuOpen(false)}>My Bids</NavLink>
                <NavLink to="/dashboard?tab=listings" className={navLinkClass} onClick={() => setMenuOpen(false)}>My Listings</NavLink>
                <NavLink to="/auctions/create" className={navLinkClass} onClick={() => setMenuOpen(false)}>Create Auction</NavLink>
                {isAdmin && <NavLink to="/admin" className={navLinkClass} onClick={() => setMenuOpen(false)}>Admin</NavLink>}
                <div className="mobile-menu-divider" />
                <button className="mobile-logout-btn" onClick={handleLogout}>
                  <LogOut size={16} /> Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary btn-full" onClick={() => setMenuOpen(false)}>Sign In</Link>
                <Link to="/register" className="btn btn-primary btn-full" onClick={() => setMenuOpen(false)}>Register</Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
