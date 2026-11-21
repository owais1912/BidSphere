import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auctionApi, categoryApi } from '../../api/services';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/helpers';
import {
  Gavel,
  Image as ImageIcon,
  Calendar,
  IndianRupee,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import './CreateAuctionPage.css';

const DEFAULT_IMAGE_SUGGESTIONS = [
  { label: 'Camera / Tech', url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80' },
  { label: 'Luxury Watch', url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80' },
  { label: 'Headphones', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80' },
  { label: 'Sneakers / Fashion', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80' },
];

export default function CreateAuctionPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  // Default dates: start in 5 minutes, end in 3 days
  const now = new Date();
  const defaultStart = new Date(now.getTime() + 5 * 60 * 1000).toISOString().slice(0, 16);
  const defaultEnd = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    imageUrl: '',
    startingPrice: '',
    minimumBidIncrement: '100',
    startTime: defaultStart,
    endTime: defaultEnd,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await categoryApi.getAll();
        setCategories(res.data);
        if (res.data.length > 0) {
          setFormData((prev) => ({ ...prev, categoryId: String(res.data[0].id) }));
        }
      } catch (err) {
        console.error('Failed to load categories', err);
        setServerError('Failed to load categories. Please reload.');
      } finally {
        setLoadingCategories(false);
      }
    }
    loadCategories();
  }, []);

  function validate() {
    const errs = {};
    if (!formData.title.trim()) {
      errs.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      errs.title = 'Title must be at least 3 characters';
    } else if (formData.title.trim().length > 255) {
      errs.title = 'Title cannot exceed 255 characters';
    }

    if (!formData.description.trim()) {
      errs.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      errs.description = 'Description must be at least 10 characters';
    }

    if (!formData.categoryId) {
      errs.categoryId = 'Category selection is required';
    }

    const startPrice = parseFloat(formData.startingPrice);
    if (!formData.startingPrice || isNaN(startPrice) || startPrice <= 0) {
      errs.startingPrice = 'Starting price must be greater than 0';
    }

    const minInc = parseFloat(formData.minimumBidIncrement);
    if (!formData.minimumBidIncrement || isNaN(minInc) || minInc <= 0) {
      errs.minimumBidIncrement = 'Minimum increment must be greater than 0';
    }

    if (!formData.startTime) {
      errs.startTime = 'Start time is required';
    }

    if (!formData.endTime) {
      errs.endTime = 'End time is required';
    } else if (formData.startTime && new Date(formData.endTime) <= new Date(formData.startTime)) {
      errs.endTime = 'End time must be after start time';
    }

    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        categoryId: parseInt(formData.categoryId, 10),
        imageUrl: formData.imageUrl.trim() || undefined,
        startingPrice: parseFloat(formData.startingPrice),
        minimumBidIncrement: parseFloat(formData.minimumBidIncrement),
        startTime: formData.startTime,
        endTime: formData.endTime,
      };

      const res = await auctionApi.create(payload);
      toast.success('Auction listing created successfully!');
      navigate(`/auctions/${res.data.id}`);
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="create-auction-page">
      <div className="container container-md">
        <div className="create-header">
          <div className="header-icon-badge">
            <Gavel size={24} />
          </div>
          <h1 className="create-title">Create Auction Listing</h1>
          <p className="create-subtitle">
            List your item for competitive bidding. Set your starting reserve, increments, and duration.
          </p>
        </div>

        {serverError && (
          <div className="alert alert-error mb-6">
            <AlertCircle size={18} />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="create-auction-form">
          {/* Section: Basic Info */}
          <div className="form-card">
            <h2 className="card-section-title">Item Information</h2>

            <div className="form-group">
              <label htmlFor="title" className="form-label form-label-required">
                Listing Title
              </label>
              <input
                id="title"
                type="text"
                className={`form-input ${errors.title ? 'error' : ''}`}
                placeholder="e.g. Vintage 1978 Mechanical Chronograph Watch"
                value={formData.title}
                onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                disabled={submitting}
              />
              {errors.title && <span className="form-error">{errors.title}</span>}
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="categoryId" className="form-label form-label-required">
                  Category
                </label>
                <select
                  id="categoryId"
                  className={`form-select ${errors.categoryId ? 'error' : ''}`}
                  value={formData.categoryId}
                  onChange={(e) => setFormData((p) => ({ ...p, categoryId: e.target.value }))}
                  disabled={loadingCategories || submitting}
                >
                  {loadingCategories && <option>Loading categories…</option>}
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && <span className="form-error">{errors.categoryId}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="imageUrl" className="form-label">
                  Image URL
                </label>
                <input
                  id="imageUrl"
                  type="url"
                  className="form-input"
                  placeholder="https://example.com/image.jpg"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData((p) => ({ ...p, imageUrl: e.target.value }))}
                  disabled={submitting}
                />
              </div>
            </div>

            {/* Quick image suggestions */}
            <div className="image-suggestions">
              <span className="suggestions-label">
                <Sparkles size={14} /> Quick image sample:
              </span>
              {DEFAULT_IMAGE_SUGGESTIONS.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="suggestion-tag"
                  onClick={() => setFormData((p) => ({ ...p, imageUrl: s.url }))}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {formData.imageUrl && (
              <div className="image-preview-box">
                <span className="preview-label">Image Preview:</span>
                <img
                  src={formData.imageUrl}
                  alt="Listing preview"
                  className="preview-img"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}

            <div className="form-group mt-4">
              <label htmlFor="description" className="form-label form-label-required">
                Detailed Description
              </label>
              <textarea
                id="description"
                rows={5}
                className={`form-textarea ${errors.description ? 'error' : ''}`}
                placeholder="Describe the condition, history, provenance, technical specifications, and what is included in the package…"
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                disabled={submitting}
              />
              {errors.description && <span className="form-error">{errors.description}</span>}
            </div>
          </div>

          {/* Section: Pricing & Bidding Rules */}
          <div className="form-card">
            <h2 className="card-section-title">Pricing & Increments</h2>

            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="startingPrice" className="form-label form-label-required">
                  Starting Price (₹)
                </label>
                <div className="input-with-symbol">
                  <span className="symbol">₹</span>
                  <input
                    id="startingPrice"
                    type="number"
                    step="1"
                    min="1"
                    className={`form-input ${errors.startingPrice ? 'error' : ''}`}
                    placeholder="e.g. 5000"
                    value={formData.startingPrice}
                    onChange={(e) => setFormData((p) => ({ ...p, startingPrice: e.target.value }))}
                    disabled={submitting}
                  />
                </div>
                {errors.startingPrice && (
                  <span className="form-error">{errors.startingPrice}</span>
                )}
                <span className="form-hint">The lowest initial bid you will accept.</span>
              </div>

              <div className="form-group">
                <label htmlFor="minimumBidIncrement" className="form-label form-label-required">
                  Minimum Bid Increment (₹)
                </label>
                <div className="input-with-symbol">
                  <span className="symbol">₹</span>
                  <input
                    id="minimumBidIncrement"
                    type="number"
                    step="1"
                    min="1"
                    className={`form-input ${errors.minimumBidIncrement ? 'error' : ''}`}
                    placeholder="e.g. 100"
                    value={formData.minimumBidIncrement}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, minimumBidIncrement: e.target.value }))
                    }
                    disabled={submitting}
                  />
                </div>
                {errors.minimumBidIncrement && (
                  <span className="form-error">{errors.minimumBidIncrement}</span>
                )}
                <span className="form-hint">Each new bid must exceed the previous by this amount.</span>
              </div>
            </div>
          </div>

          {/* Section: Schedule */}
          <div className="form-card">
            <h2 className="card-section-title">Auction Schedule</h2>

            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="startTime" className="form-label form-label-required">
                  Start Date & Time
                </label>
                <input
                  id="startTime"
                  type="datetime-local"
                  className={`form-input ${errors.startTime ? 'error' : ''}`}
                  value={formData.startTime}
                  onChange={(e) => setFormData((p) => ({ ...p, startTime: e.target.value }))}
                  disabled={submitting}
                />
                {errors.startTime && <span className="form-error">{errors.startTime}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="endTime" className="form-label form-label-required">
                  End Date & Time
                </label>
                <input
                  id="endTime"
                  type="datetime-local"
                  className={`form-input ${errors.endTime ? 'error' : ''}`}
                  value={formData.endTime}
                  onChange={(e) => setFormData((p) => ({ ...p, endTime: e.target.value }))}
                  disabled={submitting}
                />
                {errors.endTime && <span className="form-error">{errors.endTime}</span>}
              </div>
            </div>
          </div>

          {/* Submission Buttons */}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/auctions')}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              id="publish-auction-btn"
              className="btn btn-primary btn-lg"
              disabled={submitting}
            >
              {submitting ? 'Publishing Listing…' : 'Publish Auction Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
