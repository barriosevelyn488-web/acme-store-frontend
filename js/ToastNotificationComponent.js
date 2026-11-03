// Pure OOP ToastNotificationComponent Class (Zero Emojis, Pure SVGs)
class ToastNotificationComponent {
  constructor(containerId = 'toast-container') {
    this._container = document.getElementById(containerId);
  }

  show(message, type = 'info', duration = 3500) {
    if (!this._container) return;

    const toast = document.createElement('div');
    toast.className = 'pointer-events-auto flex items-center space-x-3 px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold transform transition-all duration-300 translate-y-2 opacity-0';

    let iconSvg = '';
    let styleClasses = '';

    if (type === 'success') {
      styleClasses = 'bg-slate-900 text-emerald-400 border-slate-700';
      iconSvg = `
        <svg class="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
      `;
    } else if (type === 'error') {
      styleClasses = 'bg-slate-900 text-rose-400 border-slate-700';
      iconSvg = `
        <svg class="w-4 h-4 text-rose-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      `;
    } else if (type === 'warning') {
      styleClasses = 'bg-slate-900 text-amber-400 border-slate-700';
      iconSvg = `
        <svg class="w-4 h-4 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
      `;
    } else {
      styleClasses = 'bg-slate-900 text-sky-400 border-slate-700';
      iconSvg = `
        <svg class="w-4 h-4 text-sky-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      `;
    }

    toast.className += ` ${styleClasses}`;
    toast.innerHTML = `
      ${iconSvg}
      <span class="flex-1 text-slate-100">${message}</span>
    `;

    this._container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
    });

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-x-full');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, duration);
  }
}

const toastNotification = new ToastNotificationComponent();
