// The Master Data Object
// Structure: { "YYYY-MM": { salary: 0, expenses: [] } }
let historyData = {};
let currentMonthKey = ""; // Stores the currently viewed month (e.g., "2026-04")

const AUTO_IMPORT_CANDIDATES = ['salaryTrackerData.json', 'data.json'];

window.onload = async function() {
    const today = new Date();
    const yearMonth = today.toISOString().substring(0, 7);

    // Set default inputs
    document.getElementById('date').valueAsDate = today;
    document.getElementById('salaryMonthInput').value = yearMonth;

    await autoImportDataFromLocalJson();

    // Load the current month if it exists, otherwise leave blank
    loadMonth(yearMonth);
};

async function autoImportDataFromLocalJson() {
    for (const fileName of AUTO_IMPORT_CANDIDATES) {
        try {
            const response = await fetch(fileName, { cache: 'no-store' });
            if (!response.ok) {
                continue;
            }

            const content = await response.json();
            const importedHistory = content?.historyData ?? content;

            if (!isValidHistoryData(importedHistory)) {
                console.warn(`Skipped ${fileName}: Invalid format.`);
                continue;
            }

            historyData = importedHistory;
            console.info(`Auto-loaded data from ${fileName}.`);
            return;
        } catch (error) {
            console.warn(`Unable to auto-load ${fileName}.`, error);
        }
    }
}

function openSalaryModal() {
    document.getElementById('salaryModal').classList.add('modal-open');
}

function closeSalaryModal() {
    document.getElementById('salaryModal').classList.remove('modal-open');
}

// --- Month Management ---

function loadMonth(monthKey) {
    currentMonthKey = monthKey;
    const data = historyData[monthKey] || { salary: 0, expenses: [] };
    
    // Update Header
    const dateObj = new Date(monthKey + "-01");
    const monthName = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    document.getElementById('currentMonthName').innerText = monthName;

    // Update UI
    renderExpenses();
    updateUI();
}

function setSalaryFromModal() {
    const salaryValue = parseFloat(document.getElementById('modalSalaryInput').value);
    const monthKey = document.getElementById('salaryMonthInput').value;

    if (isNaN(salaryValue) || !monthKey) {
        alert("Please enter valid data");
        return;
    }

    // Initialize month in history if it doesn't exist
    if (!historyData[monthKey]) {
        historyData[monthKey] = { salary: 0, expenses: [] };
    }

    historyData[monthKey].salary = salaryValue;
    saveAndSync();
    loadMonth(monthKey); // Switch view to the month we just edited
    closeSalaryModal();
}

// --- Expense Management ---

function addExpense() {
    if (!currentMonthKey || !historyData[currentMonthKey]) {
        alert("Please set a Salary for this month first using the + icon!");
        return;
    }

    const desc = document.getElementById('desc').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const date = document.getElementById('date').value;

    if (!desc || isNaN(amount) || !date) {
        alert("Fill all fields");
        return;
    }

    // Push to the history object
    historyData[currentMonthKey].expenses.push({ date, desc, amount });
    
    saveAndSync();
    renderExpenses();
    updateUI();

    // Clear inputs
    document.getElementById('desc').value = '';
    document.getElementById('amount').value = '';
}

// --- UI Rendering ---

function renderExpenses() {
    const tableBody = document.getElementById('expenseList');
    tableBody.innerHTML = ''; // Clear table
    
    const expenses = historyData[currentMonthKey]?.expenses || [];

    // Sort expenses by date (newest first)
    const sorted = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));

    sorted.forEach(item => {
        const row = tableBody.insertRow();
        const formattedDate = new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const dateCell = row.insertCell();
        const descCell = row.insertCell();
        const amountCell = row.insertCell();

        dateCell.textContent = formattedDate;
        descCell.textContent = item.desc;
        amountCell.className = 'expense-amount';
        amountCell.textContent = `- ₹${item.amount.toLocaleString('en-IN')}`;
    });
}

function updateUI() {
    const data = historyData[currentMonthKey] || { salary: 0, expenses: [] };
    const totalSalary = data.salary;
    const totalExpenses = data.expenses.reduce((sum, item) => sum + item.amount, 0);
    const balance = totalSalary - totalExpenses;

    document.getElementById('salaryDisplay').innerText = totalSalary.toLocaleString('en-IN');
    document.getElementById('expensesDisplay').innerText = totalExpenses.toLocaleString('en-IN');
    document.getElementById('balance').innerText = balance.toLocaleString('en-IN');
}

function saveAndSync() {
    localStorage.setItem('salaryTrackerData', JSON.stringify(historyData));
}

// --- Navigation (The History Icon) ---
function toggleHistoryList() {
    // We will build a simple month-selector dropdown or sidebar list here
    const months = Object.keys(historyData).sort().reverse();
    if (months.length === 0) {
        alert("No history found yet!");
        return;
    }
    
    let message = "Select a month to view:\n" + months.join("\n");
    let choice = prompt(message, currentMonthKey);
    
    if (choice && historyData[choice]) {
        loadMonth(choice);
    }
}

function exportData() {
    const payload = {
        exportedAt: new Date().toISOString(),
        version: 1,
        historyData
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    const stamp = new Date().toISOString().slice(0, 10);
    anchor.href = url;
    anchor.download = `salary-tracker-backup-${stamp}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
}

function isValidHistoryData(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return false;
    }

    return Object.values(data).every(month => {
        if (!month || typeof month !== 'object' || Array.isArray(month)) {
            return false;
        }

        if (typeof month.salary !== 'number' || Number.isNaN(month.salary)) {
            return false;
        }

        if (!Array.isArray(month.expenses)) {
            return false;
        }

        return month.expenses.every(expense => (
            expense &&
            typeof expense.date === 'string' &&
            typeof expense.desc === 'string' &&
            typeof expense.amount === 'number' &&
            !Number.isNaN(expense.amount)
        ));
    });
}