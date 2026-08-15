import React from 'react';

/**
 * SizeChartModal Component
 * Static measurement size chart guide for Dresses and Nighties.
 * Responsive glassmorphic modal readable on mobile devices.
 */
export default function SizeChartModal({ isOpen, onClose, category = 'Dress' }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card size-chart-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="size-icon-gold">📏</span>
            <h3>Size Guide — {category}</h3>
          </div>
          <button type="button" className="btn-modal-close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        <div className="modal-body">
          <p className="size-chart-intro">
            Standard measurements in inches. Measure around the fullest part of your bust and waist for the best fit.
          </p>

          <div className="table-responsive-wrapper">
            <table className="size-chart-table">
              <thead>
                <tr>
                  <th>Size</th>
                  <th>Bust (in)</th>
                  <th>Waist (in)</th>
                  <th>Hip (in)</th>
                  <th>Length (in)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong className="size-tag">S</strong></td>
                  <td>34" - 36"</td>
                  <td>28" - 30"</td>
                  <td>36" - 38"</td>
                  <td>42" - 44"</td>
                </tr>
                <tr>
                  <td><strong className="size-tag">M</strong></td>
                  <td>36" - 38"</td>
                  <td>30" - 32"</td>
                  <td>38" - 40"</td>
                  <td>44" - 46"</td>
                </tr>
                <tr>
                  <td><strong className="size-tag">L</strong></td>
                  <td>38" - 40"</td>
                  <td>32" - 34"</td>
                  <td>40" - 42"</td>
                  <td>46" - 48"</td>
                </tr>
                <tr>
                  <td><strong className="size-tag">XL</strong></td>
                  <td>40" - 42"</td>
                  <td>34" - 36"</td>
                  <td>42" - 44"</td>
                  <td>48" - 50"</td>
                </tr>
                <tr>
                  <td><strong className="size-tag">XXL</strong></td>
                  <td>42" - 44"</td>
                  <td>36" - 38"</td>
                  <td>44" - 46"</td>
                  <td>50" - 52"</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="size-fit-tips">
            <p>💡 <em>Tip: If you prefer a relaxed or free-flowing fit, consider selecting one size larger. For custom tailoring inquiries, tap "Buy Now on WhatsApp".</em></p>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close Size Guide
          </button>
        </div>
      </div>
    </div>
  );
}
