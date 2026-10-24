import { renderLandingNav } from "../components/landing/LandingNav.js";
import { renderContactSection } from "../components/landing/ContactSection.js";
import { renderLandingFooter } from "../components/landing/LandingFooter.js";
import { setupHomeViewEvents } from "./HomeView.js";

/**
 * Dedicated Public Contact View
 * Rendered when user navigates directly to #contact.
 */
export function renderContactView() {
  return `
    <div class="public-landing-page public-contact-standalone" id="public-landing-page">
      ${renderLandingNav()}
      <main id="public-main-content" style="padding-top: 40px; padding-bottom: 60px;">
        ${renderContactSection()}
      </main>
      ${renderLandingFooter()}
    </div>
  `;
}

export function setupContactViewEvents(onNavigate, onOpenLogin) {
  setupHomeViewEvents(onNavigate, onOpenLogin);
}
