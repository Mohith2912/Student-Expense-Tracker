const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
});

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

const categories = [
  { name: 'Food', budget: 6500, type: 'need' },
  { name: 'Hostel', budget: 9000, type: 'need' },
  { name: 'Transport', budget: 2200, type: 'need' },
  { name: 'Books', budget: 1800, type: 'need' },
  { name: 'Entertainment', budget: 2500, type: 'want' },
  { name: 'Shopping', budget: 2800, type: 'want' },
  { name: 'Savings', budget: 5000, type: 'saving' }
];

let transactions = [];
let goals = [];
let trendMode = 6;
let ledgerFilter = 'all';
let charts = {};

const sampleTransactions = [
  { id: crypto.randomUUID(), type: 'income', category: 'Allowance', note: 'Monthly allowance', date: '2026-06-01', payment: 'Bank', amount: 18000 },
  { id: crypto.randomUUID(), type: 'income', category: 'Freelance', note: 'UI gig payout', date: '2026-06-06', payment: 'UPI', amount: 6500 },
  { id: crypto.randomUUID(), type: 'expense', category: 'Hostel', note: 'Hostel and electricity', date: '2026-06-02', payment: 'Bank', amount: 8200 },
  { id: crypto.randomUUID(), type: 'expense', category: 'Food', note: 'Mess + snacks', date: '2026-06-04', payment: 'UPI', amount: 3300 },
  { id: crypto.randomUUID(), type: 'expense', category: 'Transport', note: 'Bus pass recharge', date: '2026-06-05', payment: 'UPI', amount: 1200 },
  { id: crypto.randomUUID(), type: 'expense', category: 'Books', note: 'Numerical methods guide', date: '2026-06-08', payment: 'Cash', amount: 950 },
  { id: crypto.randomUUID(), type: 'expense', category: 'Entertainment', note: 'Movie and dinner', date: '2026-06-10', payment: 'UPI', amount: 1450 },
  { id: crypto.randomUUID(), type: 'expense', category: 'Shopping', note: 'T-shirt and essentials', date: '2026-06-12', payment: 'Card', amount: 1850 },
  { id: crypto.randomUUID(), type: 'expense', category: 'Food', note: 'Cafe work session', date: '2026-06-15', payment: 'UPI', amount: 720 }
];

const sampleGoals = [
  { id: crypto.randomUUID(), title: 'Emergency fund', target: 12000, saved: 5400, deadline: '2026-09-30' },
  { id: crypto.randomUUID(), title: 'New headphones', target: 4500, saved: 2100, deadline: '2026-07-28' }
];

const sections = document.querySelectorAll('.section');
const navButtons = document.querySelectorAll('[data-section-target]');
const mobileButtons = document.querySelectorAll('.mobile-nav [data-section-target]');
const categorySelect = document.getElementById('category');
const pageTitle = document.getElementById('pageTitle');
const transactionForm = document.getElementById('transactionForm');
const goalForm = document.getElementById('goalForm');
const typeSelect = document.getElementById('type');
const amountInput = document.getElementById('amount');
const dateInput = document.getElementById('date');
const paymentInput = document.getElementById('payment');
const noteInput = document.getElementById('note');

function formatINR(value) {
  return currency.format(Math.round(value || 0));
}

function seedDemo() {
  transactions = JSON.parse(JSON.stringify(sampleTransactions));
  goals = JSON.parse(JSON.stringify(sampleGoals));
  renderAll();
}

function populateCategorySelect(type = 'expense') {
  const incomeOptions = ['Allowance', 'Scholarship', 'Freelance', 'Parents', 'Part-time'];
  const expenseOptions = categories.filter((category) => category.name !== 'Savings').map((category) => category.name);
  const list = type === 'income' ? incomeOptions : expenseOptions;
  categorySelect.innerHTML = list.map((item) => `<option value="${item}">${item}</option>`).join('');
}

function computeMetrics() {
  const income = transactions.filter((transaction) => transaction.type === 'income').reduce((sum, transaction) => sum + Number(transaction.amount), 0);
  const expenses = transactions.filter((transaction) => transaction.type === 'expense').reduce((sum, transaction) => sum + Number(transaction.amount), 0);
  const saved = Math.max(0, income - expenses);
  const balance = income - expenses;

  const expenseByCategory = {};
  categories.forEach((category) => {
    expenseByCategory[category.name] = 0;
  });

  transactions.filter((transaction) => transaction.type === 'expense').forEach((transaction) => {
    expenseByCategory[transaction.category] = (expenseByCategory[transaction.category] || 0) + Number(transaction.amount);
  });

  const byTypeTotals = { need: 0, want: 0, saving: 0 };
  categories.forEach((category) => {
    byTypeTotals[category.type] += expenseByCategory[category.name] || 0;
  });

  const topCategoryEntry = Object.entries(expenseByCategory).sort((a, b) => b[1] - a[1])[0] || ['None', 0];

  return {
    income,
    expenses,
    saved,
    balance,
    expenseByCategory,
    needsRatio: expenses ? Math.round((byTypeTotals.need / expenses) * 100) : 0,
    wantsRatio: expenses ? Math.round((byTypeTotals.want / expenses) * 100) : 0,
    savingsRate: income ? Math.round((saved / income) * 100) : 0,
    topCategory: topCategoryEntry[1] ? topCategoryEntry[0] : '-',
    budgetUsage: categories.map((category) => {
      const spent = expenseByCategory[category.name] || 0;
      const percent = category.budget ? Math.round((spent / category.budget) * 100) : 0;
      return { ...category, spent, percent };
    })
  };
}

function renderOverview(metrics) {
  document.getElementById('balanceValue').textContent = formatINR(metrics.balance);
  document.getElementById('incomeValue').textContent = formatINR(metrics.income);
  document.getElementById('spentValue').textContent = formatINR(metrics.expenses);
  document.getElementById('savedValue').textContent = formatINR(metrics.saved);
  document.getElementById('needsRatio').textContent = `${metrics.needsRatio}%`;
  document.getElementById('wantsRatio').textContent = `${metrics.wantsRatio}%`;
  document.getElementById('savingsRate').textContent = `${metrics.savingsRate}%`;
  document.getElementById('topCategory').textContent = metrics.topCategory;

  const goalTotal = goals.reduce((sum, goal) => sum + goal.target, 0);
  const goalSaved = goals.reduce((sum, goal) => sum + goal.saved, 0);
  const goalPercent = goalTotal ? Math.round((goalSaved / goalTotal) * 100) : 0;

  document.getElementById('goalPercent').textContent = `${goalPercent}%`;
  document.getElementById('goalLabel').textContent = goalTotal ? `${formatINR(goalSaved)} of ${formatINR(goalTotal)}` : 'No goals yet';

  const ring = document.querySelector('.progress-ring');
  const ringStop = Math.min(360, goalPercent * 3.6);
  ring.style.background = `conic-gradient(var(--color-success) 0deg, var(--color-success) ${ringStop}deg, color-mix(in srgb, var(--color-success) 18%, transparent) ${ringStop}deg, color-mix(in srgb, var(--color-success) 18%, transparent) 360deg)`;

  const overBudget = metrics.budgetUsage.filter((item) => item.percent > 100);
  const nearBudget = metrics.budgetUsage.filter((item) => item.percent >= 75 && item.percent <= 100);
  const budgetHealth = document.getElementById('budgetHealth');

  if (overBudget.length) {
    budgetHealth.textContent = `${overBudget.length} category is over budget right now.`;
  } else if (nearBudget.length) {
    budgetHealth.textContent = `${nearBudget.length} categories are close to their budget cap.`;
  } else {
    budgetHealth.textContent = 'All categories are in a healthy budget zone.';
  }

  let insight = 'You are building a stable monthly money pattern.';
  if (metrics.wantsRatio > 30) insight = 'Wants spending is climbing; trim shopping or entertainment this week.';
  if (metrics.savingsRate >= 25) insight = 'Strong work: your savings rate is comfortably above a typical student buffer.';
  if (metrics.topCategory === 'Food') insight = 'Food is the largest bucket; batching snacks and café spending may unlock quick savings.';
  document.getElementById('smartInsight').textContent = insight;
}

function renderRecentTransactions() {
  const container = document.getElementById('recentTransactions');
  const recent = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  if (!recent.length) {
    container.innerHTML = '<div class="empty-state">No transactions available.</div>';
    return;
  }

  container.innerHTML = recent.map((transaction) => `
    <div class="transaction-item">
      <div class="icon-badge">${transaction.category[0]}</div>
      <div>
        <div class="line-1"><strong>${transaction.category}</strong><span class="subtle">${transaction.payment}</span></div>
        <p class="subtle">${transaction.note || 'No note'} · ${new Date(transaction.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
      </div>
      <div class="amount ${transaction.type}">${transaction.type === 'expense' ? '-' : '+'}${formatINR(transaction.amount)}</div>
    </div>
  `).join('');
}

function renderBudgetPressure(metrics) {
  const container = document.getElementById('budgetPressure');
  container.innerHTML = metrics.budgetUsage
    .filter((item) => item.name !== 'Savings')
    .map((item) => {
      const color = item.percent > 100 ? 'var(--color-danger)' : item.percent > 75 ? 'var(--color-warning)' : 'var(--color-success)';
      return `
        <div class="budget-item">
          <div class="line-1"><strong>${item.name}</strong><span class="subtle">${formatINR(item.spent)} / ${formatINR(item.budget)}</span></div>
          <div class="progress-bar"><span style="width:${Math.min(item.percent, 100)}%; background:${color};"></span></div>
          <p class="subtle">${item.percent}% used this month</p>
        </div>
      `;
    })
    .join('');
}

function renderLedger() {
  const tbody = document.getElementById('ledgerTable');
  const filtered = [...transactions]
    .filter((transaction) => (ledgerFilter === 'all' ? true : transaction.type === ledgerFilter))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (!filtered.length) {
    tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state">No matching transactions.</div></td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map((transaction) => `
    <tr>
      <td><span class="pill">${transaction.type}</span></td>
      <td>${transaction.category}</td>
      <td>${transaction.note || '-'}</td>
      <td>${new Date(transaction.date).toLocaleDateString('en-IN')}</td>
      <td>${transaction.payment}</td>
      <td class="amount ${transaction.type}">${transaction.type === 'expense' ? '-' : '+'}${formatINR(transaction.amount)}</td>
      <td><button class="ghost-btn delete-transaction-btn" data-id="${transaction.id}">Delete</button></td>
    </tr>
  `).join('');

  document.querySelectorAll('.delete-transaction-btn').forEach((button) => {
    button.addEventListener('click', () => deleteTransaction(button.dataset.id));
  });
}

function renderBudgetEditor(metrics) {
  const editor = document.getElementById('budgetEditor');
  editor.innerHTML = metrics.budgetUsage.map((item) => `
    <div class="budget-item">
      <div class="line-1"><strong>${item.name}</strong><span class="subtle">Spent ${formatINR(item.spent)}</span></div>
      <div class="field">
        <label for="budget-${item.name}">Monthly budget</label>
        <input id="budget-${item.name}" class="budget-input" data-name="${item.name}" type="number" min="0" value="${item.budget}" />
      </div>
      <div class="progress-bar"><span style="width:${Math.min(item.percent, 100)}%; background:${item.percent > 100 ? 'var(--color-danger)' : 'var(--color-primary)'}"></span></div>
    </div>
  `).join('');

  document.querySelectorAll('.budget-input').forEach((input) => {
    input.addEventListener('change', (event) => updateBudget(event.target.dataset.name, event.target.value));
  });
}

function renderBudgetInsights(metrics) {
  const element = document.getElementById('budgetInsights');
  const items = [];

  if (metrics.needsRatio > 60) items.push(['Priority reset', 'Needs spending is above 60% of total expenses; inspect hostel, transport, or food optimization.']);
  if (metrics.wantsRatio > 30) items.push(['Lifestyle check', 'Wants spending crossed a healthy student threshold, so cap entertainment or impulse shopping next week.']);
  if (metrics.savingsRate < 15) items.push(['Savings push', 'Current savings rate is low; set a non-negotiable auto-save target from every income entry.']);

  categories.forEach((category) => {
    if (category.name !== 'Savings') {
      const spent = metrics.expenseByCategory[category.name] || 0;
      if (spent > category.budget) {
        items.push([`${category.name} over budget`, `${category.name} exceeded its cap by ${formatINR(spent - category.budget)}.`]);
      }
    }
  });

  if (!items.length) {
    items.push(['Healthy balance', `Your present flow leaves ${formatINR(metrics.balance)} available after expenses, which is a stable sign for this month.`]);
  }

  element.innerHTML = items.map(([title, text]) => `
    <div class="insight-item">
      <div class="icon-badge">✓</div>
      <div>
        <strong>${title}</strong>
        <p class="subtle">${text}</p>
      </div>
    </div>
  `).join('');
}

function renderTransactionInsights(metrics) {
  const element = document.getElementById('transactionInsights');
  const topThree = Object.entries(metrics.expenseByCategory)
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  if (!topThree.length) {
    element.innerHTML = '<div class="empty-state">Add transactions to unlock insights.</div>';
    return;
  }

  element.innerHTML = topThree.map(([name, value], index) => `
    <div class="insight-item">
      <div class="icon-badge">${index + 1}</div>
      <div>
        <strong>${name}</strong>
        <p class="subtle">Spent ${formatINR(value)} this month in ${name.toLowerCase()}.</p>
      </div>
    </div>
  `).join('');
}

function renderGoals() {
  const list = document.getElementById('goalList');

  if (!goals.length) {
    list.innerHTML = '<div class="empty-state">No goals yet. Add one to start saving intentionally.</div>';
    return;
  }

  list.innerHTML = goals.map((goal) => {
    const progress = goal.target ? Math.round((goal.saved / goal.target) * 100) : 0;
    const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));

    return `
      <div class="goal-item">
        <div>
          <div class="line-1"><strong>${goal.title}</strong><span class="pill">${progress}%</span></div>
          <p class="subtle">${formatINR(goal.saved)} saved of ${formatINR(goal.target)} · ${daysLeft > 0 ? `${daysLeft} days left` : 'Deadline reached'}</p>
          <div class="progress-bar" style="margin-top:.8rem;"><span style="width:${Math.min(progress, 100)}%; background:var(--color-success)"></span></div>
        </div>
        <button class="ghost-btn delete-goal-btn" data-id="${goal.id}">Remove</button>
      </div>
    `;
  }).join('');

  document.querySelectorAll('.delete-goal-btn').forEach((button) => {
    button.addEventListener('click', () => deleteGoal(button.dataset.id));
  });
}

function renderBehaviorInsights(metrics) {
  const behavior = document.getElementById('behaviorInsights');
  const entries = [];

  const food = metrics.expenseByCategory.Food || 0;
  const entertainment = metrics.expenseByCategory.Entertainment || 0;
  const shopping = metrics.expenseByCategory.Shopping || 0;

  if (food > 5000) entries.push(['Food trend', 'Food spend is high for the current point in the month; plan two low-cost days to recover.']);
  if (entertainment + shopping > 3500) entries.push(['Impulse cluster', 'Entertainment plus shopping is creating avoidable pressure on savings capacity.']);
  if (metrics.savingsRate > 20) entries.push(['Strong savings signal', 'Your saving habit is above a safe student benchmark, which gives flexibility for emergency or semester costs.']);
  if (metrics.balance < 3000) entries.push(['Low remaining balance', 'Remaining balance is slim, so keep the next week focused on essentials only.']);
  if (!entries.length) entries.push(['Stable month', 'Your expense distribution is balanced and currently under control.']);

  behavior.innerHTML = entries.map(([title, text]) => `
    <div class="insight-item">
      <div class="icon-badge">→</div>
      <div>
        <strong>${title}</strong>
        <p class="subtle">${text}</p>
      </div>
    </div>
  `).join('');
}

function renderScorecard(metrics) {
  const scorecard = document.getElementById('scorecard');
  const score = Math.max(
    0,
    Math.min(
      100,
      100 - Math.max(0, metrics.wantsRatio - 30) - Math.max(0, 15 - metrics.savingsRate) * 2 - Math.max(0, metrics.budgetUsage.filter((item) => item.percent > 100).length * 8)
    )
  );

  const cards = [
    ['Financial discipline score', `${score}/100`],
    ['Available balance', formatINR(metrics.balance)],
    ['Goal count', String(goals.length)],
    ['Over-budget categories', String(metrics.budgetUsage.filter((item) => item.percent > 100).length)]
  ];

  scorecard.innerHTML = cards.map(([title, value]) => `
    <div class="insight-item">
      <div class="icon-badge">★</div>
      <div>
        <strong>${title}</strong>
        <p class="subtle">${value}</p>
      </div>
    </div>
  `).join('');
}

function buildCharts(metrics) {
  const trendLabels = trendMode === 6 ? monthNames : monthNames.slice(-3);
  const incomeSeries = trendMode === 6 ? [12000, 15500, 14800, 17200, 21000, metrics.income] : [17200, 21000, metrics.income];
  const expenseSeries = trendMode === 6 ? [9800, 11200, 10600, 12150, 13900, metrics.expenses] : [12150, 13900, metrics.expenses];
  const catEntries = Object.entries(metrics.expenseByCategory).filter(([, value]) => value > 0);

  if (charts.trend) charts.trend.destroy();
  charts.trend = new Chart(document.getElementById('trendChart'), {
    type: 'line',
    data: {
      labels: trendLabels,
      datasets: [
        {
          label: 'Income',
          data: incomeSeries,
          borderColor: '#2d6a4f',
          backgroundColor: 'rgba(45,106,79,0.12)',
          tension: 0.35,
          fill: true
        },
        {
          label: 'Expenses',
          data: expenseSeries,
          borderColor: '#b42318',
          backgroundColor: 'rgba(180,35,24,0.08)',
          tension: 0.35,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom' } },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback(value) {
              return `₹${value}`;
            }
          }
        }
      }
    }
  });

  if (charts.category) charts.category.destroy();
  charts.category = new Chart(document.getElementById('categoryChart'), {
    type: 'doughnut',
    data: {
      labels: catEntries.map(([name]) => name),
      datasets: [
        {
          data: catEntries.map(([, value]) => value),
          backgroundColor: ['#116466', '#74c69d', '#f4a261', '#457b9d', '#e76f51', '#6d597a', '#2d6a4f'],
          borderWidth: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom' } },
      cutout: '68%'
    }
  });
}

function renderAll() {
  const metrics = computeMetrics();
  renderOverview(metrics);
  renderRecentTransactions();
  renderBudgetPressure(metrics);
  renderLedger();
  renderBudgetEditor(metrics);
  renderBudgetInsights(metrics);
  renderTransactionInsights(metrics);
  renderGoals();
  renderBehaviorInsights(metrics);
  renderScorecard(metrics);
  buildCharts(metrics);
}

function setActiveSection(sectionId) {
  sections.forEach((section) => section.classList.toggle('active', section.id === sectionId));
  navButtons.forEach((button) => button.classList.toggle('active', button.dataset.sectionTarget === sectionId));
  mobileButtons.forEach((button) => button.classList.toggle('active', button.dataset.sectionTarget === sectionId));

  const titleMap = {
    dashboard: 'Dashboard overview',
    transactions: 'Transactions ledger',
    budgets: 'Budget planner',
    goals: 'Savings goals',
    analytics: 'Analytics and insights'
  };

  pageTitle.textContent = titleMap[sectionId] || 'Student Expense Tracker';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function deleteTransaction(id) {
  transactions = transactions.filter((transaction) => transaction.id !== id);
  renderAll();
}

function deleteGoal(id) {
  goals = goals.filter((goal) => goal.id !== id);
  renderAll();
}

function updateBudget(name, value) {
  const item = categories.find((category) => category.name === name);
  if (item) item.budget = Number(value || 0);
  renderAll();
}

transactionForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const transaction = {
    id: crypto.randomUUID(),
    type: typeSelect.value,
    amount: Number(amountInput.value),
    category: categorySelect.value,
    date: dateInput.value,
    payment: paymentInput.value,
    note: noteInput.value.trim()
  };

  transactions.unshift(transaction);
  transactionForm.reset();
  dateInput.value = new Date().toISOString().split('T')[0];
  populateCategorySelect('expense');
  renderAll();
  setActiveSection('transactions');
});

goalForm.addEventListener('submit', (event) => {
  event.preventDefault();

  goals.unshift({
    id: crypto.randomUUID(),
    title: document.getElementById('goalTitle').value.trim(),
    target: Number(document.getElementById('goalTarget').value),
    saved: Number(document.getElementById('goalSaved').value),
    deadline: document.getElementById('goalDeadline').value
  });

  goalForm.reset();
  renderAll();
});

typeSelect.addEventListener('change', (event) => {
  populateCategorySelect(event.target.value);
});

document.getElementById('fillSampleExpense').addEventListener('click', () => {
  typeSelect.value = 'expense';
  populateCategorySelect('expense');
  amountInput.value = 240;
  categorySelect.value = 'Food';
  dateInput.value = new Date().toISOString().split('T')[0];
  paymentInput.value = 'UPI';
  noteInput.value = 'Evening snacks';
});

document.getElementById('fillSampleGoal').addEventListener('click', () => {
  document.getElementById('goalTitle').value = 'Semester trip fund';
  document.getElementById('goalTarget').value = 7000;
  document.getElementById('goalSaved').value = 1500;
  document.getElementById('goalDeadline').value = '2026-08-20';
});

document.querySelectorAll('[data-section-target]').forEach((button) => {
  button.addEventListener('click', () => {
    const section = button.dataset.sectionTarget;
    if (section) setActiveSection(section);
  });
});

document.querySelectorAll('[data-ledger-filter]').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-ledger-filter]').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    ledgerFilter = button.dataset.ledgerFilter;
    renderLedger();
  });
});

document.querySelectorAll('[data-trend]').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-trend]').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    trendMode = Number(button.dataset.trend);
    renderAll();
  });
});

document.getElementById('themeToggle').addEventListener('click', () => {
  const root = document.documentElement;
  const nextTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', nextTheme);
  document.getElementById('themeToggle').textContent = nextTheme === 'dark' ? '☀️ Theme' : '🌙 Theme';
  renderAll();
});

document.getElementById('seedDataBtn').addEventListener('click', seedDemo);
document.getElementById('quickAddTop').addEventListener('click', () => setActiveSection('transactions'));
document.getElementById('quickAddSidebar').addEventListener('click', () => setActiveSection('transactions'));
document.getElementById('mobileAddBtn').addEventListener('click', () => setActiveSection('transactions'));

populateCategorySelect('expense');
dateInput.value = new Date().toISOString().split('T')[0];
seedDemo();