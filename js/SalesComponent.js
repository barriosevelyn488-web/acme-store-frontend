// Pure OOP SalesComponent Class (Zero Emojis, Pure SVGs)
class SalesComponent {
  constructor() {
    this._sales = [];
    this._receiptModal = document.getElementById('modal-receipt');
  }

  async loadMySales() {
    try {
      let res;
      try {
        res = await apiClient.get('/sales/my-sales');
      } catch (e) {
        res = await apiClient.get('/sales/my');
      }
      this._sales = res.data || [];
      this.renderMySales();
    } catch (err) {
      toastNotification.show('Error al cargar historial de compras', 'error');
    }
  }

  renderMySales() {
    const container = document.getElementById('my-sales-container');
    if (!container) return;

    if (!this._sales || this._sales.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12 bg-white rounded-3xl border border-slate-200">
          <svg class="w-10 h-10 mx-auto text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
          <p class="text-xs font-bold text-slate-700">Aún no has registrado compras</p>
          <p class="text-[11px] text-slate-400 mt-1">Explora la tienda y añade tus títulos preferidos.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this._sales
      .map(sale => {
        const itemCount = sale.detalles ? sale.detalles.reduce((acc, d) => acc + d.cantidad, 0) : 0;
        const formattedDate = new Date(sale.fechaVenta).toLocaleString('es-ES', {
          dateStyle: 'medium',
          timeStyle: 'short'
        });

        return `
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="space-y-1.5 flex-1">
              <div class="flex items-center space-x-2">
                <span class="font-bold text-xs text-slate-900">Factura #${sale.id}</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">${itemCount} libro(s)</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">${sale.metodoPago || 'Tarjeta'}</span>
              </div>
              <p class="text-[11px] text-slate-400">${formattedDate}</p>
              
              ${sale.direccionEnvio ? `
                <div class="text-[11px] text-slate-500 flex items-center space-x-1">
                  <svg class="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                  <span>Entrega: <strong>${sale.direccionEnvio}</strong> ${sale.ciudad ? `(${sale.ciudad})` : ''}</span>
                </div>
              ` : ''}

              <div class="text-[11px] text-slate-600 space-y-0.5 pt-1">
                ${sale.detalles.map(d => `<div>• <strong>${d.cantidad}x</strong> ${d.libroInfo?.titulo || `Libro #${d.libroId}`} ($${Number(d.subtotal).toFixed(2)})</div>`).join('')}
              </div>
            </div>

            <div class="flex items-center space-x-4">
              <div class="text-right">
                <span class="text-[10px] text-slate-400 uppercase font-bold block">Total Pagado</span>
                <span class="text-base font-extrabold text-emerald-600">$${Number(sale.total).toFixed(2)}</span>
              </div>

              <button onclick="salesComponent.showReceipt(${sale.id})" class="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all flex items-center space-x-1">
                <svg class="w-3.5 h-3.5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                <span>Ver Comprobante</span>
              </button>
            </div>
          </div>
        `;
      })
      .join('');
  }

  async showReceipt(saleId) {
    try {
      let res;
      try {
        res = await apiClient.get(`/sales/${saleId}/receipt`);
      } catch (e) {
        res = await apiClient.get(`/sales/${saleId}`);
      }
      const sale = res.data;
      if (!sale) return;

      const titleEl = document.getElementById('receipt-id-title');
      const dateEl = document.getElementById('receipt-date');
      const nameEl = document.getElementById('receipt-customer-name');
      const idEl = document.getElementById('receipt-customer-id');
      const payEl = document.getElementById('receipt-payment-method');
      const shipEl = document.getElementById('receipt-shipping-address');
      const totalEl = document.getElementById('receipt-total');

      if (titleEl) titleEl.textContent = `Factura Oficial #${sale.id}`;
      if (dateEl) dateEl.textContent = `Fecha: ${new Date(sale.fechaVenta).toLocaleString('es-ES')}`;
      if (nameEl) nameEl.textContent = sale.usuarioInfo?.nombre || (authComponent.currentUser ? authComponent.currentUser.nombre : 'Cliente');
      if (idEl) idEl.textContent = sale.usuarioInfo?.identificacion || (authComponent.currentUser ? authComponent.currentUser.identificacion : '-');
      if (payEl) payEl.textContent = sale.metodoPago || 'Tarjeta de Crédito / Débito';
      if (shipEl) shipEl.textContent = sale.direccionEnvio ? `${sale.direccionEnvio} (${sale.ciudad || ''})` : 'Despacho a Domicilio';

      const tableBody = document.getElementById('receipt-items-table');
      if (tableBody && sale.detalles) {
        tableBody.innerHTML = sale.detalles
          .map(item => `
            <tr class="text-slate-700">
              <td class="py-2.5">
                <div class="font-bold">${item.libroInfo?.titulo || `Libro #${item.libroId}`}</div>
                <div class="text-[10px] text-slate-400">ISBN: ${item.libroInfo?.isbn || '-'}</div>
              </td>
              <td class="py-2.5 text-center font-bold">${item.cantidad}</td>
              <td class="py-2.5 text-right">$${Number(item.precioUnitario).toFixed(2)}</td>
              <td class="py-2.5 text-right font-bold text-slate-900">$${Number(item.subtotal).toFixed(2)}</td>
            </tr>
          `)
          .join('');
      }

      if (totalEl) totalEl.textContent = `$${Number(sale.total).toFixed(2)}`;

      if (this._receiptModal) this._receiptModal.classList.remove('hidden');
    } catch (err) {
      toastNotification.show('No se pudo abrir el comprobante', 'error');
    }
  }

  closeReceiptModal() {
    if (this._receiptModal) this._receiptModal.classList.add('hidden');
  }
}

const salesComponent = new SalesComponent();
