document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const views = {
        hero: document.getElementById('hero'),
        auth: document.getElementById('auth'),
        setup: document.getElementById('setup'),
        app: document.getElementById('app'),
        history: document.getElementById('history')
    };

    const inputs = {
        setupAmount: document.getElementById('setupAmount'),
        setupCount: document.getElementById('setupCount'),
        total: document.getElementById('totalAmount'),
        list: document.getElementById('ledgerList'),
        authUse: document.getElementById('authUsername'),
        authPass: document.getElementById('authPassword')
    };

    const buttons = {
        start: document.getElementById('startBtn'),
        continue: document.getElementById('continueBtn'),
        cancelSetup: document.getElementById('cancelSetupBtn'),
        reset: document.getElementById('resetBtn'),
        addPerson: document.getElementById('addPersonBtn'),
        save: document.getElementById('saveBtn'),
        historyNav: document.getElementById('historyLink'),
        accountNav: document.getElementById('accountLink'),
        backFromHistory: document.getElementById('backFromHistoryBtn'),
        clearHistory: document.getElementById('clearHistoryBtn'),
        brandLogo: document.querySelector('.brand'),
        
        // Auth Buttons
        tabLogin: document.getElementById('tabLogin'),
        tabRegister: document.getElementById('tabRegister'),
        authAction: document.getElementById('authActionBtn'),
        cancelAuth: document.getElementById('cancelAuthBtn'),
        logout: document.getElementById('logoutBtn')
    };

    const ui = {
        authError: document.getElementById('authError'),
        userIcon: document.getElementById('userIcon'),
        historyTitle: document.getElementById('historyTitle')
    };

    // --- State ---
    let participants = [];
    let nextId = 1;
    let currentEditingId = null;
    let currentUser = localStorage.getItem('splitSimpleCurrentUser') || null; // 'null' or username
    let isRegisterMode = false;

    // Initialize UI
    updateUserIcon();

    // --- Helper Functions ---

    function getHistoryKey() {
        return currentUser ? `splitSimpleHistory_${currentUser}` : `splitSimpleHistory_guest`;
    }

    function getHistoryData() {
        return JSON.parse(localStorage.getItem(getHistoryKey())) || [];
    }

    function saveHistoryData(data) {
        localStorage.setItem(getHistoryKey(), JSON.stringify(data));
    }

    function updateUserIcon() {
        if (currentUser) {
            ui.userIcon.classList.add('icon-filled'); // Make icon solid/filled
            ui.userIcon.innerHTML = `<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4" fill="currentColor"></circle>`;
        } else {
            ui.userIcon.classList.remove('icon-filled');
            ui.userIcon.innerHTML = `<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>`;
        }
    }

    // --- Navigation ---

    function switchView(viewName) {
        Object.values(views).forEach(el => el.classList.add('hidden'));
        views[viewName].classList.remove('hidden');
    }

    function goHome() {
        switchView('hero');
        inputs.total.value = '';
        inputs.setupAmount.value = '';
        inputs.setupCount.value = '';
        participants = [];
        currentEditingId = null;
    }

    buttons.reset.addEventListener('click', goHome);
    buttons.brandLogo.addEventListener('click', goHome);
    buttons.backFromHistory.addEventListener('click', goHome);
    buttons.cancelAuth.addEventListener('click', goHome);

    // --- AUTHENTICATION LOGIC ---

    buttons.accountNav.addEventListener('click', () => {
        if (currentUser) {
            // Already logged in? Show "Logout" option in Auth View
            isRegisterMode = false; // Reset to login view
            updateAuthUI();
            switchView('auth');
            // Hide form inputs, show logout
            buttons.logout.classList.remove('hidden');
            inputs.authUse.value = currentUser;
            inputs.authUse.disabled = true;
            inputs.authPass.classList.add('hidden');
            buttons.authAction.classList.add('hidden');
            ui.authError.innerText = `Logged in as ${currentUser}`;
            ui.authError.style.color = '#00b862';
        } else {
            // Not logged in? Show Login Form
            inputs.authUse.disabled = false;
            inputs.authPass.classList.remove('hidden');
            buttons.authAction.classList.remove('hidden');
            buttons.logout.classList.add('hidden');
            ui.authError.innerText = '';
            ui.authError.style.color = '';
            switchView('auth');
            inputs.authUse.focus();
        }
    });

    buttons.tabLogin.addEventListener('click', () => {
        isRegisterMode = false;
        updateAuthUI();
    });

    buttons.tabRegister.addEventListener('click', () => {
        isRegisterMode = true;
        updateAuthUI();
    });

    function updateAuthUI() {
        ui.authError.innerText = '';
        ui.authError.style.color = '';
        if (isRegisterMode) {
            buttons.tabRegister.classList.add('active');
            buttons.tabLogin.classList.remove('active');
            buttons.authAction.innerText = "Sign Up";
        } else {
            buttons.tabLogin.classList.add('active');
            buttons.tabRegister.classList.remove('active');
            buttons.authAction.innerText = "Login";
        }
    }

    buttons.logout.addEventListener('click', () => {
        currentUser = null;
        localStorage.removeItem('splitSimpleCurrentUser');
        updateUserIcon();
        alert("Logged out successfully.");
        goHome();
    });

    buttons.authAction.addEventListener('click', () => {
        const username = inputs.authUse.value.trim();
        const password = inputs.authPass.value.trim();

        if (!username || !password) {
            ui.authError.innerText = "Please fill in all fields";
            ui.authError.style.color = '';
            return;
        }

        // Get Users DB
        const users = JSON.parse(localStorage.getItem('splitSimpleUsers')) || [];

        if (isRegisterMode) {
            // SIGN UP
            if (users.find(u => u.username === username)) {
                ui.authError.innerText = "Username already exists";
                return;
            }
            users.push({ username, password });
            localStorage.setItem('splitSimpleUsers', JSON.stringify(users));
            
            // Auto Login
            currentUser = username;
            localStorage.setItem('splitSimpleCurrentUser', currentUser);
            updateUserIcon();
            alert("Account created! You are now logged in.");
            goHome();

        } else {
            // LOGIN
            const user = users.find(u => u.username === username && u.password === password);
            if (user) {
                currentUser = username;
                localStorage.setItem('splitSimpleCurrentUser', currentUser);
                updateUserIcon();
                goHome();
            } else {
                ui.authError.innerText = "Invalid credentials";
            }
        }
    });


    // --- HISTORY VIEW ---

    buttons.historyNav.addEventListener('click', () => {
        switchView('history');
        ui.historyTitle.innerText = currentUser ? `${currentUser}'s History` : `Guest History`;
        renderHistory();
    });

    function renderHistory() {
        const historyData = getHistoryData();
        const historyList = document.getElementById('historyList');
        const emptyMsg = document.getElementById('emptyHistoryMsg');
        
        historyList.innerHTML = '';

        if (historyData.length === 0) {
            emptyMsg.style.display = 'block';
            return;
        } else {
            emptyMsg.style.display = 'none';
        }

        historyData.forEach(item => {
            // Check All Paid Logic
            let allPaid = false;
            if (item.savedParticipants && item.savedParticipants.length > 0) {
                allPaid = item.savedParticipants.every(p => p.paid);
            }

            const amountClass = allPaid ? 'text-success' : 'text-danger';
            const checkmark = allPaid ? 
                `<svg class="icon-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>` 
                : '';

            const li = document.createElement('li');
            li.className = 'history-card';
            li.setAttribute('title', 'Click to edit this split');
            
            let namesStr = "";
            if (item.savedParticipants) {
                namesStr = item.savedParticipants.map(p => p.name).join(', ');
            } else if (item.names) {
                namesStr = item.names; 
            }

            li.innerHTML = `
                <div class="h-header">
                    <span class="h-date">${item.date}</span>
                    <span class="h-total ${amountClass}">
                        $${item.total} ${checkmark}
                    </span>
                </div>
                <div class="h-people">
                    <strong>${item.savedParticipants ? item.savedParticipants.length : item.peopleCount} People:</strong> ${namesStr}
                </div>
            `;
            
            li.addEventListener('click', () => {
                loadSplit(item);
            });

            historyList.appendChild(li);
        });
    }

    buttons.clearHistory.addEventListener('click', () => {
        if(confirm("Clear history for this account?")) {
            localStorage.removeItem(getHistoryKey());
            renderHistory();
        }
    });

    // --- MAIN APP LOGIC (Ripple, Setup, etc) ---

    // 1. HOME -> SETUP (Animation)
    buttons.start.addEventListener('click', () => {
        const rect = buttons.start.getBoundingClientRect();
        const overlay = document.createElement('div');
        overlay.classList.add('transition-overlay');
        overlay.style.width = `${rect.width}px`;
        overlay.style.height = `${rect.height}px`;
        overlay.style.top = `${rect.top}px`;
        overlay.style.left = `${rect.left}px`;
        
        document.body.appendChild(overlay);
        overlay.offsetHeight; 

        const maxDim = Math.max(window.innerWidth, window.innerHeight);
        const scale = (maxDim / rect.width) * 2.5; 
        
        overlay.style.transform = `scale(${scale})`;

        setTimeout(() => {
            inputs.setupAmount.value = '';
            inputs.setupCount.value = '';
            currentEditingId = null;
            switchView('setup');
            inputs.setupAmount.focus();
            overlay.style.opacity = '0';
            setTimeout(() => { overlay.remove(); }, 400);
        }, 500);
    });

    // 2. SETUP -> APP
    buttons.continue.addEventListener('click', () => {
        const amount = inputs.setupAmount.value;
        const count = parseInt(inputs.setupCount.value);

        if (!amount || !count || count < 1) {
            alert("Please enter a valid amount and number of people.");
            return;
        }

        participants = [];
        for (let i = 1; i <= count; i++) {
            participants.push({ id: i, name: `Person ${i}`, paid: false });
        }
        nextId = count + 1;
        inputs.total.value = amount;
        switchView('app');
        renderList();
        updateSplitAmounts();
    });

    buttons.cancelSetup.addEventListener('click', goHome);

    // --- CALCULATOR & SAVING ---

    buttons.addPerson.addEventListener('click', () => {
        participants.push({ id: nextId, name: `Person ${participants.length + 1}`, paid: false });
        nextId++;
        renderList();
        updateSplitAmounts();
    });

    inputs.total.addEventListener('input', updateSplitAmounts);

    function calculateSplit() {
        const total = parseFloat(inputs.total.value);
        if (!total || isNaN(total)) return "0.00";
        if (participants.length === 0) return "0.00";
        return (total / participants.length).toFixed(2);
    }

    function updateSplitAmounts() {
        const amount = calculateSplit();
        document.querySelectorAll('.split-val').forEach(el => el.innerText = `$${amount}`);
    }

    function renderList() {
        inputs.list.innerHTML = '';
        const currentSplit = calculateSplit();
        participants.forEach((person, index) => {
            const li = document.createElement('li');
            li.className = 'ledger-item';
            li.innerHTML = `
                <input type="text" class="name-input" value="${person.name}" data-index="${index}" placeholder="Name">
                <div class="row-right">
                    <span class="split-val">$${currentSplit}</span>
                    <button class="status-btn ${person.paid ? 'paid' : ''}" data-index="${index}">
                        ${person.paid ? 'Paid' : 'Unpaid'}
                    </button>
                    <button class="remove-btn" data-index="${index}">×</button>
                </div>
            `;
            inputs.list.appendChild(li);
        });
        attachRowListeners();
    }

    function attachRowListeners() {
        document.querySelectorAll('.name-input').forEach(input => {
            input.addEventListener('input', (e) => { participants[e.target.dataset.index].name = e.target.value; });
        });
        document.querySelectorAll('.status-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.target.dataset.index;
                participants[idx].paid = !participants[idx].paid;
                if (participants[idx].paid) {
                    btn.classList.add('paid');
                    btn.innerText = 'Paid';
                } else {
                    btn.classList.remove('paid');
                    btn.innerText = 'Unpaid';
                }
            });
        });
        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.dataset.index);
                if (participants.length <= 1) return;
                participants.splice(idx, 1);
                renderList();
                updateSplitAmounts();
            });
        });
    }

    buttons.save.addEventListener('click', () => {
        const total = inputs.total.value;
        if (!total || parseFloat(total) <= 0) {
            alert("Please enter a valid amount before saving.");
            return;
        }

        const nowStr = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        let historyData = getHistoryData(); // LOAD CURRENT USER'S DATA

        if (currentEditingId !== null) {
            const existingIndex = historyData.findIndex(item => item.id === currentEditingId);
            if (existingIndex !== -1) {
                historyData[existingIndex].total = total;
                historyData[existingIndex].peopleCount = participants.length;
                historyData[existingIndex].savedParticipants = JSON.parse(JSON.stringify(participants));
                historyData[existingIndex].date = nowStr;
            } else {
                // ID not found in this user's history? Create new.
                historyData.unshift(createEntry(total, nowStr));
            }
        } else {
            historyData.unshift(createEntry(total, nowStr));
        }

        saveHistoryData(historyData); // SAVE BACK TO CURRENT USER
        
        const originalText = buttons.save.innerText;
        buttons.save.innerText = currentEditingId !== null ? "Updated!" : "Saved!";
        buttons.save.style.backgroundColor = "#4BB543"; 
        
        setTimeout(() => {
            buttons.save.innerText = originalText;
            buttons.save.style.backgroundColor = "";
            goHome(); 
        }, 1000);
    });

    function createEntry(total, dateStr) {
        return {
            id: Date.now(),
            date: dateStr,
            total: total,
            peopleCount: participants.length,
            savedParticipants: JSON.parse(JSON.stringify(participants))
        };
    }

    function loadSplit(item) {
        currentEditingId = item.id;
        inputs.total.value = item.total;
        
        if (item.savedParticipants) {
            participants = JSON.parse(JSON.stringify(item.savedParticipants));
        } else {
            participants = [{ id: 1, name: 'Person 1', paid: false }, { id: 2, name: 'Person 2', paid: false }];
        }

        const maxId = participants.reduce((max, p) => (p.id > max ? p.id : max), 0);
        nextId = maxId + 1;

        switchView('app');
        renderList();
        updateSplitAmounts();
    }
});