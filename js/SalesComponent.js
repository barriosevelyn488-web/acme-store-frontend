// Pure OOP SalesComponent Class (Zero Emojis, Pure SVGs)
class SalesComponent {
  constructor() {
    this._sales = [];
    this._receiptModal = document.getElementById('modal-receipt');
  }

  async loadMySales() {
    try {
      const res = await apiClient.get('/sales/my');
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
            <div class="space-y-1">
              <div class="flex items-center space-x-2">
                <span class="font-bold text-xs text-slate-800">Factura #${sale.id}</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">${itemCount} libro(s)</span>
              </div>
              <p class="text-[11px] text-slate-400">${formattedDate}</p>
              
              <div class="text-[11px] text-slate-600 space-y-0.5 pt-1">
                ${sale.detalles.map(d => `<div>• <strong>${d.cantidad}x</strong> ${d.libroInfo?.titulo || `Libro #${d.libroId}`} ($${Number(d.subtotal).toFixed(2)})</div>`).join('')}
              </div>
            </div>

            <div class="flex items-center space-x-4">
              <div class="text-right">
                <span class="text-[10px] text-slate-400 uppercase font-bold block">Total Pagado</span>
                <span class="text-base font-extrabold text-emerald-600">$${Number(sale.total).toFixed(2)}</span>
              </div>

              <button onclick="salesComponent.showReceipt(${sale.id})" class="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all">
                Ver Comprobante
              </button>
            </div>
          </div>
        `;
      })
      .join('');
  }

  async showReceipt(saleId) {
    try {
      const res = await apiClient.get(`/sales/${saleId}/receipt`);
      const sale = res.data;
      if (!sale) return;

      document.getElementById('receipt-id-title').textContent = `Comprobante de Venta #${sale.id}`;
      document.getElementById('receipt-date').textContent = `Fecha: ${new Date(sale.fechaVenta).toLocaleString('es-ES')}`;
      document.getElementById('receipt-customer-name').textContent = sale.usuarioInfo?.nombre || 'Cliente';
      document.getElementById('receipt-customer-id').textContent = sale.usuarioInfo?.identificacion || '-';

      const tableBody = document.getElementById('receipt-items-table');
      tableBody.innerHTML = sale.detalles
        .map(item => `
          <tr class="text-slate-700">
            <td class="py-2">
              <div class="font-bold">${item.libroInfo?.titulo || `Libro #${item.libroId}`}</div>
              <div class="text-[10px] text-slate-400">ISBN: ${item.libroInfo?.isbn || '-'}</div>
            </td>
            <td class="py-2 text-center font-bold">${item.cantidad}</td>
            <td class="py-2 text-right">$${Number(item.precioUnitario).toFixed(2)}</td>
            <td class="py-2 text-right font-bold text-slate-900">$${Number(item.subtotal).toFixed(2)}</td>
          </tr>
        `)
        .join('');

      document.getElementById('receipt-total').textContent = `$${Number(sale.total).toFixed(2)}`;

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
