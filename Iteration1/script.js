document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const views = {
        hero: document.getElementById('hero'),
        setup: document.getElementById('setup'),
        app: document.getElementById('app'),
        history: document.getElementById('history')
    };

    const inputs = {
        setupAmount: document.getElementById('setupAmount'),
        setupCount: document.getElementById('setupCount'),
        total: document.getElementById('totalAmount'),
        list: document.getElementById('ledgerList')
    };

    const buttons = {
        start: document.getElementById('startBtn'),
        continue: document.getElementById('continueBtn'),
        cancelSetup: document.getElementById('cancelSetupBtn'),
        reset: document.getElementById('resetBtn'),
        addPerson: document.getElementById('addPersonBtn'),
        save: document.getElementById('saveBtn'),
        historyNav: document.getElementById('historyLink'),
        backFromHistory: document.getElementById('backFromHistoryBtn'),
        clearHistory: document.getElementById('clearHistoryBtn'),
        brandLogo: document.querySelector('.brand')
    };

    // --- State ---
    let participants = [];
    let nextId = 1;
    let historyData = JSON.parse(localStorage.getItem('splitSimpleHistory')) || [];
    let currentEditingId = null;

    // --- Navigation / View Management ---

    function switchView(viewName) {
        Object.values(views).forEach(el => el.classList.add('hidden'));
        views[viewName].classList.remove('hidden');
    }

    // 1. HOME -> SETUP (With Ripple Animation)
    buttons.start.addEventListener('click', () => {
        const rect = buttons.start.getBoundingClientRect();
        const overlay = document.createElement('div');
        overlay.classList.add('transition-overlay');
        overlay.style.width = `${rect.width}px`;
        overlay.style.height = `${rect.height}px`;
        overlay.style.top = `${rect.top}px`;
        overlay.style.left = `${rect.left}px`;
        
        document.body.appendChild(overlay);
        overlay.offsetHeight; // Force reflow

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
            participants.push({
                id: i,
                name: `Person ${i}`,
                paid: false
            });
        }
        nextId = count + 1;

        inputs.total.value = amount;
        switchView('app');
        renderList();
        updateSplitAmounts();
    });

    buttons.cancelSetup.addEventListener('click', goHome);

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

    buttons.historyNav.addEventListener('click', () => {
        switchView('history');
        renderHistory();
    });

    // --- Calculator Logic ---
    buttons.addPerson.addEventListener('click', () => {
        participants.push({
            id: nextId,
            name: `Person ${participants.length + 1}`,
            paid: false
        });
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
            input.addEventListener('input', (e) => {
                participants[e.target.dataset.index].name = e.target.value;
            });
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

    // --- History Logic ---

    buttons.save.addEventListener('click', () => {
        const total = inputs.total.value;
        if (!total || parseFloat(total) <= 0) {
            alert("Please enter a valid amount before saving.");
            return;
        }

        const nowStr = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

        if (currentEditingId !== null) {
            const existingIndex = historyData.findIndex(item => item.id === currentEditingId);
            if (existingIndex !== -1) {
                historyData[existingIndex].total = total;
                historyData[existingIndex].peopleCount = participants.length;
                historyData[existingIndex].savedParticipants = JSON.parse(JSON.stringify(participants));
                historyData[existingIndex].date = nowStr;
            } else {
                createNewEntry(total, nowStr);
            }
        } else {
            createNewEntry(total, nowStr);
        }

        localStorage.setItem('splitSimpleHistory', JSON.stringify(historyData));
        
        const originalText = buttons.save.innerText;
        buttons.save.innerText = currentEditingId !== null ? "Updated!" : "Saved!";
        buttons.save.style.backgroundColor = "#4BB543"; 
        
        setTimeout(() => {
            buttons.save.innerText = originalText;
            buttons.save.style.backgroundColor = "";
            goHome(); 
        }, 1000);
    });

    function createNewEntry(total, dateStr) {
        const newEntry = {
            id: Date.now(),
            date: dateStr,
            total: total,
            peopleCount: participants.length,
            savedParticipants: JSON.parse(JSON.stringify(participants))
        };
        historyData.unshift(newEntry);
    }

    buttons.clearHistory.addEventListener('click', () => {
        if(confirm("Clear all history?")) {
            historyData = [];
            localStorage.removeItem('splitSimpleHistory');
            renderHistory();
        }
    });

    function loadSplit(item) {
        currentEditingId = item.id;
        inputs.total.value = item.total;
        
        if (item.savedParticipants) {
            participants = JSON.parse(JSON.stringify(item.savedParticipants));
        } else {
            participants = [
                { id: 1, name: 'Person 1', paid: false },
                { id: 2, name: 'Person 2', paid: false }
            ];
        }

        const maxId = participants.reduce((max, p) => (p.id > max ? p.id : max), 0);
        nextId = maxId + 1;

        switchView('app');
        renderList();
        updateSplitAmounts();
    }

    function renderHistory() {
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
            // Check if everyone has paid
            let allPaid = false;
            if (item.savedParticipants && item.savedParticipants.length > 0) {
                allPaid = item.savedParticipants.every(p => p.paid);
            }

            // Determine Styles
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
});