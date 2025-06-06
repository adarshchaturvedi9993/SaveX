// DOM Elements
const savingAmount = document.getElementById('savingAmount');
const savingNote = document.getElementById('savingNote');
const savingMethod = document.getElementById('savingMethod');
const totalAmountEl = document.getElementById('totalAmount');
const recentActivityEl = document.getElementById('recentActivity');
const darkModeToggle = document.getElementById('darkModeToggle');

// App State
let savings = JSON.parse(localStorage.getItem('savings')) || [];
let methods = JSON.parse(localStorage.getItem('methods')) || ['Gullak', 'Bank', 'Cash'];
let currentTheme = localStorage.getItem('selectedTheme') || 'default';
let currentFont = localStorage.getItem('selectedFont') || 'poppins';
let darkMode = localStorage.getItem('darkMode') === 'true';

// Initialize the app
function init() {
  loadSavings();
  loadMethods();
  loadTheme();
  loadFont();
  setupDarkMode();
  setupEventListeners();
}

// Load savings data
function loadSavings() {
  if (savings.length === 0) return;
  
  // Calculate and display total
  const total = savings.reduce((sum, saving) => sum + saving.amount, 0);
  totalAmountEl.textContent = total.toLocaleString();
  
  // Update recent activity
  updateRecentActivity(savings.slice(0, 5));
}

// Load methods into select inputs
function loadMethods() {
  const methodSelects = document.querySelectorAll('select[id$="Method"]');
  methodSelects.forEach(select => {
    // Save current value
    const currentValue = select.value;
    // Clear options
    select.innerHTML = '<option value="">Select Method</option>';
    // Add methods
    methods.forEach(method => {
      const option = document.createElement('option');
      option.value = method;
      option.textContent = method;
      select.appendChild(option);
    });
    // Restore current value if still valid
    if (methods.includes(currentValue)) {
      select.value = currentValue;
    }
  });
  
  // Update method list in settings
  updateMethodList();
}

// Update recent activity display
function updateRecentActivity(activities) {
  if (activities.length === 0) {
    recentActivityEl.innerHTML = `
      <div class="empty-activity">
        <i class="fas fa-inbox"></i>
        <p>No recent activity</p>
      </div>
    `;
    return;
  }

  recentActivityEl.innerHTML = activities.map(activity => `
    <div class="activity-item">
      <div class="activity-icon">
        <i class="fas fa-${getMethodIcon(activity.method)}"></i>
      </div>
      <div class="activity-details">
        <div class="activity-amount">₹${activity.amount.toLocaleString()}</div>
        <div class="activity-method ${activity.method.toLowerCase()}">
          <i class="fas fa-${getMethodIcon(activity.method)}"></i>
          ${activity.method}
        </div>
        ${activity.note ? `<div class="activity-note">${activity.note}</div>` : ''}
      </div>
      <div class="activity-date">
        ${formatDate(activity.date)}
      </div>
    </div>
  `).join('');
}

// Helper: Get method icon
function getMethodIcon(method) {
  const icons = {
    'Gullak': 'piggy-bank',
    'Bank': 'university',
    'Cash': 'money-bill-wave'
  };
  return icons[method] || 'wallet';
}

// Helper: Format date with seconds
function formatDate(date) {
  const d = new Date(date);
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }) + ' • ' + d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short'
  });
}

// Add new saving
function addSaving() {
  const amount = parseFloat(savingAmount.value);
  const note = savingNote.value.trim();
  const method = savingMethod.value;
  
  if (!amount || amount <= 0) {
    showAlert('Error', 'Please enter a valid amount', 'error');
    return;
  }
  
  if (!method) {
    showAlert('Error', 'Please select a saving method', 'error');
    return;
  }
  
  const newSaving = {
    id: Date.now(),
    amount,
    note,
    method,
    date: new Date().toISOString()
  };
  
  savings.unshift(newSaving);
  saveSavings();
  
  // Update UI
  const total = savings.reduce((sum, saving) => sum + saving.amount, 0);
  totalAmountEl.textContent = total.toLocaleString();
  updateRecentActivity(savings.slice(0, 5));
  
  // Reset form
  savingAmount.value = '';
  savingNote.value = '';
  savingMethod.value = '';
  
  showAlert('Success', 'Saving added successfully', 'success');
}

// Save savings to localStorage
function saveSavings() {
  localStorage.setItem('savings', JSON.stringify(savings));
}

// Show alert message
function showAlert(title, message, type) {
  const alertContainer = document.getElementById('alertContainer');
  const alertEl = document.createElement('div');
  alertEl.className = `alert alert-${type}`;
  alertEl.innerHTML = `
    <div class="alert-icon">
      <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i>
    </div>
    <div class="alert-content">
      <div class="alert-title">${title}</div>
      <div class="alert-message">${message}</div>
    </div>
    <button class="alert-close" onclick="this.parentElement.remove()">
      <i class="fas fa-times"></i>
    </button>
    <div class="alert-progress">
      <div class="alert-progress-bar"></div>
    </div>
  `;
  
  alertContainer.appendChild(alertEl);
  
  // Remove alert after 5 seconds
  setTimeout(() => {
    alertEl.classList.add('slide-out');
    setTimeout(() => alertEl.remove(), 400);
  }, 5000);
}

// Theme functions
function showThemeModal() {
  document.getElementById('themeModal').classList.add('active');
}

function selectTheme(theme) {
  // Remove all theme classes
  document.body.classList.remove(
    'theme-default',
    'theme-green',
    'theme-purple',
    'theme-orange',
    'theme-pink',
    'theme-teal'
  );
  
  // Add selected theme class
  if (theme !== 'default') {
    document.body.classList.add(`theme-${theme}`);
  }
  
  // Update selected state in UI
  document.querySelectorAll('.theme-option').forEach(option => {
    option.classList.remove('selected');
  });
  document.querySelector(`.theme-option[data-theme="${theme}"]`).classList.add('selected');
  
  // Save to localStorage
  localStorage.setItem('selectedTheme', theme);
  currentTheme = theme;
  
  // Update CSS variables for the theme
  updateThemeVariables(theme);
}

function updateThemeVariables(theme) {
  const root = document.documentElement;
  
  switch(theme) {
    case 'green':
      root.style.setProperty('--primary', '#2ecc71');
      root.style.setProperty('--secondary', '#27ae60');
      break;
    case 'purple':
      root.style.setProperty('--primary', '#9b59b6');
      root.style.setProperty('--secondary', '#8e44ad');
      break;
    case 'orange':
      root.style.setProperty('--primary', '#e67e22');
      root.style.setProperty('--secondary', '#d35400');
      break;
    case 'pink':
      root.style.setProperty('--primary', '#e84393');
      root.style.setProperty('--secondary', '#fd79a8');
      break;
    case 'teal':
      root.style.setProperty('--primary', '#00cec9');
      root.style.setProperty('--secondary', '#0984e3');
      break;
    default: // default theme
      root.style.setProperty('--primary', '#4361ee');
      root.style.setProperty('--secondary', '#3a0ca3');
  }
}

function loadTheme() {
  const savedTheme = localStorage.getItem('selectedTheme') || 'default';
  selectTheme(savedTheme);
}

// Font functions
function showFontModal() {
  document.getElementById('fontModal').classList.add('active');
}

function selectFont(font) {
  // Remove all font classes
  document.body.classList.remove(
    'font-poppins',
    'font-montserrat',
    'font-roboto',
    'font-opensans',
    'font-sohne'
  );
  
  // Add selected font class
  document.body.classList.add(`font-${font}`);
  
  // Update selected state in UI
  document.querySelectorAll('.font-option').forEach(option => {
    option.classList.remove('selected');
  });
  document.querySelector(`.font-option[data-font="${font}"]`).classList.add('selected');
  
  // Save to localStorage
  localStorage.setItem('selectedFont', font);
  currentFont = font;
}

function loadFont() {
  const savedFont = localStorage.getItem('selectedFont') || 'poppins';
  selectFont(savedFont);
}

// Dark mode functions
function setupDarkMode() {
  darkModeToggle.checked = darkMode;
  toggleDarkMode(darkMode);
}

function toggleDarkMode(enable) {
  if (enable) {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
  darkMode = enable;
  localStorage.setItem('darkMode', enable);
}

// Method management
function updateMethodList() {
  const methodListEl = document.getElementById('methodList');
  methodListEl.innerHTML = '';
  
  methods.forEach(method => {
    const methodEl = document.createElement('div');
    methodEl.className = 'method-tag';
    methodEl.innerHTML = `
      <span>${method}</span>
      <div class="method-actions">
        <button class="method-action-btn" onclick="editMethod('${method}')">
          <i class="fas fa-edit"></i>
        </button>
        <button class="method-action-btn" onclick="deleteMethod('${method}')">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
    methodListEl.appendChild(methodEl);
  });
}

function addNewMethod() {
  const methodInput = document.getElementById('newMethodInput');
  const newMethod = methodInput.value.trim();
  
  if (!newMethod) {
    showAlert('Error', 'Please enter a method name', 'error');
    return;
  }
  
  if (methods.includes(newMethod)) {
    showAlert('Error', 'Method already exists', 'error');
    return;
  }
  
  methods.push(newMethod);
  saveMethods();
  methodInput.value = '';
  showAlert('Success', 'Method added successfully', 'success');
}

function editMethod(oldMethod) {
  const newMethod = prompt('Edit method name:', oldMethod);
  if (!newMethod || newMethod.trim() === '') return;
  
  const index = methods.indexOf(oldMethod);
  if (index !== -1) {
    methods[index] = newMethod.trim();
    saveMethods();
    
    // Update any savings with this method
    savings.forEach(saving => {
      if (saving.method === oldMethod) {
        saving.method = newMethod.trim();
      }
    });
    saveSavings();
    
    showAlert('Success', 'Method updated successfully', 'success');
  }
}

function deleteMethod(method) {
  if (!confirm(`Are you sure you want to delete the "${method}" method?`)) return;
  
  const index = methods.indexOf(method);
  if (index !== -1) {
    methods.splice(index, 1);
    saveMethods();
    showAlert('Success', 'Method deleted successfully', 'success');
  }
}

function saveMethods() {
  localStorage.setItem('methods', JSON.stringify(methods));
  loadMethods();
}

// Modal functions
function showModal(modalId) {
  document.getElementById(modalId).classList.add('active');
}

function hideModal() {
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.classList.remove('active');
  });
}

// Section navigation
function showSection(section) {
  document.querySelectorAll('.bottom-nav .nav-item').forEach(item => {
    item.classList.remove('active');
  });
  document.querySelector(`.nav-item[onclick="showSection('${section}')"]`).classList.add('active');

  document.getElementById('homeSection').classList.add('hidden');
  document.getElementById('historySection').classList.add('hidden');
  document.getElementById('settingsSection').classList.add('hidden');
  document.getElementById('gamesSection').classList.add('hidden');
  
  if (section === 'home') {
    document.getElementById('homeSection').classList.remove('hidden');
  } else if (section === 'history') {
    document.getElementById('historySection').classList.remove('hidden');
    loadHistory();
  } else if (section === 'settings') {
    document.getElementById('settingsSection').classList.remove('hidden');
  } else if (section === 'games') {
    document.getElementById('gamesSection').classList.remove('hidden');
    loadGames();
  }
}

// History functions
function loadHistory() {
  const historyTable = document.getElementById('historyTable');
  const methodTotals = document.getElementById('methodTotals');
  
  if (savings.length === 0) {
    historyTable.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 20px;">
          <div class="empty-activity">
            <i class="fas fa-inbox"></i>
            <p>No history found</p>
          </div>
        </td>
      </tr>
    `;
    methodTotals.innerHTML = '';
    return;
  }

  // Calculate method totals
  const totals = {};
  methods.forEach(method => {
    totals[method] = savings
      .filter(s => s.method === method)
      .reduce((sum, s) => sum + s.amount, 0);
  });

  // Display method totals
  methodTotals.innerHTML = methods.map(method => `
    <div class="method-total ${method.toLowerCase()}">
      <i class="fas fa-${getMethodIcon(method)}"></i>
      <div>
        <div>${method}</div>
        <div class="text-muted">₹${totals[method].toLocaleString()}</div>
      </div>
    </div>
  `).join('');

  // Display history table
  historyTable.innerHTML = savings.map(saving => `
    <tr>
      <td>₹${saving.amount.toLocaleString()}</td>
      <td>${formatDate(saving.date)}</td>
      <td>
        <div class="method-badge ${saving.method.toLowerCase()}-badge">
          <i class="fas fa-${getMethodIcon(saving.method)}"></i>
          ${saving.method}
        </div>
      </td>
      <td>${saving.note || '-'}</td>
      <td>
        <div class="action-buttons">
          <button class="action-btn edit-btn" onclick="editSaving(${saving.id})">
            <i class="fas fa-edit"></i>
          </button>
          <button class="action-btn delete-btn" onclick="deleteSaving(${saving.id})">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function sortHistory() {
  const method = document.getElementById('sortMethod').value;
  const month = document.getElementById('sortMonth').value;

  let filteredSavings = [...savings];

  if (method) {
    filteredSavings = filteredSavings.filter(s => s.method === method);
  }

  if (month) {
    filteredSavings = filteredSavings.filter(s => {
      const date = new Date(s.date);
      return date.getMonth() === parseInt(month);
    });
  }

  // Update the table with filtered results
  const historyTable = document.getElementById('historyTable');
  historyTable.innerHTML = filteredSavings.map(saving => `
    <tr>
      <td>₹${saving.amount.toLocaleString()}</td>
      <td>${formatDate(saving.date)}</td>
      <td>
        <div class="method-badge ${saving.method.toLowerCase()}-badge">
          <i class="fas fa-${getMethodIcon(saving.method)}"></i>
          ${saving.method}
        </div>
      </td>
      <td>${saving.note || '-'}</td>
      <td>
        <div class="action-buttons">
          <button class="action-btn edit-btn" onclick="editSaving(${saving.id})">
            <i class="fas fa-edit"></i>
          </button>
          <button class="action-btn delete-btn" onclick="deleteSaving(${saving.id})">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function editSaving(id) {
  const saving = savings.find(s => s.id === id);
  if (!saving) return;

  document.getElementById('editMethodName').value = saving.method;
  document.getElementById('methodModalTitle').textContent = 'Edit Saving';
  
  // Create form elements dynamically
  const modalBody = document.querySelector('#methodEditModal .modal-body');
  modalBody.innerHTML = `
    <div class="form-group">
      <label class="form-label">Amount</label>
      <input type="number" id="editAmount" value="${saving.amount}">
    </div>
    <div class="form-group">
      <label class="form-label">Note</label>
      <textarea id="editNote">${saving.note || ''}</textarea>
    </div>
    <div class="form-group">
      <label class="form-label">Method</label>
      <select id="editMethod">
        ${methods.map(m => `<option value="${m}" ${m === saving.method ? 'selected' : ''}>${m}</option>`).join('')}
      </select>
    </div>
  `;

  document.getElementById('saveMethodBtn').onclick = function() {
    const amount = parseFloat(document.getElementById('editAmount').value);
    const note = document.getElementById('editNote').value.trim();
    const method = document.getElementById('editMethod').value;

    if (!amount || amount <= 0) {
      showAlert('Error', 'Please enter a valid amount', 'error');
      return;
    }

    saving.amount = amount;
    saving.note = note;
    saving.method = method;
    saveSavings();
    loadHistory();
    hideModal();
    showAlert('Success', 'Saving updated successfully', 'success');
  };

  showModal('methodEditModal');
}

function deleteSaving(id) {
  showModal('confirmModal');
  document.getElementById('modalTitle').textContent = 'Confirm Delete';
  document.getElementById('modalBody').textContent = 'Are you sure you want to delete this saving?';
  document.getElementById('confirmActionBtn').onclick = function() {
    savings = savings.filter(s => s.id !== id);
    saveSavings();
    loadHistory();
    hideModal();
    showAlert('Success', 'Saving deleted successfully', 'success');
  };
}

// Games section functions
function loadGames() {
  const gamesSection = document.getElementById('gamesSection');
  gamesSection.innerHTML = `
    <div class="header">
      <div class="header-icon"><i class="fas fa-gamepad"></i></div>
      Mini Games
    </div>
    
    <div class="card animate-fadeIn">
      <div class="card-title"><i class="fas fa-coins"></i> Coin Flip Game</div>
      <p style="margin-bottom: 16px;">Flip a coin and win virtual coins!</p>
      <button onclick="playCoinFlip()"><i class="fas fa-coins"></i> Play Coin Flip</button>
    </div>
    
    <div class="card animate-fadeIn">
      <div class="card-title"><i class="fas fa-dice"></i> Dice Roll Game</div>
      <p style="margin-bottom: 16px;">Roll a dice and test your luck!</p>
      <button onclick="playDiceRoll()"><i class="fas fa-dice"></i> Play Dice Roll</button>
    </div>
    
    <div id="gameResult" style="margin-top: 20px;"></div>
  `;
}

function playCoinFlip() {
  const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
  const win = Math.random() < 0.5;
  const amount = Math.floor(Math.random() * 50) + 10;
  
  const gameResult = document.getElementById('gameResult');
  gameResult.innerHTML = `
    <div class="card ${win ? 'alert-success' : 'alert-error'}">
      <div class="card-title">
        <i class="fas fa-${win ? 'check-circle' : 'times-circle'}"></i>
        ${win ? 'You Won!' : 'You Lost!'}
      </div>
      <p>Coin landed on: ${result}</p>
      <p>${win ? `You won ₹${amount}!` : 'Better luck next time!'}</p>
    </div>
  `;
  
  if (win) {
    // Add to savings if you want
    // const newSaving = {
    //   id: Date.now(),
    //   amount,
    //   note: 'Won from Coin Flip game',
    //   method: 'Gullak',
    //   date: new Date().toISOString()
    // };
    // savings.unshift(newSaving);
    // saveSavings();
  }
}

function playDiceRoll() {
  const roll = Math.floor(Math.random() * 6) + 1;
  const win = roll >= 4;
  const amount = Math.floor(Math.random() * 100) + 20;
  
  const gameResult = document.getElementById('gameResult');
  gameResult.innerHTML = `
    <div class="card ${win ? 'alert-success' : 'alert-error'}">
      <div class="card-title">
        <i class="fas fa-${win ? 'check-circle' : 'times-circle'}"></i>
        ${win ? 'You Won!' : 'You Lost!'}
      </div>
      <p>You rolled: ${roll}</p>
      <p>${win ? `You won ₹${amount}!` : 'Better luck next time!'}</p>
    </div>
  `;
  
  if (win) {
    // Add to savings if you want
    // const newSaving = {
    //   id: Date.now(),
    //   amount,
    //   note: 'Won from Dice Roll game',
    //   method: 'Gullak',
    //   date: new Date().toISOString()
    // };
    // savings.unshift(newSaving);
    // saveSavings();
  }
}

// Data management
function exportData() {
  const data = {
    savings,
    methods,
    settings: {
      theme: currentTheme,
      font: currentFont,
      darkMode
    }
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `savings-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showAlert('Success', 'Data exported successfully', 'success');
}

function importData() {
  const input = document.getElementById('importFile');
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = event => {
      try {
        const data = JSON.parse(event.target.result);
        
        if (data.savings && data.methods) {
          savings = data.savings;
          methods = data.methods;
          
          if (data.settings) {
            currentTheme = data.settings.theme || 'default';
            currentFont = data.settings.font || 'poppins';
            darkMode = data.settings.darkMode || false;
          }
          
          saveSavings();
          saveMethods();
          localStorage.setItem('selectedTheme', currentTheme);
          localStorage.setItem('selectedFont', currentFont);
          localStorage.setItem('darkMode', darkMode);
          
          loadSavings();
          loadMethods();
          loadTheme();
          loadFont();
          setupDarkMode();
          
          showAlert('Success', 'Data imported successfully', 'success');
        } else {
          showAlert('Error', 'Invalid backup file', 'error');
        }
      } catch (err) {
        showAlert('Error', 'Failed to parse backup file', 'error');
        console.error(err);
      }
    };
    reader.readAsText(file);
    input.value = '';
  };
  input.click();
}

function confirmReset() {
  showModal('confirmModal');
  document.getElementById('modalTitle').textContent = 'Confirm Reset';
  document.getElementById('modalBody').textContent = 'Are you sure you want to reset all data? This action cannot be undone.';
  document.getElementById('confirmActionBtn').onclick = resetData;
}

function resetData() {
  savings = [];
  methods = ['Gullak', 'Bank', 'Cash'];
  currentTheme = 'default';
  currentFont = 'poppins';
  darkMode = false;
  
  localStorage.clear();
  
  saveSavings();
  saveMethods();
  localStorage.setItem('selectedTheme', currentTheme);
  localStorage.setItem('selectedFont', currentFont);
  localStorage.setItem('darkMode', darkMode);
  
  loadSavings();
  loadMethods();
  loadTheme();
  loadFont();
  setupDarkMode();
  
  hideModal();
  showAlert('Success', 'All data has been reset', 'success');
}

// Event listeners
function setupEventListeners() {
  // Dark mode toggle
  darkModeToggle.addEventListener('change', (e) => {
    toggleDarkMode(e.target.checked);
  });
  
  // Import file change
  document.getElementById('importFile').addEventListener('change', importData);
  
  // Confirm modal button
  document.getElementById('confirmActionBtn').addEventListener('click', () => {
    // Handled in individual functions
  });
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Global functions for HTML onclick handlers
window.addSaving = addSaving;
window.showSection = showSection;
window.showThemeModal = showThemeModal;
window.showFontModal = showFontModal;
window.selectTheme = selectTheme;
window.selectFont = selectFont;
window.hideModal = hideModal;
window.addNewMethod = addNewMethod;
window.editMethod = editMethod;
window.deleteMethod = deleteMethod;
window.exportData = exportData;
window.confirmReset = confirmReset;
window.resetData = resetData;
window.playCoinFlip = playCoinFlip;
window.playDiceRoll = playDiceRoll;