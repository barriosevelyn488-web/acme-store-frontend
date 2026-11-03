// Pure OOP ProfileComponent Class (Enforces Non-Editable Identification)
class ProfileComponent {
  async loadProfile() {
    try {
      const res = await apiClient.get('/profile');
      const user = res.data;
      if (!user) return;

      document.getElementById('profile-identificacion').value = user.identificacion;
      document.getElementById('profile-nombre').value = user.nombre;
      document.getElementById('profile-email').value = user.email;
      document.getElementById('profile-telefono').value = user.telefono || '';
      document.getElementById('profile-direccion').value = user.direccion || '';
    } catch (err) {
      toastNotification.show('Error al cargar datos del perfil', 'error');
    }
  }

  async onSubmit(event) {
    event.preventDefault();
    const nombre = document.getElementById('profile-nombre').value.trim();
    const email = document.getElementById('profile-email').value.trim();
    const telefono = document.getElementById('profile-telefono').value.trim();
    const direccion = document.getElementById('profile-direccion').value.trim();

    try {
      const res = await apiClient.put('/profile', {
        nombre,
        email,
        telefono,
        direccion
      });

      toastNotification.show('Perfil actualizado con éxito.', 'success');
      if (res.data) {
        authComponent._currentUser = res.data;
        authComponent.renderAuthenticatedNav();
      }
    } catch (err) {
      toastNotification.show(err.message || 'Error al actualizar perfil', 'error');
    }
  }
}

const profileComponent = new ProfileComponent();
