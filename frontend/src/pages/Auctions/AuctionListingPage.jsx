import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { auctionApi, categoryApi } from '../../api/services';
import AuctionCard from '../../components/AuctionCard/AuctionCard';
import { Search, Filter, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import './AuctionListingPage.css';

export default function AuctionListingPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [auctions, setAuctions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Read URL search params
  const currentSearch = searchParams.get('search') || '';
  const currentCategory = searchParams.get('categoryId') || '';
  const currentStatus = searchParams.get('status') || '';
  const currentSort = searchParams.get('sortBy') || 'newest';
  const currentPage = parseInt(searchParams.get('page') || '0', 10);

  const [searchInput, setSearchInput] = useState(currentSearch);

  // Fetch categories on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await categoryApi.getAll();
        setCategories(res.data);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    }
    loadCategories();
  }, []);

  // Fetch auctions whenever query params change
  useEffect(() => {
    async function loadAuctions() {
      setLoading(true);
      setError(null);
      try {
        const params = {
          search: currentSearch || undefined,
          categoryId: currentCategory || undefined,
          status: currentStatus || undefined,
          sortBy: currentSort,
          page: currentPage,
          size: 12,
        };
        const res = await auctionApi.getAuctions(params);
        setAuctions(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
        setTotalElements(res.data.totalElements || 0);
      } catch (err) {
        console.error('Failed to load auctions', err);
        setError('Failed to load auctions. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadAuctions();
  }, [currentSearch, currentCategory, currentStatus, currentSort, currentPage]);

  function updateFilters(updates) {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    // Reset to page 0 on any filter/search change
    if (!('page' in updates)) {
      newParams.set('page', '0');
    }
    setSearchParams(newParams);
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    updateFilters({ search: searchInput.trim() });
  }

  function handleClearFilters() {
    setSearchInput('');
    setSearchParams({});
  }

  const hasActiveFilters = Boolean(currentSearch || currentCategory || currentStatus || (currentSort && currentSort !== 'newest'));

  return (
    <div className="auction-listing-page">
      <div className="container">
        {/* Page Header */}
        <div className="listing-header">
          <div>
            <h1 className="listing-title">Explore Auctions</h1>
            <p className="listing-subtitle">
              Discover unique collector pieces, rare electronics, luxury watches, and more
            </p>
          </div>
          <div className="listing-count-badge">
            {totalElements} {totalElements === 1 ? 'Auction' : 'Auctions'} Found
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="listing-toolbar">
          <form className="listing-search-form" onSubmit={handleSearchSubmit}>
            <div className="search-input-wrapper">
              <Search className="search-icon" size={18} />
              <input
                type="text"
                placeholder="Search by title, description, or keyword…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="search-input"
              />
              {searchInput && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => {
                    setSearchInput('');
                    updateFilters({ search: '' });
                  }}
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </form>

          <div className="listing-filters">
            {/* Category Filter */}
            <div className="filter-select-group">
              <label htmlFor="category-select" className="filter-label">
                Category
              </label>
              <select
                id="category-select"
                className="form-select"
                value={currentCategory}
                onChange={(e) => updateFilters({ categoryId: e.target.value })}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="filter-select-group">
              <label htmlFor="status-select" className="filter-label">
                Status
              </label>
              <select
                id="status-select"
                className="form-select"
                value={currentStatus}
                onChange={(e) => updateFilters({ status: e.target.value })}
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active (Live)</option>
                <option value="UPCOMING">Upcoming</option>
                <option value="ENDED">Ended</option>
              </select>
            </div>

            {/* Sort Order */}
            <div className="filter-select-group">
              <label htmlFor="sort-select" className="filter-label">
                Sort By
              </label>
              <select
                id="sort-select"
                className="form-select"
                value={currentSort}
                onChange={(e) => updateFilters({ sortBy: e.target.value })}
              >
                <option value="newest">Newly Listed</option>
                <option value="endingSoon">Ending Soonest</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                className="btn btn-outline btn-sm clear-filters-btn"
                onClick={handleClearFilters}
              >
                <X size={14} /> Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="listing-grid-skeleton">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card-skeleton">
                <div className="skeleton-img"></div>
                <div className="skeleton-body">
                  <div className="skeleton-line line-short"></div>
                  <div className="skeleton-line line-title"></div>
                  <div className="skeleton-line line-price"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="listing-state listing-state-error">
            <p>{error}</p>
            <button
              onClick={() => updateFilters({})}
              className="btn btn-primary btn-sm mt-4"
            >
              Retry
            </button>
          </div>
        ) : auctions.length === 0 ? (
          <div className="listing-state listing-state-empty">
            <div className="empty-icon-circle">
              <Search size={32} />
            </div>
            <h2 className="empty-title">No auctions found</h2>
            <p className="empty-subtitle">
              We couldn't find any auctions matching your current filters. Try searching for something else or clearing your criteria.
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                className="btn btn-secondary mt-4"
                onClick={handleClearFilters}
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="auction-grid">
              {auctions.map((auction) => (
                <AuctionCard key={auction.id} auction={auction} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  disabled={currentPage === 0}
                  onClick={() => updateFilters({ page: currentPage - 1 })}
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  disabled={currentPage >= totalPages - 1}
                  onClick={() => updateFilters({ page: currentPage + 1 })}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
