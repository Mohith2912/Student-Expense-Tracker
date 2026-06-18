document.addEventListener('DOMContentLoaded', () => {
  const totalIncome = 0;
  const totalExpense = 0;
  const balance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0;

  document.getElementById('totalIncome').textContent = `₹${totalIncome}`;
  document.getElementById('totalExpense').textContent = `₹${totalExpense}`;
  document.getElementById('balance').textContent = `₹${balance}`;
  document.getElementById('savingsRate').textContent = `${savingsRate}%`;

  const trendCtx = document.getElementById('trendChart');
  const categoryCtx = document.getElementById('categoryChart');

  new Chart(trendCtx, {
    type: 'bar',
    data: {
      labels: ['Income', 'Expense'],
      datasets: [{
        label: 'Amount',
        data: [0, 0],
        backgroundColor: ['#156c63', '#b42318']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });

  new Chart(categoryCtx, {
    type: 'doughnut',
    data: {
      labels: ['Food', 'Transport', 'Books', 'Hostel', 'Entertainment', 'Shopping'],
      datasets: [{
        data: [0, 0, 0, 0, 0, 0],
        backgroundColor: ['#156c63', '#74c69d', '#f4a261', '#457b9d', '#e76f51', '#6d597a']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
});