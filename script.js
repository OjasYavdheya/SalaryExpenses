let currentBalance = 0;

function setSalary() {
    const salaryInput = document.getElementById('totalSalary');
    const salaryValue = parseFloat(salaryInput.value);

    if (isNaN(salaryValue) || salaryValue <= 0) {
        alert("Please enter a valid salary amount.");
        return;
    }

    currentBalance = salaryValue;
    updateUI();
    // Disable salary input after setting to prevent confusion, or keep it open to reset
}

function addExpense() {
    const desc = document.getElementById('desc').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const date = document.getElementById('date').value;

    if (!desc || isNaN(amount) || !date) {
        alert("Please fill in all expense details.");
        return;
    }

    // Subtract from balance
    currentBalance -= amount;

    // Add to table
    const tableBody = document.getElementById('expenseList');
    const row = tableBody.insertRow();
    row.innerHTML = `
        <td>${date}</td>
        <td>${desc}</td>
        <td>₹${amount}</td>
    `;

    // Clear inputs
    document.getElementById('desc').value = '';
    document.getElementById('amount').value = '';
    
    updateUI();
}

function updateUI() {
    document.getElementById('balance').innerText = currentBalance.toFixed(2);
}