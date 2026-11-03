// Pure OOP CartComponent Class (Zero Emojis, Pure SVGs)
class CartComponent {
  constructor() {
    this._items = [];
    this._modal = document.getElementById('modal-cart');
    this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem('acme_cart');
      if (stored) {
        this._items = JSON.parse(stored);
      }
    } catch (e) {
      this._items = [];
    }
    this.updateBadge();
  }

  saveToStorage() {
    localStorage.setItem('acme_cart', JSON.stringify(this._items));
    this.updateBadge();
  }

  openModal() {
    this.render();
    if (this._modal) this._modal.classList.remove('hidden');
  }

  closeModal() {
    if (this._modal) this._modal.classList.add('hidden');
  }

  addItem(book) {
    const existing = this._items.find(i => i.id === book.id);
    if (existing) {
      if (existing.cantidad + 1 > book.stockDisponible) {
        toastNotification.show(`Solo hay ${book.stockDisponible} ejemplares disponibles en inventario.`, 'warning');
        return;
      }
      existing.cantidad += 1;
    } else {
      if (book.stockDisponible < 1) {
        toastNotification.show('Este ejemplar está actualmente agotado.', 'warning');
        return;
      }
      this._items.push({
        id: book.id,
        titulo: book.titulo,
        autor: book.autor,
        precioVenta: book.precioVenta,
        stockDisponible: book.stockDisponible,
        cantidad: 1
      });
    }

    this.saveToStorage();
    toastNotification.show(`"${book.titulo}" añadido al carrito.`, 'success');
  }

  updateQuantity(bookId, delta) {
    const item = this._items.find(i => i.id === bookId);
    if (!item) return;

    const newQty = item.cantidad + delta;
    if (newQty <= 0) {
      this.removeItem(bookId);
      return;
    }

    if (newQty > item.stockDisponible) {
      toastNotification.show(`Stock máximo alcanzado (${item.stockDisponible} unidades).`, 'warning');
      return;
    }

    item.cantidad = newQty;
    this.saveToStorage();
    this.render();
  }

  removeItem(bookId) {
    this._items = this._items.filter(i => i.id !== bookId);
    this.saveToStorage();
    this.render();
  }

  clear() {
    this._items = [];
    this.saveToStorage();
    this.render();
  }

  updateBadge() {
    const count = this._items.reduce((acc, i) => acc + i.cantidad, 0);
    const badge = document.getElementById('cart-badge');
    if (badge) {
      if (count > 0) {
        badge.textContent = count;
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    }
  }

  calculateTotal() {
    return this._items.reduce((acc, i) => acc + i.cantidad * Number(i.precioVenta), 0);
  }

  render() {
    const container = document.getElementById('cart-items-container');
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('btn-cart-checkout');

    if (!container) return;

    if (this._items.length === 0) {
      container.innerHTML = `
        <div class="text-center py-10 text-slate-400">
          <svg class="w-10 h-10 mx-auto mb-2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
          <p class="text-xs font-semibold">El carrito está vacío</p>
          <p class="text-[11px] text-slate-400 mt-0.5">Explora el catálogo y añade los libros que deseas adquirir.</p>
        </div>
      `;
      subtotalEl.textContent = '$0.00';
      totalEl.textContent = '$0.00';
      checkoutBtn.disabled = true;
      checkoutBtn.classList.add('opacity-50', 'pointer-events-none');
      return;
    }

    checkoutBtn.disabled = false;
    checkoutBtn.classList.remove('opacity-50', 'pointer-events-none');

    container.innerHTML = this._items
      .map(item => `
        <div class="py-3 flex items-center justify-between space-x-3">
          <div class="flex-1 min-w-0">
            <h4 class="text-xs font-bold text-slate-800 truncate">${item.titulo}</h4>
            <p class="text-[11px] text-slate-400 truncate">${item.autor}</p>
            <span class="text-xs font-semibold text-brand-600">$${Number(item.precioVenta).toFixed(2)} c/u</span>
          </div>

          <div class="flex items-center space-x-2">
            <button onclick="cartComponent.updateQuantity(${item.id}, -1)" class="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center">
              -
            </button>
            <span class="text-xs font-bold text-slate-800 w-4 text-center">${item.cantidad}</span>
            <button onclick="cartComponent.updateQuantity(${item.id}, 1)" class="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center">
              +
            </button>
          </div>

          <div class="text-right pl-2">
            <div class="text-xs font-bold text-slate-800">$${(item.cantidad * item.precioVenta).toFixed(2)}</div>
            <button onclick="cartComponent.removeItem(${item.id})" class="text-[10px] text-rose-500 hover:underline">Quitar</button>
          </div>
        </div>
      `)
      .join('');

    const total = this.calculateTotal();
    subtotalEl.textContent = `$${total.toFixed(2)}`;
    totalEl.textContent = `$${total.toFixed(2)}`;
  }

  async checkout() {
    if (!authComponent.currentUser) {
      toastNotification.show('Debes iniciar sesión con tu correo y contraseña para comprar.', 'info');
      this.closeModal();
      authComponent.openModal('login');
      return;
    }

    if (this._items.length === 0) return;

    try {
      const payload = {
        items: this._items.map(i => ({
          libroId: i.id,
          cantidad: i.cantidad
        }))
      };

      const res = await apiClient.post('/sales', payload);
      this.clear();
      this.closeModal();
      toastNotification.show('¡Compra completada con éxito! Inventario actualizado.', 'success');

      catalogComponent.loadBooks();

      if (res.data && res.data.id) {
        salesComponent.showReceipt(res.data.id);
      }
    } catch (err) {
      toastNotification.show(err.message || 'Error al procesar la compra', 'error');
    }
  }
}

const cartComponent = new CartComponent();
