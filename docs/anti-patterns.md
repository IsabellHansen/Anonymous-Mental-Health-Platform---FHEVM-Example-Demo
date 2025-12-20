# Anti-Patterns

## Overview

This chapter demonstrates **common mistakes to avoid** when developing FHEVM applications. Learning what NOT to do is as important as learning best practices.

## Anti-Pattern 1: Missing FHE.allowThis()

### The Mistake

```solidity
// ❌ WRONG: Forgot FHE.allowThis()
function registerPatient(
    uint8 _anxietyLevel,
    uint8 _depressionLevel,
    uint8 _stressLevel
) external {
    euint8 anxiety = FHE.asEuint8(_anxietyLevel);
    euint8 depression = FHE.asEuint8(_depressionLevel);
    euint8 stress = FHE.asEuint8(_stressLevel);

    // Storing without permissions
    patientProfiles[msg.sender] = PatientProfile({
        anxietyLevel: anxiety,
        depressionLevel: depression,
        stressLevel: stress,
        isActive: true,
        registrationTime: block.timestamp
    });

    // ERROR: Contract can't use this data without FHE.allowThis()
    _checkEmergencyLevel(_anxietyLevel, _depressionLevel, _stressLevel);
}
```

### Why It's Wrong

- ❌ Contract has no permission to use encrypted values
- ❌ Conditions checking encrypted values will revert
- ❌ Storage succeeds, but operations fail later
- ❌ Hard to debug

### The Fix

```solidity
// ✅ CORRECT: Grant contract permission first
function registerPatient(
    uint8 _anxietyLevel,
    uint8 _depressionLevel,
    uint8 _stressLevel
) external {
    euint8 anxiety = FHE.asEuint8(_anxietyLevel);
    euint8 depression = FHE.asEuint8(_depressionLevel);
    euint8 stress = FHE.asEuint8(_stressLevel);

    // ✅ Grant contract permissions immediately
    FHE.allowThis(anxiety);
    FHE.allowThis(depression);
    FHE.allowThis(stress);

    // ✅ Grant user permissions
    FHE.allow(anxiety, msg.sender);
    FHE.allow(depression, msg.sender);
    FHE.allow(stress, msg.sender);

    // Now everything works
    patientProfiles[msg.sender] = PatientProfile({
        anxietyLevel: anxiety,
        depressionLevel: depression,
        stressLevel: stress,
        isActive: true,
        registrationTime: block.timestamp
    });

    _checkEmergencyLevel(_anxietyLevel, _depressionLevel, _stressLevel);
}
```

### How to Avoid It

Create a mental checklist:

1. Create encrypted value
2. ✅ Call `FHE.allowThis()`
3. ✅ Call `FHE.allow()` if user needs access
4. Use the value

## Anti-Pattern 2: Encrypted Values in View Functions

### The Mistake

```solidity
// ❌ WRONG: Returning encrypted values from view function
function getPatientProfile(address _patient)
    external
    view
    returns (euint8, euint8, euint8)
{
    PatientProfile storage profile = patientProfiles[_patient];
    // ERROR: Cannot return encrypted types from view function
    return (profile.anxietyLevel, profile.depressionLevel, profile.stressLevel);
}
```

### Why It's Wrong

- ❌ View functions are deterministic and static
- ❌ Encrypted values have no way to leave the contract securely
- ❌ Violates FHE security model
- ❌ Transaction will revert

### The Correct Approach

```solidity
// ✅ CORRECT: Request decryption through transaction
function requestPatientProfile(address _patient) external {
    require(msg.sender == _patient || msg.sender == patient_counselor[_patient],
        "Unauthorized");

    emit DecryptionRequested(_patient, msg.sender, block.timestamp);
}

// User decrypts client-side using the handle
// Then they can view their data
```

## Anti-Pattern 3: Signer Mismatch in Encryption

### The Mistake (Client-Side)

```typescript
// ❌ WRONG: Mismatched signers
const signer1 = ethers.Wallet.createRandom();
const signer2 = ethers.Wallet.createRandom();

// Encrypt for signer1
const encrypted = await fhevm
    .createEncryptedInput(contractAddress, signer1.address)
    .add32(secret)
    .encrypt();

// Try to use with signer2
const tx = await contract
    .connect(signer2)  // ← Wrong signer!
    .updateSecret(encrypted.handles[0], encrypted.inputProof);
```

### Why It's Wrong

- ❌ Signer mismatch causes verification failure
- ❌ Input proof is bound to specific signer
- ❌ Transaction reverts unexpectedly
- ❌ Hard to debug

### The Fix

```typescript
// ✅ CORRECT: Matching signers
const signer = ethers.Wallet.createRandom();

// Encrypt for the correct signer
const encrypted = await fhevm
    .createEncryptedInput(contractAddress, signer.address)
    .add32(secret)
    .encrypt();

// Use the same signer
const tx = await contract
    .connect(signer)  // ← Same signer
    .updateSecret(encrypted.handles[0], encrypted.inputProof);
```

## Anti-Pattern 4: Checking Unencrypted Plaintext

### The Mistake

```solidity
// ❌ WRONG: Revealing plaintext for access control
function updateHealthLevel(
    uint8 _level,  // ← Plaintext input!
    bytes calldata _proof
) external {
    // The plaintext is visible, defeating privacy
    require(_level <= 10, "Invalid level");

    euint8 encrypted = FHE.asEuint8(_level);
    // ... rest of function
}
```

### Why It's Wrong

- ❌ Plaintext value visible in transaction
- ❌ Blockchain observers see the input
- ❌ Defeats purpose of privacy
- ❌ No confidentiality guarantees

### Partial Solution

```solidity
// ⚠️ BETTER: Validate before processing
function updateHealthLevel(
    uint8 _level,
    bytes calldata _proof
) external {
    // Validate plaintext inputs before encrypting
    require(_level <= 10, "Invalid level");

    euint8 encrypted = FHE.asEuint8(_level);
    // ... rest of function
}

// NOTE: For true privacy, use encrypted inputs
// See FHEVM documentation for advanced patterns
```

## Anti-Pattern 5: Wasting Gas on Type Conversion

### The Mistake

```solidity
// ❌ WRONG: Excessive gas usage
function registerPatient(
    uint8 _anxiety,
    uint8 _depression,
    uint8 _stress
) external {
    // Converting 0-10 values to euint32 is wasteful
    euint32 anxiety = FHE.asEuint32(uint32(_anxiety));
    euint32 depression = FHE.asEuint32(uint32(_depression));
    euint32 stress = FHE.asEuint32(uint32(_stress));

    // This is much more expensive than needed
    // ...
}
```

### Why It's Wrong

- ❌ Oversized types cost more gas
- ❌ Wastes storage space
- ❌ Slower operations
- ❌ No benefit for small values

### The Fix

```solidity
// ✅ CORRECT: Appropriate types
function registerPatient(
    uint8 _anxiety,
    uint8 _depression,
    uint8 _stress
) external {
    // Use smallest appropriate type
    euint8 anxiety = FHE.asEuint8(_anxiety);      // 0-255 is enough
    euint8 depression = FHE.asEuint8(_depression);  // 0-255 is enough
    euint8 stress = FHE.asEuint8(_stress);        // 0-255 is enough

    // Much cheaper and sufficient
    // ...
}
```

### Type Selection Guide

```solidity
// Values 0-255?       → euint8
// Values 0-65,535?    → euint16
// Values 0-4B?        → euint32
// Very large values?  → euint64

// Health levels (0-10)  → euint8
// Scores (0-100)       → euint8
// Counts (0-1000)      → euint16
// Amounts (ETH, USD)   → euint32/euint64
```

## Anti-Pattern 6: Not Validating Before Encrypting

### The Mistake

```solidity
// ❌ WRONG: Encrypt first, validate after
function createSession(
    uint8 _sessionType,
    uint8 _severity
) external {
    // Encrypt immediately
    euint8 type = FHE.asEuint8(_sessionType);
    euint8 severity = FHE.asEuint8(_severity);

    FHE.allowThis(type);
    FHE.allowThis(severity);

    // Then validate
    require(_sessionType <= 3, "Invalid type");  // ← Too late!
    require(_severity <= 10, "Invalid severity");

    // Invalid data is already encrypted and stored
}
```

### Why It's Wrong

- ❌ Wastes gas encrypting invalid data
- ❌ Stores invalid encrypted values
- ❌ Error handling is confused
- ❌ Transactions partially complete

### The Fix

```solidity
// ✅ CORRECT: Validate first
function createSession(
    uint8 _sessionType,
    uint8 _severity
) external {
    // Validate before encrypting
    require(_sessionType <= 3, "Invalid type");
    require(_severity <= 10, "Invalid severity");

    // Only encrypt if valid
    euint8 type = FHE.asEuint8(_sessionType);
    euint8 severity = FHE.asEuint8(_severity);

    FHE.allowThis(type);
    FHE.allowThis(severity);
    FHE.allow(type, msg.sender);
    FHE.allow(severity, msg.sender);

    // Store validated, encrypted data
}
```

## Anti-Pattern 7: Permission Timing Issues

### The Mistake

```solidity
// ❌ WRONG: Granting permissions at wrong time
function emergencyUpdate(
    uint8 _newLevel,
    uint8 _trigger
) external onlyAuthorized {
    euint8 newLevel = FHE.asEuint8(_newLevel);
    euint8 trigger = FHE.asEuint8(_trigger);

    // Use the data BEFORE granting permissions
    if (FHE.eq(trigger, FHE.asEuint8(1))) {  // ← ERROR: No permission yet!
        patientProfiles[msg.sender].level = newLevel;
    }

    // Grant permissions too late
    FHE.allowThis(newLevel);
    FHE.allowThis(trigger);
}
```

### Why It's Wrong

- ❌ Contract tries to use encrypted values without permission
- ❌ Condition evaluation fails
- ❌ Hard to understand the error
- ❌ Operations don't execute

### The Fix

```solidity
// ✅ CORRECT: Permissions first
function emergencyUpdate(
    uint8 _newLevel,
    uint8 _trigger
) external onlyAuthorized {
    euint8 newLevel = FHE.asEuint8(_newLevel);
    euint8 trigger = FHE.asEuint8(_trigger);

    // Grant permissions FIRST
    FHE.allowThis(newLevel);
    FHE.allowThis(trigger);

    // NOW use the data
    if (FHE.eq(trigger, FHE.asEuint8(1))) {  // ← Works!
        patientProfiles[msg.sender].level = newLevel;
    }

    FHE.allow(newLevel, msg.sender);
}
```

## Anti-Pattern Summary

### Quick Reference

| Anti-Pattern | Symptom | Solution |
|---|---|---|
| Missing `FHE.allowThis()` | Operation reverts | Always call immediately after creating encrypted value |
| Encrypted in view function | Doesn't compile | Use transaction-based decryption |
| Signer mismatch | Input proof verification fails | Use same signer for encrypt and call |
| Oversized types | High gas costs | Use smallest appropriate type |
| Validating after encrypt | Wasted gas | Validate plaintext first |
| Late permission grants | Operation reverts | Grant permissions before using |

## Debugging Checklist

If your code isn't working:

1. ✅ **Are you calling `FHE.allowThis()`?**
   - After every encrypted value creation
   - Before any operations on that value

2. ✅ **Are signers matched?**
   - Encryption signer = transaction signer
   - Input proof bound to correct address

3. ✅ **Are types appropriate?**
   - Using smallest type for your value range
   - Not oversizing unnecessarily

4. ✅ **Are inputs validated?**
   - Before encryption
   - With clear error messages

5. ✅ **Are permissions granted correctly?**
   - Contract: `FHE.allowThis()`
   - Users: `FHE.allow(value, address)`

## Key Takeaways

### Remember ✅

- Always grant permissions immediately
- Validate before encrypting
- Match signers in encryption/calls
- Use appropriate types
- Keep encrypted data safe

### Never ❌

- Return encrypted values from view functions
- Use unmatched signers
- Forget `FHE.allowThis()`
- Encrypt invalid data
- Reveal plaintext publicly

## Next Steps

- Study [Security](security.md) for validation patterns
- Learn [User Decryption](user-decryption.md) for proper data access
- Review test cases showing these patterns

---

[← Back to Summary](SUMMARY.md) | [Next: Security →](security.md)
