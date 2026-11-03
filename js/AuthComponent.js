// Pure OOP AuthComponent Class (Manual Login, Strict Roles, Zero Demo)
class AuthComponent {
  constructor() {
    this._currentUser = null;
    this._modal = document.getElementById('modal-auth');
    this._currentTab = 'login';
  }

  get currentUser() {
    return this._currentUser;
  }

  async checkCurrentSession() {
    try {
      const res = await apiClient.get('/auth/me');
      if (res && res.success && res.data) {
        this._currentUser = res.data;
        this.renderAuthenticatedNav();
      } else {
        this.renderGuestNav();
      }
    } catch (err) {
      this._currentUser = null;
      this.renderGuestNav();
    }
  }

  openModal(tab = 'login') {
    this.switchTab(tab);
    if (this._modal) this._modal.classList.remove('hidden');
  }

  closeModal() {
    if (this._modal) this._modal.classList.add('hidden');
  }

  switchTab(tab) {
    this._currentTab = tab;
    const loginTab = document.getElementById('auth-tab-login');
    const regTab = document.getElementById('auth-tab-register');
    const formLogin = document.getElementById('form-login');
    const formRegister = document.getElementById('form-register');

    if (tab === 'login') {
      loginTab.className = 'flex-1 pb-3 text-xs font-bold text-brand-600 border-b-2 border-brand-600';
      regTab.className = 'flex-1 pb-3 text-xs font-bold text-slate-400 border-b-2 border-transparent';
      formLogin.classList.remove('hidden');
      formRegister.classList.add('hidden');
    } else {
      regTab.className = 'flex-1 pb-3 text-xs font-bold text-brand-600 border-b-2 border-brand-600';
      loginTab.className = 'flex-1 pb-3 text-xs font-bold text-slate-400 border-b-2 border-transparent';
      formRegister.classList.remove('hidden');
      formLogin.classList.add('hidden');
    }
  }

  async handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    try {
      const response = await apiClient.post('/auth/login', { email, password });
      apiClient.setToken(response.data.token);
      this._currentUser = response.data.user;

      toastNotification.show(`Bienvenido, ${this._currentUser.nombre}.`, 'success');
      this.closeModal();
      this.renderAuthenticatedNav();

      if (this._currentUser.rol === 'admin') {
        appRouter.navigate('admin');
      } else {
        appRouter.navigate('catalog');
      }
      catalogComponent.loadBooks();
    } catch (err) {
      toastNotification.show(err.message || 'Credenciales inválidas.', 'error');
    }
  }

  async handleRegister(event) {
    event.preventDefault();
    const identificacion = document.getElementById('reg-id').value.trim();
    const nombre = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const telefono = document.getElementById('reg-phone').value.trim();
    const password = document.getElementById('reg-password').value;
    const direccion = document.getElementById('reg-address').value.trim();

    try {
      const response = await apiClient.post('/auth/register', {
        identificacion,
        nombre,
        email,
        telefono,
        direccion,
        password,
        rol: 'cliente'
      });

      apiClient.setToken(response.data.token);
      this._currentUser = response.data.user;

      toastNotification.show('Cuenta creada exitosamente.', 'success');
      this.closeModal();
      this.renderAuthenticatedNav();
      appRouter.navigate('catalog');
      catalogComponent.loadBooks();
    } catch (err) {
      toastNotification.show(err.message || 'Error en el registro.', 'error');
    }
  }

  async logout() {
    try {
      await apiClient.post('/auth/logout');
    } catch (e) {}
    apiClient.setToken(null);
    this._currentUser = null;
    this.renderGuestNav();
    toastNotification.show('Sesión cerrada con éxito.', 'info');
    appRouter.navigate('catalog');
  }

  renderAuthenticatedNav() {
    document.getElementById('nav-guest').classList.add('hidden');
    const navUser = document.getElementById('nav-user');
    navUser.classList.remove('hidden');

    const nameEl = document.getElementById('user-display-name');
    const badgeEl = document.getElementById('user-role-badge');
    const avatarEl = document.getElementById('user-avatar');

    nameEl.textContent = this._currentUser.nombre;
    avatarEl.textContent = this._currentUser.nombre.charAt(0).toUpperCase();

    const isAdmin = this._currentUser.rol === 'admin';
    badgeEl.textContent = isAdmin ? 'Administrador' : 'Lector';
    badgeEl.className = isAdmin
      ? 'text-[10px] font-bold uppercase text-indigo-600'
      : 'text-[10px] font-semibold uppercase text-brand-600';

    const navLoans = document.getElementById('nav-btn-loans');
    const navSales = document.getElementById('nav-btn-sales');
    const navAdmin = document.getElementById('nav-btn-admin');

    navLoans.classList.remove('hidden');
    navSales.classList.remove('hidden');

    if (isAdmin) {
      navAdmin.classList.remove('hidden');
    } else {
      navAdmin.classList.add('hidden');
    }
  }

  renderGuestNav() {
    document.getElementById('nav-guest').classList.remove('hidden');
    document.getElementById('nav-user').classList.add('hidden');
    document.getElementById('nav-btn-loans').classList.add('hidden');
    document.getElementById('nav-btn-sales').classList.add('hidden');
    document.getElementById('nav-btn-admin').classList.add('hidden');
  }
}

const authComponent = new AuthComponent();
