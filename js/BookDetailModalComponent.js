// Pure OOP BookDetailModalComponent Class (Displays Synopsis & Metadata on Click)
class BookDetailModalComponent {
  constructor() {
    this._modal = document.getElementById('modal-book-detail');
    this._currentBook = null;
  }

  show(book) {
    this._currentBook = book;
    if (!this._modal) return;

    const cleanIsbn = book.isbn ? book.isbn.replace(/[^0-9X]/gi, '') : '';
    const coverUrl = cleanIsbn ? `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-L.jpg` : '';
    const imgEl = document.getElementById('detail-cover-img');

    imgEl.src = coverUrl;
    imgEl.onerror = () => {
      imgEl.src = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400';
    };

    document.getElementById('detail-isbn').textContent = `ISBN: ${book.isbn}`;
    document.getElementById('detail-title').textContent = book.titulo;
    document.getElementById('detail-author').textContent = `Por ${book.autor}`;
    document.getElementById('detail-editorial').textContent = book.editorial || 'Editorial Independiente';
    document.getElementById('detail-year').textContent = book.anioPublicacion || '-';
    document.getElementById('detail-stock').textContent = `${book.stockDisponible} ejemplares en inventario`;
    document.getElementById('detail-price').textContent = `$${Number(book.precioVenta).toFixed(2)}`;
    document.getElementById('detail-synopsis').textContent = book.resumen || 'Sin resumen o sinopsis registrada para esta obra.';

    const loanBtn = document.getElementById('detail-btn-loan');
    const buyBtn = document.getElementById('detail-btn-buy');

    const canOperate = book.stockDisponible > 0;
    loanBtn.disabled = !canOperate;
    buyBtn.disabled = !canOperate;

    loanBtn.onclick = () => {
      this.closeModal();
      loanComponent.openLoanModal(book.id, book.titulo);
    };

    buyBtn.onclick = () => {
      this.closeModal();
      cartComponent.addItem(book);
    };

    this._modal.classList.remove('hidden');
  }

  closeModal() {
    if (this._modal) this._modal.classList.add('hidden');
  }
}

const bookDetailComponent = new BookDetailModalComponent();
