document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('transactionForm');
  const tableBody = document.getElementById('transactionTableBody');
  const transactions = [];

  function renderTransactions() {
    tableBody.innerHTML = '';

    if (transactions.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6">No transactions added yet.</td>
        </tr>
      `;
      return;
    }

    transactions.forEach((transaction, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${transaction.type}</td>
        <td>${transaction.category}</td>
        <td>₹${transaction.amount}</td>
        <td>${transaction.date}</td>
        <td>${transaction.note || '-'}</td>
        <td><button class="delete-btn" data-index="${index}">Delete</button></td>
      `;
      tableBody.appendChild(row);
    });

    document.querySelectorAll('.delete-btn').forEach((button) => {
      button.addEventListener('click', () => {
        const index = Number(button.dataset.index);
        transactions.splice(index, 1);
        renderTransactions();
      });
    });
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const type = document.getElementById('type').value;
    const amount = document.getElementById('amount').value;
    const category = document.getElementById('category').value;
    const date = document.getElementById('date').value;
    const note = document.getElementById('note').value.trim();

    transactions.push({ type, amount, category, date, note });
    form.reset();
    renderTransactions();
  });

  renderTransactions();
});