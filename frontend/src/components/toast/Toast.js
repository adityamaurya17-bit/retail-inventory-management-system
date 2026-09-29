// Toast notification service
class ToastService {
  constructor() {
    this.container = null;
    this.ensureContainer();
  }

  ensureContainer() {
    if (!this.container) {
      let el = document.getElementById("toast-container");
      if (!el) {
        el = document.createElement("div");
        el.id = "toast-container";
        el.className = "toast-container";
        document.body.appendChild(el);
      }
      this.container = el;
    }
  }

  show(message, type = "info", duration = 3800) {
    this.ensureContainer();
    const toast = document.createElement("div");
    toast.className = `toast-item toast-${type} animate-slide-in`;

    let icon = "info";
    if (type === "success") icon = "check-circle";
    if (type === "warning") icon = "alert-triangle";
    if (type === "error") icon = "alert-octagon";

    toast.innerHTML = `
      <div class="toast-icon">
        <i data-lucide="${icon}"></i>
      </div>
      <div class="toast-body">
        <span class="toast-text">${message}</span>
      </div>
      <button class="toast-close" aria-label="Dismiss">&times;</button>
    `;

    const closeBtn = toast.querySelector(".toast-close");
    const removeToast = () => {
      toast.classList.add("animate-fade-out");
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 250);
    };

    closeBtn.addEventListener("click", removeToast);
    this.container.appendChild(toast);

    if (window.lucide) {
      window.lucide.createIcons({ root: toast });
    }

    if (duration > 0) {
      setTimeout(removeToast, duration);
    }
  }

  success(msg, duration) {
    this.show(msg, "success", duration);
  }

  warning(msg, duration) {
    this.show(msg, "warning", duration);
  }

  error(msg, duration) {
    this.show(msg, "error", duration);
  }

  info(msg, duration) {
    this.show(msg, "info", duration);
  }
}

export const toast = new ToastService();
