import { useRef, useState } from "react";
import { Icon } from "./Icon.jsx";

export function Footer() {
  const [storesOpen, setStoresOpen] = useState(false);
  const downloadButton = useRef(null);

  return (
    <footer className="page-container site-footer">
      <img className="footer-divider" src="/assets/footer-divider.svg" alt="" />
      <div className="footer-columns">
        <div className="footer-brand-column">
          <div className="footer-brand" role="img" aria-label="Prana">
            <img className="footer-brand-mark" src="/assets/footer-brand-mark.svg" alt="" />
            <img className="footer-wordmark" src="/assets/footer-wordmark.svg" alt="" />
            <img className="footer-wordmark-detail" src="/assets/footer-wordmark-detail.svg" alt="" />
          </div>
          <p>PRANA 2026</p>
        </div>

        <div className="footer-information">
          <p className="footer-company">Heal Food Delivery Jalan Raya Padonan No. 41 A, Tibubeneng, Kuta Utara, Badung, Bali Bank name BCA Account number 7703037854</p>
          <p className="footer-platform">Runs on an reliable core&nbsp;<a href="https://foodpicasso.com/en" target="_blank" rel="noreferrer">Foodpicásso</a>&nbsp;ver. 2</p>
          <ul className="footer-contact-list">
            <li>
              <span className="location-icon footer-contact-icon"><img src="/assets/footer-whatsapp.svg" alt="" /></span>
              <span>Contact to manager</span>
            </li>
            <li>
              <span className="location-icon footer-contact-icon"><Icon name="location" /></span>
              <span>Delivery locations and<br />zones Reviews</span>
            </li>
          </ul>
        </div>

        <div className="footer-app-column">
          <img className="footer-column-divider" src="/assets/footer-column-divider.svg" alt="" />
          <h2>Promos, discounts and cashback – all in our app!</h2>
          <p className="footer-app-caption">Download Now!</p>
          <div className="footer-download"
            onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setStoresOpen(false); }}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setStoresOpen(false);
                downloadButton.current?.focus();
              }
            }}>
            <button type="button" className="footer-download-button" ref={downloadButton}
              aria-expanded={storesOpen} aria-controls="footer-app-stores" onClick={() => setStoresOpen((open) => !open)}>
              <img src="/assets/footer-app-mark.svg" alt="" />
              <span>Download App</span>
            </button>
            {storesOpen && (
              <div className="footer-app-stores" id="footer-app-stores" aria-label="Download Prana">
                <a href="https://apps.apple.com/us/app/id6803918738" target="_blank" rel="noreferrer">App Store</a>
                <a href="https://play.google.com/store/apps/details?id=kitchen.prana.app" target="_blank" rel="noreferrer">Google Play</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
