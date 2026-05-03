let currentSalary = 0;
let currentExpenses = 0;

// *** Initialization & Date Defaults ***
window.onload = function() {
    const today = new Date();
    // Default the expense date input to today
    document.getElementById('date').valueAsDate = today;
    
    // Default the salary month input to current month
    const yearMonth = today.toISOString().substring(0, 7); // Format: YYYY-MM
    document.getElementById('salaryMonthInput').value = yearMonth;

    updateUI();
};

// *** Functionality of the new '+' Icon ***
const modal = document.getElementById('salaryModal');

function openSalaryModal() {
    modal.classList.add('modal-open');
}

function closeSalaryModal() {
    modal.classList.remove('modal-open');
}

// Close the modal if the user clicks outside of it
window.onclick = function(event) {
    if (event.target == modal) {
        closeSalaryModal();
    }
}

function setSalaryFromModal() {
    const salaryInput = document.getElementById('modalSalaryInput');
    const monthInput = document.getElementById('salaryMonthInput');
    
    const salaryValue = parseFloat(salaryInput.value);
    const selectedMonth = monthInput.value;

    if (isNaN(salaryValue) || salaryValue <= 0 || !selectedMonth) {
        alert("Please enter a valid salary and month.");
        return;
    }

    // Set the data
    currentSalary = salaryValue;
    currentExpenses = 0; // Reset expenses for the new month setup
    document.getElementById('expenseList').innerHTML = ''; // Clear the table

    // Update the Month Name in the header
    const dateObj = new Date(selectedMonth);
    const monthName = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    document.getElementById('currentMonthName').innerText = monthName;

    // Reset the last update time
    const today = new Date();
    document.getElementById('lastUpdateText').innerText = 'Set on ' + today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'});

    updateUI();
    closeSalaryModal();
    // Clear modal inputs for next use
    salaryInput.value = '';
}

// *** Main Expense Functionality ***
function addExpense() {
    const desc = document.getElementById('desc').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const dateInput = document.getElementById('date').value;

    if (!desc || isNaN(amount) || amount <= 0 || !dateInput) {
        alert("Please fill in all valid expense details.");
        return;
    }

    // Subtract from balance logic
    currentExpenses += amount;

    // Add row to the table with formatting matching the image
    const tableBody = document.getElementById('expenseList');
    const row = tableBody.insertRow(0); // Insert at the top

    const formattedDate = new Date(dateInput).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    row.innerHTML = `
        <td>${formattedDate}</td>
        <td>${desc}</td>
        <td class="expense-amount">- ₹${amount.toFixed(2)}</td>
    `;

    // Clear main inputs
    document.getElementById('desc').value = '';
    document.getElementById('amount').value = '';
    
    updateUI();
}

function updateUI() {
    const currentBalance = currentSalary - currentExpenses;
    
    // Standard Formatting
    document.getElementById('salaryDisplay').innerText = currentSalary.toLocaleString('en-IN');
    document.getElementById('expensesDisplay').innerText = currentExpenses.toLocaleString('en-IN');
    document.getElementById('expensesDisplayTotal').innerText = currentExpenses.toLocaleString('en-IN');
    document.getElementById('balance').innerText = currentBalance.toLocaleString('en-IN');
}