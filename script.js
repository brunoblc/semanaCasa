// Função para salvar dados no localStorage
function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Função para carregar dados do localStorage
function loadData(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

// Função para formatar valores como moeda
function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

// Função para adicionar atividades
function addActivity(day) {
  const activityInput = document.getElementById(`activityInput${day.charAt(0).toUpperCase() + day.slice(1)}`);
  const hoursInput = document.getElementById(`hoursInput${day.charAt(0).toUpperCase() + day.slice(1)}`);
  const activityText = activityInput.value.trim();
  const hours = parseFloat(hoursInput.value) || 0;

  if (activityText !== '' && hours > 0) {
    const list = document.getElementById(day);
    const li = document.createElement('li');
    li.textContent = `${activityText} (${hours} horas)`;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.addEventListener('change', function () {
      li.classList.toggle('completed', checkbox.checked);
      updateTotalHours(day);
    });

    li.appendChild(checkbox);
    list.appendChild(li);

    activityInput.value = '';
    hoursInput.value = '';

    // Salvar dados no localStorage após adicionar atividade
    saveData(day, Array.from(list.children).map(li => li.textContent));

    // Atualizar total de horas após adicionar atividade para o dia correto
    updateTotalHours(day);
  }
}


// Função para adicionar despesas
function addExpense() {
  const descriptionInput = document.getElementById('expenseDescription');
  const amountInput = document.getElementById('expenseAmount');
  const description = descriptionInput.value.trim();
  const amount = parseFloat(amountInput.value) || 0;

  if (description !== '' && amount > 0) {
    const expensesList = document.getElementById('expenses');
    const currentDate = new Date().toLocaleDateString();
    const existingItem = Array.from(expensesList.children).find(
      li => li.getAttribute('data-date') === currentDate && li.getAttribute('data-description') === description
    );

    if (existingItem) {
      // Se já existe uma despesa com a mesma descrição para o dia atual, atualiza o valor
      const existingAmount = parseFloat(existingItem.getAttribute('data-amount')) || 0;
      existingItem.textContent = `${description} - ${formatCurrency(existingAmount + amount)}`;
      existingItem.setAttribute('data-amount', existingAmount + amount);
    } else {
      // Caso contrário, cria um novo item
      const li = document.createElement('li');
      li.textContent = `${description} - ${formatCurrency(amount)}`;
      li.setAttribute('data-description', description);
      li.setAttribute('data-amount', amount);
      li.setAttribute('data-date', currentDate);
      expensesList.appendChild(li);
    }

    descriptionInput.value = '';
    amountInput.value = '';

    // Salvar dados no localStorage após adicionar despesa
    saveData('expenses', Array.from(expensesList.children).map(li => ({
      description: li.getAttribute('data-description'),
      amount: li.getAttribute('data-amount'),
      date: li.getAttribute('data-date')
    })));

    // Atualizar total de despesas após adicionar despesa
    updateTotalExpenses();
  }
}

// Função para atualizar o total de horas
function updateTotalHours(day) {
  const list = document.getElementById(day);
  const totalHoursElement = document.getElementById(`totalHours${day.charAt(0).toUpperCase() + day.slice(1)}`);

  const totalHours = Array.from(list.children)
    .filter(li => li.classList.contains('completed'))
    .reduce((sum, li) => {
      const hours = parseFloat(li.textContent.match(/\((\d+(\.\d+)?) horas\)/)[1]) || 0;
      return sum + hours;
    }, 0);

  totalHoursElement.textContent = totalHours.toFixed(2);

  // Salvar o total no localStorage
  saveData(`totalHours${day}`, totalHours);
}

// Função para atualizar o total de despesas
function updateTotalExpenses() {
  const expensesList = document.getElementById('expenses');
  const totalExpensesElement = document.getElementById('totalExpenses');

  const totalExpenses = Array.from(expensesList.children)
    .reduce((sum, li) => {
      const amount = parseFloat(li.getAttribute('data-amount')) || 0;
      return sum + amount;
    }, 0);

  totalExpensesElement.textContent = formatCurrency(totalExpenses);

  // Salvar o total no localStorage
  saveData('totalExpenses', totalExpenses);
}

// Função para carregar dados do localStorage quando a página é carregada
function loadSavedData() {
  // Carregar atividades para cada dia da semana
  ['monday', 'tuesday' /* adicione os outros dias aqui */].forEach(day => {
    const savedData = loadData(day);
    if (savedData) {
      const list = document.getElementById(day);
      list.innerHTML = ''; // Limpar a lista antes de adicionar itens salvos
      savedData.forEach(activityText => {
        const li = document.createElement('li');
        li.textContent = activityText;
        list.appendChild(li);
      });
      updateTotalHours(day);
    }
  });

  // Carregar despesas
  const savedExpenses = loadData('expenses');
  if (savedExpenses) {
    const expensesList = document.getElementById('expenses');
    expensesList.innerHTML = ''; // Limpar a lista antes de adicionar itens salvos
    savedExpenses.forEach(expense => {
      const li = document.createElement('li');
      li.textContent = `${expense.description} - ${formatCurrency(parseFloat(expense.amount))}`;
      li.setAttribute('data-description', expense.description);
      li.setAttribute('data-amount', expense.amount);
      li.setAttribute('data-date', expense.date);
      expensesList.appendChild(li);
    });
    updateTotalExpenses();
  }
}

// Chamar a função para carregar dados quando a página é carregada
loadSavedData();

// Função para reiniciar as atividades de um dia específico
function resetDay(day) {
  const list = document.getElementById(day);
  list.innerHTML = ''; // Limpar a lista de atividades

  // Limpar o total de horas para o dia
  const totalHoursElement = document.getElementById(`totalHours${day.charAt(0).toUpperCase() + day.slice(1)}`);
  totalHoursElement.textContent = '0.00';

  // Limpar os dados salvos no localStorage para o dia
  saveData(day, []);
  saveData(`totalHours${day}`, 0);
}

// Função para reiniciar as despesas
function resetExpenses() {
  const expensesList = document.getElementById('expenses');
  expensesList.innerHTML = ''; // Limpar a lista de despesas

  // Atualizar o total de despesas após reiniciar as despesas
  updateTotalExpenses();

  // Limpar os dados salvos no localStorage para as despesas
  saveData('expenses', []);
}

