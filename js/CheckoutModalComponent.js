// Pure OOP CheckoutModalComponent Class (Realistic Payment & Shipping Flow)
class CheckoutModalComponent {
  constructor() {
    this._modal = document.getElementById('modal-checkout');
    this._selectedMethod = 'tarjeta';
    this._items = [];
    this._total = 0;
  }

  openModal(items = [], total = 0) {
    if (!authComponent.currentUser) {
      toastNotification.show('Inicia sesión para procesar tu compra.', 'info');
      authComponent.openModal('login');
      return;
    }

    this._items = items;
    this._total = total;

    // Pre-fill user data
    const user = authComponent.currentUser;
    const addressEl = document.getElementById('checkout-address');
    const phoneEl = document.getElementById('checkout-phone');
    const cardHolderEl = document.getElementById('card-holder');

    if (addressEl && user && user.direccion) addressEl.value = user.direccion;
    if (phoneEl && user && user.telefono) phoneEl.value = user.telefono;
    if (cardHolderEl && user && user.nombre) cardHolderEl.value = user.nombre.toUpperCase();

    const countEl = document.getElementById('checkout-items-count');
    const subtotalEl = document.getElementById('checkout-subtotal');
    const totalEl = document.getElementById('checkout-total');

    if (countEl) countEl.textContent = this._items.reduce((acc, i) => acc + i.cantidad, 0);
    if (subtotalEl) subtotalEl.textContent = `$${Number(this._total).toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${Number(this._total).toFixed(2)}`;

    this.selectMethod('tarjeta');
    if (this._modal) this._modal.classList.remove('hidden');
  }

  closeModal() {
    if (this._modal) this._modal.classList.add('hidden');
  }

  selectMethod(method) {
    this._selectedMethod = method;
    const methods = ['tarjeta', 'transferencia', 'efectivo', 'paypal'];

    methods.forEach(m => {
      const btn = document.getElementById(`pay-opt-${m}`);
      const panel = document.getElementById(`pay-panel-${m}`);

      if (m === method) {
        if (btn) {
          btn.className = 'pay-method-btn active p-3 rounded-2xl border-2 border-brand-600 bg-brand-50/50 flex flex-col items-center text-center space-y-1 transition-all';
        }
        if (panel) panel.classList.remove('hidden');
      } else {
        if (btn) {
          btn.className = 'pay-method-btn p-3 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white flex flex-col items-center text-center space-y-1 transition-all';
        }
        if (panel) panel.classList.add('hidden');
      }
    });
  }

  _getMethodLabel() {
    switch (this._selectedMethod) {
      case 'tarjeta': return 'Tarjeta de Crédito / Débito';
      case 'transferencia': return 'Transferencia Bancaria / PSE';
      case 'efectivo': return 'Efectivo Contraentrega';
      case 'paypal': return 'PayPal Wallet';
      default: return 'Pago Electrónico';
    }
  }

  async submitOrder(event) {
    event.preventDefault();
    const btn = document.getElementById('btn-submit-order');
    const btnText = document.getElementById('btn-submit-order-text');

    const address = document.getElementById('checkout-address').value.trim();
    const city = document.getElementById('checkout-city').value.trim();
    const phone = document.getElementById('checkout-phone').value.trim();
    const notes = document.getElementById('checkout-notes').value.trim();

    if (!address || !city || !phone) {
      toastNotification.show('Por favor completa los datos de entrega obligatorios.', 'warning');
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.classList.add('opacity-70', 'pointer-events-none');
      if (btnText) btnText.textContent = 'Procesando pago seguro...';
    }

    try {
      const payload = {
        items: this._items.map(i => ({
          libroId: i.id,
          cantidad: i.cantidad
        })),
        paymentMethod: this._getMethodLabel(),
        shippingAddress: address,
        shippingCity: city,
        contactPhone: phone,
        deliveryNotes: notes
      };

      const res = await apiClient.post('/sales', payload);

      cartComponent.clear();
      this.closeModal();
      toastNotification.show('¡Compra confirmada! Factura generada con éxito.', 'success');

      catalogComponent.loadBooks();

      const saleId = res.data?.id || res.id;
      if (saleId) {
        await salesComponent.showReceipt(saleId);
      }
    } catch (err) {
      toastNotification.show(err.message || 'Error al procesar la compra', 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.classList.remove('opacity-70', 'pointer-events-none');
        if (btnText) btnText.textContent = 'Confirmar Pago y Emitir Comprobante';
      }
    }
  }
}

const checkoutModalComponent = new CheckoutModalComponent();
