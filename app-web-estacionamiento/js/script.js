// Modelo de datos para un auto registrado en el estacionamiento.
// Se guarda en localStorage con información de entrada, salida, duración, cobro y pago.
class Entry {
    constructor(licensePlate, entryTime, vehicleSize, exitTime = null, duration = 0, charge = 0, paymentMethod = null, receiptNumber = null) {
        this.id = window.crypto.randomUUID();
        this.licensePlate = licensePlate;
        this.entryTime = entryTime;
        this.vehicleSize = vehicleSize;
        this.exitTime = exitTime;
        this.duration = duration;
        this.charge = charge;
        this.paymentMethod = paymentMethod;
        this.receiptNumber = receiptNumber;
    }
}

// Modelo de datos para transacciones de caja: ingresos y retiros.
class Transaction {
    constructor(amount, description, type, paymentMethod) {
        this.id = window.crypto.randomUUID();
        this.amount = amount;
        this.description = description;
        this.type = type; // 'ingreso' or 'retiro'
        this.paymentMethod = paymentMethod; // 'efectivo' or 'tarjeta'
    }
}

class UI {
    static displayEntries() {
        const entries = Store.getEntries();
        entries.forEach((entry) => UI.addEntryToTable(entry));
        UI.updateCarCount();
    }

    static addEntryToTable(entry) {
        const tableBody = document.querySelector('#tableBody');
        const row = document.createElement('tr');
        row.dataset.id = entry.id;
        row.innerHTML = `
            <td><input type="text" class="form-control license-plate" value="${entry.licensePlate}"></td>
            <td>${entry.entryTime}</td>
            <td>${entry.exitTime || ''} ${!entry.exitTime ? '<button class="btn btn-primary update-exit-time">Actualizar Salida</button>' : ''}</td>
            <td>${entry.duration} min</td>
            <td>$${entry.charge}</td>
            <td><input type="checkbox" class="payment-method" data-type="tarjeta" ${entry.paymentMethod === 'tarjeta' ? 'checked' : ''}></td>
            <td><input type="checkbox" class="payment-method" data-type="efectivo" ${entry.paymentMethod === 'efectivo' ? 'checked' : ''}></td>
            <td><input type="text" class="receipt-number form-control" value="${entry.receiptNumber || ''}"></td>
            <td><button class="btn btn-danger delete">X</button></td>
        `;
        tableBody.appendChild(row);
    }

    static displayTransactions() {
        const transactions = Store.getTransactions();
        const transactionSection = document.querySelector('#transactionSection');
        const transactionBody = document.querySelector('#transactionBody');
        transactionBody.innerHTML = '';
        if (transactions.length > 0) {
            transactionSection.style.display = 'block';
            transactions.forEach((transaction) => UI.addTransactionToTable(transaction));
        } else {
            transactionSection.style.display = 'none';
        }
    }

    static addTransactionToTable(transaction) {
        const transactionBody = document.querySelector('#transactionBody');
        const row = document.createElement('tr');
        row.dataset.id = transaction.id;
        row.innerHTML = `
            <td>
                <select class="form-control transaction-type">
                    <option value="ingreso" ${transaction.type === 'ingreso' ? 'selected' : ''}>Ingreso</option>
                    <option value="retiro" ${transaction.type === 'retiro' ? 'selected' : ''}>Retiro</option>
                </select>
            </td>
            <td><input type="number" class="form-control transaction-amount" value="${transaction.amount}"></td>
            <td><input type="text" class="form-control transaction-description" value="${transaction.description}"></td>
            <td><button class="btn btn-danger delete-transaction">X</button></td>
        `;
        transactionBody.appendChild(row);
    }

    static updateCarCount() {
        const entries = Store.getEntries();
        const carCount = document.querySelector('#carCount');
        carCount.textContent = entries.length;
    }

    static clearInput() {
        document.querySelector('#licensePlate').value = '';
        document.querySelector('#entryTime').value = '';
        document.querySelector('#vehicleSize').value = 'normal';
    }

    static deleteEntry(target) {
        if (target.classList.contains('delete')) {
            target.parentElement.parentElement.remove();
            UI.updateCarCount();
        }
    }

    static deleteTransaction(target) {
        if (target.classList.contains('delete-transaction')) {
            target.parentElement.parentElement.remove();
            UI.updateTransactionSectionVisibility();
        }
    }

    static updateTransactionSectionVisibility() {
        const transactions = Store.getTransactions();
        const transactionSection = document.querySelector('#transactionSection');
        transactionSection.style.display = transactions.length > 0 ? 'block' : 'none';
    }

    static showAlert(message, className) {
        const div = document.createElement('div');
        div.className = `alert alert-${className} w-50 mx-auto`;
        div.appendChild(document.createTextNode(message));
        const formContainer = document.querySelector('.form-container');
        const form = document.querySelector('#entryForm');
        formContainer.insertBefore(div, form);
        setTimeout(() => document.querySelector('.alert').remove(), 3000);
    }

    static validateInputs() {
        const licensePlate = document.querySelector('#licensePlate').value.trim();
        const entryTime = document.querySelector('#entryTime').value;
        const licensePlateRegex = /^[A-Za-z0-9]{6}$/;
        if (licensePlate === '' || entryTime === '') {
            UI.showAlert('Todos los campos deben ser llenados!', 'danger');
            return false;
        }
        if (!licensePlateRegex.test(licensePlate)) {
            UI.showAlert('La placa de licencia debe contener exactamente 6 letras o números', 'danger');
            return false;
        }
        return true;
    }

    static calculateCharge(duration, vehicleSize) {
        if (vehicleSize === 'normal') {
            if (duration <= 30) return 1000;
            return duration * 40;
        } else {
            if (duration <= 30) return 1200;
            return duration * 45;
        }
    }

    static roundToNearestHundred(amount) {
        return Math.round(amount / 100) * 100;
    }

    static clearTable() {
        const tableBody = document.querySelector('#tableBody');
        tableBody.innerHTML = '';
        const transactionBody = document.querySelector('#transactionBody');
        transactionBody.innerHTML = '';
        UI.updateTransactionSectionVisibility();
        UI.updateCarCount();
    }

    static showTransactionModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5);
            display: flex; justify-content: center; align-items: center; z-index: 1000;
        `;
        modal.innerHTML = `
            <div style="background: white; padding: 20px; border-radius: 5px; width: 400px;">
                <h5>Retiro/Ingreso</h5>
                <div class="form-group">
                    <label for="transactionAmount">Monto:</label>
                    <input type="number" class="form-control" id="transactionAmount" placeholder="0">
                </div>
                <div class="form-group">
                    <label for="transactionDescription">Descripción:</label>
                    <input type="text" class="form-control" id="transactionDescription" placeholder="Descripción">
                </div>
                <div class="form-group">
                    <label>Método de pago:</label><br>
                    <input type="radio" name="transactionPaymentMethod" id="transactionEfectivo" value="efectivo">
                    <label for="transactionEfectivo">Efectivo</label>
                    <input type="radio" name="transactionPaymentMethod" id="transactionTarjeta" value="tarjeta">
                    <label for="transactionTarjeta">Tarjeta</label>
                </div>
                <button class="btn btn-success" id="depositBtn">Ingreso del Monto</button>
                <button class="btn btn-danger" id="withdrawBtn">Retiro del Monto</button>
                <button class="btn btn-secondary" id="cancelBtn">Cancelar</button>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('depositBtn').addEventListener('click', () => {
            const amount = parseFloat(document.getElementById('transactionAmount').value);
            const description = document.getElementById('transactionDescription').value.trim();
            const paymentMethod = document.querySelector('input[name="transactionPaymentMethod"]:checked')?.value;
            if (isNaN(amount) || amount <= 0) {
                UI.showAlert('Por favor, ingrese un monto válido', 'danger');
                return;
            }
            if (!description) {
                UI.showAlert('Por favor, ingrese una descripción', 'danger');
                return;
            }
            if (!paymentMethod) {
                UI.showAlert('Por favor, seleccione un método de pago', 'danger');
                return;
            }
            const transaction = new Transaction(amount, description, 'ingreso', paymentMethod);
            Store.addTransaction(transaction);
            UI.addTransactionToTable(transaction);
            UI.updateTransactionSectionVisibility();
            UI.showAlert('Ingreso registrado exitosamente', 'success');
            modal.remove();
        });

        document.getElementById('withdrawBtn').addEventListener('click', () => {
            const amount = parseFloat(document.getElementById('transactionAmount').value);
            const description = document.getElementById('transactionDescription').value.trim();
            const paymentMethod = document.querySelector('input[name="transactionPaymentMethod"]:checked')?.value;
            if (isNaN(amount) || amount <= 0) {
                UI.showAlert('Por favor, ingrese un monto válido', 'danger');
                return;
            }
            if (!description) {
                UI.showAlert('Por favor, ingrese una descripción', 'danger');
                return;
            }
            if (!paymentMethod) {
                UI.showAlert('Por favor, seleccione un método de pago', 'danger');
                return;
            }
            const transaction = new Transaction(amount, description, 'retiro', paymentMethod);
            Store.addTransaction(transaction);
            UI.addTransactionToTable(transaction);
            UI.updateTransactionSectionVisibility();
            UI.showAlert('Retiro registrado exitosamente', 'success');
            modal.remove();
        });

        document.getElementById('cancelBtn').addEventListener('click', () => {
            modal.remove();
        });
    }
}

class Store {
    static getEntries() {
        return localStorage.getItem('entries') ? JSON.parse(localStorage.getItem('entries')) : [];
    }

    static addEntries(entry) {
        const entries = Store.getEntries();
        entries.push(entry);
        localStorage.setItem('entries', JSON.stringify(entries));
    }

    static updateEntries(updatedEntry) {
        const entries = Store.getEntries();
        const index = entries.findIndex(entry => entry.id === updatedEntry.id);
        if (index !== -1) {
            entries[index] = updatedEntry;
            localStorage.setItem('entries', JSON.stringify(entries));
        }
    }

    static removeEntries(id) {
        const entries = Store.getEntries();
        const filteredEntries = entries.filter(entry => entry.id !== id);
        localStorage.setItem('entries', JSON.stringify(filteredEntries));
    }

    static getTransactions() {
        return localStorage.getItem('transactions') ? JSON.parse(localStorage.getItem('transactions')) : [];
    }

    static addTransaction(transaction) {
        const transactions = Store.getTransactions();
        transactions.push(transaction);
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }

    static updateTransaction(updatedTransaction) {
        const transactions = Store.getTransactions();
        const index = transactions.findIndex(transaction => transaction.id === updatedTransaction.id);
        if (index !== -1) {
            transactions[index] = updatedTransaction;
            localStorage.setItem('transactions', JSON.stringify(transactions));
        }
    }

    static removeTransaction(id) {
        const transactions = Store.getTransactions();
        const filteredTransactions = transactions.filter(transaction => transaction.id !== id);
        localStorage.setItem('transactions', JSON.stringify(filteredTransactions));
    }

    static clearEntries() {
        localStorage.removeItem('entries');
        localStorage.removeItem('initialCash');
        localStorage.removeItem('transactions');
    }
}

// ==================== EVENTOS ====================

document.addEventListener('DOMContentLoaded', () => {
    UI.displayEntries();
    UI.displayTransactions();

    const initialCashInput = document.querySelector('#initialCash');
    initialCashInput.value = localStorage.getItem('initialCash') || '';
    initialCashInput.addEventListener('change', () => {
        localStorage.setItem('initialCash', initialCashInput.value);
    });

    // Eventos de edición en tabla de autos
    document.querySelector('#tableBody').addEventListener('input', (e) => {
        const row = e.target.closest('tr');
        const id = row.dataset.id;
        const entries = Store.getEntries();
        const entry = entries.find(e => e.id === id);
        if (entry) {
            if (e.target.classList.contains('license-plate')) {
                entry.licensePlate = e.target.value;
                Store.updateEntries(entry);
            } else if (e.target.classList.contains('receipt-number')) {
                entry.receiptNumber = e.target.value;
                Store.updateEntries(entry);
            }
        }
    });

    document.querySelector('#tableBody').addEventListener('change', (e) => {
        if (e.target.classList.contains('payment-method')) {
            const row = e.target.closest('tr');
            const id = row.dataset.id;
            const entries = Store.getEntries();
            const entry = entries.find(e => e.id === id);
            if (entry) {
                let paymentMethod = null;
                if (e.target.checked) {
                    paymentMethod = e.target.dataset.type;
                    row.querySelectorAll('.payment-method').forEach(cb => {
                        if (cb.dataset.type !== paymentMethod) cb.checked = false;
                    });
                } else {
                    const checked = row.querySelector('.payment-method:checked');
                    if (checked) paymentMethod = checked.dataset.type;
                }
                entry.paymentMethod = paymentMethod;
                Store.updateEntries(entry);
            }
        }
    });

    // Eventos de transacciones
    document.querySelector('#transactionBody').addEventListener('input', (e) => {
        const row = e.target.closest('tr');
        if (!row) return;
        const id = row.dataset.id;
        const transactions = Store.getTransactions();
        const transaction = transactions.find(t => t.id === id);
        if (!transaction) return;

        if (e.target.classList.contains('transaction-amount')) {
            transaction.amount = parseFloat(e.target.value) || 0;
            Store.updateTransaction(transaction);
        }

        if (e.target.classList.contains('transaction-description')) {
            transaction.description = e.target.value;
            Store.updateTransaction(transaction);
        }
    });

    document.querySelector('#transactionBody').addEventListener('change', (e) => {
        if (!e.target.classList.contains('transaction-type')) return;
        const row = e.target.closest('tr');
        if (!row) return;
        const id = row.dataset.id;
        const transactions = Store.getTransactions();
        const transaction = transactions.find(t => t.id === id);
        if (!transaction) return;

        transaction.type = e.target.value;
        Store.updateTransaction(transaction);
    });

    document.querySelector('#transactionBody').addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-transaction')) {
            const row = e.target.closest('tr');
            const id = row.dataset.id;
            UI.deleteTransaction(e.target);
            Store.removeTransaction(id);
            UI.showAlert('Transacción eliminada exitosamente', 'success');
        }
    });

    document.querySelector('#transactionBtn').addEventListener('click', () => {
        UI.showTransactionModal();
    });
});

// Agregar nuevo auto
document.querySelector('#entryForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!UI.validateInputs()) return;

    const licensePlate = document.querySelector('#licensePlate').value.trim();
    const entryTime = document.querySelector('#entryTime').value;
    const vehicleSize = document.querySelector('#vehicleSize').value;

    const entry = new Entry(licensePlate, entryTime, vehicleSize);
    UI.addEntryToTable(entry);
    Store.addEntries(entry);
    UI.clearInput();
    UI.showAlert('Carro añadido exitosamente al estacionamiento', 'success');
    UI.updateCarCount();
});

// Actualizar salida y eliminar
document.querySelector('#tableBody').addEventListener('click', (e) => {
    if (e.target.classList.contains('update-exit-time')) {
        const row = e.target.closest('tr');
        const id = row.dataset.id;
        const entries = Store.getEntries();
        const entry = entries.find(e => e.id === id);
        if (!entry) return;

        const now = new Date();
        const exitTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        const [entryHours, entryMinutes] = entry.entryTime.split(':').map(Number);
        const [exitHours, exitMinutes] = exitTime.split(':').map(Number);

        let entryDate = new Date(1970, 0, 1, entryHours, entryMinutes);
        let exitDate = new Date(1970, 0, 1, exitHours, exitMinutes);

        if (exitDate < entryDate) exitDate.setDate(exitDate.getDate() + 1);

        const duration = Math.round((exitDate - entryDate) / 60000);
        const charge = UI.roundToNearestHundred(UI.calculateCharge(duration, entry.vehicleSize));

        const updatedEntry = new Entry(
            entry.licensePlate, entry.entryTime, entry.vehicleSize,
            exitTime, duration, charge, entry.paymentMethod, entry.receiptNumber
        );
        updatedEntry.id = id;

        Store.updateEntries(updatedEntry);

        row.children[2].innerHTML = exitTime;
        row.children[3].textContent = `${duration} min`;
        row.children[4].textContent = `$${charge}`;
    }

    if (e.target.classList.contains('delete')) {
        const row = e.target.closest('tr');
        const id = row.dataset.id;
        UI.deleteEntry(e.target);
        Store.removeEntries(id);
        UI.showAlert('Carro eliminado de la lista del estacionamiento', 'success');
        UI.updateCarCount();
    }
});

// ==================== GUARDAR LISTA (MEJORADO) ====================
document.querySelector('#saveList').addEventListener('click', () => {
    // Guardar cambios actuales
    document.querySelectorAll('#tableBody tr').forEach(row => {
        const id = row.dataset.id;
        const licensePlate = row.querySelector('.license-plate').value.trim();
        const receiptNumber = row.querySelector('.receipt-number').value.trim();
        const paymentChecked = row.querySelector('.payment-method:checked');
        const paymentMethod = paymentChecked ? paymentChecked.dataset.type : null;

        const entries = Store.getEntries();
        const entry = entries.find(e => e.id === id);
        if (entry) {
            entry.licensePlate = licensePlate;
            entry.receiptNumber = receiptNumber;
            entry.paymentMethod = paymentMethod;
            Store.updateEntries(entry);
        }
    });

    // Guardar transacciones
    document.querySelectorAll('#transactionBody tr').forEach(row => {
        const id = row.dataset.id;
        const amount = parseFloat(row.querySelector('.transaction-amount').value);
        const description = row.querySelector('.transaction-description').value.trim();
        const type = row.querySelector('.transaction-type').value;

        const transactions = Store.getTransactions();
        const transaction = transactions.find(t => t.id === id);
        if (transaction && !isNaN(amount) && amount > 0 && description) {
            transaction.amount = amount;
            transaction.description = description;
            transaction.type = type;
            Store.updateTransaction(transaction);
        }
    });

    const entries = Store.getEntries();

    // Verificar números de boleta faltantes
    const receiptNumbers = entries
        .map(entry => parseInt(entry.receiptNumber))
        .filter(num => !isNaN(num) && num > 0)
        .sort((a, b) => a - b);

    let missingNumbers = [];
    if (receiptNumbers.length > 0) {
        const minNum = Math.min(...receiptNumbers);
        const maxNum = Math.max(...receiptNumbers);
        for (let i = minNum; i <= maxNum; i++) {
            if (!receiptNumbers.includes(i)) {
                missingNumbers.push(i);
            }
        }
    }

    let missingReason = "Sin faltantes";

    if (missingNumbers.length > 0) {
        const missingText = missingNumbers.join(', ');
        const reason = prompt(
            `⚠️ ATENCIÓN: Faltan los siguientes números de boleta:\n` +
            `${missingText}\n\n` +
            `Ingrese el motivo por el cual faltan estos recibos:\n` +
            `(ejemplo: "Anulada", "Error de impresión", "Cliente no pagó", "Cancelada", etc.)`
        );

        if (reason === null || reason.trim() === '') {
            alert('No se generará el PDF porque no se justificó la falta de boletas.');
            return;
        }
        missingReason = reason.trim();
    }

    const operatorName = prompt('Ingrese el nombre del operador:');
    if (!operatorName) {
        alert('Por favor, ingrese un nombre de operador para guardar el PDF.');
        return;
    }

    // Generar PDF
    const turno = document.querySelector('#turno').value;
    const initialCash = parseFloat(document.querySelector('#initialCash').value) || 0;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const currentDate = new Date().toLocaleDateString('es-CL');

    // Calcular totales
    let entryEfectivo = 0, entryTarjeta = 0, totalGeneral = 0;
    entries.forEach(entry => {
        if (entry.charge) {
            totalGeneral += entry.charge;
            if (entry.paymentMethod === 'efectivo') entryEfectivo += entry.charge;
            else if (entry.paymentMethod === 'tarjeta') entryTarjeta += entry.charge;
        }
    });

    let transactionEfectivoAdjustments = 0;
    let transactionTarjetaAdjustments = 0;
    const transactions = Store.getTransactions();

    transactions.forEach(transaction => {
        if (transaction.type === 'ingreso') {
            if (transaction.paymentMethod === 'efectivo') transactionEfectivoAdjustments += transaction.amount;
            else if (transaction.paymentMethod === 'tarjeta') transactionTarjetaAdjustments += transaction.amount;
        } else if (transaction.type === 'retiro') {
            if (transaction.paymentMethod === 'efectivo') transactionEfectivoAdjustments -= transaction.amount;
            else if (transaction.paymentMethod === 'tarjeta') transactionTarjetaAdjustments -= transaction.amount;
        }
    });

    const totalEfectivo = entryEfectivo + transactionEfectivoAdjustments;
    const totalTarjeta = entryTarjeta + transactionTarjetaAdjustments;
    const totalRecaudado = totalEfectivo + totalTarjeta;
    const totalFinalCaja = initialCash + totalEfectivo;

    // Ordenar por número de boleta
    const sortedEntries = [...entries].sort((a, b) => {
        return (parseInt(a.receiptNumber) || 0) - (parseInt(b.receiptNumber) || 0);
    });

    const columns = [
        'NRO. ORDEN', 'PATENTE', 'HORA ING.', 'HORA SALIDA', 
        'TOTAL MINUTOS', 'COBRO TOTAL', 'PAGO TARJETA S', 
        'PAGO EFECTIVO S', 'NRO RECIBO'
    ];

    const pdfRows = sortedEntries.map((entry, index) => [
        index + 1,
        entry.licensePlate || '',
        entry.entryTime || '',
        entry.exitTime || '',
        entry.duration ? `${entry.duration}` : '',
        entry.charge ? `$${entry.charge}` : '',
        entry.paymentMethod === 'tarjeta' ? 'X' : '',
        entry.paymentMethod === 'efectivo' ? 'X' : '',
        entry.receiptNumber || ''
    ]);

    doc.autoTable({
        head: [columns],
        body: pdfRows,
        foot: [['', '', '', '', '', `$${totalGeneral}`, `$${entryTarjeta}`, `$${entryEfectivo}`, '']],
        startY: 35,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 1, halign: 'center', font: 'times' },
        headStyles: { fillColor: [255,255,255], textColor: [0,0,0], fontStyle: 'bold' },
        footStyles: { fontStyle: 'bold' },
        columnStyles: {
            0: { cellWidth: 15 }, 1: { cellWidth: 25 }, 2: { cellWidth: 20 },
            3: { cellWidth: 20 }, 4: { cellWidth: 20 }, 5: { cellWidth: 20 },
            6: { cellWidth: 20 }, 7: { cellWidth: 20 }, 8: { cellWidth: 20 }
        }
    });

    const finalY = doc.autoTable.previous.finalY + 15;
    doc.text(`Justificación de boletas faltantes: ${missingReason}`, 10, finalY);

    // Aquí puedes seguir agregando el resto de los totales y transacciones como tenías antes
    // (el código de totales en caja, transacciones, etc.)

    doc.save(`Historial_Estacionamiento_${new Date().toISOString().slice(0,10)}.pdf`);
});

document.querySelector('#clearList').addEventListener('click', () => {
    if (confirm('¿Estás seguro de que deseas eliminar todos los registros del estacionamiento?')) {
        Store.clearEntries();
        UI.clearTable();
        document.querySelector('#initialCash').value = '';
        UI.showAlert('Lista de estacionamiento eliminada exitosamente', 'success');
    }
});
