// DOM Elements
const savingAmount = document.getElementById('savingAmount');
const savingNote = document.getElementById('savingNote');
const totalAmountEl = document.getElementById('totalAmount');
const recentActivityEl = document.getElementById('recentActivity');
const darkModeToggle = document.getElementById('darkModeToggle');
// P/L DOM Elements
const totalEarningsEl = document.getElementById('totalEarnings');
const totalExpensesEl = document.getElementById('totalExpenses');
const netProfitLossEl = document.getElementById('netProfitLoss');
const plHistoryEl = document.getElementById('plHistory');
// **NEW** P/L Input Elements
const plAmountInput = document.getElementById('plAmount');
const plNoteInput = document.getElementById('plNote');
const plTypeToggle = document.getElementById('plTypeToggle');
const addPLBtn = document.getElementById('addPLBtn');
// **NEW** Daily Summary Elements
const dailySummaryDate = document.getElementById('dailySummaryDate');
const startOfDayEl = document.getElementById('startOfDay');
const endOfDayEl = document.getElementById('endOfDay');
const dayProfitEl = document.getElementById('dayProfit');


// App State
let savings = JSON.parse(localStorage.getItem('savings')) || [];
let methods = JSON.parse(localStorage.getItem('methods')) || ['SaveX', 'Bank', 'Cash'];
let earnings = JSON.parse(localStorage.getItem('earnings')) || [];
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let currentTheme = localStorage.getItem('selectedTheme') || 'default';
let currentFont = localStorage.getItem('selectedFont') || 'poppins';
let darkMode = localStorage.getItem('darkMode') === 'true';
let isPremium = localStorage.getItem('isPremium') === 'true'; // PREMIUM FEATURE STATE
let currentPLType = 'earning'; // **NEW** for combined P/L input

// ========= init() function for robust indicator positioning =========
function init() {
  createPremiumUI(); // Create premium-related UI elements dynamically
  loadSavings();
  loadMethods();
  loadPLData();
  loadTheme();
  loadFont();
  setupDarkMode();
  setupEventListeners();
  initializeAds();
  applyPremiumLocks(); // Apply UI locks based on premium status
  // Set initial indicator position after a short delay to ensure rendering is complete
  setTimeout(moveIndicator, 100);
}

// ========= Function to move the navigation indicator =========
function moveIndicator() {
  const navigation = document.querySelector('.navigation');
  if (!navigation) return;

  const indicator = navigation.querySelector('.indicator');
  const activeItem = navigation.querySelector('li.active');

  if (activeItem && indicator) {
    const itemWidth = activeItem.offsetWidth;
    const indicatorWidth = 70; // Fixed width from CSS
    const moveX = activeItem.offsetLeft + (itemWidth / 2) - (indicatorWidth / 2);
    indicator.style.transform = `translateX(${moveX}px)`;
  }
}

// Ad functions
function initializeAds() {
  (adsbygoogle = window.adsbygoogle || []).push({});
  document.addEventListener('sectionChanged', function() {
    setTimeout(() => { (adsbygoogle = window.adsbygoogle || []).push({}); }, 500);
  });
}

// Method selection functionality
function selectMethod(element, method) {
  document.querySelectorAll('.method-option').forEach(option => { option.classList.remove('selected'); });
  element.classList.add('selected');
  document.getElementById('savingMethod').value = method;
  element.style.animation = 'pulse 0.5s ease';
  setTimeout(() => { element.style.animation = 'pulse 2s infinite'; }, 500);
}

// Update loadMethods() to create dynamic options
function loadMethods() {
  const methodOptions = document.querySelector('.method-options');
  const defaultMethods = ['SaveX', 'Bank', 'Cash'];
  document.querySelectorAll('.method-option').forEach(option => {
    if (!defaultMethods.includes(option.dataset.value)) { option.remove(); }
  });
  methods.forEach(method => {
    if (!defaultMethods.includes(method)) {
      const methodOption = document.createElement('div');
      methodOption.className = 'method-option';
      methodOption.dataset.value = method;
      methodOption.onclick = function() { selectMethod(this, method); };
      methodOption.innerHTML = `<div class="method-icon"><i class="fas fa-wallet"></i></div><div class="method-name">${method}</div>`;
      methodOption.style.animation = 'fadeInUp 0.4s forwards';
      methodOptions.appendChild(methodOption);
    }
  });
}

// Load savings data
function loadSavings() {
  const total = savings.reduce((sum, saving) => sum + saving.amount, 0);
  totalAmountEl.textContent = total.toLocaleString();
  const sortedSavings = [...savings].sort((a,b) => new Date(b.date) - new Date(a.date));
  updateRecentActivity(sortedSavings.slice(0, 5));
}

// Update recent activity display
function updateRecentActivity(activities) {
  if (activities.length === 0) {
    recentActivityEl.innerHTML = `<div class="empty-activity"><i class="fas fa-inbox"></i><p>No recent activity</p></div>`;
    return;
  }
  recentActivityEl.innerHTML = activities.map(activity => `
    <div class="activity-item">
      <div class="activity-icon"><i class="fas fa-${getMethodIcon(activity.method)}"></i></div>
      <div class="activity-details">
        <div class="activity-amount">₹${activity.amount.toLocaleString()}</div>
        <div class="activity-method ${activity.method.toLowerCase()}">
          <i class="fas fa-${getMethodIcon(activity.method)}"></i> ${activity.method}
        </div>
        ${activity.note ? `<div class="activity-note">${activity.note}</div>` : ''}
      </div>
      <div class="activity-date">${formatDate(activity.date)}</div>
    </div>`).join('');
}

// Helper: Get method icon
function getMethodIcon(method) {
  const icons = {'SaveX': 'piggy-bank', 'Bank': 'university', 'Cash': 'money-bill-wave'};
  return icons[method] || 'wallet';
}

// Helper: Format date with seconds
function formatDate(date) {
  const d = new Date(date);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) + ' • ' + d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

// Add new saving
function addSaving() {
  const amount = parseFloat(savingAmount.value);
  const note = savingNote.value.trim();
  const method = document.getElementById('savingMethod').value;
  if (!amount || amount <= 0) { showAlert('Error', 'Please enter a valid amount', 'error'); return; }
  if (!method) {
    showAlert('Error', 'Please select a saving method', 'error');
    const methodOptions = document.querySelector('.method-options');
    methodOptions.style.animation = 'shake 0.5s';
    setTimeout(() => { methodOptions.style.animation = ''; }, 500);
    return;
  }
  const newSaving = { id: Date.now(), amount, note, method, date: new Date().toISOString() };
  savings.push(newSaving); // Use push, then sort when displaying
  saveSavings();
  loadSavings();
  loadPLData(); // **UPDATE**: Reload P/L data as savings affect daily summary
  savingAmount.value = '';
  savingNote.value = '';
  document.getElementById('savingMethod').value = '';
  document.querySelectorAll('.method-option').forEach(option => {
    option.classList.remove('selected');
    option.style.animation = '';
  });
  showAlert('Success', 'Saving added successfully', 'success');
  maybeShowInterstitial();
}

// P/L Functions
function saveEarnings() { localStorage.setItem('earnings', JSON.stringify(earnings)); }
function saveExpenses() { localStorage.setItem('expenses', JSON.stringify(expenses)); }

// **NEW**: Unified function to add P/L transactions
function addPLTransaction() {
    const amount = parseFloat(plAmountInput.value);
    const note = plNoteInput.value.trim();
    if (!amount || amount <= 0) {
        showAlert('Error', `Please enter a valid ${currentPLType} amount`, 'error');
        return;
    }

    if (currentPLType === 'earning') {
        const newEarning = { id: 'e' + Date.now(), type: 'earning', amount, note, date: new Date().toISOString() };
        earnings.push(newEarning);
        saveEarnings();
    } else {
        const newExpense = { id: 'x' + Date.now(), type: 'expense', amount, note, date: new Date().toISOString() };
        expenses.push(newExpense);
        saveExpenses();
    }
    
    loadPLData();
    plAmountInput.value = '';
    plNoteInput.value = '';
    showAlert('Success', `${currentPLType.charAt(0).toUpperCase() + currentPLType.slice(1)} added successfully`, 'success');
}

// **NEW**: Function to toggle between Earning and Expense input
function setPLType(type) {
    currentPLType = type;
    const earningBtn = plTypeToggle.querySelector('[data-type="earning"]');
    const expenseBtn = plTypeToggle.querySelector('[data-type="expense"]');
    
    if (type === 'earning') {
        earningBtn.classList.add('active');
        expenseBtn.classList.remove('active');
        addPLBtn.className = 'add-pl-btn earning';
        addPLBtn.innerHTML = '<i class="fas fa-plus"></i> Add Earning';
    } else {
        expenseBtn.classList.add('active');
        earningBtn.classList.remove('active');
        addPLBtn.className = 'add-pl-btn expense';
        addPLBtn.innerHTML = '<i class="fas fa-minus"></i> Add Expense';
    }
}


// **MODIFIED**: loadPLData now also triggers the daily summary update
function loadPLData() {
  const totalEarnings = earnings.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const netProfitLoss = totalEarnings - totalExpenses;
  totalEarningsEl.textContent = `₹${totalEarnings.toLocaleString()}`;
  totalExpensesEl.textContent = `₹${totalExpenses.toLocaleString()}`;
  netProfitLossEl.textContent = `₹${netProfitLoss.toLocaleString()}`;
  const netPLElement = netProfitLossEl.parentElement;
  netPLElement.classList.remove('profit', 'loss');
  if (netProfitLoss > 0) netPLElement.classList.add('profit');
  else if (netProfitLoss < 0) netPLElement.classList.add('loss');

  updateDailySummary(dailySummaryDate.value); // **NEW**

  const plHistory = [...earnings, ...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
  if (plHistory.length === 0) {
    plHistoryEl.innerHTML = `<div class="empty-activity"><i class="fas fa-inbox"></i><p>No P/L activity yet</p></div>`; return;
  }
  plHistoryEl.innerHTML = plHistory.map(item => `
    <div class="activity-item pl-activity-item ${item.type}">
      <div class="activity-icon"><i class="fas fa-${item.type === 'earning' ? 'arrow-up' : 'arrow-down'}"></i></div>
      <div class="activity-details">
        <div class="activity-amount">${item.type === 'expense' ? '-' : ''}₹${item.amount.toLocaleString()}</div>
        ${item.note ? `<div class="activity-note">${item.note}</div>` : ''}
      </div>
      <div class="activity-date">${formatDate(item.date)}</div>
    </div>`).join('');
}

// **NEW**: Function to calculate and display the daily financial summary
function updateDailySummary(dateString) {
    if (!dateString) return; // Don't run if date is not set yet
    const selectedDate = new Date(dateString);
    const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

    // Combine all transactions for easier calculation
    const allTransactions = [
        ...savings.map(s => ({ ...s, type: 'saving' })),
        ...earnings.map(e => ({ ...e, type: 'earning' })),
        ...expenses.map(ex => ({ ...ex, type: 'expense' }))
    ];

    // Calculate Start of Day Balance
    let startOfDayBalance = 0;
    allTransactions.forEach(tx => {
        if (new Date(tx.date) < startOfDay) {
            if (tx.type === 'saving' || tx.type === 'earning') {
                startOfDayBalance += tx.amount;
            } else if (tx.type === 'expense') {
                startOfDayBalance -= tx.amount;
            }
        }
    });

    // Calculate Profit/Loss and savings for the selected day
    let dayProfit = 0;
    let daySavings = 0;
    allTransactions.forEach(tx => {
        const txDate = new Date(tx.date);
        if (txDate >= startOfDay && txDate <= endOfDay) {
            if (tx.type === 'earning') {
                dayProfit += tx.amount;
            } else if (tx.type === 'expense') {
                dayProfit -= tx.amount;
            } else if (tx.type === 'saving') {
                daySavings += tx.amount;
            }
        }
    });
    
    const endOfDayBalance = startOfDayBalance + dayProfit + daySavings;

    // Update UI
    startOfDayEl.textContent = `₹${startOfDayBalance.toLocaleString()}`;
    endOfDayEl.textContent = `₹${endOfDayBalance.toLocaleString()}`;
    dayProfitEl.textContent = `₹${dayProfit.toLocaleString()}`;
    dayProfitEl.className = 'day-summary-value';
    if (dayProfit > 0) {
        dayProfitEl.classList.add('profit');
    } else if (dayProfit < 0) {
        dayProfitEl.classList.add('loss');
    }
}


// Interstitial ad logic
function maybeShowInterstitial() {
  const showCount = localStorage.getItem('interstitialCount') || 0;
  if (showCount >= 2) {
    console.log('Show interstitial ad here');
    localStorage.setItem('interstitialCount', 0);
  } else {
    localStorage.setItem('interstitialCount', parseInt(showCount) + 1);
  }
}

// Save savings to localStorage
function saveSavings() { localStorage.setItem('savings', JSON.stringify(savings)); }

// Show alert message
function showAlert(title, message, type) {
  const alertContainer = document.getElementById('alertContainer');
  const alertEl = document.createElement('div');
  alertEl.className = `alert alert-${type}`;
  alertEl.innerHTML = `<div class="alert-icon"><i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i></div><div class="alert-content"><div class="alert-title">${title}</div><div class="alert-message">${message}</div></div><button class="alert-close" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button><div class="alert-progress"><div class="alert-progress-bar"></div></div>`;
  alertContainer.appendChild(alertEl);
  setTimeout(() => {
    alertEl.classList.add('slide-out');
    setTimeout(() => alertEl.remove(), 400);
  }, 5000);
}

// ========= PREMIUM FEATURE SYSTEM =========
function createPremiumUI() {
    if (document.getElementById('premiumModal')) return; // Avoid re-creating

    // Create Premium Modal
    const premiumModal = document.createElement('div');
    premiumModal.id = 'premiumModal';
    premiumModal.className = 'modal-overlay';
    premiumModal.innerHTML = `
        <div class="modal premium-modal">
            <div class="modal-header">
                <h3 class="modal-title"><i class="fas fa-star" style="color: #FFD700;"></i> Go Premium</h3>
                <button class="modal-close" onclick="hideModal()">×</button>
            </div>
            <div class="modal-body">
                <p style="text-align: center; font-size: 1.1rem; margin-bottom: 25px;">Unlock all features and take full control of your finances!</p>
                <ul class="premium-features-list">
                    <li><i class="fas fa-check-circle"></i> <b>Profit & Loss Tracking:</b> Monitor your earnings vs. expenses.</li>
                    <li><i class="fas fa-check-circle"></i> <b>Advanced Filtering:</b> Sort and filter your history by date and month.</li>
                    <li><i class="fas fa-check-circle"></i> <b>Unlimited Custom Methods:</b> Create as many saving methods as you need.</li>
                    <li><i class="fas fa-check-circle"></i> <b>Data Export:</b> Securely backup your financial data.</li>
                    <li><i class="fas fa-check-circle"></i> <b>Full Customization:</b> Access all themes and fonts.</li>
                    <li><i class="fas fa-check-circle"></i> <b>Ad-Free Experience:</b> Enjoy SaveX without interruptions.</li>
                </ul>
            </div>
            <div class="modal-footer">
                <button class="premium-upgrade-btn" onclick="upgradeToPremium()"><i class="fas fa-rocket"></i> Upgrade Now</button>
            </div>
        </div>`;
    document.body.appendChild(premiumModal);

    // Create P/L Section Lock Overlay
    const plSection = document.getElementById('plSection');
    if (plSection) {
        const plLockOverlay = document.createElement('div');
        plLockOverlay.id = 'plLockOverlay';
        plLockOverlay.className = 'feature-lock-overlay hidden';
        plLockOverlay.innerHTML = `
            <div class="lock-content">
                <i class="fas fa-lock lock-icon-large"></i>
                <h2>Profit & Loss Tracking</h2>
                <p>This is a premium feature. Upgrade to monitor your earnings and expenses.</p>
                <button onclick="showPremiumModal()"><i class="fas fa-star"></i> Unlock Premium</button>
            </div>`;
        plSection.style.position = 'relative'; // Ensure overlay is positioned correctly
        plSection.prepend(plLockOverlay);
    }

    // Create Upgrade button in settings
    const settingsSection = document.getElementById('settingsSection');
    if (settingsSection) {
        const upgradeCard = document.createElement('div');
        upgradeCard.id = 'upgradePremiumCard';
        upgradeCard.className = 'card premium-cta-card';
        upgradeCard.onclick = showPremiumModal;
        upgradeCard.innerHTML = `
            <div class="card-title"><i class="fas fa-star"></i> Upgrade to SaveX Premium</div>
            <p>Unlock P/L tracking, data export, full customization, and more!</p>
        `;
        settingsSection.prepend(upgradeCard);
    }
}

function showPremiumModal() {
    showModal('premiumModal');
}

function upgradeToPremium() {
    // In a real app, this would trigger the In-App Purchase flow.
    // For this simulation, we'll just set the flag.
    isPremium = true;
    localStorage.setItem('isPremium', 'true');
    hideModal();
    showAlert('Success!', 'You are now a Premium user! All features unlocked.', 'success');
    applyPremiumLocks(); // Re-apply to unlock everything
}

// **MODIFIED**: applyPremiumLocks now also handles history filters
function applyPremiumLocks() {
    // Lock/Unlock P/L Section
    const plLockOverlay = document.getElementById('plLockOverlay');
    if (plLockOverlay) {
        plLockOverlay.classList.toggle('hidden', isPremium);
    }

    // Lock/Unlock Settings Options
    const premiumSettings = {
        'showThemeModal()': 'Change Theme',
        'showFontModal()': 'Change Font',
        'exportData()': 'Data Management'
    };

    document.querySelectorAll('#settingsSection .settings-option').forEach(option => {
        const onclickAttr = option.getAttribute('onclick');
        if (premiumSettings[onclickAttr]) {
            let lockIcon = option.querySelector('.lock-icon');
            if (!lockIcon) {
                lockIcon = document.createElement('i');
                lockIcon.className = 'fas fa-lock lock-icon';
                option.appendChild(lockIcon);
            }
            option.classList.toggle('locked', !isPremium);
            lockIcon.style.display = isPremium ? 'none' : 'inline-block';
        }
    });

    // **NEW**: Lock/Unlock History Filters
    const historyFilters = document.getElementById('historyFilterControls');
    if (historyFilters) {
        historyFilters.classList.toggle('locked', !isPremium);
        let lockIcon = historyFilters.querySelector('.lock-icon');
        if (!lockIcon) {
            lockIcon = document.createElement('i');
            lockIcon.className = 'fas fa-lock lock-icon';
            historyFilters.appendChild(lockIcon);
        }
        lockIcon.style.display = isPremium ? 'none' : 'inline-block';

        if (!isPremium) {
            historyFilters.onclick = (e) => { 
                e.stopPropagation(); // prevent select from opening
                showPremiumModal();
            };
            document.getElementById('sortMethod').disabled = true;
            document.getElementById('sortMonth').disabled = true;
        } else {
            historyFilters.onclick = null;
            document.getElementById('sortMethod').disabled = false;
            document.getElementById('sortMonth').disabled = false;
        }
    }
    
    // Hide or Show Premium CTA card in settings
    const upgradeCard = document.getElementById('upgradePremiumCard');
    if(upgradeCard) {
        upgradeCard.style.display = isPremium ? 'none' : 'block';
    }
}

// Theme functions
function showThemeModal() {
    if (!isPremium) { showPremiumModal(); return; }
    document.getElementById('themeModal').classList.add('active');
}
function selectTheme(theme) {
    const bodyClassList = document.body.classList;
    bodyClassList.forEach(className => {
        if (className.startsWith('theme-')) {
            bodyClassList.remove(className);
        }
    });
    if (theme !== 'default') {
        bodyClassList.add(`theme-${theme}`);
    }
  document.querySelectorAll('.theme-option').forEach(option => option.classList.remove('selected'));
  document.querySelector(`.theme-option[data-theme="${theme}"]`).classList.add('selected');
  localStorage.setItem('selectedTheme', theme);
  currentTheme = theme;
}
function loadTheme() { selectTheme(localStorage.getItem('selectedTheme') || 'default'); }

// Font functions
function showFontModal() {
    if (!isPremium) { showPremiumModal(); return; }
    document.getElementById('fontModal').classList.add('active');
}
function selectFont(font) {
  const bodyClassList = document.body.classList;
    bodyClassList.forEach(className => {
        if (className.startsWith('font-')) {
            bodyClassList.remove(className);
        }
    });
  bodyClassList.add(`font-${font}`);
  document.querySelectorAll('.font-option').forEach(option => option.classList.remove('selected'));
  document.querySelector(`.font-option[data-font="${font}"]`).classList.add('selected');
  localStorage.setItem('selectedFont', font);
  currentFont = font;
}
function loadFont() { selectFont(localStorage.getItem('selectedFont') || 'poppins'); }

// Dark mode functions
function setupDarkMode() {
  darkModeToggle.checked = darkMode;
  toggleDarkMode(darkMode);
}
function toggleDarkMode(enable) {
  if (enable) document.body.classList.add('dark-mode');
  else document.body.classList.remove('dark-mode');
  darkMode = enable;
  localStorage.setItem('darkMode', enable);
}

// Method management
function updateMethodList() {
  const methodListEl = document.getElementById('methodList');
  methodListEl.innerHTML = methods.map(method => `<div class="method-tag"><span>${method}</span><div class="method-actions"><button class="method-action-btn" onclick="editMethod('${method}')"><i class="fas fa-edit"></i></button><button class="method-action-btn" onclick="deleteMethod('${method}')"><i class="fas fa-trash"></i></button></div></div>`).join('');
}
function addNewMethod() {
  const customMethodsCount = methods.filter(m => !['SaveX', 'Bank', 'Cash'].includes(m)).length;
  if (!isPremium && customMethodsCount >= 2) {
      showAlert('Premium Feature', 'Free users can add up to 2 custom methods. Upgrade to add more.', 'info');
      showPremiumModal();
      return;
  }

  const methodInput = document.getElementById('newMethodInput');
  const newMethod = methodInput.value.trim();
  if (!newMethod) { showAlert('Error', 'Please enter a method name', 'error'); return; }
  if (methods.map(m => m.toLowerCase()).includes(newMethod.toLowerCase())) { showAlert('Error', 'Method already exists', 'error'); return; }
  methods.push(newMethod);
  saveMethods();
  methodInput.value = '';
  showAlert('Success', 'Method added successfully', 'success');
  updateMethodList();
}
function editMethod(oldMethod) {
  const newMethod = prompt('Edit method name:', oldMethod);
  if (!newMethod || newMethod.trim() === '' || newMethod.trim().toLowerCase() === oldMethod.toLowerCase()) return;
  const index = methods.indexOf(oldMethod);
  if (index !== -1) {
    methods[index] = newMethod.trim();
    saveMethods();
    savings.forEach(saving => { if (saving.method === oldMethod) saving.method = newMethod.trim(); });
    saveSavings();
    showAlert('Success', 'Method updated successfully', 'success');
    updateMethodList();
    loadHistory();
  }
}
function deleteMethod(method) {
  if (!confirm(`Are you sure you want to delete the "${method}" method? This cannot be undone.`)) return;
  const index = methods.indexOf(method);
  if (index !== -1) {
    methods.splice(index, 1);
    saveMethods();
    showAlert('Success', 'Method deleted successfully', 'success');
    updateMethodList();
    loadHistory();
  }
}
function saveMethods() {
  localStorage.setItem('methods', JSON.stringify(methods));
  loadMethods();
}

// Modal functions
function showModal(modalId) { document.getElementById(modalId).classList.add('active'); }
function hideModal() { document.querySelectorAll('.modal-overlay').forEach(modal => modal.classList.remove('active')); }

// Section navigation function
function showSection(section) {
  document.querySelectorAll('.navigation ul li').forEach(item => { item.classList.remove('active'); });
  
  if (section === 'pl' && !isPremium) {
      showPremiumModal();
      // Keep user on the current section or move to home
      const currentActive = document.querySelector('.navigation ul li[onclick*="showSection"] a .icon').closest('li');
      if (currentActive) currentActive.classList.add('active');
      moveIndicator();
      return;
  }
  
  const activeNavItem = document.querySelector(`.navigation ul li[data-section="${section}"]`);
  if (activeNavItem) { activeNavItem.classList.add('active'); }

  document.querySelectorAll('.container > div[id$="Section"]').forEach(s => s.classList.add('hidden'));
  const sectionToShow = document.getElementById(section + 'Section');
  if (sectionToShow) { sectionToShow.classList.remove('hidden'); }
  
  if (section === 'history') loadHistory();
  else if (section === 'pl') loadPLData();
  else if (section === 'settings') updateMethodList();
  
  moveIndicator();
  const event = new Event('sectionChanged');
  document.dispatchEvent(event);
}

// History functions
function loadHistory() {
  const historyTable = document.getElementById('historyTable');
  const methodTotals = document.getElementById('methodTotals');
  if (savings.length === 0) {
    historyTable.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 20px;"><div class="empty-activity"><i class="fas fa-inbox"></i><p>No history found</p></div></td></tr>`;
    methodTotals.innerHTML = '';
    return;
  }
  const totals = {};
  methods.forEach(method => {
    totals[method] = savings.filter(s => s.method === method).reduce((sum, s) => sum + s.amount, 0);
  });
  methodTotals.innerHTML = methods.map(method => `<div class="method-total ${method.toLowerCase()}"><i class="fas fa-${getMethodIcon(method)}"></i><div><div>${method}</div><div class="text-muted">₹${(totals[method] || 0).toLocaleString()}</div></div></div>`).join('');
  
  sortHistory(); // Use sortHistory to display the table content
}
function sortHistory() {
  const methodFilter = document.getElementById('sortMethod').value;
  const monthFilter = document.getElementById('sortMonth').value;
  let filteredSavings = [...savings];
  if (methodFilter) filteredSavings = filteredSavings.filter(s => s.method === methodFilter);
  if (monthFilter) filteredSavings = filteredSavings.filter(s => new Date(s.date).getMonth() === parseInt(monthFilter));
  const sortedSavings = filteredSavings.sort((a,b) => new Date(b.date) - new Date(a.date));
  const historyTable = document.getElementById('historyTable');
  if (sortedSavings.length === 0) {
    historyTable.innerHTML = `<tr><td colspan="5" style="text-align:center;">No records found for this filter.</td></tr>`; return;
  }
  historyTable.innerHTML = sortedSavings.map(saving => `<tr><td>₹${saving.amount.toLocaleString()}</td><td>${formatDate(saving.date)}</td><td><div class="method-badge ${saving.method.toLowerCase().replace(/\s+/g, '-')}-badge"><i class="fas fa-${getMethodIcon(saving.method)}"></i> ${saving.method}</div></td><td>${saving.note || '-'}</td><td><div class="action-buttons"><button class="action-btn edit-btn" onclick="editSaving(${saving.id})"><i class="fas fa-edit"></i></button><button class="action-btn delete-btn" onclick="deleteSaving(${saving.id})"><i class="fas fa-trash"></i></button></div></td></tr>`).join('');
}
function editSaving(id) {
  const saving = savings.find(s => s.id === id);
  if (!saving) return;
  document.getElementById('methodModalTitle').textContent = 'Edit Saving';
  const modalBody = document.querySelector('#methodEditModal .modal-body');
  modalBody.innerHTML = `<div class="form-group"><label class="form-label">Amount</label><input type="number" id="editAmount" value="${saving.amount}"></div><div class="form-group"><label class="form-label">Note</label><textarea id="editNote">${saving.note || ''}</textarea></div><div class="form-group"><label class="form-label">Method</label><select id="editMethod">${methods.map(m => `<option value="${m}" ${m === saving.method ? 'selected' : ''}>${m}</option>`).join('')}</select></div>`;
  document.getElementById('saveMethodBtn').onclick = function() {
    const amount = parseFloat(document.getElementById('editAmount').value);
    const note = document.getElementById('editNote').value.trim();
    const method = document.getElementById('editMethod').value;
    if (!amount || amount <= 0) { showAlert('Error', 'Please enter a valid amount', 'error'); return; }
    saving.amount = amount; saving.note = note; saving.method = method;
    saveSavings(); loadSavings(); loadHistory(); hideModal();
    showAlert('Success', 'Saving updated successfully', 'success');
  };
  showModal('methodEditModal');
}
function deleteSaving(id) {
  showModal('confirmModal');
  document.getElementById('modalTitle').textContent = 'Confirm Delete';
  document.getElementById('modalBody').textContent = 'Are you sure you want to delete this saving? This action will also affect your P/L summary.';
  document.getElementById('confirmActionBtn').onclick = function() {
    savings = savings.filter(s => s.id !== id);
    saveSavings(); loadSavings(); loadHistory(); loadPLData(); hideModal();
    showAlert('Success', 'Saving deleted successfully', 'success');
  };
}

// Data management
function exportData() {
  if (!isPremium) { showPremiumModal(); return; }
  const data = { savings, methods, earnings, expenses, settings: { theme: currentTheme, font: currentFont, darkMode, isPremium } };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `savex-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  a.remove();
  showAlert('Success', 'Data exported successfully', 'success');
}
function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (data.savings && data.methods) {
        savings = data.savings || []; methods = data.methods || ['SaveX', 'Bank', 'Cash']; earnings = data.earnings || []; expenses = data.expenses || [];
        if (data.settings) {
          currentTheme = data.settings.theme || 'default';
          currentFont = data.settings.font || 'poppins';
          darkMode = data.settings.darkMode || false;
            if (typeof data.settings.isPremium !== 'undefined') {
                isPremium = data.settings.isPremium;
                localStorage.setItem('isPremium', isPremium);
            }
        }
        saveSavings(); saveMethods(); saveEarnings(); saveExpenses();
        localStorage.setItem('selectedTheme', currentTheme);
        localStorage.setItem('selectedFont', currentFont);
        localStorage.setItem('darkMode', darkMode);
        init();
        showAlert('Success', 'Data imported successfully', 'success');
      } else { showAlert('Error', 'Invalid backup file', 'error'); }
    } catch (err) { showAlert('Error', 'Failed to parse backup file', 'error'); console.error(err); } 
    finally { event.target.value = ''; }
  };
  reader.readAsText(file);
}
function confirmReset() {
  showModal('confirmModal');
  document.getElementById('modalTitle').textContent = 'Confirm Reset';
  document.getElementById('modalBody').textContent = 'Are you sure you want to reset all data, including Premium status? This action cannot be undone.';
  document.getElementById('confirmActionBtn').onclick = resetData;
}
function resetData() {
  savings = []; methods = ['SaveX', 'Bank', 'Cash']; earnings = []; expenses = [];
  currentTheme = 'default'; currentFont = 'poppins'; darkMode = false; isPremium = false;
  localStorage.clear();
  saveSavings(); saveMethods(); saveEarnings(); saveExpenses();
  localStorage.setItem('selectedTheme', currentTheme);
  localStorage.setItem('selectedFont', currentFont);
  localStorage.setItem('darkMode', darkMode);
  init();
  hideModal();
  showAlert('Success', 'All data has been reset', 'success');
}

// Event listeners function
function setupEventListeners() {
  darkModeToggle.addEventListener('change', (e) => toggleDarkMode(e.target.checked));
  document.getElementById('importFile').addEventListener('change', importData);
  window.addEventListener('resize', moveIndicator);
  
  // **NEW** Event Listeners for P/L and Daily Summary
  plTypeToggle.addEventListener('click', (e) => {
    const button = e.target.closest('button');
    if (button) {
      setPLType(button.dataset.type);
    }
  });
  dailySummaryDate.addEventListener('change', (e) => updateDailySummary(e.target.value));

  // Set default date for daily summary to today
  dailySummaryDate.value = new Date().toISOString().split('T')[0];
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Global functions for HTML onclick handlers
window.addSaving = addSaving; window.selectMethod = selectMethod; window.showSection = showSection;
window.addPLTransaction = addPLTransaction;
window.showThemeModal = showThemeModal;
window.showFontModal = showFontModal; window.selectTheme = selectTheme; window.selectFont = selectFont;
window.hideModal = hideModal; window.addNewMethod = addNewMethod; window.editMethod = editMethod;
window.deleteMethod = deleteMethod; window.exportData = exportData; window.confirmReset = confirmReset;
window.sortHistory = sortHistory; window.editSaving = editSaving; window.deleteSaving = deleteSaving;
window.showPremiumModal = showPremiumModal; window.upgradeToPremium = upgradeToPremium;