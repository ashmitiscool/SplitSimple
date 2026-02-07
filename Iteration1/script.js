document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const views = {
        hero: document.getElementById('hero'),
        auth: document.getElementById('auth'),
        setup: document.getElementById('setup'),
        app: document.getElementById('app'),
        history: document.getElementById('history'),
        groups: document.getElementById('groups')
    };

    const inputs = {
        setupAmount: document.getElementById('setupAmount'),
        setupCount: document.getElementById('setupCount'),
        total: document.getElementById('totalAmount'),
        list: document.getElementById('ledgerList'),
        authUse: document.getElementById('authUsername'),
        authPass: document.getElementById('authPassword'),
        // Group Inputs
        newGroupName: document.getElementById('newGroupName'),
        newGroupMembers: document.getElementById('newGroupMembersList')
    };

    const buttons = {
        start: document.getElementById('startBtn'),
        continue: document.getElementById('continueBtn'),
        cancelSetup: document.getElementById('cancelSetupBtn'),
        reset: document.getElementById('resetBtn'),
        addPerson: document.getElementById('addPersonBtn'),
        save: document.getElementById('saveBtn'),
        
        // Navigation
        historyNav: document.getElementById('historyLink'),
        accountNav: document.getElementById('accountLink'),
        groupsNav: document.getElementById('groupsLink'),
        backFromHistory: document.getElementById('backFromHistoryBtn'),
        clearHistory: document.getElementById('clearHistoryBtn'),
        brandLogo: document.querySelector('.brand'),
        
        // Auth
        tabLogin: document.getElementById('tabLogin'),
        tabRegister: document.getElementById('tabRegister'),
        authAction: document.getElementById('authActionBtn'),
        cancelAuth: document.getElementById('cancelAuthBtn'),
        logout: document.getElementById('logoutBtn'),

        // Groups
        goToCreateGroup: document.getElementById('goToCreateGroupBtn'),
        saveNewGroup: document.getElementById('saveNewGroupBtn'),
        cancelCreateGroup: document.getElementById('cancelCreateGroupBtn'),
        addNewMemberInput: document.getElementById('addNewMemberInputBtn'),
        backFromGroups: document.getElementById('backFromGroupsBtn'),
        
        // Setup Group Loading
        loadGroup: document.getElementById('loadGroupBtn'),
        cancelGroupLoad: document.getElementById('cancelGroupLoad')
    };

    const ui = {
        authError: document.getElementById('authError'),
        userIcon: document.getElementById('userIcon'),
        historyTitle: document.getElementById('historyTitle'),
        // Groups UI
        groupsListView: document.getElementById('groupsListView'),
        groupsCreateView: document.getElementById('groupsCreateView'),
        groupsList: document.getElementById('groupsList'),
        emptyGroupsMsg: document.getElementById('emptyGroupsMsg'),
        // Setup UI
        groupSelectContainer: document.getElementById('groupSelectContainer'),
        setupGroupList: document.getElementById('setupGroupList'),
        activeGroupDisplay: document.getElementById('activeGroupDisplay'),
        activeGroupName: document.getElementById('activeGroupName'),
        clearActiveGroup: document.getElementById('clearActiveGroup')
    };

    // --- State ---
    let participants = [];
    let nextId = 1;
    let currentEditingId = null;
    let currentUser = localStorage.getItem('splitSimpleCurrentUser') || null; 
    let isRegisterMode = false;
    // New State for Groups
    let selectedGroupMembers = null; // Stores ["Alice", "Bob"] if a group is picked

    // Initialize
    updateUserIcon();

    // --- Helper Functions ---
    function getDataKey(type) {
        // type = 'History' or 'Groups'
        const suffix = currentUser ? `_${currentUser}` : `_guest`;
        return `splitSimple${type}${suffix}`;
    }

    function getStorageData(type) {
        return JSON.parse(localStorage.getItem(getDataKey(type))) || [];
    }

    function saveStorageData(type, data) {
        localStorage.setItem(getDataKey(type), JSON.stringify(data));
    }

    function updateUserIcon() {
        if (currentUser) {
            ui.userIcon.classList.add('icon-filled');
            ui.userIcon.innerHTML = `<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4" fill="currentColor"></circle>`;
        } else {
            ui.userIcon.classList.remove('icon-filled');
            ui.userIcon.innerHTML = `<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>`;
        }
    }

    function switchView(viewName) {
        Object.values(views).forEach(el => el.classList.add('hidden'));
        views[viewName].classList.remove('hidden');
    }

    // --- Navigation Handlers ---
    function goHome() {
        switchView('hero');
        inputs.total.value = '';
        inputs.setupAmount.value = '';
        inputs.setupCount.value = '';
        participants = [];
        currentEditingId = null;
        selectedGroupMembers = null; // Reset group selection
        ui.activeGroupDisplay.classList.add('hidden');
        buttons.loadGroup.classList.remove('hidden');
    }

    buttons.reset.addEventListener('click', goHome);
    buttons.brandLogo.addEventListener('click', goHome);
    buttons.backFromHistory.addEventListener('click', goHome);
    buttons.cancelAuth.addEventListener('click', goHome);
    buttons.backFromGroups.addEventListener('click', goHome);

    // --- GROUPS LOGIC ---

    buttons.groupsNav.addEventListener('click', () => {
        switchView('groups');
        // Reset to list view
        ui.groupsListView.classList.remove('hidden');
        ui.groupsCreateView.classList.add('hidden');
        renderGroupsList();
    });

    buttons.goToCreateGroup.addEventListener('click', () => {
        ui.groupsListView.classList.add('hidden');
        ui.groupsCreateView.classList.remove('hidden');
        inputs.newGroupName.value = '';
        inputs.newGroupMembers.innerHTML = '';
        // Add 2 default inputs
        addMemberInput();
        addMemberInput();
    });

    buttons.cancelCreateGroup.addEventListener('click', () => {
        ui.groupsCreateView.classList.add('hidden');
        ui.groupsListView.classList.remove('hidden');
    });

    buttons.addNewMemberInput.addEventListener('click', addMemberInput);

    function addMemberInput() {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'member-create-input';
        input.placeholder = 'Member Name';
        inputs.newGroupMembers.appendChild(input);
    }

    buttons.saveNewGroup.addEventListener('click', () => {
        const name = inputs.newGroupName.value.trim();
        // Collect Member Names
        const memberInputs = document.querySelectorAll('.member-create-input');
        const members = [];
        memberInputs.forEach(inp => {
            if(inp.value.trim()) members.push(inp.value.trim());
        });

        if (!name || members.length < 1) {
            alert("Please enter a group name and at least one member.");
            return;
        }

        const groups = getStorageData('Groups');
        groups.push({
            id: Date.now(),
            name: name,
            members: members
        });
        saveStorageData('Groups', groups);

        // Reset UI
        ui.groupsCreateView.classList.add('hidden');
        ui.groupsListView.classList.remove('hidden');
        renderGroupsList();
    });

    function renderGroupsList() {
        const groups = getStorageData('Groups');
        ui.groupsList.innerHTML = '';
        
        if (groups.length === 0) {
            ui.emptyGroupsMsg.style.display = 'block';
            return;
        } else {
            ui.emptyGroupsMsg.style.display = 'none';
        }

        groups.forEach((group, index) => {
            const li = document.createElement('li');
            li.className = 'history-card'; // Reuse style
            
            // Added Delete Button Container
            li.innerHTML = `
                <div class="h-header">
                    <span class="h-total">${group.name}</span>
                    <button class="delete-group-btn" data-index="${index}" style="background:none; border:none; cursor:pointer; color:#ff4444; font-weight:bold; font-size:1.2rem;">&times;</button>
                </div>
                <div class="h-people">
                    ${group.members.length} Members: ${group.members.join(', ')}
                </div>
            `;
            
            // Attach Delete Logic
            const deleteBtn = li.querySelector('.delete-group-btn');
            deleteBtn.addEventListener('click', (e) => {
                // Stop the click from bubbling up (if you had a click on the card to edit later)
                e.stopPropagation(); 
                
                if(confirm(`Delete group "${group.name}"?`)) {
                    const currentGroups = getStorageData('Groups');
                    currentGroups.splice(index, 1); // Remove item at index
                    saveStorageData('Groups', currentGroups);
                    renderGroupsList(); // Re-render list
                }
            });

            ui.groupsList.appendChild(li);
        });
    }

    // --- SETUP: LOAD GROUP LOGIC ---

    buttons.loadGroup.addEventListener('click', () => {
        const groups = getStorageData('Groups');
        if (groups.length === 0) {
            alert("No saved groups found. Go to 'Groups' in the menu to create one!");
            return;
        }
        
        buttons.loadGroup.classList.add('hidden');
        ui.groupSelectContainer.classList.remove('hidden');
        ui.setupGroupList.innerHTML = '';

        groups.forEach(group => {
            const div = document.createElement('div');
            div.className = 'mini-group-item';
            div.innerText = `${group.name} (${group.members.length})`;
            div.addEventListener('click', () => {
                applyGroupToSetup(group);
            });
            ui.setupGroupList.appendChild(div);
        });
    });

    buttons.cancelGroupLoad.addEventListener('click', () => {
        ui.groupSelectContainer.classList.add('hidden');
        buttons.loadGroup.classList.remove('hidden');
    });

    function applyGroupToSetup(group) {
        // UI Updates
        ui.groupSelectContainer.classList.add('hidden');
        ui.activeGroupDisplay.classList.remove('hidden');
        ui.activeGroupName.innerText = group.name;

        // Logic Updates
        selectedGroupMembers = group.members;
        inputs.setupCount.value = group.members.length;
        
        // Visual feedback
        inputs.setupCount.disabled = true; // Lock count when group is active
    }

    ui.clearActiveGroup.addEventListener('click', () => {
        selectedGroupMembers = null;
        ui.activeGroupDisplay.classList.add('hidden');
        buttons.loadGroup.classList.remove('hidden');
        inputs.setupCount.value = '';
        inputs.setupCount.disabled = false;
    });


    // --- AUTHENTICATION ---
    // (Existing Auth Logic remains mostly the same, ensuring keys are updated)
    buttons.accountNav.addEventListener('click', () => {
        if (currentUser) {
            isRegisterMode = false;
            updateAuthUI();
            switchView('auth');
            buttons.logout.classList.remove('hidden');
            inputs.authUse.value = currentUser;
            inputs.authUse.disabled = true;
            inputs.authPass.classList.add('hidden');
            buttons.authAction.classList.add('hidden');
            ui.authError.innerText = `Logged in as ${currentUser}`;
            ui.authError.style.color = '#00b862';
        } else {
            inputs.authUse.disabled = false;
            inputs.authPass.classList.remove('hidden');
            buttons.authAction.classList.remove('hidden');
            buttons.logout.classList.add('hidden');
            ui.authError.innerText = '';
            switchView('auth');
            inputs.authUse.focus();
        }
    });

    buttons.tabLogin.addEventListener('click', () => { isRegisterMode = false; updateAuthUI(); });
    buttons.tabRegister.addEventListener('click', () => { isRegisterMode = true; updateAuthUI(); });

    function updateAuthUI() {
        ui.authError.innerText = '';
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
        alert("Logged out.");
        goHome();
    });

    buttons.authAction.addEventListener('click', () => {
        const username = inputs.authUse.value.trim();
        const password = inputs.authPass.value.trim();
        if (!username || !password) return;

        const users = JSON.parse(localStorage.getItem('splitSimpleUsers')) || [];

        if (isRegisterMode) {
            if (users.find(u => u.username === username)) {
                ui.authError.innerText = "Username already exists";
                return;
            }
            users.push({ username, password });
            localStorage.setItem('splitSimpleUsers', JSON.stringify(users));
            currentUser = username;
            localStorage.setItem('splitSimpleCurrentUser', currentUser);
            updateUserIcon();
            alert("Account created!");
            goHome();
        } else {
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

    // --- MAIN APP FLOW ---

    // 1. HOME -> SETUP
    buttons.start.addEventListener('click', () => {
        // Animation Logic (Shortened for brevity, same as before)
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
            // Clean inputs
            inputs.setupAmount.value = '';
            inputs.setupCount.value = '';
            inputs.setupCount.disabled = false;
            currentEditingId = null;
            selectedGroupMembers = null;
            ui.activeGroupDisplay.classList.add('hidden');
            buttons.loadGroup.classList.remove('hidden');

            switchView('setup');
            inputs.setupAmount.focus();
            overlay.style.opacity = '0';
            setTimeout(() => { overlay.remove(); }, 400);
        }, 500);
    });

    // 2. SETUP -> APP (Modified for Groups)
    buttons.continue.addEventListener('click', () => {
        const amount = inputs.setupAmount.value;
        const count = parseInt(inputs.setupCount.value);

        if (!amount || !count || count < 1) {
            alert("Please enter a valid amount and number of people.");
            return;
        }

        participants = [];
        
        // CHECK: Are we using a Group or Default?
        if (selectedGroupMembers && selectedGroupMembers.length === count) {
            // Use Group Names
            selectedGroupMembers.forEach((name, i) => {
                participants.push({ id: i+1, name: name, paid: false });
            });
        } else {
            // Use Default Names
            for (let i = 1; i <= count; i++) {
                participants.push({ id: i, name: `Person ${i}`, paid: false });
            }
        }

        nextId = count + 1;
        inputs.total.value = amount;
        switchView('app');
        renderList();
        updateSplitAmounts();
    });

    // --- HISTORY, CALCULATOR & SAVING (Standard Logic) ---
    // ... (This logic remains standard, using getStorageData/saveStorageData helper) ...
    
    // History View
    buttons.historyNav.addEventListener('click', () => {
        switchView('history');
        ui.historyTitle.innerText = currentUser ? `${currentUser}'s History` : `Guest History`;
        renderHistory();
    });

    function renderHistory() {
        const historyData = getStorageData('History');
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
            let allPaid = false;
            if (item.savedParticipants && item.savedParticipants.length > 0) {
                allPaid = item.savedParticipants.every(p => p.paid);
            }
            const amountClass = allPaid ? 'text-success' : 'text-danger';
            const checkmark = allPaid ? `<svg class="icon-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>` : '';
            
            // Handle Names Display
            let namesStr = "";
            if (item.savedParticipants) {
                namesStr = item.savedParticipants.map(p => p.name).join(', ');
            } else if (item.names) {
                namesStr = item.names; 
            }

            const li = document.createElement('li');
            li.className = 'history-card';
            li.innerHTML = `
                <div class="h-header">
                    <span class="h-date">${item.date}</span>
                    <span class="h-total ${amountClass}">$${item.total} ${checkmark}</span>
                </div>
                <div class="h-people">
                    <strong>${item.savedParticipants ? item.savedParticipants.length : item.peopleCount} People:</strong> ${namesStr}
                </div>
            `;
            li.addEventListener('click', () => loadSplit(item));
            historyList.appendChild(li);
        });
    }

    // Add Person
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
                    <button class="status-btn ${person.paid ? 'paid' : ''}" data-index="${index}">${person.paid ? 'Paid' : 'Unpaid'}</button>
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
                renderList(); // Re-render to update UI state properly
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

    // Save Split
    buttons.save.addEventListener('click', () => {
        const total = inputs.total.value;
        if (!total || parseFloat(total) <= 0) { alert("Invalid amount."); return; }
        const nowStr = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        let historyData = getStorageData('History');

        if (currentEditingId !== null) {
            const existingIndex = historyData.findIndex(item => item.id === currentEditingId);
            if (existingIndex !== -1) {
                historyData[existingIndex].total = total;
                historyData[existingIndex].peopleCount = participants.length;
                historyData[existingIndex].savedParticipants = JSON.parse(JSON.stringify(participants));
                historyData[existingIndex].date = nowStr;
            } else { historyData.unshift(createEntry(total, nowStr)); }
        } else { historyData.unshift(createEntry(total, nowStr)); }

        saveStorageData('History', historyData);
        
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

    buttons.clearHistory.addEventListener('click', () => {
        if(confirm("Clear history?")) {
            localStorage.removeItem(getDataKey('History'));
            renderHistory();
        }
    });

    function loadSplit(item) {
        currentEditingId = item.id;
        inputs.total.value = item.total;
        if (item.savedParticipants) participants = JSON.parse(JSON.stringify(item.savedParticipants));
        else participants = [{ id: 1, name: 'Person 1', paid: false }, { id: 2, name: 'Person 2', paid: false }];
        const maxId = participants.reduce((max, p) => (p.id > max ? p.id : max), 0);
        nextId = maxId + 1;
        switchView('app');
        renderList();
        updateSplitAmounts();
    }
});