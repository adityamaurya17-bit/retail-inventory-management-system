import { renderLandingNav } from "../components/landing/LandingNav.js";
import { renderLandingHero } from "../components/landing/LandingHero.js";
import { renderAdminFeatures } from "../components/landing/AdminFeatures.js";
import { renderAdminWorkflow } from "../components/landing/AdminWorkflow.js";
import { renderContactSection } from "../components/landing/ContactSection.js";
import { renderLandingFooter } from "../components/landing/LandingFooter.js";

/**
 * Public Stockora Administrator Homepage View
 * The primary public, unauthenticated entrypoint to the Stockora system.
 */
export function renderHomeView() {
  return `
    <div class="public-landing-page" id="public-landing-page">
      ${renderLandingNav()}
      <main id="public-main-content">
        ${renderLandingHero()}
        ${renderAdminFeatures()}
        ${renderAdminWorkflow()}
        ${renderContactSection()}
      </main>
      ${renderLandingFooter()}
    </div>
  `;
}

/**
 * Bind interactive events for Public Landing Page
 */
export function setupHomeViewEvents(onNavigate, onOpenLogin) {
  const root = document.getElementById("public-landing-page");
  if (!root) return;

  // -------------------------------------------------------------
  // 1. Admin Login Triggers (Header, Hero, Footer, Mobile Drawer)
  // -------------------------------------------------------------
  const loginSelectors = [
    "#btn-nav-admin-login",
    "#btn-hero-admin-login",
    "#footer-link-login",
    "#footer-btn-login",
    "#btn-mobile-nav-login"
  ];

  loginSelectors.forEach((selector) => {
    root.querySelectorAll(selector).forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        // Close mobile drawer if open
        closeMobileDrawer();
        if (typeof onOpenLogin === "function") {
          onOpenLogin();
        } else {
          onNavigate("login");
        }
      });
    });
  });

  // -------------------------------------------------------------
  // 2. Mobile Drawer Navigation Toggle
  // -------------------------------------------------------------
  const mobileToggleBtn = root.querySelector("#btn-public-mobile-menu");
  const mobileDrawer = root.querySelector("#public-mobile-drawer");
  const menuIcon = root.querySelector("#public-menu-icon");

  function closeMobileDrawer() {
    if (mobileDrawer && mobileDrawer.classList.contains("open")) {
      mobileDrawer.classList.remove("open");
      mobileToggleBtn?.setAttribute("aria-expanded", "false");
      if (menuIcon) {
        menuIcon.setAttribute("data-lucide", "menu");
        if (window.lucide) window.lucide.createIcons({ root: mobileToggleBtn });
      }
    }
  }

  function toggleMobileDrawer() {
    if (!mobileDrawer) return;
    const isOpen = mobileDrawer.classList.toggle("open");
    mobileToggleBtn?.setAttribute("aria-expanded", isOpen ? "true" : "false");
    if (menuIcon) {
      menuIcon.setAttribute("data-lucide", isOpen ? "x" : "menu");
      if (window.lucide) window.lucide.createIcons({ root: mobileToggleBtn });
    }
  }

  if (mobileToggleBtn) {
    mobileToggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleMobileDrawer();
    });
  }

  // Close mobile drawer when clicking any link inside it
  root.querySelectorAll(".public-mobile-link").forEach((link) => {
    link.addEventListener("click", () => {
      closeMobileDrawer();
    });
  });

  // Close mobile drawer when clicking outside
  document.addEventListener("click", (e) => {
    if (mobileDrawer && mobileDrawer.classList.contains("open")) {
      if (!mobileDrawer.contains(e.target) && !mobileToggleBtn?.contains(e.target)) {
        closeMobileDrawer();
      }
    }
  });

  // -------------------------------------------------------------
  // 3. Smooth Section Scrolling & Active Navigation Link Update
  // -------------------------------------------------------------
  const navLinks = root.querySelectorAll(".public-nav-link, .public-mobile-link");
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (href && href.startsWith("#")) {
        const targetId = href.replace(/^#/, "");
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          e.preventDefault();
          history.pushState(null, "", href);
          targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
          updateActiveNavLink(targetId);
        }
      }
    });
  });

  function updateActiveNavLink(sectionId) {
    root.querySelectorAll(".public-nav-link").forEach((l) => {
      const sec = l.dataset.navSection;
      l.classList.toggle("active", sec === sectionId);
    });
  }

  // -------------------------------------------------------------
  // 4. Contact Form Validation & Academic Demonstration Handling
  // -------------------------------------------------------------
  // 4. Contact Form Validation & Lower Center Pop-Up Feedback
  // -------------------------------------------------------------
  const contactForm = root.querySelector("#public-contact-form");
  const submitBtn = root.querySelector("#btn-submit-contact");
  const submitLabel = root.querySelector("#submit-contact-label");

  function showLowerCenterPopup(title, htmlMessage, duration = 5500) {
    let container = document.getElementById("lower-center-popup-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "lower-center-popup-container";
      container.className = "popup-lower-center-container";
      document.body.appendChild(container);
    }

    container.innerHTML = "";

    const popup = document.createElement("div");
    popup.className = "popup-lower-center";
    popup.setAttribute("role", "status");
    popup.setAttribute("aria-live", "polite");

    popup.innerHTML = `
      <div class="popup-icon-wrap">
        <i data-lucide="check-circle"></i>
      </div>
      <div class="popup-content">
        <div class="popup-title">${title}</div>
        <p class="popup-message">${htmlMessage}</p>
      </div>
      <button type="button" class="popup-close-btn" aria-label="Dismiss notification">&times;</button>
    `;

    let dismissTimer;
    const dismiss = () => {
      if (dismissTimer) clearTimeout(dismissTimer);
      popup.classList.add("hide");
      setTimeout(() => {
        if (popup.parentNode) popup.parentNode.removeChild(popup);
      }, 250);
    };

    popup.querySelector(".popup-close-btn").addEventListener("click", dismiss);
    container.appendChild(popup);

    if (window.lucide) {
      window.lucide.createIcons({ root: popup });
    }

    if (duration > 0) {
      dismissTimer = setTimeout(dismiss, duration);
    }
  }

  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      // Clear previous error states
      const fields = ["name", "email", "subject", "message"];
      fields.forEach((f) => {
        const input = root.querySelector(`#contact-${f}`);
        const errEl = root.querySelector(`#err-contact-${f}`);
        input?.classList.remove("input-error");
        if (errEl) errEl.textContent = "";
      });

      const nameVal = root.querySelector("#contact-name")?.value.trim() || "";
      const emailVal = root.querySelector("#contact-email")?.value.trim() || "";
      const subjectVal = root.querySelector("#contact-subject")?.value.trim() || "";
      const messageVal = root.querySelector("#contact-message")?.value.trim() || "";

      let hasError = false;

      // Validation
      if (!nameVal || nameVal.length < 2) {
        showFieldError("name", "Please provide your full name (minimum 2 characters).");
        hasError = true;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailVal || !emailRegex.test(emailVal)) {
        showFieldError("email", "Please provide a valid email address.");
        hasError = true;
      }

      if (!subjectVal || subjectVal.length < 3) {
        showFieldError("subject", "Please provide a subject (minimum 3 characters).");
        hasError = true;
      }

      if (!messageVal || messageVal.length < 10) {
        showFieldError("message", "Please provide message details (minimum 10 characters).");
        hasError = true;
      }

      if (hasError) return;

      // Professional feedback handling
      if (submitBtn) submitBtn.disabled = true;
      if (submitLabel) submitLabel.textContent = "Sending Message...";

      setTimeout(() => {
        contactForm.reset();
        if (submitBtn) submitBtn.disabled = false;
        if (submitLabel) submitLabel.textContent = "Send Message";

        // Display pop up in lower center of the webpage
        showLowerCenterPopup(
          "Message Received",
          `Thank you, <strong>${escapeHtml(nameVal)}</strong>. Your inquiry has been received and our operations team will get back to you shortly.`
        );
      }, 400);
    });
  }

  function showFieldError(field, msg) {
    const input = root.querySelector(`#contact-${field}`);
    const errEl = root.querySelector(`#err-contact-${field}`);
    input?.classList.add("input-error");
    if (errEl) errEl.textContent = msg;
  }

  function escapeHtml(str) {
    return str.replace(/[&<>'"]/g, (tag) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;"
    }[tag] || tag));
  }

  // -------------------------------------------------------------
  // 5. Scroll to targeted hash if initial load had e.g. #features
  // -------------------------------------------------------------
  const currentHash = (window.location.hash || "").replace(/^#/, "");
  if (currentHash && ["features", "how-it-works", "contact"].includes(currentHash)) {
    const el = document.getElementById(currentHash);
    if (el) {
      setTimeout(() => {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        updateActiveNavLink(currentHash);
      }, 100);
    }
  }
}
