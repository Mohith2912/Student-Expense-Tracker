document.addEventListener('DOMContentLoaded', () => {
  const transactionCount = 0;
  const income = 0;
  const expense = 0;
  const balance = income - expense;

  document.getElementById('analyticsTransactionCount').textContent = transactionCount;
  document.getElementById('analyticsIncome').textContent = `₹${income}`;
  document.getElementById('analyticsExpense').textContent = `₹${expense}`;
  document.getElementById('analyticsBalance').textContent = `₹${balance}`;

  const insightSummary = document.getElementById('insightSummary');
  const insights = [
    'No transactions yet, so analytics will appear after data is added.',
    'Income, expense, and balance metrics will update here.',
    'This page is separated for future advanced charts and reports.'
  ];

  insightSummary.innerHTML = insights.map((text) => `
    <div class="insight-box">${text}</div>
  `).join('');
});