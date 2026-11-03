// Pure OOP AdminComponent Class (Zero Emojis, Pure SVGs, Full Operations)
class AdminComponent {
  constructor() {
    this._currentSubTab = 'books';
    this._bookModal = document.getElementById('modal-book');
    this._returnModal = document.getElementById('modal-return-loan');
    this._olModal = document.getElementById('modal-openlibrary');
  }

  async initDashboard() {
    await Promise.all([
      this.loadKpiMetrics(),
      this.loadBooksTable(),
      this.loadLoansTable(),
      this.loadSalesTable()
    ]);
  }

  switchTab(tab) {
    this._currentSubTab = tab;
    const tabs = ['books', 'loans', 'sales', 'users'];
    tabs.forEach(t => {
      const btn = document.getElementById(`admin-tab-btn-${t}`);
      const panel = document.getElementById(`admin-subtab-${t}`);
      if (t === tab) {
        btn.className = 'admin-tab-btn pb-3 text-xs font-bold border-b-2 border-brand-600 text-brand-600 flex items-center space-x-1.5';
        panel.classList.remove('hidden');
      } else {
        btn.className = 'admin-tab-btn pb-3 text-xs font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-800 flex items-center space-x-1.5';
        panel.classList.add('hidden');
      }
    });

    if (tab === 'books') this.loadBooksTable();
    if (tab === 'loans') this.loadLoansTable();
    if (tab === 'sales') this.loadSalesTable();
    if (tab === 'users') userManagerComponent.loadUsersTable();
  }

  async loadKpiMetrics() {
    try {
      const [booksRes, loanMetricsRes, saleMetricsRes] = await Promise.all([
        apiClient.get('/books'),
        apiClient.get('/loans/metrics'),
        apiClient.get('/sales/metrics')
      ]);

      const books = booksRes.data || [];
      const loanMetrics = loanMetricsRes.data || {};
      const saleMetrics = saleMetricsRes.data || {};

      document.getElementById('kpi-total-books').textContent = books.length;
      document.getElementById('kpi-active-loans').textContent = loanMetrics.activos || 0;
      document.getElementById('kpi-delayed-loans').textContent = loanMetrics.retrasados || 0;
      document.getElementById('kpi-sales-revenue').textContent = `$${Number(saleMetrics.totalRecaudado || 0).toFixed(2)}`;
      document.getElementById('kpi-sales-count').textContent = `${saleMetrics.totalVentasCount || 0} compras registradas`;
    } catch (e) {
      console.error('Error cargando métricas:', e);
    }
  }

  // ================= BOOKS CRUD =================
  async loadBooksTable() {
    try {
      const res = await apiClient.get('/books');
      const books = res.data || [];
      const tbody = document.getElementById('admin-books-table-body');
      if (!tbody) return;

      tbody.innerHTML = books
        .map(b => `
          <tr class="hover:bg-slate-50 transition-colors">
            <td class="py-3 px-4 font-mono font-medium text-slate-600">${b.isbn}</td>
            <td class="py-3 px-4 font-bold text-slate-800">${b.titulo}</td>
            <td class="py-3 px-4 text-slate-600">${b.autor}</td>
            <td class="py-3 px-4 font-bold text-slate-900">$${Number(b.precioVenta).toFixed(2)}</td>
            <td class="py-3 px-4 text-center font-semibold text-slate-700">${b.stockTotal}</td>
            <td class="py-3 px-4 text-center">
              <span class="px-2 py-0.5 rounded-full text-[11px] font-bold ${
                b.stockDisponible > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }">
                ${b.stockDisponible}
              </span>
            </td>
            <td class="py-3 px-4 text-right space-x-2">
              <button onclick='adminComponent.openEditBookModal(${JSON.stringify(b).replace(/'/g, "&#39;")})' class="text-indigo-600 hover:text-indigo-900 font-semibold">
                Editar
              </button>
              <button onclick="adminComponent.confirmDeleteBook(${b.id}, '${b.titulo.replace(/'/g, "\\'")}')" class="text-rose-600 hover:text-rose-900 font-semibold">
                Eliminar
              </button>
            </td>
          </tr>
        `)
        .join('');
    } catch (e) {
      console.error('Error cargando tabla de libros:', e);
    }
  }

  openCreateBookModal() {
    document.getElementById('book-modal-title').textContent = 'Crear Nuevo Libro';
    document.getElementById('book-form-id').value = '';
    document.getElementById('book-form-isbn').value = '';
    document.getElementById('book-form-titulo').value = '';
    document.getElementById('book-form-autor').value = '';
    document.getElementById('book-form-editorial').value = '';
    document.getElementById('book-form-anio').value = new Date().getFullYear();
    document.getElementById('book-form-resumen').value = '';
    document.getElementById('book-form-precio').value = '19.99';
    document.getElementById('book-form-stock-total').value = '10';
    document.getElementById('book-form-stock-disponible').value = '10';

    if (this._bookModal) this._bookModal.classList.remove('hidden');
  }

  openEditBookModal(book) {
    document.getElementById('book-modal-title').textContent = 'Editar Libro Existente';
    document.getElementById('book-form-id').value = book.id;
    document.getElementById('book-form-isbn').value = book.isbn;
    document.getElementById('book-form-titulo').value = book.titulo;
    document.getElementById('book-form-autor').value = book.autor;
    document.getElementById('book-form-editorial').value = book.editorial || '';
    document.getElementById('book-form-anio').value = book.anioPublicacion || '';
    document.getElementById('book-form-resumen').value = book.resumen || '';
    document.getElementById('book-form-precio').value = book.precioVenta;
    document.getElementById('book-form-stock-total').value = book.stockTotal;
    document.getElementById('book-form-stock-disponible').value = book.stockDisponible;

    if (this._bookModal) this._bookModal.classList.remove('hidden');
  }

  closeBookModal() {
    if (this._bookModal) this._bookModal.classList.add('hidden');
  }

  async handleSaveBook(event) {
    event.preventDefault();
    const id = document.getElementById('book-form-id').value;
    const payload = {
      isbn: document.getElementById('book-form-isbn').value.trim(),
      titulo: document.getElementById('book-form-titulo').value.trim(),
      autor: document.getElementById('book-form-autor').value.trim(),
      editorial: document.getElementById('book-form-editorial').value.trim(),
      anioPublicacion: parseInt(document.getElementById('book-form-anio').value, 10),
      resumen: document.getElementById('book-form-resumen').value.trim(),
      precioVenta: parseFloat(document.getElementById('book-form-precio').value),
      stockTotal: parseInt(document.getElementById('book-form-stock-total').value, 10),
      stockDisponible: parseInt(document.getElementById('book-form-stock-disponible').value, 10)
    };

    try {
      if (id) {
        await apiClient.put(`/books/${id}`, payload);
        toastNotification.show('Libro actualizado exitosamente.', 'success');
      } else {
        await apiClient.post('/books', payload);
        toastNotification.show('Libro añadido al inventario.', 'success');
      }
      this.closeBookModal();
      this.loadBooksTable();
      catalogComponent.loadBooks();
      this.loadKpiMetrics();
    } catch (err) {
      toastNotification.show(err.message || 'Error al guardar libro', 'error');
    }
  }

  async confirmDeleteBook(id, titulo) {
    if (!confirm(`¿Deseas eliminar permanentemente el libro "${titulo}"?\n\nEl sistema validará que no posea préstamos activos ni historial de ventas.`)) {
      return;
    }

    try {
      await apiClient.delete(`/books/${id}`);
      toastNotification.show(`Libro "${titulo}" eliminado exitosamente.`, 'success');
      this.loadBooksTable();
      catalogComponent.loadBooks();
      this.loadKpiMetrics();
    } catch (err) {
      toastNotification.show(err.message || 'No se pudo eliminar el libro', 'error');
    }
  }

  // ================= LOANS MANAGEMENT =================
  async loadLoansTable() {
    try {
      const res = await apiClient.get('/loans');
      const loans = res.data || [];
      const tbody = document.getElementById('admin-loans-table-body');
      if (!tbody) return;

      tbody.innerHTML = loans
        .map(l => {
          const isReturned = l.estado === 'devuelto';
          const isDelayed = l.estado === 'retrasado';
          
          let statusBadge = '';
          if (isReturned) {
            statusBadge = '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Devuelto</span>';
          } else if (isDelayed) {
            statusBadge = '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">Retrasado</span>';
          } else {
            statusBadge = '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">Activo</span>';
          }

          return `
            <tr class="hover:bg-slate-50 transition-colors">
              <td class="py-3 px-4 font-mono text-slate-500">#${l.id}</td>
              <td class="py-3 px-4">
                <div class="font-bold text-slate-800">${l.usuario?.nombre || 'Usuario'}</div>
                <div class="text-[10px] text-slate-400 font-mono">${l.usuario?.identificacion || '-'}</div>
              </td>
              <td class="py-3 px-4 font-medium text-slate-700">${l.libro?.titulo || `Libro #${l.libroId}`}</td>
              <td class="py-3 px-4 text-slate-600">${l.fechaPrestamo}</td>
              <td class="py-3 px-4 font-semibold ${isDelayed ? 'text-rose-600' : 'text-slate-600'}">${l.fechaTentativaDevolucion}</td>
              <td class="py-3 px-4 text-slate-600">${l.fechaDevolucionReal || '-'}</td>
              <td class="py-3 px-4">${statusBadge}</td>
              <td class="py-3 px-4 text-right">
                ${!isReturned ? `
                  <button onclick="adminComponent.openReturnModal(${l.id}, '${(l.libro?.titulo || 'Libro').replace(/'/g, "\\'")}', '${(l.usuario?.nombre || 'Lector').replace(/'/g, "\\'")}')" class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors">
                    Devolver
                  </button>
                ` : '<span class="text-[10px] text-slate-400 font-medium">Finalizado</span>'}
              </td>
            </tr>
          `;
        })
        .join('');
    } catch (e) {
      console.error('Error cargando tabla de préstamos:', e);
    }
  }

  openReturnModal(loanId, libroTitulo, usuarioNombre) {
    document.getElementById('return-loan-id').value = loanId;
    document.getElementById('return-modal-info').textContent = `Reingreso del libro: "${libroTitulo}" prestado a ${usuarioNombre}.`;
    document.getElementById('return-fecha-real').value = new Date().toISOString().split('T')[0];
    document.getElementById('return-notas').value = '';

    if (this._returnModal) this._returnModal.classList.remove('hidden');
  }

  closeReturnModal() {
    if (this._returnModal) this._returnModal.classList.add('hidden');
  }

  async handleConfirmReturn(event) {
    event.preventDefault();
    const loanId = document.getElementById('return-loan-id').value;
    const fechaDevolucionReal = document.getElementById('return-fecha-real').value;
    const notas = document.getElementById('return-notas').value;

    try {
      await apiClient.put(`/loans/${loanId}/return`, { fechaDevolucionReal, notas });
      this.closeReturnModal();
      toastNotification.show('Devolución registrada. Stock disponible reintegrado.', 'success');
      this.loadLoansTable();
      catalogComponent.loadBooks();
      this.loadKpiMetrics();
    } catch (err) {
      toastNotification.show(err.message || 'Error al procesar devolución', 'error');
    }
  }

  // ================= SALES MANAGEMENT =================
  async loadSalesTable() {
    try {
      const res = await apiClient.get('/sales');
      const sales = res.data || [];
      const tbody = document.getElementById('admin-sales-table-body');
      if (!tbody) return;

      tbody.innerHTML = sales
        .map(s => {
          const totalItems = s.detalles ? s.detalles.reduce((acc, d) => acc + d.cantidad, 0) : 0;
          const formattedDate = new Date(s.fechaVenta).toLocaleString('es-ES', {
            dateStyle: 'short',
            timeStyle: 'short'
          });

          return `
            <tr class="hover:bg-slate-50 transition-colors">
              <td class="py-3 px-4 font-mono font-bold text-slate-800">#${s.id}</td>
              <td class="py-3 px-4">
                <div class="font-bold text-slate-800">${s.usuarioInfo?.nombre || 'Cliente'}</div>
                <div class="text-[10px] text-slate-400 font-mono">${s.usuarioInfo?.identificacion || '-'}</div>
              </td>
              <td class="py-3 px-4 text-slate-500">${formattedDate}</td>
              <td class="py-3 px-4 font-semibold text-slate-700">${totalItems} ejemplar(es)</td>
              <td class="py-3 px-4 font-bold text-emerald-600 text-sm">$${Number(s.total).toFixed(2)}</td>
              <td class="py-3 px-4 text-right">
                <button onclick="salesComponent.showReceipt(${s.id})" class="text-brand-600 hover:text-brand-800 font-semibold">
                  Ver Recibo
                </button>
              </td>
            </tr>
          `;
        })
        .join('');
    } catch (e) {
      console.error('Error cargando tabla de ventas:', e);
    }
  }

  // ================= OPEN LIBRARY API =================
  openOpenLibraryModal() {
    if (this._olModal) this._olModal.classList.remove('hidden');
    setTimeout(() => {
      document.getElementById('ol-search-input').focus();
    }, 100);
  }

  closeOpenLibraryModal() {
    if (this._olModal) this._olModal.classList.add('hidden');
  }

  async searchOpenLibrary() {
    const query = document.getElementById('ol-search-input').value.trim();
    if (!query) {
      toastNotification.show('Escribe un término de búsqueda.', 'warning');
      return;
    }

    const container = document.getElementById('ol-results-container');
    const searchBtn = document.getElementById('btn-ol-search');

    searchBtn.disabled = true;
    container.innerHTML = `
      <div class="text-center py-12 text-slate-500">
        <p class="text-xs">Consultando catálogo global en tiempo real...</p>
      </div>
    `;

    try {
      const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=10`;
      const response = await fetch(url);
      const data = await response.json();
      const docs = data.docs || [];

      if (docs.length === 0) {
        container.innerHTML = `
          <div class="text-center py-10 text-slate-400">
            <p class="text-xs font-bold text-slate-700">No se encontraron resultados para "${query}"</p>
          </div>
        `;
        return;
      }

      container.innerHTML = docs
        .map(doc => {
          const isbn = doc.isbn ? doc.isbn[0] : `OL-${Math.floor(Math.random() * 900000 + 100000)}`;
          const cleanIsbn = isbn.replace(/[^0-9X]/gi, '');
          const coverUrl = cleanIsbn ? `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-M.jpg` : '';
          const author = doc.author_name ? doc.author_name.join(', ') : 'Autor Desconocido';
          const title = doc.title || 'Sin Título';
          const publisher = doc.publisher ? doc.publisher[0] : 'Editorial Global';
          const year = doc.first_publish_year || new Date().getFullYear();

          const bookData = JSON.stringify({
            isbn,
            titulo: title,
            autor: author,
            editorial: publisher,
            anioPublicacion: year,
            resumen: doc.first_sentence ? doc.first_sentence.join(' ') : `Obra de ${author} publicada originalmente en ${year}.`
          }).replace(/'/g, "&#39;");

          return `
            <div class="py-3 flex items-center justify-between space-x-3">
              <div class="flex items-center space-x-3 min-w-0 flex-1">
                ${coverUrl ? `
                  <img src="${coverUrl}" onerror="this.src='https://placehold.co/40x55?text=Libro'" class="w-10 h-14 object-cover rounded shadow border border-slate-200">
                ` : '<div class="w-10 h-14 bg-slate-200 rounded flex items-center justify-center text-xs text-slate-400 font-mono">Libro</div>'}
                
                <div class="min-w-0 flex-1">
                  <h4 class="text-xs font-bold text-slate-800 truncate">${title}</h4>
                  <p class="text-[11px] text-slate-500 truncate">${author}</p>
                  <p class="text-[10px] text-slate-400 font-mono">ISBN: ${isbn} • Año: ${year}</p>
                </div>
              </div>

              <button 
                onclick='adminComponent.importBookFromOpenLibrary(${bookData})'
                class="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all"
              >
                + Importar
              </button>
            </div>
          `;
        })
        .join('');
    } catch (err) {
      container.innerHTML = `
        <div class="text-center py-8 text-rose-500 text-xs">
          Error al conectar con Open Library API.
        </div>
      `;
    } finally {
      searchBtn.disabled = false;
    }
  }

  importBookFromOpenLibrary(bookData) {
    this.closeOpenLibraryModal();
    this.openCreateBookModal();

    document.getElementById('book-form-isbn').value = bookData.isbn;
    document.getElementById('book-form-titulo').value = bookData.titulo;
    document.getElementById('book-form-autor').value = bookData.autor;
    document.getElementById('book-form-editorial').value = bookData.editorial || '';
    document.getElementById('book-form-anio').value = bookData.anioPublicacion || new Date().getFullYear();
    document.getElementById('book-form-resumen').value = bookData.resumen || '';
    document.getElementById('book-form-precio').value = '24.99';
    document.getElementById('book-form-stock-total').value = '10';
    document.getElementById('book-form-stock-disponible').value = '10';

    toastNotification.show(`Datos de "${bookData.titulo}" precargados con sinopsis.`, 'info');
  }
}

const adminComponent = new AdminComponent();
