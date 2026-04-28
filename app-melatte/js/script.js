// Modelo de datos de la venta.
// Cada venta se guarda en localStorage como un objeto con id, producto, método de pago, precio y empleado.
class Sale {
    constructor(product, paymentMethod, price, employee) {
        this.id = window.crypto.randomUUID();
        this.product = product;
        this.paymentMethod = paymentMethod;
        this.price = parseFloat(price);
        this.employee = employee;
    }
}

// Funciones de presentación y comportamiento de la interfaz.
class UI {
    static displaySales() {
        const sales = Store.getSales();
        sales.forEach(sale => UI.addSaleToTable(sale));
        UI.updateSaleCount();
    }

    static addSaleToTable(sale) {
        const tableBody = document.querySelector('#tableBody');
        const row = document.createElement('tr');
        row.dataset.id = sale.id;
        row.innerHTML = `
            <td><input type="text" class="form-control product" value="${sale.product}"></td>
            <td>
                <select class="form-control payment-method">
                    <option value="efectivo" ${sale.paymentMethod === 'efectivo' ? 'selected' : ''}>Efectivo</option>
                    <option value="transferencia" ${sale.paymentMethod === 'transferencia' ? 'selected' : ''}>Transferencia</option>
                    <option value="consumo personal" ${sale.paymentMethod === 'consumo personal' ? 'selected' : ''}>Consumo Personal</option>
                </select>
            </td>
            <td><input type="number" class="form-control price" value="${sale.price}"></td>
            <td><input type="text" class="form-control employee" value="${sale.employee}"></td>
            <td><button class="btn btn-danger btn-sm delete">X</button></td>
        `;
        tableBody.appendChild(row);
    }

    static updateSaleCount() {
        document.querySelector('#saleCount').textContent = Store.getSales().length;
    }

    static clearInputs() {
        document.querySelector('#product').value = '';
        document.querySelector('#price').value = '';
        document.querySelector('#paymentMethod').value = 'efectivo';
        document.querySelector('#employee').value = 'MELATTE';
    }

    static showAlert(message, type) {
        const div = document.createElement('div');
        div.className = `alert alert-${type} w-50 mx-auto mt-3`;
        div.textContent = message;
        document.querySelector('.form-container').insertBefore(div, document.querySelector('#saleForm'));
        setTimeout(() => div.remove(), 3000);
    }
}

class Store {
    static getSales() { return localStorage.getItem('sales') ? JSON.parse(localStorage.getItem('sales')) : []; }
    static addSale(sale) { const sales = this.getSales(); sales.push(sale); localStorage.setItem('sales', JSON.stringify(sales)); }
    static updateSale(updated) { 
        const sales = this.getSales(); 
        const i = sales.findIndex(s => s.id === updated.id); 
        if (i > -1) { sales[i] = updated; localStorage.setItem('sales', JSON.stringify(sales)); } 
    }
    static removeSale(id) { localStorage.setItem('sales', JSON.stringify(this.getSales().filter(s => s.id !== id))); }
    static clearAll() {
        localStorage.removeItem('sales');
        localStorage.removeItem('initialCash');
    }
}

// Eventos
document.addEventListener('DOMContentLoaded', () => {
    UI.displaySales();

    const initialCash = document.querySelector('#initialCash');
    initialCash.value = localStorage.getItem('initialCash') || '';
    initialCash.addEventListener('change', () => localStorage.setItem('initialCash', initialCash.value));

    // Autocompletar precio
    document.querySelector('#product').addEventListener('change', function () {
        const option = this.selectedOptions[0];
        if (option.dataset.price) {
            document.querySelector('#price').value = option.dataset.price;
        } else {
            document.querySelector('#price').value = '';
        }
    });

    // Edición en tabla
    document.querySelector('#tableBody').addEventListener('input', e => {
        const row = e.target.closest('tr');
        if (!row) return;
        const sale = Store.getSales().find(s => s.id === row.dataset.id);
        if (!sale) return;
        if (e.target.classList.contains('product')) sale.product = e.target.value;
        if (e.target.classList.contains('price')) sale.price = parseFloat(e.target.value) || 0;
        if (e.target.classList.contains('employee')) sale.employee = e.target.value;
        Store.updateSale(sale);
    });

    document.querySelector('#tableBody').addEventListener('change', e => {
        if (e.target.classList.contains('payment-method')) {
            const row = e.target.closest('tr');
            const sale = Store.getSales().find(s => s.id === row.dataset.id);
            if (sale) {
                sale.paymentMethod = e.target.value;
                Store.updateSale(sale);
            }
        }
    });
});

// Añadir venta
document.querySelector('#saleForm').addEventListener('submit', e => {
    e.preventDefault();
    const product = document.querySelector('#product').value.trim();
    const price = parseFloat(document.querySelector('#price').value);
    const payment = document.querySelector('#paymentMethod').value;
    const employee = document.querySelector('#employee').value;

    if (!product || isNaN(price) || price <= 0) {
        UI.showAlert('Complete producto y precio válido', 'danger');
        return;
    }

    const sale = new Sale(product, payment, price, employee);
    Store.addSale(sale);
    UI.addSaleToTable(sale);
    UI.updateSaleCount();
    UI.clearInputs();
    UI.showAlert('Venta añadida', 'success');
});

// Eliminar venta
document.querySelector('#tableBody').addEventListener('click', e => {
    if (e.target.classList.contains('delete')) {
        const id = e.target.closest('tr').dataset.id;
        Store.removeSale(id);
        e.target.closest('tr').remove();
        UI.updateSaleCount();
        UI.showAlert('Venta eliminada', 'success');
    }
});

// Generar PDF
document.querySelector('#saveList').addEventListener('click', () => {
    const operatorName = "MELATTE";  // Nombre fijo, siempre la misma persona
    const initialCash = parseFloat(document.querySelector('#initialCash').value) || 0;
    const sales = Store.getSales();

    let efectivo = 0, transferencia = 0, totalVentas = 0;
    sales.forEach(s => {
        if (s.paymentMethod !== 'consumo personal') {
            totalVentas += s.price;
            if (s.paymentMethod === 'efectivo') efectivo += s.price;
            if (s.paymentMethod === 'transferencia') transferencia += s.price;
        }
    });

    const totalRecaudado = efectivo + transferencia;
    const cajaFinal = initialCash + efectivo;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString('es-CL');

    doc.setFontSize(12);
    doc.text('FECHA: ' + date, 10, 10);
    doc.text('OPERADOR: ' + operatorName, 10, 20);

    const tableData = sales.map((s, i) => [
        i + 1,
        s.product,
        s.paymentMethod.toUpperCase(),
        '$' + s.price.toLocaleString(),
        s.employee
    ]);

    doc.autoTable({
        head: [['N°', 'PRODUCTO', 'PAGO', 'PRECIO', 'ENCARGADO']],
        body: tableData,
        startY: 30,
        theme: 'grid',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [100, 50, 50] }
    });

    let y = doc.autoTable.previous.finalY + 10;

    doc.text('DINERO AL INICIO DEL DÍA', 10, y);
    doc.text('$' + initialCash.toLocaleString(), 120, y); y += 10;

    doc.text('TOTAL RECAUDADO EN EFECTIVO', 10, y);
    doc.text('$' + efectivo.toLocaleString(), 120, y); y += 10;

    doc.text('TOTAL RECAUDADO EN TRANSFERENCIA', 10, y);
    doc.text('$' + transferencia.toLocaleString(), 120, y); y += 10;

    doc.text('TOTAL RECAUDADO', 10, y);
    doc.text('$' + totalRecaudado.toLocaleString(), 120, y); y += 10;

    doc.text('TOTAL FINAL EN CAJA (EFECTIVO)', 10, y);
    doc.text('$' + cajaFinal.toLocaleString(), 120, y);

    doc.save(`MeLatte_${date.replace(/\//g, '-')}.pdf`);
});

// Limpiar todo
document.querySelector('#clearList').addEventListener('click', () => {
    if (confirm('¿Borrar todas las ventas del día?')) {
        Store.clearAll();
        document.querySelector('#tableBody').innerHTML = '';
        document.querySelector('#initialCash').value = '';
        UI.updateSaleCount();
        UI.showAlert('Todo limpiado', 'success');
    }
});
