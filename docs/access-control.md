# Access Control

## Overview

Access control is critical for FHEVM applications. This chapter demonstrates how to grant permissions for encrypted data using `FHE.allowThis()` and `FHE.allow()`.

## FHE.allowThis() - Contract Permissions

### Concept

`FHE.allowThis()` grants the smart contract permission to use encrypted data. **Without this call, the contract cannot perform any operations on encrypted values.**

### Why It's Required

In FHE, encrypted data is cryptographically sealed. Only explicitly authorized parties can work with it. The contract itself is treated as a distinct entity that must be authorized.

### Code Example

```solidity
function registerPatient(
    uint8 _anxietyLevel,
    uint8 _depressionLevel,
    uint8 _stressLevel
) external {
    // Convert to encrypted types
    euint8 encryptedAnxiety = FHE.asEuint8(_anxietyLevel);
    euint8 encryptedDepression = FHE.asEuint8(_depressionLevel);
    euint8 encryptedStress = FHE.asEuint8(_stressLevel);

    // ✅ CRITICAL: Grant contract permissions
    FHE.allowThis(encryptedAnxiety);
    FHE.allowThis(encryptedDepression);
    FHE.allowThis(encryptedStress);

    // Now the contract can use these values
    patientProfiles[msg.sender] = PatientProfile({
        anxietyLevel: encryptedAnxiety,
        depressionLevel: encryptedDepression,
        stressLevel: encryptedStress,
        isActive: true,
        registrationTime: block.timestamp
    });
}
```

### When to Call It

Call `FHE.allowThis()`:
- ✅ After creating encrypted values
- ✅ After performing FHE operations
- ✅ After decryption operations
- ✅ Before storing encrypted data

### What It Enables

After calling `FHE.allowThis()`, the contract can:
- ✅ Store encrypted values
- ✅ Compare encrypted values
- ✅ Perform arithmetic operations
- ✅ Trigger conditions based on encrypted data
- ✅ Emit events with encrypted handles

## FHE.allow() - User Permissions

### Concept

`FHE.allow()` grants specific users permission to decrypt values. This enables **selective data sharing** - only authorized addresses can access encrypted data.

### Code Example

```solidity
/// @notice Update patient's mental health levels
/// @dev Grants both contract and patient access
function updateMentalHealthLevels(
    uint8 _anxietyLevel,
    uint8 _depressionLevel,
    uint8 _stressLevel
) external onlyRegisteredPatient {
    // Encrypt new values
    euint8 newAnxiety = FHE.asEuint8(_anxietyLevel);
    euint8 newDepression = FHE.asEuint8(_depressionLevel);
    euint8 newStress = FHE.asEuint8(_stressLevel);

    // Update storage
    patientProfiles[msg.sender].anxietyLevel = newAnxiety;
    patientProfiles[msg.sender].depressionLevel = newDepression;
    patientProfiles[msg.sender].stressLevel = newStress;

    // Grant both permissions
    FHE.allowThis(newAnxiety);
    FHE.allowThis(newDepression);
    FHE.allowThis(newStress);

    // Patient can decrypt their own data
    FHE.allow(newAnxiety, msg.sender);
    FHE.allow(newDepression, msg.sender);
    FHE.allow(newStress, msg.sender);

    emit MentalHealthUpdated(msg.sender, block.timestamp);
}
```

### Multi-Party Access

Grant access to multiple parties:

```solidity
/// @notice Create therapy plan (counselor only)
function createTherapyPlan(
    address _patient,
    uint8 _maxSessions,
    uint256 _duration
) external onlyCounselor patientExists(_patient) {
    // Encrypt therapy parameters
    euint8 encryptedMaxSessions = FHE.asEuint8(_maxSessions);

    // Store therapy plan
    therapyPlans[_patient] = TherapyPlan({
        maxSessions: encryptedMaxSessions,
        createdAt: block.timestamp,
        planActive: true
    });

    // Permissions: Contract + Patient + Counselor
    FHE.allowThis(encryptedMaxSessions);
    FHE.allow(encryptedMaxSessions, _patient);      // Patient sees plan
    FHE.allow(encryptedMaxSessions, msg.sender);     // Counselor manages it

    emit TherapyPlanCreated(_patient, msg.sender);
}
```

### Permission Patterns

#### Patient-Only Access
```solidity
FHE.allowThis(encryptedData);
FHE.allow(encryptedData, patientAddress);
```

#### Counselor Access
```solidity
FHE.allowThis(encryptedData);
FHE.allow(encryptedData, msg.sender);  // Current counselor
```

#### Dual Access (Patient + Counselor)
```solidity
FHE.allowThis(encryptedData);
FHE.allow(encryptedData, patientAddress);
FHE.allow(encryptedData, counselorAddress);
```

#### No User Access (Contract Only)
```solidity
FHE.allowThis(encryptedData);
// No FHE.allow() calls - only contract can use this
```

## Complete Example: Patient Journey

### Registration with Permissions

```solidity
function registerPatient(
    uint8 _anxietyLevel,
    uint8 _depressionLevel,
    uint8 _stressLevel
) external {
    require(!isPatientRegistered(msg.sender),
        "Already registered");
    require(_anxietyLevel <= 10 && _depressionLevel <= 10 && _stressLevel <= 10,
        "Levels must be 0-10");

    // Encryption
    euint8 anxiety = FHE.asEuint8(_anxietyLevel);
    euint8 depression = FHE.asEuint8(_depressionLevel);
    euint8 stress = FHE.asEuint8(_stressLevel);

    // Storage
    patientProfiles[msg.sender] = PatientProfile({
        anxietyLevel: anxiety,
        depressionLevel: depression,
        stressLevel: stress,
        isActive: true,
        registrationTime: block.timestamp
    });

    // ✅ Contract permissions (mandatory)
    FHE.allowThis(anxiety);
    FHE.allowThis(depression);
    FHE.allowThis(stress);

    // ✅ Patient permissions (selective access)
    FHE.allow(anxiety, msg.sender);
    FHE.allow(depression, msg.sender);
    FHE.allow(stress, msg.sender);

    // Emergency check uses encrypted values
    _checkEmergencyLevel(_anxietyLevel, _depressionLevel, _stressLevel);
}
```

### Therapy Plan with Dual Access

```solidity
function createTherapyPlan(
    address _patient,
    uint8 _maxSessions,
    uint256 _duration
) external onlyCounselor patientExists(_patient) {
    require(_maxSessions > 0, "Sessions must be > 0");

    euint8 maxSessions = FHE.asEuint8(_maxSessions);

    therapyPlans[_patient] = TherapyPlan({
        maxSessions: maxSessions,
        createdAt: block.timestamp,
        planActive: true
    });

    // Permissions: Both contract and dual users
    FHE.allowThis(maxSessions);          // Contract
    FHE.allow(maxSessions, _patient);     // Patient views
    FHE.allow(maxSessions, msg.sender);   // Counselor manages
}
```

## Access Control Patterns

### Pattern 1: Private Data (Contract Only)

```solidity
euint32 privateCounter = FHE.asEuint32(value);
FHE.allowThis(privateCounter);
// No FHE.allow() - only contract can use
```

**Use Case:** Internal counters, temporary calculations

### Pattern 2: User-Owned Data

```solidity
euint8 userValue = FHE.asEuint8(value);
FHE.allowThis(userValue);
FHE.allow(userValue, msg.sender);  // Only user can decrypt
```

**Use Case:** Personal health metrics, private balances

### Pattern 3: Shared Data

```solidity
euint8 sharedValue = FHE.asEuint8(value);
FHE.allowThis(sharedValue);
FHE.allow(sharedValue, user1);  // User 1
FHE.allow(sharedValue, user2);  // User 2
```

**Use Case:** Multi-party agreements, shared records

### Pattern 4: Role-Based Access

```solidity
euint32 therapyData = FHE.asEuint32(value);
FHE.allowThis(therapyData);

// Patient can view
FHE.allow(therapyData, patient);

// Counselor can view
FHE.allow(therapyData, counselor);

// Doctor has full access
FHE.allow(therapyData, doctor);
```

**Use Case:** Healthcare systems with multiple roles

## Key Takeaways

### Permission Checklist ✅

- ✅ **Always call FHE.allowThis()** - Contract needs permission
- ✅ **Call FHE.allow() for users** - Grant selective access
- ✅ **Grant immediately** - After creating/modifying encrypted values
- ✅ **Document permissions** - Explain who can access what
- ✅ **Use consistent patterns** - Predictable permission grants

### Common Mistakes ❌

- ❌ **Forgetting FHE.allowThis()** - Contract can't operate
- ❌ **Missing FHE.allow()** - Users can't decrypt
- ❌ **Granting too much access** - Excess FHE.allow() calls
- ❌ **Late permission grants** - Call before using values
- ❌ **Not documenting** - Unclear who can access what

## Practice Exercise

Implement the following with proper permissions:

```solidity
// Grant patient access to their profile
function getPatientProfile(address _patient)
    external
    view
    onlyAuthorized(_patient)
    returns (PatientProfile memory)
{
    // This should work because we granted permission in registerPatient()
}

// Grant counselor access to therapy plan
function getTherapyPlan(address _patient)
    external
    view
    onlyCounselor
    returns (TherapyPlan memory)
{
    // This should work because we granted counselor permission
}
```

## Next Steps

- Understand [Anti-Patterns](anti-patterns.md) - Common permission mistakes
- Learn [User Decryption](user-decryption.md) - How users access their data
- Study [Public Decryption](public-decryption.md) - Emergency alerting patterns

---

[← Back to Summary](SUMMARY.md) | [Next: Anti-Patterns →](anti-patterns.md)
