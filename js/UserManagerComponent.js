// Pure OOP UserManagerComponent Class (Dedicated User Management for Admin)
class UserManagerComponent {
  constructor() {
    this._users = [];
    this._modal = document.getElementById('modal-user');
  }

  async loadUsersTable() {
    try {
      const res = await apiClient.get('/users');
      this._users = res.data || [];
      this.render();
    } catch (err) {
      console.error('Error cargando usuarios:', err);
      toastNotification.show('Error al cargar directorio de usuarios', 'error');
    }
  }

  render() {
    const tbody = document.getElementById('admin-users-table-body');
    if (!tbody) return;

    if (this._users.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="py-8 text-center text-slate-400">No se encontraron usuarios registrados.</td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = this._users
      .map(u => {
        const isAdmin = u.rol === 'admin';
        const roleBadge = isAdmin
          ? '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700">Administrador</span>'
          : '<span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">Lector</span>';

        const escapedUser = JSON.stringify(u).replace(/'/g, "&#39;");

        return `
          <tr class="hover:bg-slate-50 transition-colors">
            <td class="py-3 px-4 font-mono text-slate-500">#${u.id}</td>
            <td class="py-3 px-4 font-mono font-medium text-slate-700">${u.identificacion}</td>
            <td class="py-3 px-4 font-bold text-slate-800">${u.nombre}</td>
            <td class="py-3 px-4 text-slate-600">${u.email}</td>
            <td class="py-3 px-4 text-slate-500">${u.telefono || '-'}</td>
            <td class="py-3 px-4 text-center">${roleBadge}</td>
            <td class="py-3 px-4 text-right space-x-2">
              <button onclick='userManagerComponent.openEditUserModal(${escapedUser})' class="text-indigo-600 hover:text-indigo-900 font-semibold">
                Editar
              </button>
              <button onclick="userManagerComponent.confirmDeleteUser(${u.id}, '${u.nombre.replace(/'/g, "\\'")}')" class="text-rose-600 hover:text-rose-900 font-semibold">
                Eliminar
              </button>
            </td>
          </tr>
        `;
      })
      .join('');
  }

  openCreateUserModal() {
    document.getElementById('user-modal-title').textContent = 'Crear Nuevo Usuario';
    document.getElementById('user-form-id').value = '';
    document.getElementById('user-form-identificacion').value = '';
    document.getElementById('user-form-identificacion').disabled = false;
    document.getElementById('user-form-nombre').value = '';
    document.getElementById('user-form-email').value = '';
    document.getElementById('user-form-telefono').value = '';
    document.getElementById('user-form-direccion').value = '';
    document.getElementById('user-form-rol').value = 'cliente';
    document.getElementById('user-form-password').required = true;
    document.getElementById('user-form-password').value = '';

    if (this._modal) this._modal.classList.remove('hidden');
  }

  openEditUserModal(user) {
    document.getElementById('user-modal-title').textContent = 'Editar Usuario Existente';
    document.getElementById('user-form-id').value = user.id;
    document.getElementById('user-form-identificacion').value = user.identificacion;
    document.getElementById('user-form-identificacion').disabled = true; // Protect identification
    document.getElementById('user-form-nombre').value = user.nombre;
    document.getElementById('user-form-email').value = user.email;
    document.getElementById('user-form-telefono').value = user.telefono || '';
    document.getElementById('user-form-direccion').value = user.direccion || '';
    document.getElementById('user-form-rol').value = user.rol;
    document.getElementById('user-form-password').required = false;
    document.getElementById('user-form-password').value = '';

    if (this._modal) this._modal.classList.remove('hidden');
  }

  closeModal() {
    if (this._modal) this._modal.classList.add('hidden');
  }

  async handleSaveUser(event) {
    event.preventDefault();
    const id = document.getElementById('user-form-id').value;
    const payload = {
      identificacion: document.getElementById('user-form-identificacion').value.trim(),
      nombre: document.getElementById('user-form-nombre').value.trim(),
      email: document.getElementById('user-form-email').value.trim(),
      telefono: document.getElementById('user-form-telefono').value.trim(),
      direccion: document.getElementById('user-form-direccion').value.trim(),
      rol: document.getElementById('user-form-rol').value
    };

    const password = document.getElementById('user-form-password').value;
    if (password) {
      payload.password = password;
    }

    try {
      if (id) {
        await apiClient.put(`/users/${id}`, payload);
        toastNotification.show('Usuario actualizado con éxito.', 'success');
      } else {
        await apiClient.post('/users', payload);
        toastNotification.show('Usuario creado exitosamente.', 'success');
      }

      this.closeModal();
      this.loadUsersTable();
    } catch (err) {
      toastNotification.show(err.message || 'Error al guardar usuario', 'error');
    }
  }

  async confirmDeleteUser(id, nombre) {
    if (!confirm(`¿Confirmas la eliminación del usuario "${nombre}"?\n\nEl sistema validará que no posea préstamos activos ni compras registradas.`)) {
      return;
    }

    try {
      await apiClient.delete(`/users/${id}`);
      toastNotification.show(`Usuario "${nombre}" eliminado.`, 'success');
      this.loadUsersTable();
    } catch (err) {
      toastNotification.show(err.message || 'No se pudo eliminar el usuario', 'error');
    }
  }
}

const userManagerComponent = new UserManagerComponent();
