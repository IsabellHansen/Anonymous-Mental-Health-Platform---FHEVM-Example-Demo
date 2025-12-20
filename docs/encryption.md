# Encryption

## Overview

Encryption is the foundation of FHEVM applications. This chapter demonstrates how to convert plaintext values to encrypted types and store them securely on-chain.

## Encrypted Value Storage

### Concept

In FHEVM, all sensitive data must be encrypted before storage. The `FHE.asEuint*()` functions convert plaintext values to their encrypted equivalents.

### Code Example

```solidity
// Convert plaintext to encrypted type
euint8 encryptedAnxiety = FHE.asEuint8(_anxietyLevel);
euint8 encryptedDepression = FHE.asEuint8(_depressionLevel);
euint8 encryptedStress = FHE.asEuint8(_stressLevel);

// Store encrypted data on-chain
patientProfiles[msg.sender].anxietyLevel = encryptedAnxiety;
patientProfiles[msg.sender].depressionLevel = encryptedDepression;
patientProfiles[msg.sender].stressLevel = encryptedStress;
```

### Available Encrypted Types

FHEVM provides several encrypted integer types:

| Type | Range | Use Case |
|------|-------|----------|
| `euint8` | 0-255 | Small values (health levels 0-10) |
| `euint16` | 0-65,535 | Medium values (scores, counts) |
| `euint32` | 0-4,294,967,295 | Large values (amounts, IDs) |
| `euint64` | Very large | Financial amounts, timestamps |

### What You Learn

- ✅ How to convert plaintext to encrypted types
- ✅ Storing encrypted data in contract state
- ✅ Understanding encrypted handle lifecycle
- ✅ Choosing appropriate encrypted types

## Multiple Value Encryption

### Concept

Real-world applications often need to encrypt multiple related values simultaneously.

### Code Example

```solidity
function registerPatient(
    uint8 _anxietyLevel,
    uint8 _depressionLevel,
    uint8 _stressLevel
) external {
    // Validate BEFORE encrypting
    require(_anxietyLevel <= 10 && _depressionLevel <= 10 && _stressLevel <= 10,
        "Levels must be 0-10");

    // Encrypt all values
    euint8 encryptedAnxiety = FHE.asEuint8(_anxietyLevel);
    euint8 encryptedDepression = FHE.asEuint8(_depressionLevel);
    euint8 encryptedStress = FHE.asEuint8(_stressLevel);

    // Store in structured format
    patientProfiles[msg.sender] = PatientProfile({
        anxietyLevel: encryptedAnxiety,
        depressionLevel: encryptedDepression,
        stressLevel: encryptedStress,
        isActive: true,
        registrationTime: block.timestamp
    });

    // Grant permissions (covered in Access Control chapter)
    FHE.allowThis(encryptedAnxiety);
    FHE.allowThis(encryptedDepression);
    FHE.allowThis(encryptedStress);

    FHE.allow(encryptedAnxiety, msg.sender);
    FHE.allow(encryptedDepression, msg.sender);
    FHE.allow(encryptedStress, msg.sender);
}
```

### Best Practices

1. **Validate Before Encrypting**
   ```solidity
   // ✅ Correct - validate first
   require(value <= 10, "Invalid value");
   euint8 encrypted = FHE.asEuint8(value);

   // ❌ Incorrect - wasteful
   euint8 encrypted = FHE.asEuint8(value);
   require(value <= 10, "Invalid value");
   ```

2. **Use Appropriate Types**
   ```solidity
   // ✅ Correct - use smallest type
   euint8 healthLevel = FHE.asEuint8(level);  // 0-10

   // ❌ Wasteful - type too large
   euint32 healthLevel = FHE.asEuint32(level);  // 0-10
   ```

3. **Structured Storage**
   ```solidity
   // ✅ Organized
   struct PatientProfile {
       euint8 anxietyLevel;
       euint8 depressionLevel;
       euint8 stressLevel;
       bool isActive;
       uint256 registrationTime;
   }
   ```

## Input Validation Before Encryption

### Why Validate First?

Validation before encryption:
- ✅ Saves gas (avoid encrypting invalid data)
- ✅ Provides clear error messages
- ✅ Prevents incorrect encrypted values
- ✅ Improves user experience

### Code Example

```solidity
function registerPatient(
    uint8 _anxietyLevel,
    uint8 _depressionLevel,
    uint8 _stressLevel
) external {
    // ✅ Step 1: Validate inputs
    require(!isPatientRegistered(msg.sender),
        "Patient already registered");

    require(_anxietyLevel <= 10 && _depressionLevel <= 10 && _stressLevel <= 10,
        "Levels must be 0-10");

    // ✅ Step 2: Now encrypt (knowing inputs are valid)
    euint8 encryptedAnxiety = FHE.asEuint8(_anxietyLevel);
    euint8 encryptedDepression = FHE.asEuint8(_depressionLevel);
    euint8 encryptedStress = FHE.asEuint8(_stressLevel);

    // ✅ Step 3: Store and grant permissions
    // ... storage code ...
}
```

### Common Validation Patterns

```solidity
// Range checking
require(value >= MIN && value <= MAX, "Out of range");

// Non-zero validation
require(value > 0, "Cannot be zero");

// Duplicate prevention
require(!exists[key], "Already exists");

// Permission checking
require(msg.sender == owner, "Unauthorized");
```

## Practical Example: Mental Health Registration

### Complete Function

```solidity
/// @notice Register as a patient with encrypted mental health levels
/// @dev All health indicators are encrypted before storage
/// @param _anxietyLevel Anxiety level (0-10)
/// @param _depressionLevel Depression level (0-10)
/// @param _stressLevel Stress level (0-10)
function registerPatient(
    uint8 _anxietyLevel,
    uint8 _depressionLevel,
    uint8 _stressLevel
) external {
    // Validation
    require(!isPatientRegistered(msg.sender),
        "Patient already registered");
    require(_anxietyLevel <= 10 && _depressionLevel <= 10 && _stressLevel <= 10,
        "Levels must be 0-10");

    // Encryption
    euint8 encryptedAnxiety = FHE.asEuint8(_anxietyLevel);
    euint8 encryptedDepression = FHE.asEuint8(_depressionLevel);
    euint8 encryptedStress = FHE.asEuint8(_stressLevel);

    // Storage
    patientProfiles[msg.sender] = PatientProfile({
        anxietyLevel: encryptedAnxiety,
        depressionLevel: encryptedDepression,
        stressLevel: encryptedStress,
        isActive: true,
        registrationTime: block.timestamp
    });

    // Permissions
    FHE.allowThis(encryptedAnxiety);
    FHE.allowThis(encryptedDepression);
    FHE.allowThis(encryptedStress);

    FHE.allow(encryptedAnxiety, msg.sender);
    FHE.allow(encryptedDepression, msg.sender);
    FHE.allow(encryptedStress, msg.sender);

    // Emergency detection
    _checkEmergencyLevel(_anxietyLevel, _depressionLevel, _stressLevel);

    // Event
    emit PatientRegistered(msg.sender, block.timestamp);
}
```

### What Makes This Secure?

1. **Input Validation** - Rejects invalid data early
2. **Encryption** - All sensitive data encrypted
3. **Access Control** - Proper permissions granted
4. **Emergency Detection** - Threshold checking without revealing values
5. **Event Logging** - Public notification without sensitive data

## Key Takeaways

### Do's ✅

- ✅ **Validate before encrypting** - Save gas and provide clear errors
- ✅ **Use smallest appropriate type** - `euint8` for 0-255, not `euint32`
- ✅ **Grant permissions immediately** - Call `FHE.allowThis()` and `FHE.allow()`
- ✅ **Organize with structs** - Group related encrypted values
- ✅ **Document encrypted fields** - Help developers understand

### Don'ts ❌

- ❌ **Don't encrypt invalid data** - Validate first
- ❌ **Don't use oversized types** - Wasteful and expensive
- ❌ **Don't forget permissions** - Contract won't work without them
- ❌ **Don't expose sensitive data** - Keep encrypted throughout
- ❌ **Don't use view functions** - Can't return encrypted values directly

## Next Steps

- Learn about [Access Control](access-control.md) to understand permission management
- Study [Anti-Patterns](anti-patterns.md) to avoid common mistakes
- Explore [User Decryption](user-decryption.md) to see how users access their data

## Test Yourself

Try implementing these exercises:

1. Create a function that encrypts a single value
2. Encrypt multiple values in a struct
3. Add input validation before encryption
4. Grant proper permissions to encrypted values
5. Write tests to verify encryption works correctly

---

[← Back to Summary](SUMMARY.md) | [Next: Access Control →](access-control.md)
