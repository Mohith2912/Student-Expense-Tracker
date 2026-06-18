document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('budgetForm');
  const budgetCards = document.getElementById('budgetCards');

  const budgets = {
    Food: 0,
    Transport: 0,
    Books: 0,
    Hostel: 0,
    Entertainment: 0,
    Shopping: 0
  };

  function renderBudgets() {
    budgetCards.innerHTML = '';

    Object.entries(budgets).forEach(([name, amount]) => {
      const card = document.createElement('div');
      card.className = 'budget-card';
      card.innerHTML = `
        <h4>${name}</h4>
        <p>Budget: ₹${amount}</p>
      `;
      budgetCards.appendChild(card);
    });
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    budgets.Food = Number(document.getElementById('foodBudget').value || 0);
    budgets.Transport = Number(document.getElementById('transportBudget').value || 0);
    budgets.Books = Number(document.getElementById('booksBudget').value || 0);
    budgets.Hostel = Number(document.getElementById('hostelBudget').value || 0);
    budgets.Entertainment = Number(document.getElementById('entertainmentBudget').value || 0);
    budgets.Shopping = Number(document.getElementById('shoppingBudget').value || 0);

    renderBudgets();
  });

  renderBudgets();
});