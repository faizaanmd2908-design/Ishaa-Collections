import React from 'react';
import { Link } from 'react-router-dom';
import { BOUTIQUE_WHATSAPP_PHONE } from '../utils/whatsappHelper';

/**
 * CustomerFooter Component
 * Clean boutique catalog footer.
 */
export default function CustomerFooter() {
  const whatsappUrl = `https://wa.me/${BOUTIQUE_WHATSAPP_PHONE.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hi Ishaa Collections, I have an inquiry about your catalogue.')}`;

  return (
    <footer className="customer-footer">
      <div className="footer-content-grid">
        <div className="footer-brand-col">
          <div className="footer-brand-header">
            <div className="brand-emblem-gold">IC</div>
            <span className="brand-name-serif">ISHAA COLLECTIONS</span>
          </div>
          <p className="footer-desc">
            Handpicked boutique sarees, elegant designer dresses, and comfortable nightwear. Direct catalogue ordering via WhatsApp with Pan India shipping.
          </p>
        </div>

        <div className="footer-links-col">
          <h4>Explore Catalogue</h4>
          <ul>
            <li><Link to="/category/saree">Designer Sarees</Link></li>
            <li><Link to="/category/dress">Casual & Party Dresses</Link></li>
            <li><Link to="/category/nighty">Comfort Nighties</Link></li>
            <li><Link to="/category/all">All Collections</Link></li>
          </ul>
        </div>

        <div className="footer-contact-col">
          <h4>Order Assistance</h4>
          <p>Have questions about size, fabric, or shipping?</p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp-footer"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.758.459 3.474 1.33 4.988L2 22l5.133-1.346a9.97 9.97 0 0 0 4.879 1.27h.004c5.505 0 9.989-4.478 9.99-9.985A9.998 9.998 0 0 0 12.012 2z" />
            </svg>
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <span>© {new Date().getFullYear()} Ishaa Collections. All rights reserved.</span>
        <span className="footer-sub-note">Boutique Catalogue & WhatsApp Ordering</span>
      </div>
    </footer>
  );
}
