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
      toastNotification.show('Préstamo registrado exitosamente. Stock disponible actualizado.', 'success');
      await catalogComponent.loadBooks();
      appRouter.navigate('my-loans');
    } catch (err) {
      toastNotification.show(err.message || 'Error al solicitar préstamo', 'error');
    }
  }

  async loadMyLoans() {
    try {
      let res;
      try {
        res = await apiClient.get('/loans/my-loans');
      } catch (e) {
        res = await apiClient.get('/loans/my');
      }
      this._loans = res.data || [];
      this.renderMyLoans();
    } catch (err) {
      toastNotification.show('Error al cargar historial de préstamos', 'error');
    }
  }

  async returnLoan(loanId, libroTitulo = 'libro') {
    if (!confirm(`¿Confirmas la devolución de "${libroTitulo}" a la biblioteca?`)) {
      return;
    }

    try {
      try {
        await apiClient.patch(`/loans/${loanId}/return`);
      } catch (err) {
        await apiClient.post(`/loans/${loanId}/return`);
      }

      toastNotification.show(`Devolución de "${libroTitulo}" registrada exitosamente.`, 'success');
      await this.loadMyLoans();
      await catalogComponent.loadBooks();
    } catch (err) {
      toastNotification.show(err.message || 'Error al registrar devolución', 'error');
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

            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
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

              <div class="pt-2 sm:pt-0">
                ${!isReturned ? `
                  <button 
                    onclick="loanComponent.returnLoan(${loan.id}, '${(loan.libro?.titulo || 'Libro #' + loan.libroId).replace(/'/g, "\\'")}')" 
                    class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                    <span>Devolver Libro</span>
                  </button>
                ` : `
                  <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-500 text-xs font-medium">
                    <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span>Ejemplar Devuelto</span>
                  </span>
                `}
              </div>
            </div>
          </div>
        `;
      })
      .join('');
  }
}

const loanComponent = new LoanComponent();
