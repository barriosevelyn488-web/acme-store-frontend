// Pure OOP CatalogComponent Class (Zero Emojis, Clickable for Synopsis Modal)
class CatalogComponent {
  constructor() {
    this._books = [];
    this._searchQuery = '';
    this._availableOnly = false;
    this._debounceTimer = null;
  }

  async loadBooks() {
    try {
      const params = {};
      if (this._searchQuery) params.search = this._searchQuery;
      if (this._availableOnly) params.availableOnly = true;

      const res = await apiClient.get('/books', params);
      this._books = res.data || [];
      this.render();
    } catch (err) {
      console.warn('Conectando o cargando catálogo...', err);
      // Fallback catalogue if local offline testing
      this._books = [
        { id: 1, isbn: '978-0307474728', titulo: 'Cien Años de Soledad', autor: 'Gabriel García Márquez', editorial: 'Vintage Español', anioPublicacion: 1967, precioVenta: 18.50, stockTotal: 10, stockDisponible: 9, resumen: 'Obra cumbre del realismo mágico hispanoamericano. Narra las venturas y desventuras de la estirpe Buendía a lo largo de cien años en el mítico pueblo de Macondo.' },
        { id: 2, isbn: '978-8424116286', titulo: 'Don Quijote de la Mancha', autor: 'Miguel de Cervantes', editorial: 'Austral', anioPublicacion: 1605, precioVenta: 22.00, stockTotal: 8, stockDisponible: 8, resumen: 'La mayor joya de la literatura universal en lengua castellana. Las hazañas y desvaríos de Don Quijote y su escudero Sancho Panza en pos de la justicia y los ideales caballerescos.' },
        { id: 3, isbn: '978-0307474278', titulo: 'El Código Da Vinci', autor: 'Dan Brown', editorial: 'Anchor Books', anioPublicacion: 2003, precioVenta: 15.99, stockTotal: 12, stockDisponible: 10, resumen: 'Un intrigante thriller internacional que mezcla historia del arte, sociedades secretas, simbología religiosa y una carrera contrarreloj por París y Londres.' },
        { id: 4, isbn: '978-0451524935', titulo: '1984', autor: 'George Orwell', editorial: 'Signet Classic', anioPublicacion: 1949, precioVenta: 14.50, stockTotal: 15, stockDisponible: 14, resumen: 'Novela distópica clásica sobre la vigilancia totalitaria, el Gran Hermano, la manipulación de la verdad histórica y la defensa de la libertad individual.' },
        { id: 5, isbn: '978-0132350884', titulo: 'Clean Code: Handbook of Agile Craftsmanship', autor: 'Robert C. Martin', editorial: 'Prentice Hall', anioPublicacion: 2008, precioVenta: 45.00, stockTotal: 6, stockDisponible: 6, resumen: 'Guía fundamental para desarrolladores de software sobre buenas prácticas, refactorización, arquitectura limpia y principios SOLID orientados a objetos.' },
        { id: 6, isbn: '978-0156012195', titulo: 'El Principito', autor: 'Antoine de Saint-Exupéry', editorial: 'Harcourt', anioPublicacion: 1943, precioVenta: 12.00, stockTotal: 20, stockDisponible: 20, resumen: 'Poético y conmovedor relato sobre el amor, la amistad, la pérdida y el sentido de la vida, visto a través de los ojos inocentes de un pequeño príncipe de otro planeta.' },
        { id: 7, isbn: '978-1400034956', titulo: 'Crónica de una Muerte Anunciada', autor: 'Gabriel García Márquez', editorial: 'Vintage Español', anioPublicacion: 1981, precioVenta: 13.50, stockTotal: 7, stockDisponible: 7, resumen: 'Extraordinaria reconstrucción periodística y literaria del asesinato anunciado de Santiago Nasar a manos de los hermanos Vicario en un pueblo caribeño.' },
        { id: 8, isbn: '978-1451673319', titulo: 'Fahrenheit 451', autor: 'Ray Bradbury', editorial: 'Simon & Schuster', anioPublicacion: 1953, precioVenta: 16.00, stockTotal: 9, stockDisponible: 9, resumen: 'Clásico de la ciencia ficción que retrata un futuro donde los bomberos tienen la misión de quemar todos los libros para erradicar el pensamiento crítico.' }
      ];
      this.render();
    }
  }

  onSearch(query) {
    clearTimeout(this._debounceTimer);
    this._searchQuery = query;
    this._debounceTimer = setTimeout(() => {
      this.loadBooks();
    }, 250);
  }

  filterAvailability(availableOnly) {
    this._availableOnly = availableOnly;
    const buttons = document.querySelectorAll('.catalog-filter-btn');
    buttons.forEach(btn => {
      const type = btn.getAttribute('data-filter');
      if ((type === 'available' && availableOnly) || (type === 'all' && !availableOnly)) {
        btn.className = 'catalog-filter-btn px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 text-white shadow-sm transition-all';
      } else {
        btn.className = 'catalog-filter-btn px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all';
      }
    });
    this.loadBooks();
  }

  _getCoverGradient(id) {
    const gradients = [
      'from-slate-800 to-indigo-950',
      'from-slate-900 to-sky-950',
      'from-blue-900 to-slate-900',
      'from-emerald-950 to-slate-900',
      'from-slate-800 to-teal-950'
    ];
    return gradients[id % gradients.length];
  }

  render() {
    const grid = document.getElementById('catalog-grid');
    const emptyState = document.getElementById('catalog-empty');

    if (!this._books || this._books.length === 0) {
      grid.innerHTML = '';
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');
    grid.innerHTML = this._books
      .map(book => {
        const canOperate = book.stockDisponible > 0;
        const grad = this._getCoverGradient(book.id);
        const cleanIsbn = book.isbn ? book.isbn.replace(/[^0-9X]/gi, '') : '';
        const coverUrl = cleanIsbn ? `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-M.jpg?default=false` : '';

        const escapedBook = JSON.stringify(book).replace(/"/g, '&quot;');

        return `
          <div class="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group">
            
            <!-- Book Cover Art (Clickable for Synopsis Modal) -->
            <div 
              onclick="bookDetailComponent.show(${escapedBook})"
              class="h-56 bg-gradient-to-tr ${grad} p-5 flex flex-col justify-between text-white relative overflow-hidden cursor-pointer"
              title="Haz clic para ver la sinopsis completa"
            >
              <div class="flex justify-between items-start z-10">
                <span class="text-[10px] font-mono font-bold uppercase bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm border border-white/10">
                  ${book.isbn}
                </span>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase backdrop-blur-sm ${
                  canOperate ? 'bg-emerald-500/80 text-white' : 'bg-rose-500/80 text-white'
                }">
                  ${canOperate ? `Stock: ${book.stockDisponible}` : 'Agotado'}
                </span>
              </div>

              <!-- Cover Image if available -->
              ${coverUrl ? `
                <img 
                  src="${coverUrl}" 
                  alt="${book.titulo}" 
                  onerror="this.remove()" 
                  class="absolute right-4 bottom-2 w-20 h-28 object-cover rounded shadow-2xl border border-white/20 transform group-hover:scale-105 transition-all duration-300 z-10"
                />
              ` : ''}

              <div class="z-10 max-w-[70%]">
                <h3 class="font-serif font-bold text-base leading-snug line-clamp-2 drop-shadow-sm group-hover:text-sky-200 transition-colors">
                  ${book.titulo}
                </h3>
                <p class="text-xs text-slate-300 font-medium mt-1 truncate">${book.autor}</p>
                <span class="text-[10px] text-sky-300 font-medium mt-2 inline-flex items-center space-x-1 underline underline-offset-2">
                  <span>Ver sinopsis</span>
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                </span>
              </div>

              <div class="absolute left-0 top-0 bottom-0 w-3 bg-black/20 pointer-events-none"></div>
            </div>

            <!-- Metadata & Actions -->
            <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div class="space-y-1 text-xs text-slate-500">
                <div class="flex justify-between">
                  <span>Editorial:</span>
                  <span class="font-medium text-slate-700">${book.editorial || 'No especificada'}</span>
                </div>
                <div class="flex justify-between">
                  <span>Año de Edición:</span>
                  <span class="font-medium text-slate-700">${book.anioPublicacion || '-'}</span>
                </div>
                <div class="flex justify-between">
                  <span>Stock Total Físico:</span>
                  <span class="font-medium text-slate-700">${book.stockTotal} ejemplares</span>
                </div>
              </div>

              <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span class="text-[10px] text-slate-400 font-bold uppercase block">Precio Venta</span>
                  <span class="text-lg font-extrabold text-slate-900">$${Number(book.precioVenta).toFixed(2)}</span>
                </div>

                <div class="flex items-center space-x-2">
                  <!-- Loan Button -->
                  <button 
                    onclick="loanComponent.openLoanModal(${book.id}, '${book.titulo.replace(/'/g, "\\'")}')" 
                    ${!canOperate ? 'disabled' : ''}
                    class="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-brand-600 hover:border-brand-500 hover:bg-brand-50 disabled:opacity-40 disabled:pointer-events-none transition-all"
                    title="Solicitar Préstamo"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  </button>

                  <!-- Buy Button -->
                  <button 
                    onclick="cartComponent.addItem(${escapedBook})" 
                    ${!canOperate ? 'disabled' : ''}
                    class="px-3.5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-600/20 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center space-x-1"
                    title="Comprar libro"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                    <span>Comprar</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        `;
      })
      .join('');
  }
}

const catalogComponent = new CatalogComponent();
