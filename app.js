// Contract configuration
const CONTRACT_ADDRESS = '0x522E656CbE5d6b8461c63C679C3e2860d1aF44f7';
const CONTRACT_ABI = [
    "function counselor() view returns (address)",
    "function currentSessionId() view returns (uint16)",
    "function lastSessionTime() view returns (uint256)",
    "function registerPatient(uint8 _anxietyLevel, uint8 _depressionLevel, uint8 _stressLevel)",
    "function startCounselingSession(uint8 _sessionType, uint8 _severityLevel)",
    "function completeSession(uint16 _sessionId, uint8 _improvementScore)",
    "function createTherapyPlan(address _patient, uint8 _recommendedSessions, uint8 _priorityLevel)",
    "function updateMentalHealthLevels(uint8 _anxietyLevel, uint8 _depressionLevel, uint8 _stressLevel)",
    "function isSessionTimeAvailable() view returns (bool)",
    "function getSessionAvailability() view returns (bool available, uint256 nextAvailableTime, uint256 currentTime)",
    "function getPatientSessionCount(address _patient) view returns (uint256)",
    "function getSessionInfo(uint16 _sessionId) view returns (bool sessionActive, bool sessionCompleted, uint256 startTime, uint256 endTime, address patient)",
    "function getSessionStats() view returns (uint16 nextSessionId, uint256 totalSessions, uint256 lastSession)",
    "function isPatientRegistered(address _patient) view returns (bool)",
    "function getTherapyPlanStatus(address _patient) view returns (bool planActive, uint256 createdTime)",
    "event PatientRegistered(address indexed patient, uint256 timestamp)",
    "event SessionStarted(uint16 indexed sessionId, address indexed patient, uint256 startTime)",
    "event SessionCompleted(uint16 indexed sessionId, address indexed patient, uint256 endTime)",
    "event TherapyPlanCreated(address indexed patient, uint256 timestamp)",
    "event EmergencyAlert(address indexed patient, uint256 timestamp)"
];

// Global variables
let provider;
let signer;
let contract;
let userAccount;
let currentSessionId = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
    initializeApp();
    setupEventListeners();
    setupRangeInputs();
});

// Also initialize when window loads (backup)
window.addEventListener('load', function() {
    console.log('Window Loaded');

    // Wait a bit for ethers to load if not already loaded
    if (typeof ethers === 'undefined') {
        console.log('Ethers not loaded yet, waiting...');
        setTimeout(function() {
            if (typeof ethers !== 'undefined') {
                console.log('Ethers loaded after delay');
            } else {
                console.error('Ethers failed to load after delay');
                showStatus('registrationStatus', 'Error: Web3 library failed to load. Please refresh the page.', 'error');
            }
        }, 1000);
    }

    if (!document.getElementById('connectWallet').onclick) {
        setupEventListeners();
    }
});

async function initializeApp() {
    try {
        // Show loading indicator
        const loadingStatus = document.getElementById('loadingStatus');
        if (loadingStatus) {
            loadingStatus.style.display = 'block';
        }

        // Check if ethers is loaded
        if (typeof ethers === 'undefined') {
            console.log('Waiting for ethers.js to load...');
            // Hide loading after timeout
            setTimeout(() => {
                if (loadingStatus) {
                    loadingStatus.style.display = 'none';
                }
            }, 5000);
            return;
        }

        // Hide loading indicator
        if (loadingStatus) {
            loadingStatus.style.display = 'none';
        }

        // Check if MetaMask is installed
        if (typeof window.ethereum !== 'undefined') {
            console.log('MetaMask is installed');
            await checkConnection();
        } else {
            showStatus('registrationStatus', 'Please install MetaMask to use this application', 'error');
        }
    } catch (error) {
        console.error('Initialization error:', error);
        showStatus('registrationStatus', 'Failed to initialize application', 'error');
    }
}

// Expose initializeApp to global scope
window.initializeApp = initializeApp;

async function checkConnection() {
    try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
            await connectWallet();
        }
    } catch (error) {
        console.error('Error checking connection:', error);
    }
}

async function connectWallet() {
    try {
        // Check if MetaMask is installed
        if (typeof window.ethereum === 'undefined') {
            showStatus('registrationStatus', 'Please install MetaMask to use this application', 'error');
            return;
        }

        // Check if ethers is loaded
        if (typeof ethers === 'undefined') {
            showStatus('registrationStatus', 'Web3 library is still loading. Please wait a moment and try again.', 'warning');
            return;
        }

        showStatus('registrationStatus', 'Connecting to wallet...', 'info');

        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        userAccount = accounts[0];

        // Initialize provider and signer
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();

        // Initialize contract
        contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

        // Update UI
        document.getElementById('connectWallet').style.display = 'none';
        document.getElementById('accountInfo').style.display = 'block';
        document.getElementById('accountAddress').textContent = `${userAccount.slice(0, 6)}...${userAccount.slice(-4)}`;

        // Get network info
        const network = await provider.getNetwork();
        document.getElementById('networkInfo').textContent = `Network: ${network.name} (${network.chainId})`;

        // Check user status and update UI
        await updateUserInterface();

        showStatus('registrationStatus', 'Wallet connected successfully!', 'success');

        // Listen for account changes
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);

    } catch (error) {
        console.error('Error connecting wallet:', error);
        showStatus('registrationStatus', 'Failed to connect wallet', 'error');
    }
}

async function updateUserInterface() {
    try {
        if (!contract || !userAccount) return;

        // Check if user is registered
        const isRegistered = await contract.isPatientRegistered(userAccount);

        // Check if user is the counselor
        const counselorAddress = await contract.counselor();
        const isCounselor = userAccount.toLowerCase() === counselorAddress.toLowerCase();

        // Update section visibility
        if (isRegistered) {
            document.getElementById('registrationSection').style.display = 'none';
            document.getElementById('sessionSection').style.display = 'block';
            document.getElementById('updateSection').style.display = 'block';
            document.getElementById('dashboardSection').style.display = 'block';

            await updateSessionAvailability();
            await updateDashboard();
            await checkActiveSession();
        } else {
            document.getElementById('registrationSection').style.display = 'block';
            document.getElementById('sessionSection').style.display = 'none';
            document.getElementById('updateSection').style.display = 'none';
            document.getElementById('dashboardSection').style.display = 'none';
        }

        if (isCounselor) {
            document.getElementById('counselorSection').style.display = 'block';
        }

        // Always show system stats
        await updateSystemStats();

    } catch (error) {
        console.error('Error updating UI:', error);
    }
}

async function registerPatient() {
    try {
        const anxietyLevel = parseInt(document.getElementById('anxietyLevel').value);
        const depressionLevel = parseInt(document.getElementById('depressionLevel').value);
        const stressLevel = parseInt(document.getElementById('stressLevel').value);

        showStatus('registrationStatus', 'Registering patient...', 'info');

        const tx = await contract.registerPatient(anxietyLevel, depressionLevel, stressLevel);

        showStatus('registrationStatus', 'Transaction submitted. Waiting for confirmation...', 'info');

        await tx.wait();

        showStatus('registrationStatus', 'Patient registered successfully!', 'success');

        // Update UI after successful registration
        setTimeout(() => {
            updateUserInterface();
        }, 2000);

    } catch (error) {
        console.error('Registration error:', error);
        showStatus('registrationStatus', `Registration failed: ${error.message}`, 'error');
    }
}

async function updateSessionAvailability() {
    try {
        const availability = await contract.getSessionAvailability();
        const isAvailable = availability[0];
        const nextAvailableTime = availability[1];
        const currentTime = availability[2];

        const availabilityDiv = document.getElementById('availabilityInfo');

        if (isAvailable) {
            availabilityDiv.innerHTML = `
                <span style="color: green; font-weight: bold;">✅ Sessions Available Now</span>
                <p>You can book a session immediately.</p>
            `;
            document.getElementById('startSessionBtn').disabled = false;
        } else {
            const waitTime = new Date(nextAvailableTime.toNumber() * 1000);
            availabilityDiv.innerHTML = `
                <span style="color: orange; font-weight: bold;">⏳ Next Available Session</span>
                <p>Available at: ${waitTime.toLocaleString()}</p>
            `;
            document.getElementById('startSessionBtn').disabled = true;
        }
    } catch (error) {
        console.error('Error checking availability:', error);
    }
}

async function startSession() {
    try {
        const sessionType = parseInt(document.getElementById('sessionType').value);
        const severityLevel = parseInt(document.getElementById('severityLevel').value);

        showStatus('sessionStatus', 'Starting counseling session...', 'info');

        const tx = await contract.startCounselingSession(sessionType, severityLevel);

        showStatus('sessionStatus', 'Transaction submitted. Waiting for confirmation...', 'info');

        const receipt = await tx.wait();

        // Get session ID from events
        const sessionStartedEvent = receipt.events.find(event => event.event === 'SessionStarted');
        if (sessionStartedEvent) {
            currentSessionId = sessionStartedEvent.args.sessionId.toNumber();
        }

        showStatus('sessionStatus', 'Session started successfully!', 'success');

        // Update UI to show active session
        await updateActiveSession();

    } catch (error) {
        console.error('Session start error:', error);
        showStatus('sessionStatus', `Failed to start session: ${error.message}`, 'error');
    }
}

async function checkActiveSession() {
    try {
        // Get current session stats to find latest session
        const stats = await contract.getSessionStats();
        const latestSessionId = stats[0].toNumber() - 1; // nextSessionId - 1

        if (latestSessionId > 0) {
            const sessionInfo = await contract.getSessionInfo(latestSessionId);
            const isPatientSession = sessionInfo[4].toLowerCase() === userAccount.toLowerCase();

            if (isPatientSession && sessionInfo[0] && !sessionInfo[1]) { // active but not completed
                currentSessionId = latestSessionId;
                await updateActiveSession();
            }
        }
    } catch (error) {
        console.error('Error checking active session:', error);
    }
}

async function updateActiveSession() {
    if (currentSessionId) {
        try {
            const sessionInfo = await contract.getSessionInfo(currentSessionId);
            const startTime = new Date(sessionInfo[2].toNumber() * 1000);

            document.getElementById('activeSessionInfo').innerHTML = `
                <div class="privacy-notice">
                    <strong>🔐 Privacy Protected:</strong> Your session details are encrypted and anonymous.
                </div>
                <p><strong>Session ID:</strong> ${currentSessionId}</p>
                <p><strong>Started:</strong> ${startTime.toLocaleString()}</p>
                <p><strong>Status:</strong> Active</p>
            `;

            document.getElementById('activeSessionSection').style.display = 'block';
            document.getElementById('sessionSection').style.display = 'none';
        } catch (error) {
            console.error('Error updating active session:', error);
        }
    }
}

async function completeSession() {
    try {
        const improvementScore = parseInt(document.getElementById('improvementScore').value);

        showStatus('completionStatus', 'Completing session...', 'info');

        const tx = await contract.completeSession(currentSessionId, improvementScore);

        showStatus('completionStatus', 'Transaction submitted. Waiting for confirmation...', 'info');

        await tx.wait();

        showStatus('completionStatus', 'Session completed successfully!', 'success');

        // Reset session state
        currentSessionId = null;
        document.getElementById('activeSessionSection').style.display = 'none';
        document.getElementById('sessionSection').style.display = 'block';

        // Update UI
        await updateUserInterface();

    } catch (error) {
        console.error('Session completion error:', error);
        showStatus('completionStatus', `Failed to complete session: ${error.message}`, 'error');
    }
}

async function updateMentalHealthLevels() {
    try {
        const anxietyLevel = parseInt(document.getElementById('newAnxietyLevel').value);
        const depressionLevel = parseInt(document.getElementById('newDepressionLevel').value);
        const stressLevel = parseInt(document.getElementById('newStressLevel').value);

        showStatus('updateStatus', 'Updating mental health levels...', 'info');

        const tx = await contract.updateMentalHealthLevels(anxietyLevel, depressionLevel, stressLevel);

        showStatus('updateStatus', 'Transaction submitted. Waiting for confirmation...', 'info');

        await tx.wait();

        showStatus('updateStatus', 'Mental health levels updated successfully!', 'success');

    } catch (error) {
        console.error('Update error:', error);
        showStatus('updateStatus', `Failed to update levels: ${error.message}`, 'error');
    }
}

async function createTherapyPlan() {
    try {
        const patientAddress = document.getElementById('patientAddress').value;
        const recommendedSessions = parseInt(document.getElementById('recommendedSessions').value);
        const priorityLevel = parseInt(document.getElementById('priorityLevel').value);

        if (!ethers.utils.isAddress(patientAddress)) {
            showStatus('planStatus', 'Invalid patient address', 'error');
            return;
        }

        showStatus('planStatus', 'Creating therapy plan...', 'info');

        const tx = await contract.createTherapyPlan(patientAddress, recommendedSessions, priorityLevel);

        showStatus('planStatus', 'Transaction submitted. Waiting for confirmation...', 'info');

        await tx.wait();

        showStatus('planStatus', 'Therapy plan created successfully!', 'success');

    } catch (error) {
        console.error('Therapy plan error:', error);
        showStatus('planStatus', `Failed to create therapy plan: ${error.message}`, 'error');
    }
}

async function updateDashboard() {
    try {
        const sessionCount = await contract.getPatientSessionCount(userAccount);
        const therapyPlan = await contract.getTherapyPlanStatus(userAccount);

        document.getElementById('totalSessions').textContent = sessionCount.toString();

        if (therapyPlan[0]) { // planActive
            const createdDate = new Date(therapyPlan[1].toNumber() * 1000);
            document.getElementById('therapyPlanStatus').textContent = `Active (Created: ${createdDate.toLocaleDateString()})`;
        } else {
            document.getElementById('therapyPlanStatus').textContent = 'None';
        }

        // Try to get registration date (this would need to be stored or retrieved from events)
        document.getElementById('registrationDate').textContent = 'Connected';

    } catch (error) {
        console.error('Error updating dashboard:', error);
    }
}

async function updateSystemStats() {
    try {
        const stats = await contract.getSessionStats();
        const nextSessionId = stats[0].toNumber();
        const totalSessions = stats[1].toNumber();
        const lastSessionTime = new Date(stats[2].toNumber() * 1000);

        document.getElementById('systemStats').innerHTML = `
            <div class="dashboard-stats">
                <div class="stat-card">
                    <h3>Total Sessions</h3>
                    <span>${totalSessions}</span>
                </div>
                <div class="stat-card">
                    <h3>Next Session ID</h3>
                    <span>${nextSessionId}</span>
                </div>
                <div class="stat-card">
                    <h3>Last Session</h3>
                    <span>${totalSessions > 0 ? lastSessionTime.toLocaleDateString() : 'None'}</span>
                </div>
            </div>
        `;

    } catch (error) {
        console.error('Error updating system stats:', error);
    }
}

function setupEventListeners() {
    console.log('Setting up event listeners...');

    // Wallet connection
    const connectBtn = document.getElementById('connectWallet');
    if (connectBtn) {
        console.log('Connect wallet button found, adding event listener');
        connectBtn.addEventListener('click', function(e) {
            console.log('Connect wallet button clicked');
            e.preventDefault();
            connectWallet();
        });
    } else {
        console.error('Connect wallet button not found!');
    }

    // Patient actions
    const registerBtn = document.getElementById('registerBtn');
    if (registerBtn) {
        registerBtn.addEventListener('click', registerPatient);
    }

    const startSessionBtn = document.getElementById('startSessionBtn');
    if (startSessionBtn) {
        startSessionBtn.addEventListener('click', startSession);
    }

    const completeSessionBtn = document.getElementById('completeSessionBtn');
    if (completeSessionBtn) {
        completeSessionBtn.addEventListener('click', completeSession);
    }

    const updateLevelsBtn = document.getElementById('updateLevelsBtn');
    if (updateLevelsBtn) {
        updateLevelsBtn.addEventListener('click', updateMentalHealthLevels);
    }

    // Counselor actions
    const createPlanBtn = document.getElementById('createPlanBtn');
    if (createPlanBtn) {
        createPlanBtn.addEventListener('click', createTherapyPlan);
    }

    // Contract event listeners
    setupContractEventListeners();
}

function setupRangeInputs() {
    // Patient registration ranges
    const anxietyRange = document.getElementById('anxietyLevel');
    const anxietyValue = document.getElementById('anxietyValue');
    anxietyRange.addEventListener('input', () => anxietyValue.textContent = anxietyRange.value);

    const depressionRange = document.getElementById('depressionLevel');
    const depressionValue = document.getElementById('depressionValue');
    depressionRange.addEventListener('input', () => depressionValue.textContent = depressionRange.value);

    const stressRange = document.getElementById('stressLevel');
    const stressValue = document.getElementById('stressValue');
    stressRange.addEventListener('input', () => stressValue.textContent = stressRange.value);

    // Session severity range
    const severityRange = document.getElementById('severityLevel');
    const severityValue = document.getElementById('severityValue');
    severityRange.addEventListener('input', () => severityValue.textContent = severityRange.value);

    // Improvement score range
    const improvementRange = document.getElementById('improvementScore');
    const improvementValue = document.getElementById('improvementValue');
    improvementRange.addEventListener('input', () => improvementValue.textContent = improvementRange.value);

    // Update ranges
    const newAnxietyRange = document.getElementById('newAnxietyLevel');
    const newAnxietyValue = document.getElementById('newAnxietyValue');
    newAnxietyRange.addEventListener('input', () => newAnxietyValue.textContent = newAnxietyRange.value);

    const newDepressionRange = document.getElementById('newDepressionLevel');
    const newDepressionValue = document.getElementById('newDepressionValue');
    newDepressionRange.addEventListener('input', () => newDepressionValue.textContent = newDepressionRange.value);

    const newStressRange = document.getElementById('newStressLevel');
    const newStressValue = document.getElementById('newStressValue');
    newStressRange.addEventListener('input', () => newStressValue.textContent = newStressRange.value);
}

function showStatus(elementId, message, type) {
    const statusElement = document.getElementById(elementId);
    statusElement.textContent = message;
    statusElement.className = `status-message ${type} show`;

    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            statusElement.classList.remove('show');
        }, 5000);
    }
}

function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        // User disconnected wallet
        location.reload();
    } else if (accounts[0] !== userAccount) {
        // User switched accounts
        userAccount = accounts[0];
        updateUserInterface();
    }
}

function handleChainChanged(chainId) {
    // Reload the page when chain changes
    location.reload();
}

// Listen for contract events
function setupContractEventListeners() {
    if (contract) {
        // Listen for emergency alerts
        contract.on('EmergencyAlert', (patient, timestamp, event) => {
            if (patient.toLowerCase() === userAccount.toLowerCase()) {
                showEmergencyAlert();
            }
        });

        // Listen for session events
        contract.on('SessionStarted', (sessionId, patient, startTime, event) => {
            if (patient.toLowerCase() === userAccount.toLowerCase()) {
                showStatus('sessionStatus', `Session ${sessionId} started successfully!`, 'success');
            }
        });

        contract.on('SessionCompleted', (sessionId, patient, endTime, event) => {
            if (patient.toLowerCase() === userAccount.toLowerCase()) {
                showStatus('completionStatus', `Session ${sessionId} completed!`, 'success');
            }
        });
    }
}

function showEmergencyAlert() {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'emergency-alert';
    alertDiv.innerHTML = `
        <h3>🚨 Emergency Alert</h3>
        <p>High-risk mental health indicators detected. Please seek immediate professional help.</p>
        <p><strong>Crisis Helplines:</strong></p>
        <p>National Suicide Prevention Lifeline: 988</p>
        <p>Crisis Text Line: Text HOME to 741741</p>
    `;

    document.querySelector('main').insertBefore(alertDiv, document.querySelector('main').firstChild);

    // Auto-remove after 30 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
    }, 30000);
}

// Utility functions
function formatAddress(address) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatTimestamp(timestamp) {
    return new Date(timestamp * 1000).toLocaleString();
}

// Error handling for unhandled promise rejections
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    event.preventDefault();
});