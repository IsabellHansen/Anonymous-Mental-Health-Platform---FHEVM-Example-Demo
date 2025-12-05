# Frontend Integration Guide

## Overview

This guide explains how to integrate the Anonymous Mental Health Platform smart contract with a frontend application. The included `index.html` and `app.js` provide a complete working example.

## Quick Start

### Prerequisites

- MetaMask or compatible Web3 wallet
- Node.js 16+ (for local development)
- Basic understanding of Web3 and ethers.js

### Setup

1. **Update Contract Address**
   ```javascript
   // In app.js
   const CONTRACT_ADDRESS = "0x..."; // Your deployed contract address
   ```

2. **Serve the Application**
   ```bash
   # Using Python
   python -m http.server 3000

   # Or using Node.js
   npx http-server . -p 3000 -c-1 --cors
   ```

3. **Open in Browser**
   ```
   http://localhost:3000
   ```

---

## Architecture

### Smart Contract Interface

The frontend communicates with the contract through these main functions:

#### Patient Functions

```javascript
// Register patient with encrypted health indicators
registerPatient(anxietyLevel, depressionLevel, stressLevel)

// Start a counseling session
startCounselingSession(sessionType, severityLevel)

// Complete a session with improvement rating
completeSession(sessionId, improvementScore)

// Update mental health levels
updateMentalHealthLevels(anxietyLevel, depressionLevel, stressLevel)
```

#### Counselor Functions

```javascript
// Create therapy plan (counselor only)
createTherapyPlan(patientAddress, recommendedSessions, priorityLevel)
```

#### View Functions

```javascript
// Check if patient is registered
isPatientRegistered(patientAddress)

// Get session availability
getSessionAvailability()

// Get session information
getSessionInfo(sessionId)

// Get therapy plan status
getTherapyPlanStatus(patientAddress)

// Get session statistics
getSessionStats()
```

---

## Web3 Integration

### 1. Connect Wallet

```javascript
async function connectWallet() {
  if (!window.ethereum) {
    alert('Please install MetaMask');
    return;
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    // Store provider and signer for later use
    window.provider = provider;
    window.signer = signer;

    return accounts[0];
  } catch (error) {
    console.error('Failed to connect wallet:', error);
  }
}
```

### 2. Initialize Contract

```javascript
async function initializeContract(contractAddress) {
  const abi = [
    // Contract ABI from AnonymousMentalHealth.sol
    // Include all function signatures
  ];

  const provider = window.provider;
  const signer = window.signer;

  const contract = new ethers.Contract(contractAddress, abi, signer);
  return contract;
}
```

### 3. Call Contract Functions

```javascript
// Register patient
async function registerPatient(anxiety, depression, stress) {
  try {
    const contract = window.contract;
    const tx = await contract.registerPatient(anxiety, depression, stress);
    const receipt = await tx.wait();

    console.log('Patient registered:', receipt.transactionHash);
    return receipt;
  } catch (error) {
    console.error('Registration failed:', error);
  }
}

// Start session
async function startSession(sessionType, severity) {
  try {
    const contract = window.contract;
    const tx = await contract.startCounselingSession(sessionType, severity);
    const receipt = await tx.wait();

    console.log('Session started:', receipt.transactionHash);
    return receipt;
  } catch (error) {
    console.error('Failed to start session:', error);
  }
}
```

---

## Frontend Features

### Patient Dashboard

#### 1. Registration Section
- Input mental health indicators (0-10 scale)
- Visual sliders for easy adjustment
- Real-time value display
- Encrypted storage confirmation

#### 2. Session Booking
- View available time slots
- Select session type
  - Anxiety Support
  - Depression Support
  - Stress Management
  - General Counseling
- Set severity level
- Book encrypted session

#### 3. Session Management
- View active session details
- Rate improvement after session
- Complete session with feedback
- Track session history

#### 4. Health Tracking
- Update mental health levels
- Monitor changes over time
- View improvement scores
- Track therapy progress

#### 5. Dashboard
- Total sessions completed
- Registration date
- Therapy plan status
- Progress statistics

### Counselor Dashboard

- View patient list
- Create therapy plans
- Assign session recommendations
- Set priority levels
- Monitor patient progress

### System Statistics

- Total sessions
- Average improvement scores
- Patient statistics
- System health status

---

## Error Handling

### Network Errors

```javascript
async function handleNetworkError(error) {
  if (error.code === 'NETWORK_ERROR') {
    console.error('Network connection failed');
    // Show user-friendly message
  }
}
```

### Transaction Errors

```javascript
async function handleTransactionError(error) {
  if (error.code === 'CALL_EXCEPTION') {
    console.error('Contract call failed:', error.message);
    // Parse error message for user feedback
  }
}
```

### MetaMask Errors

```javascript
// Handle user rejection
error.code === 4001 // User rejected request

// Handle unsupported network
error.code === 4902 // Network not added to MetaMask
```

---

## Data Encryption Flow

```
User Input (Plaintext)
    ↓
Frontend Validation
    ↓
Send to Smart Contract
    ↓
Smart Contract Encrypts (FHE.asEuint8)
    ↓
Grant Permissions (FHE.allowThis, FHE.allow)
    ↓
Store Encrypted on Blockchain
    ↓
Authorized User Decrypts
```

---

## Session Management Flow

```
Patient Registers
    ↓
Initial Health Data Encrypted
    ↓
Counselor Reviews
    ↓
Counselor Creates Therapy Plan
    ↓
Patient Books Session
    ↓
Session Active (Encrypted)
    ↓
Session Completed with Score
    ↓
Improvement Tracked
    ↓
Patient Updates Health Levels
```

---

## Security Considerations

### Frontend Security

1. **Never Store Private Keys**
   ```javascript
   // ❌ WRONG
   const privateKey = "0x...";

   // ✅ CORRECT
   // Let MetaMask handle private key management
   ```

2. **Validate User Input**
   ```javascript
   function validateHealthLevel(value) {
     const num = parseInt(value);
     if (num < 0 || num > 10) {
       throw new Error('Health level must be 0-10');
     }
     return num;
   }
   ```

3. **HTTPS Only in Production**
   ```
   https://yourapp.com
   // Never over http for production
   ```

4. **Content Security Policy**
   ```html
   <meta http-equiv="Content-Security-Policy"
         content="default-src 'self'; script-src 'self' https://unpkg.com;">
   ```

### Smart Contract Security

- All sensitive data encrypted before storage
- Access control enforced at contract level
- Input validation before encryption
- Emergency alert system without data exposure
- Role-based permissions

---

## Testing the Integration

### 1. Test on Local Network

```bash
# In terminal 1
npm run node

# In terminal 2
npm run deploy

# In browser
# Connect to http://localhost:8545
# Note the deployed contract address
```

### 2. Test on Testnet

```bash
# Update .env with testnet RPC
SEPOLIA_RPC_URL=https://rpc.sepolia.org

# Deploy to testnet
npx hardhat run scripts/deploy.ts --network sepolia

# Update frontend CONTRACT_ADDRESS
# Test with MetaMask connected to Sepolia
```

### 3. Manual Testing Checklist

- [ ] Connect wallet functionality
- [ ] Register patient with valid levels
- [ ] Reject invalid input (>10, <0)
- [ ] Prevent duplicate registration
- [ ] Start session successfully
- [ ] Complete session with score
- [ ] Update health levels
- [ ] View session history
- [ ] Emergency alert triggers
- [ ] Counselor functions work

---

## Advanced Features

### 1. Real-time Updates with WebSockets

```javascript
// Listen for contract events
contract.on('PatientRegistered', (patient, timestamp) => {
  console.log(`Patient ${patient} registered at ${timestamp}`);
  updateUI();
});

contract.on('SessionCompleted', (sessionId, patient, endTime) => {
  console.log(`Session ${sessionId} completed`);
  updateUI();
});

contract.on('EmergencyAlert', (patient, timestamp) => {
  console.log(`Emergency alert for ${patient}`);
  notifyUser();
});
```

### 2. Data Visualization

```javascript
// Chart.js example for progress tracking
function drawProgressChart(sessions) {
  const ctx = document.getElementById('progressChart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: sessions.map(s => s.date),
      datasets: [{
        label: 'Improvement Score',
        data: sessions.map(s => s.improvementScore),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    }
  });
}
```

### 3. Export Encrypted Data

```javascript
// Export session history as JSON
function exportSessions() {
  const sessions = window.sessionHistory;
  const json = JSON.stringify(sessions, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sessions.json';
  a.click();
}
```

---

## Performance Optimization

### 1. Batch Requests

```javascript
// Instead of multiple calls, batch them
async function getPatientData(patientAddress) {
  const [isRegistered, planStatus, sessionCount] = await Promise.all([
    contract.isPatientRegistered(patientAddress),
    contract.getTherapyPlanStatus(patientAddress),
    contract.getPatientSessionCount(patientAddress)
  ]);

  return { isRegistered, planStatus, sessionCount };
}
```

### 2. Cache Contract Calls

```javascript
const cache = {};

async function getCachedData(key, fetchFn) {
  if (cache[key]) {
    return cache[key];
  }

  const data = await fetchFn();
  cache[key] = data;

  // Invalidate cache after 5 minutes
  setTimeout(() => delete cache[key], 5 * 60 * 1000);

  return data;
}
```

### 3. Lazy Load Components

```javascript
// Only load when needed
async function loadCounselorPanel() {
  if (await isCounselor()) {
    const { showCounselorUI } = await import('./counselor.js');
    showCounselorUI();
  }
}
```

---

## Deployment

### Vercel Deployment

1. Create GitHub repository
2. Connect to Vercel
3. Deploy with environment variables:
   ```
   REACT_APP_CONTRACT_ADDRESS=0x...
   REACT_APP_RPC_URL=https://rpc.sepolia.org
   ```

### IPFS Deployment

```bash
# Install IPFS
npm install -g ipfs

# Add files
ipfs add -r .

# Get IPFS hash
# Access via https://gateway.ipfs.io/ipfs/<hash>
```

### Traditional Server

```bash
# Build and serve
npm run build
# Serve the build directory with HTTPS
```

---

## Troubleshooting

### MetaMask Connection Issues

```javascript
// Check if MetaMask is installed
if (!window.ethereum) {
  alert('Please install MetaMask extension');
}

// Check network
const network = await provider.getNetwork();
if (network.chainId !== 11155111) {
  alert('Please switch to Sepolia testnet');
}
```

### Transaction Failing

```javascript
// Check gas estimation
const gasEstimate = await contract.estimateGas.registerPatient(7, 5, 6);
console.log('Gas required:', gasEstimate.toString());

// Check balance
const balance = await provider.getBalance(userAddress);
console.log('User balance:', ethers.utils.formatEther(balance));
```

### Contract Not Responding

```javascript
// Verify contract address
console.log('Contract address:', CONTRACT_ADDRESS);

// Check contract exists
const code = await provider.getCode(CONTRACT_ADDRESS);
if (code === '0x') {
  console.error('Contract not found at address');
}
```

---

## Best Practices

1. **Always Validate User Input**
   - Check ranges before sending to contract
   - Validate addresses format
   - Validate data types

2. **Handle Errors Gracefully**
   - Show user-friendly messages
   - Log errors for debugging
   - Provide recovery options

3. **Manage User State**
   - Store connected wallet address
   - Track registration status
   - Cache user data appropriately

4. **Security First**
   - Never expose private keys
   - Use HTTPS in production
   - Validate contract responses
   - Implement rate limiting

5. **User Experience**
   - Show loading states
   - Provide clear feedback
   - Handle network changes
   - Support wallet disconnection

---

## Resources

- [Ethers.js Documentation](https://docs.ethers.org)
- [MetaMask Documentation](https://docs.metamask.io)
- [Web3 Best Practices](https://ethereum.org/developers/docs)
- [Smart Contract Security](https://docs.openzeppelin.com)

---

**Happy building! 🚀**
