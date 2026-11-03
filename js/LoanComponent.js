// Pure OOP LoanComponent Class (Zero Emojis, Pure SVGs)
class LoanComponent {
  constructor() {
    this._modal = document.getElementById('modal-loan');
    this._loans = [];
  }

  async openLoanModal(bookId, bookTitle) {
    if (!authComponent.currentUser) {
      toastNotification.show('Inicia sesión para solicitar un préstamo de lectura.', 'info');
      authComponent.openModal('login');
      return;
    }

    document.getElementById('loan-book-id').value = bookId;
    document.getElementById('loan-modal-book-title').textContent = `Obra: ${bookTitle}`;

    const today = new Date();
    const fechaPrestamoStr = today.toISOString().split('T')[0];
    const tentative = new Date();
    tentative.setDate(today.getDate() + 14);
    const fechaTentativaStr = tentative.toISOString().split('T')[0];

    document.getElementById('loan-fecha-prestamo').value = fechaPrestamoStr;
    document.getElementById('loan-fecha-tentativa').value = fechaTentativaStr;
    document.getElementById('loan-notas').value = '';

    const selectorContainer = document.getElementById('loan-user-selector-container');
    const selector = document.getElementById('loan-target-user-id');
    if (authComponent.currentUser.rol === 'admin') {
      selectorContainer.classList.remove('hidden');
      try {
        const res = await apiClient.get('/users');
        const users = res.data || [];
        selector.innerHTML = users
          .map(u => `<option value="${u.id}">${u.nombre} (${u.identificacion} - ${u.email})</option>`)
          .join('');
      } catch (e) {
        console.error('Error fetching users:', e);
      }
    } else {
      selectorContainer.classList.add('hidden');
    }

    if (this._modal) this._modal.classList.remove('hidden');
  }

  closeModal() {
    if (this._modal) this._modal.classList.add('hidden');
  }

  async handleConfirmLoan(event) {
    event.preventDefault();
    const libroId = document.getElementById('loan-book-id').value;
    const fechaPrestamo = document.getElementById('loan-fecha-prestamo').value;
    const fechaTentativaDevolucion = document.getElementById('loan-fecha-tentativa').value;
    const notas = document.getElementById('loan-notas').value;

    const payload = {
      libroId: parseInt(libroId, 10),
      fechaPrestamo,
      fechaTentativaDevolucion,
      notas
    };

    if (authComponent.currentUser.rol === 'admin') {
      const selectedUserId = document.getElementById('loan-target-user-id').value;
      if (selectedUserId) {
        payload.usuarioId = parseInt(selectedUserId, 10);
      }
    }

    try {
      await apiClient.post('/loans', payload);
      this.closeModal();
      toastNotification.show('Préstamo registrado. Stock disponible actualizado.', 'success');
      catalogComponent.loadBooks();
      if (appRouter.currentView === 'my-loans') {
        this.loadMyLoans();
      }
    } catch (err) {
      toastNotification.show(err.message || 'Error al solicitar préstamo', 'error');
    }
  }

  async loadMyLoans() {
    try {
      const res = await apiClient.get('/loans/my');
      this._loans = res.data || [];
      this.renderMyLoans();
    } catch (err) {
      toastNotification.show('Error al cargar historial de préstamos', 'error');
    }
  }

  renderMyLoans() {
    const container = document.getElementById('my-loans-container');
    if (!container) return;

    if (!this._loans || this._loans.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12 bg-white rounded-3xl border border-slate-200">
          <svg class="w-10 h-10 mx-auto text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          <p class="text-xs font-bold text-slate-700">No posees préstamos activos</p>
          <p class="text-[11px] text-slate-400 mt-1">Explora el catálogo y solicita el libro que desees leer.</p>
        </div>
      `;
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    container.innerHTML = this._loans
      .map(loan => {
        const isReturned = loan.estado === 'devuelto';
        const isDelayed = loan.estado === 'retrasado' || (!isReturned && todayStr > loan.fechaTentativaDevolucion);
        
        let statusBadge = '';
        if (isReturned) {
          statusBadge = '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Devuelto</span>';
        } else if (isDelayed) {
          statusBadge = '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 animate-pulse">Vencido / Retrasado</span>';
        } else {
          statusBadge = '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">En Préstamo</span>';
        }

        return `
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="space-y-1">
              <div class="flex items-center space-x-2">
                <span class="font-serif font-bold text-sm text-slate-900">${loan.libro?.titulo || `Libro #${loan.libroId}`}</span>
                ${statusBadge}
              </div>
              <p class="text-xs text-slate-500">Autor: <span class="font-medium text-slate-700">${loan.libro?.autor || '-'}</span> | ISBN: <span class="font-mono text-slate-600">${loan.libro?.isbn || '-'}</span></p>
              ${loan.notas ? `<p class="text-[11px] text-slate-400 italic">Notas: ${loan.notas}</p>` : ''}
            </div>

            <div class="flex flex-wrap items-center gap-3 text-xs">
              <div class="bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                <span class="text-[10px] text-slate-400 uppercase font-bold block">Fecha Préstamo</span>
                <span class="font-semibold text-slate-700">${loan.fechaPrestamo}</span>
              </div>

              <div class="bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                <span class="text-[10px] text-slate-400 uppercase font-bold block">Fecha Límite</span>
                <span class="font-semibold ${isDelayed ? 'text-rose-600 font-bold' : 'text-slate-700'}">${loan.fechaTentativaDevolucion}</span>
              </div>

              ${loan.fechaDevolucionReal ? `
                <div class="bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100">
                  <span class="text-[10px] text-emerald-600 uppercase font-bold block">Devuelto el:</span>
                  <span class="font-bold text-emerald-700">${loan.fechaDevolucionReal}</span>
                </div>
              ` : ''}
            </div>
          </div>
        `;
      })
      .join('');
  }
}

const loanComponent = new LoanComponent();
