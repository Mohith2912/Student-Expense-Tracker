document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('goalForm');
  const goalList = document.getElementById('goalList');
  const goals = [];

  function renderGoals() {
    goalList.innerHTML = '';

    if (goals.length === 0) {
      goalList.innerHTML = `<div class="panel">No goals created yet.</div>`;
      return;
    }

    goals.forEach((goal, index) => {
      const percent = goal.target > 0 ? Math.min(100, Math.round((goal.saved / goal.target) * 100)) : 0;

      const card = document.createElement('div');
      card.className = 'goal-card';
      card.innerHTML = `
        <h4>${goal.title}</h4>
        <p>Saved ₹${goal.saved} of ₹${goal.target}</p>
        <p>Deadline: ${goal.deadline}</p>
        <div class="goal-progress"><span style="width:${percent}%"></span></div>
        <p>${percent}% completed</p>
        <button class="remove-btn" data-index="${index}">Remove</button>
      `;
      goalList.appendChild(card);
    });

    document.querySelectorAll('.remove-btn').forEach((button) => {
      button.addEventListener('click', () => {
        const index = Number(button.dataset.index);
        goals.splice(index, 1);
        renderGoals();
      });
    });
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const title = document.getElementById('goalTitle').value.trim();
    const target = Number(document.getElementById('goalTarget').value);
    const saved = Number(document.getElementById('goalSaved').value);
    const deadline = document.getElementById('goalDeadline').value;

    goals.push({ title, target, saved, deadline });
    form.reset();
    renderGoals();
  });

  renderGoals();
});