import { store, ROLES, DEMO_ACCOUNTS } from "../state/store.js";
import { toast } from "../components/toast/Toast.js";
import confetti from "canvas-confetti";

/**
 * Dedicated Administrator Login View
 * Strictly for Administrator / Management Access.
 * (Customer/User side removed as requested).
 */
export function renderLoginView() {
  const adminAccount = DEMO_ACCOUNTS.WAREHOUSE_INVENTORY;

  return `
    <div class="login-page-root animate-fade-in" id="login-page-root">
      <div class="login-card-shell" style="max-width: 440px; margin: 40px auto; background: var(--bg-card, #ffffff); border-radius: 16px; padding: 36px 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid rgba(0,0,0,0.06);">
        
        <!-- Brand Identity Header -->
        <div class="login-card-header" style="text-align: center; margin-bottom: 24px;">
          <div class="login-brand-mark-wrap" style="display: flex; justify-content: center; margin-bottom: 14px;">
            <img 
              src="/stockora-icon.png" 
              alt="Stockora" 
              style="width: 64px; height: 64px; object-fit: contain; filter: drop-shadow(0 4px 12px rgba(26, 100, 240, 0.2));" 
            />
          </div>
          
          <h1 class="login-brand-title" style="font-size: 1.6rem; font-weight: 900; letter-spacing: -0.02em; color: var(--text-main, #0f172a); margin: 0 0 8px 0;">
            STOCK<span style="background: linear-gradient(135deg, #00b4d8, #00c48c); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">ORA</span>
          </h1>

          <div style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 14px; background: rgba(26, 100, 240, 0.08); border-radius: 999px; color: #1a64f0; font-size: 0.78rem; font-weight: 700;">
            <i data-lucide="shield-check" style="width: 14px; height: 14px;"></i>
            <span>Administrator Portal</span>
          </div>
        </div>

        <!-- Error Notification Alert -->
        <div id="login-view-error" class="alert-box alert-danger" style="display: none; margin-bottom: 18px; padding: 10px 14px; border-radius: 8px; font-size: 0.82rem; background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; align-items: center; gap: 8px;">
          <i data-lucide="alert-triangle" style="width: 16px; height: 16px; flex-shrink: 0;"></i>
          <span id="login-view-error-text">Invalid administrator credentials.</span>
        </div>

        <!-- Credentials Form -->
        <form id="form-login-view" class="login-form">
          <div class="form-group" style="margin-bottom: 16px;">
            <label for="input-login-email" class="form-label" style="display: block; font-size: 0.8rem; font-weight: 600; color: var(--text-main, #334155); margin-bottom: 6px;">Admin Email / Username</label>
            <div class="input-with-icon" style="position: relative;">
              <i data-lucide="mail" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: #94a3b8;"></i>
              <input 
                type="email" 
                id="input-login-email" 
                name="email" 
                required 
                placeholder="admin@retailhub.in" 
                value="" 
                autocomplete="off" 
                style="width: 100%; padding: 10px 12px 10px 38px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.88rem; outline: none; transition: border-color 0.2s;"
              />
            </div>
            <div id="login-view-email-error" style="display: none; color: #dc2626; font-size: 0.76rem; margin-top: 5px; align-items: center; gap: 4px;">
              <i data-lucide="alert-circle" style="width: 13px; height: 13px; flex-shrink: 0;"></i>
              <span id="login-view-email-error-text">Please enter a valid administrator email.</span>
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 20px;">
            <label for="input-login-password" class="form-label" style="display: block; font-size: 0.8rem; font-weight: 600; color: var(--text-main, #334155); margin-bottom: 6px;">Password</label>
            <div class="input-with-icon" style="position: relative;">
              <i data-lucide="lock" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: #94a3b8;"></i>
              <input 
                type="password" 
                id="input-login-password" 
                name="password" 
                required 
                placeholder="" 
                value="" 
                autocomplete="off" 
                style="width: 100%; padding: 10px 38px 10px 38px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.88rem; outline: none; transition: border-color 0.2s;"
              />
              <button 
                type="button" 
                id="btn-login-toggle-pwd" 
                class="btn-icon-inside" 
                title="Show / Hide Password"
                style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #94a3b8; padding: 4px;"
              >
                <i data-lucide="eye" id="login-pwd-eye-icon" style="width: 16px; height: 16px;"></i>
              </button>
            </div>
          </div>

          <!-- Remember Me Checkbox -->
          <div class="login-remember-row" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 22px;">
            <label for="input-login-remember" style="display: inline-flex; align-items: center; gap: 9px; cursor: pointer; font-size: 0.85rem; color: var(--text-main, #334155); user-select: none;">
              <input 
                type="checkbox" 
                id="input-login-remember" 
                name="rememberMe" 
                style="width: 17px; height: 17px; accent-color: #1a64f0; cursor: pointer; border-radius: 4px;"
              />
              <span style="font-weight: 500;">Remember me</span>
            </label>
            <span style="color: #64748b; font-size: 0.78rem;">Keep me signed in</span>
          </div>

          <!-- Submit Action Button -->
          <button 
            type="submit" 
            id="btn-login-view-submit" 
            class="btn btn-primary btn-block btn-lg"
            style="width: 100%; padding: 12px; font-size: 0.95rem; font-weight: 700; border-radius: 8px; background: linear-gradient(135deg, #1a64f0, #00b4d8); color: #ffffff; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 12px rgba(26, 100, 240, 0.25);"
          >
            <i data-lucide="log-in" style="width: 18px; height: 18px;"></i>
            <span id="login-submit-label">Sign In to Admin Console</span>
          </button>
        </form>

        <!-- System & Version Footer -->
        <div class="login-card-footer" style="text-align: center; margin-top: 22px; font-size: 0.75rem; color: #94a3b8;">
          <span>Stockora Admin v1.0</span>
        </div>

      </div>
    </div>
  `;
}

/**
 * Bind Interactive Events for Administrator Login View
 */
export function setupLoginViewEvents(onNavigate) {
  const root = document.getElementById("login-page-root");
  if (!root) return;

  const form = root.querySelector("#form-login-view");
  const emailInput = root.querySelector("#input-login-email");
  const pwdInput = root.querySelector("#input-login-password");
  const rememberCheckbox = root.querySelector("#input-login-remember");
  const togglePwdBtn = root.querySelector("#btn-login-toggle-pwd");
  const eyeIcon = root.querySelector("#login-pwd-eye-icon");
  const errorBox = root.querySelector("#login-view-error");
  const errorText = root.querySelector("#login-view-error-text");
  const submitBtn = root.querySelector("#btn-login-view-submit");
  const submitLabel = root.querySelector("#login-submit-label");
  const emailError = root.querySelector("#login-view-email-error");
  const emailErrorText = root.querySelector("#login-view-email-error-text");

  // Email validation logic on blur and submit
  const validateEmail = (showError = true) => {
    const val = emailInput ? emailInput.value.trim() : "";
    if (!val) {
      if (showError && emailError && emailErrorText) {
        emailErrorText.textContent = "Admin email or username is required.";
        emailError.style.display = "flex";
        if (emailInput) emailInput.style.borderColor = "#ef4444";
        if (window.lucide) window.lucide.createIcons({ root: emailError });
      }
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val)) {
      if (showError && emailError && emailErrorText) {
        emailErrorText.textContent = "Please enter a valid email address.";
        emailError.style.display = "flex";
        if (emailInput) emailInput.style.borderColor = "#ef4444";
        if (window.lucide) window.lucide.createIcons({ root: emailError });
      }
      return false;
    }

    if (emailError) emailError.style.display = "none";
    if (emailInput) emailInput.style.borderColor = "#cbd5e1";
    return true;
  };

  emailInput?.addEventListener("blur", () => {
    validateEmail(true);
  });

  emailInput?.addEventListener("input", () => {
    if (emailError && emailError.style.display !== "none") {
      validateEmail(true);
    }
  });

  // Toggle Password Visibility
  if (togglePwdBtn && pwdInput) {
    togglePwdBtn.addEventListener("click", () => {
      const isPassword = pwdInput.type === "password";
      pwdInput.type = isPassword ? "text" : "password";
      if (eyeIcon) {
        eyeIcon.setAttribute("data-lucide", isPassword ? "eye-off" : "eye");
        if (window.lucide) window.lucide.createIcons({ root: togglePwdBtn });
      }
    });
  }

  // Core Login Execution
  const performLogin = async (email, password, rememberMe = false) => {
    errorBox.style.display = "none";
    submitBtn.disabled = true;
    submitLabel.textContent = "Authenticating administrator...";

    const res = await store.login(email, password, ROLES.WAREHOUSE_INVENTORY, rememberMe);

    if (res.success) {
      toast.success(`Welcome back, ${res.user.name}! Administrator session active.`);
      try {
        confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
      } catch (e) {}

      // Navigate to Administrator Dashboard
      onNavigate("dashboard");
    } else {
      submitBtn.disabled = false;
      submitLabel.textContent = "Sign In to Admin Console";
      errorBox.style.display = "flex";
      errorText.textContent = res.message || "Invalid administrator credentials.";
      if (window.lucide) window.lucide.createIcons({ root: errorBox });
    }
  };

  // Form Submit Handler
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const isEmailValid = validateEmail(true);
    if (!isEmailValid) {
      emailInput?.focus();
      return;
    }

    const email = emailInput?.value.trim();
    const password = pwdInput?.value;
    const rememberMe = Boolean(rememberCheckbox?.checked);
    await performLogin(email, password, rememberMe);
  });
}
