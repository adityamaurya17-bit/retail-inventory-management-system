/**
 * Public Contact Section & Institutional Form
 * Features client-side validation and transparent academic demonstration feedback.
 */
export function renderContactSection() {
  return `
    <section class="landing-contact-section" id="contact">
      <div class="landing-container">
        
        <div class="contact-layout-split">
          
          <!-- Contact Narrative & Details (Left) -->
          <div class="contact-info-panel">
            <div class="section-tag-pill">COMMUNICATIONS</div>
            <h2 class="contact-heading">Contact Stockora Operations</h2>
            <p class="contact-subtext">
              Have questions regarding our inventory platform, system deployment, or administrative modules? Send our team a message.
            </p>

            <div class="contact-meta-cards">
              <div class="contact-meta-item">
                <div class="meta-icon-box"><i data-lucide="mail"></i></div>
                <div>
                  <span class="meta-label">Administrative Contact</span>
                  <span class="meta-val font-mono">adityamaurya@retailhub.in</span>
                </div>
              </div>

              <div class="contact-meta-item">
                <div class="meta-icon-box"><i data-lucide="shield-check"></i></div>
                <div>
                  <span class="meta-label">Platform Architecture</span>
                  <span class="meta-val">Hexagonal Core &amp; Audit Ledger</span>
                </div>
              </div>

              <div class="contact-meta-item">
                <div class="meta-icon-box"><i data-lucide="map-pin"></i></div>
                <div>
                  <span class="meta-label">Operations Scope</span>
                  <span class="meta-val">Multi-Warehouse Supply Chain</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Contact Form (Right) -->
          <div class="contact-form-panel">
            <div class="form-card-wrapper">
              <h3 class="form-card-title">Send an Inquiry</h3>
              <p class="form-card-subtitle">Fill in the fields below and our operations team will respond promptly.</p>

              <form id="public-contact-form" class="public-contact-form" novalidate>
                <div class="form-group">
                  <label for="contact-name" class="form-label">Full Name <span class="required">*</span></label>
                  <input 
                    type="text" 
                    id="contact-name" 
                    name="name" 
                    required 
                    placeholder="e.g. Elena Rostova" 
                    class="form-control"
                    autocomplete="name"
                  />
                  <span class="form-field-error" id="err-contact-name"></span>
                </div>

                <div class="form-group">
                  <label for="contact-email" class="form-label">Email Address <span class="required">*</span></label>
                  <input 
                    type="email" 
                    id="contact-email" 
                    name="email" 
                    required 
                    placeholder="e.g. name@organization.com" 
                    class="form-control"
                    autocomplete="email"
                  />
                  <span class="form-field-error" id="err-contact-email"></span>
                </div>

                <div class="form-group">
                  <label for="contact-subject" class="form-label">Subject <span class="required">*</span></label>
                  <input 
                    type="text" 
                    id="contact-subject" 
                    name="subject" 
                    required 
                    placeholder="e.g. Warehouse bin allocation module inquiry" 
                    class="form-control"
                  />
                  <span class="form-field-error" id="err-contact-subject"></span>
                </div>

                <div class="form-group">
                  <label for="contact-message" class="form-label">Message Content <span class="required">*</span></label>
                  <textarea 
                    id="contact-message" 
                    name="message" 
                    rows="4" 
                    required 
                    placeholder="Describe your inquiry or feedback..." 
                    class="form-control"
                  ></textarea>
                  <span class="form-field-error" id="err-contact-message"></span>
                </div>

                <button type="submit" class="btn btn-primary btn-block btn-lg" id="btn-submit-contact">
                  <i data-lucide="send"></i>
                  <span id="submit-contact-label">Send Message</span>
                </button>
              </form>
            </div>
          </div>

        </div>

      </div>
    </section>
  `;
}
