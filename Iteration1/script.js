document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const views = {
        hero: document.getElementById('hero'),
        auth: document.getElementById('auth'),
        setup: document.getElementById('setup'),
        app: document.getElementById('app'),
        history: document.getElementById('history'),
        groups: document.getElementById('groups'),
        admin: document.getElementById('admin') // New
    };

    const inputs = {
        setupAmount: document.getElementById('setupAmount'),
        setupCount: document.getElementById('setupCount'),
        total: document.getElementById('totalAmount'),
        list: document.getElementById('ledgerList'),
        authUse: document.getElementById('authUsername'),
        authPass: document.getElementById('authPassword'),
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
        
        historyNav: document.getElementById('historyLink'),
        accountNav: document.getElementById('accountLink'),
        groupsNav: document.getElementById('groupsLink'),
        adminNav: document.getElementById('adminLink'), // New
        backFromHistory: document.getElementById('backFromHistoryBtn'),
        clearHistory: document.getElementById('clearHistoryBtn'),
        brandLogo: document.querySelector('.brand'),
        
        tabLogin: document.getElementById('tabLogin'),
        tabRegister: document.getElementById('tabRegister'),
        authAction: document.getElementById('authActionBtn'),
        cancelAuth: document.getElementById('cancelAuthBtn'),
        logout: document.getElementById('logoutBtn'),

        goToCreateGroup: document.getElementById('goToCreateGroupBtn'),
        saveNewGroup: document.getElementById('saveNewGroupBtn'),
        cancelCreateGroup: document.getElementById('cancelCreateGroupBtn'),
        addNewMemberInput: document.getElementById('addNewMemberInputBtn'),
        backFromGroups: document.getElementById('backFromGroupsBtn'),
        
        loadGroup: document.getElementById('loadGroupBtn'),
        cancelGroupLoad: document.getElementById('cancelGroupLoad'),

        backFromAdmin: document.getElementById('backFromAdminBtn'), // New
        globalReset: document.getElementById('globalResetBtn') // New
    };

    const ui = {
        authError: document.getElementById('authError'),
        userIcon: document.getElementById('userIcon'),
        historyTitle: document.getElementById('historyTitle'),
        groupsListView: document.getElementById('groupsListView'),
        groupsCreateView: document.getElementById('groupsCreateView'),
        groupsList: document.getElementById('groupsList'),
        emptyGroupsMsg: document.getElementById('emptyGroupsMsg'),
        groupSelectContainer: document.getElementById('groupSelectContainer'),
        setupGroupList: document.getElementById('setupGroupList'),
        activeGroupDisplay: document.getElementById('activeGroupDisplay'),
        activeGroupName: document.getElementById('activeGroupName'),
        clearActiveGroup: document.getElementById('clearActiveGroup'),
        
        adminStatsGrid: document.getElementById('adminStatsGrid'), // New
        adminUserList: document.getElementById('adminUserList') // New
    };

    // --- State ---
    let participants = [];
    let nextId = 1;
    let currentEditingId = null;
    let currentUser = localStorage.getItem('splitSimpleCurrentUser') || null; 
    let isRegisterMode = false;
    let selectedGroupMembers = null; 

    // Initialize
    updateUserIcon();

    // --- Helper Functions ---
    function getDataKey(type, specificUser = null) {
        const user = specificUser || currentUser;
        const suffix = user ? `_${user}` : `_guest`;
        return `splitSimple${type}${suffix}`;
    }

    function getStorageData(type, specificUser = null) {
        return JSON.parse(localStorage.getItem(getDataKey(type, specificUser))) || [];
    }

    function saveStorageData(type, data) {
        localStorage.setItem(getDataKey(type), JSON.stringify(data));
    }

    function updateUserIcon() {
        // Toggle user icon fill
        if (currentUser) {
            ui.userIcon.classList.add('icon-filled');
            ui.userIcon.innerHTML = `<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4" fill="currentColor"></circle>`;
        } else {
            ui.userIcon.classList.remove('icon-filled');
            ui.userIcon.innerHTML = `<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>`;
        }
        
        // Show/Hide Admin Nav
        if (currentUser === 'admin') {
            buttons.adminNav.classList.remove('hidden');
        } else {
            buttons.adminNav.classList.add('hidden');
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
        selectedGroupMembers = null;
        ui.activeGroupDisplay.classList.add('hidden');
        buttons.loadGroup.classList.remove('hidden');
    }

    buttons.reset.addEventListener('click', goHome);
    buttons.brandLogo.addEventListener('click', goHome);
    buttons.backFromHistory.addEventListener('click', goHome);
    buttons.cancelAuth.addEventListener('click', goHome);
    buttons.backFromGroups.addEventListener('click', goHome);
    buttons.backFromAdmin.addEventListener('click', goHome);

    // --- GROUPS LOGIC ---
    buttons.groupsNav.addEventListener('click', () => {
        switchView('groups');
        ui.groupsListView.classList.remove('hidden');
        ui.groupsCreateView.classList.add('hidden');
        renderGroupsList();
    });

    buttons.goToCreateGroup.addEventListener('click', () => {
        ui.groupsListView.classList.add('hidden');
        ui.groupsCreateView.classList.remove('hidden');
        inputs.newGroupName.value = '';
        inputs.newGroupMembers.innerHTML = '';
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
        const memberInputs = document.querySelectorAll('.member-create-input');
        const members = [];
        memberInputs.forEach(inp => { if(inp.value.trim()) members.push(inp.value.trim()); });

        if (!name || members.length < 1) {
            alert("Please enter a group name and at least one member.");
            return;
        }

        const groups = getStorageData('Groups');
        groups.push({ id: Date.now(), name: name, members: members });
        saveStorageData('Groups', groups);

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
            li.className = 'history-card'; 
            
            li.innerHTML = `
                <div class="h-header" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                    <span class="h-total">${group.name}</span>
                    <button class="delete-group-btn" data-index="${index}">&times;</button>
                </div>
                <div class="h-people">
                    ${group.members.length} Members: ${group.members.join(', ')}
                </div>
            `;
            
            const deleteBtn = li.querySelector('.delete-group-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation(); 
                if(confirm(`Delete group "${group.name}"?`)) {
                    groups.splice(index, 1);
                    saveStorageData('Groups', groups);
                    renderGroupsList(); 
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
            div.addEventListener('click', () => applyGroupToSetup(group));
            ui.setupGroupList.appendChild(div);
        });
    });

    buttons.cancelGroupLoad.addEventListener('click', () => {
        ui.groupSelectContainer.classList.add('hidden');
        buttons.loadGroup.classList.remove('hidden');
    });

    function applyGroupToSetup(group) {
        ui.groupSelectContainer.classList.add('hidden');
        ui.activeGroupDisplay.classList.remove('hidden');
        ui.activeGroupName.innerText = group.name;
        selectedGroupMembers = group.members;
        inputs.setupCount.value = group.members.length;
        inputs.setupCount.disabled = true;
    }

    ui.clearActiveGroup.addEventListener('click', () => {
        selectedGroupMembers = null;
        ui.activeGroupDisplay.classList.add('hidden');
        buttons.loadGroup.classList.remove('hidden');
        inputs.setupCount.value = '';
        inputs.setupCount.disabled = false;
    });

    // --- AUTHENTICATION ---
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

    buttons.continue.addEventListener('click', () => {
        const amount = inputs.setupAmount.value;
        const count = parseInt(inputs.setupCount.value);

        if (!amount || !count || count < 1) {
            alert("Please enter a valid amount and number of people.");
            return;
        }

        participants = [];
        if (selectedGroupMembers && selectedGroupMembers.length === count) {
            selectedGroupMembers.forEach((name, i) => {
                participants.push({ id: i+1, name: name, paid: false });
            });
        } else {
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

    // --- HISTORY & CALCULATOR ---
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
                renderList(); 
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


    // --- ADMIN DASHBOARD ---
    
    // Admin Security & Entry
    buttons.adminNav.addEventListener('click', () => {
        if (currentUser !== 'admin') {
            alert("Unauthorized Access.");
            goHome();
            return;
        }
        switchView('admin');
        renderAdminDashboard();
    });

    function renderAdminDashboard() {
        const users = JSON.parse(localStorage.getItem('splitSimpleUsers')) || [];
        
        // Include "guest" for calculations and clearing
        const allProfiles = [{username: 'guest'}, ...users];

        let totalSplits = 0;
        let totalGroups = 0;
        let totalAmount = 0;
        let userActivity = {};

        // 1. Calculate Analytics
        allProfiles.forEach(u => {
            const h = getStorageData('History', u.username);
            const g = getStorageData('Groups', u.username);
            
            totalSplits += h.length;
            totalGroups += g.length;
            userActivity[u.username] = h.length;

            h.forEach(item => {
                totalAmount += parseFloat(item.total) || 0;
            });
        });

        let mostActive = 'N/A';
        let maxSplits = -1;
        for (const [uname, splits] of Object.entries(userActivity)) {
            if (splits > maxSplits && splits > 0) {
                maxSplits = splits;
                mostActive = uname;
            }
        }

        const avgSplit = totalSplits > 0 ? (totalAmount / totalSplits).toFixed(2) : '0.00';

        // 2. Render Stats Grid
        ui.adminStatsGrid.innerHTML = `
            <div class="stat-card"><span class="stat-value">${allProfiles.length}</span><span class="stat-label">Total Users</span></div>
            <div class="stat-card"><span class="stat-value">${totalSplits}</span><span class="stat-label">Total Splits</span></div>
            <div class="stat-card"><span class="stat-value">${totalGroups}</span><span class="stat-label">Total Groups</span></div>
            <div class="stat-card"><span class="stat-value">$${avgSplit}</span><span class="stat-label">Avg Split</span></div>
            <div class="stat-card"><span class="stat-value" style="font-size:1.5rem;">${mostActive}</span><span class="stat-label">Most Active</span></div>
        `;

        // 3. Render User Management List
        ui.adminUserList.innerHTML = '';
        allProfiles.forEach(u => {
            const hLen = getStorageData('History', u.username).length;
            const gLen = getStorageData('Groups', u.username).length;

            const card = document.createElement('div');
            card.className = 'admin-user-card';
            card.innerHTML = `
                <div class="admin-user-header">
                    <span>👤 ${u.username} ${u.username === 'admin' ? '(Super Admin)' : ''}</span>
                    <span style="font-size: 0.8rem; font-weight: normal; color: #888;">${hLen} Splits | ${gLen} Groups</span>
                </div>
                <div class="admin-user-actions">
                    <button class="admin-btn clear-hist" data-user="${u.username}">Clear History</button>
                    <button class="admin-btn clear-grp" data-user="${u.username}">Clear Groups</button>
                    ${u.username !== 'admin' && u.username !== 'guest' ? `<button class="admin-btn danger delete-acc" data-user="${u.username}">Delete Account</button>` : ''}
                </div>
            `;

            // Attach Admin Action Listeners
            card.querySelector('.clear-hist').addEventListener('click', function() {
                if (confirm(`Clear all history for ${u.username}?`)) {
                    localStorage.removeItem(getDataKey('History', u.username));
                    adminFeedback(this, "Cleared!");
                }
            });

            card.querySelector('.clear-grp').addEventListener('click', function() {
                if (confirm(`Clear all groups for ${u.username}?`)) {
                    localStorage.removeItem(getDataKey('Groups', u.username));
                    adminFeedback(this, "Cleared!");
                }
            });

            const delBtn = card.querySelector('.delete-acc');
            if(delBtn) {
                delBtn.addEventListener('click', function() {
                    if (confirm(`WARNING: Permanently delete account for ${u.username}?`)) {
                        // Remove history/groups
                        localStorage.removeItem(getDataKey('History', u.username));
                        localStorage.removeItem(getDataKey('Groups', u.username));
                        
                        // Remove from users list
                        const currentUsers = JSON.parse(localStorage.getItem('splitSimpleUsers')) || [];
                        const updatedUsers = currentUsers.filter(usr => usr.username !== u.username);
                        localStorage.setItem('splitSimpleUsers', JSON.stringify(updatedUsers));
                        
                        adminFeedback(this, "Deleted!");
                    }
                });
            }

            ui.adminUserList.appendChild(card);
        });
    }

    function adminFeedback(btn, text) {
        const originalText = btn.innerText;
        btn.innerText = text;
        btn.style.backgroundColor = 'var(--success)';
        btn.style.color = 'white';
        btn.style.borderColor = 'var(--success)';
        setTimeout(() => {
            renderAdminDashboard(); // Re-fetch all data and reset UI
        }, 1000);
    }

    // Factory Reset
    buttons.globalReset.addEventListener('click', () => {
        if (confirm("🚨 CRITICAL WARNING 🚨\n\nAre you absolutely sure you want to delete ALL data? This will wipe every user, group, and split in the application. This cannot be undone.")) {
            // Confirm twice for safety
            if (confirm("Are you 100% positive? Last chance to cancel.")) {
                localStorage.clear();
                currentUser = null;
                alert("Database Wiped. Application Reset.");
                location.reload(); // Hard refresh to reset memory
            }
        }
    });
});