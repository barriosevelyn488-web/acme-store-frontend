// Pure OOP AppRouter Class
class AppRouter {
  constructor() {
    this._currentView = 'catalog';
  }

  get currentView() {
    return this._currentView;
  }

  async init() {
    console.log('Iniciando Acme Store Frontend...');
    await authComponent.checkCurrentSession();
    await catalogComponent.loadBooks();
    this.navigate('catalog');
  }

  navigate(view) {
    if ((view === 'my-loans' || view === 'my-sales' || view === 'profile') && !authComponent.currentUser) {
      toastNotification.show('Inicia sesión para acceder a esta sección.', 'info');
      authComponent.openModal('login');
      return;
    }

    if (view === 'admin' && (!authComponent.currentUser || authComponent.currentUser.rol !== 'admin')) {
      toastNotification.show('Acceso restringido a administradores.', 'warning');
      return;
    }

    this._currentView = view;

    const views = ['catalog', 'my-loans', 'my-sales', 'admin', 'profile'];
    views.forEach(v => {
      const el = document.getElementById(`view-${v}`);
      if (el) {
        if (v === view) {
          el.classList.remove('hidden');
        } else {
          el.classList.add('hidden');
        }
      }
    });

    const navButtons = document.querySelectorAll('.nav-tab');
    navButtons.forEach(btn => {
      btn.classList.remove('text-brand-600', 'bg-brand-50');
    });

    const activeNav = document.getElementById(`nav-btn-${view === 'my-loans' ? 'loans' : view === 'my-sales' ? 'sales' : view}`);
    if (activeNav) {
      activeNav.classList.add('text-brand-600', 'bg-brand-50');
    }

    if (view === 'catalog') catalogComponent.loadBooks();
    if (view === 'my-loans') loanComponent.loadMyLoans();
    if (view === 'my-sales') salesComponent.loadMySales();
    if (view === 'admin') adminComponent.initDashboard();
    if (view === 'profile') profileComponent.loadProfile();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

const appRouter = new AppRouter();
document.addEventListener('DOMContentLoaded', () => {
  appRouter.init();
});
