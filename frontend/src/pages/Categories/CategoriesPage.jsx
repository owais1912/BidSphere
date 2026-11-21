import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { categoryApi } from '../../api/services';
import {
  Cpu,
  Watch,
  Archive,
  BookOpen,
  Home,
  Gamepad2,
  ArrowRight,
  Layers,
  Sparkles,
} from 'lucide-react';
import './CategoriesPage.css';

const CATEGORY_ICONS = {
  Electronics: Cpu,
  'Watches & Accessories': Watch,
  Collectibles: Archive,
  Books: BookOpen,
  'Home & Furniture': Home,
  Gaming: Gamepad2,
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await categoryApi.getAll();
        setCategories(res.data);
      } catch (err) {
        console.error('Failed to load categories', err);
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, []);

  return (
    <div className="categories-page">
      <div className="container">
        <div className="categories-hero">
          <div className="categories-badge">
            <Layers size={14} /> Catalog Taxonomies
          </div>
          <h1 className="categories-title">Auction Categories</h1>
          <p className="categories-subtitle">
            Explore authentic collector items, rare electronics, and luxury goods organized by curated departments.
          </p>
        </div>

        {loading ? (
          <div className="categories-loading">
            <div className="spinner"></div>
            <p>Loading departments…</p>
          </div>
        ) : (
          <div className="categories-grid">
            {categories.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.name] || Layers;
              return (
                <Link
                  key={cat.id}
                  to={`/auctions?categoryId=${cat.id}`}
                  className="category-card"
                >
                  <div className="category-icon-box">
                    <Icon size={32} />
                  </div>
                  <div className="category-card-content">
                    <h2 className="category-name">{cat.name}</h2>
                    <p className="category-desc">{cat.description}</p>
                  </div>
                  <div className="category-card-footer">
                    <span>Browse department</span>
                    <ArrowRight size={16} />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
