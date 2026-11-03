// Pure OOP BookDetailModalComponent Class (Displays Synopsis & Metadata on Click)
class BookDetailModalComponent {
  constructor() {
    this._modal = null;
    this._currentBook = null;
  }

  getModal() {
    if (!this._modal) {
      this._modal = document.getElementById('modal-book-detail');
    }
    return this._modal;
  }

  show(book) {
    this._currentBook = book;
    const modal = this.getModal();
    if (!modal) return;

    const cleanIsbn = book.isbn ? book.isbn.replace(/[^0-9X]/gi, '') : '';
    const coverUrl = cleanIsbn ? `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-L.jpg` : '';
    const imgEl = document.getElementById('detail-cover-img');

    if (imgEl) {
      imgEl.src = coverUrl;
      imgEl.onerror = () => {
        imgEl.src = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400';
      };
    }

    const setText = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };

    setText('detail-isbn', `ISBN: ${book.isbn}`);
    setText('detail-title', book.titulo);
    setText('detail-author', `Por ${book.autor}`);
    setText('detail-editorial', book.editorial || 'Editorial Independiente');
    setText('detail-year', book.anioPublicacion || '-');
    setText('detail-category', book.categoria || 'Literatura & Conocimiento');
    setText('detail-stock', `${book.stockDisponible} ejemplares disponibles en inventario`);
    setText('detail-price', `$${Number(book.precioVenta).toFixed(2)}`);
    setText('detail-synopsis', book.resumen || 'Esta obra no cuenta con una sinopsis extendida en el registro actual.');

    const loanBtn = document.getElementById('detail-btn-loan');
    const buyBtn = document.getElementById('detail-btn-buy');

    const canOperate = book.stockDisponible > 0;
    if (loanBtn) {
      loanBtn.disabled = !canOperate;
      loanBtn.onclick = (e) => {
        if (e) e.stopPropagation();
        this.closeModal();
        if (typeof loanComponent !== 'undefined') {
          loanComponent.openLoanModal(book.id, book.titulo);
        } else if (typeof loanManager !== 'undefined') {
          loanManager.openLoanModal(book.id, book.titulo);
        }
      };
    }

    if (buyBtn) {
      buyBtn.disabled = !canOperate;
      buyBtn.onclick = (e) => {
        if (e) e.stopPropagation();
        this.closeModal();
        if (typeof cartComponent !== 'undefined') {
          cartComponent.addItem(book);
        } else if (typeof cartManager !== 'undefined') {
          cartManager.addItem(book);
        }
      };
    }

    modal.classList.remove('hidden');
  }

  closeModal() {
    const modal = this.getModal();
    if (modal) modal.classList.add('hidden');
  }
}

const bookDetailComponent = new BookDetailModalComponent();
