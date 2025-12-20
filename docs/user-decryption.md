# User Decryption

## Overview

User decryption allows patients to access their encrypted health data. This chapter demonstrates how to build secure decryption workflows where only authorized users can retrieve their sensitive information.

## Single Value Decryption

### Concept

After a user is granted permission via `FHE.allow()`, they can request decryption of a single encrypted value through a transaction or off-chain decryption.

### Code Example

```solidity
/// @notice Get patient's anxiety level (for authorized users only)
/// @dev Patient can only access their own data
function getAnxietyLevel(address _patient)
    external
    view
    returns (euint8)
{
    require(_patient == msg.sender || msg.sender == authorized_counselor,
        "Unauthorized access");

    PatientProfile storage profile = patientProfiles[_patient];
    return profile.anxietyLevel;
}
```

### Client-Side Decryption

```typescript
// Patient requests their encrypted health data
async function getPatientData(patientAddress) {
    const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
    );

    // Get the encrypted value (just the handle)
    const profile = await contract.patientProfiles(patientAddress);

    // Client-side decryption (user has permission)
    const decryptedAnxiety = await fhevm.decrypt(
        contractAddress,
        profile.anxietyLevel
    );

    return decryptedAnxiety;
}
```

### What You Learn

- ✅ How to read encrypted values from storage
- ✅ Permission validation on the contract
- ✅ Client-side decryption workflow
- ✅ Private data access patterns

## Updating Encrypted Values

### Concept

Users can update their encrypted data with new values while maintaining privacy.

### Code Example

```solidity
/// @notice Update mental health levels
/// @dev Only registered patients can update their own data
function updateMentalHealthLevels(
    uint8 _anxietyLevel,
    uint8 _depressionLevel,
    uint8 _stressLevel
) external onlyRegisteredPatient {
    // Validate inputs
    require(_anxietyLevel <= 10 && _depressionLevel <= 10 && _stressLevel <= 10,
        "Levels must be 0-10");

    // Encrypt new values
    euint8 newAnxiety = FHE.asEuint8(_anxietyLevel);
    euint8 newDepression = FHE.asEuint8(_depressionLevel);
    euint8 newStress = FHE.asEuint8(_stressLevel);

    // Update storage with new encrypted values
    patientProfiles[msg.sender].anxietyLevel = newAnxiety;
    patientProfiles[msg.sender].depressionLevel = newDepression;
    patientProfiles[msg.sender].stressLevel = newStress;
    patientProfiles[msg.sender].lastUpdateTime = block.timestamp;

    // Grant permissions
    FHE.allowThis(newAnxiety);
    FHE.allowThis(newDepression);
    FHE.allowThis(newStress);

    FHE.allow(newAnxiety, msg.sender);
    FHE.allow(newDepression, msg.sender);
    FHE.allow(newStress, msg.sender);

    emit MentalHealthUpdated(msg.sender, block.timestamp);
}
```

### Update Transaction Flow

```
1. Patient submits transaction with plaintext values
   ↓
2. Contract validates inputs
   ↓
3. Contract encrypts values
   ↓
4. Contract grants permissions (allowThis + allow)
   ↓
5. Contract stores encrypted values
   ↓
6. Patient can now decrypt and view updated data
```

## Patient Profile Retrieval

### Public Profile Status

```solidity
/// @notice Check if patient is registered
/// @dev Public view function (no encrypted data)
function isPatientRegistered(address _patient)
    external
    view
    returns (bool)
{
    return patientProfiles[_patient].isActive;
}

/// @notice Get non-sensitive patient info
/// @dev Registration time is public
function getRegistrationTime(address _patient)
    external
    view
    returns (uint256)
{
    return patientProfiles[_patient].registrationTime;
}
```

### Private Profile Access

```solidity
/// @notice Get full patient profile (encrypted data)
/// @dev Only patient can call this
function getPatientProfile(address _patient)
    external
    view
    onlyPatientOrCounselor(_patient)
    returns (PatientProfile memory)
{
    return patientProfiles[_patient];
}

/// @notice Verify patient has permission to access
modifier onlyPatientOrCounselor(address _patient) {
    require(
        msg.sender == _patient ||
        msg.sender == patient_counselor[_patient],
        "Only patient or counselor can access"
    );
    _;
}
```

## Decryption with Proof

### Concept

For sensitive operations, users can provide proof of ownership before decryption is granted.

### Code Example

```solidity
/// @notice Request decryption with proof of ownership
/// @dev Patient proves they own the data before decryption
function requestDecryption(
    address _patient,
    bytes calldata _ownershipProof
) external {
    require(msg.sender == _patient, "Only data owner can request");

    // Verify proof (simplified example)
    require(_ownershipProof.length > 0, "Invalid proof");

    // Grant decryption permission
    PatientProfile storage profile = patientProfiles[_patient];

    FHE.allow(profile.anxietyLevel, msg.sender);
    FHE.allow(profile.depressionLevel, msg.sender);
    FHE.allow(profile.stressLevel, msg.sender);

    emit DecryptionApproved(_patient, block.timestamp);
}
```

## Multiple Value Decryption

### Batch Retrieval

```solidity
/// @notice Get all encrypted health metrics
/// @dev Returns all encrypted values in one struct
function getAllHealthMetrics(address _patient)
    external
    view
    onlyPatient(_patient)
    returns (HealthMetrics memory)
{
    return HealthMetrics({
        anxiety: patientProfiles[_patient].anxietyLevel,
        depression: patientProfiles[_patient].depressionLevel,
        stress: patientProfiles[_patient].stressLevel,
        lastUpdate: patientProfiles[_patient].lastUpdateTime
    });
}
```

### Client-Side Batch Decryption

```typescript
async function getFullHealthProfile(patientAddress) {
    const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
    );

    // Fetch all encrypted metrics
    const metrics = await contract.getAllHealthMetrics(patientAddress);

    // Decrypt each value client-side
    const decrypted = {
        anxiety: await fhevm.decrypt(contractAddress, metrics.anxiety),
        depression: await fhevm.decrypt(contractAddress, metrics.depression),
        stress: await fhevm.decrypt(contractAddress, metrics.stress),
        lastUpdate: metrics.lastUpdate
    };

    return decrypted;
}
```

## Privacy Guarantees

### What's Encrypted?

- ✅ Anxiety level (euint8)
- ✅ Depression level (euint8)
- ✅ Stress level (euint8)

### What's Public?

- ❌ Registration status (bool)
- ❌ Registration timestamp (uint256)
- ❌ Last update timestamp (uint256)
- ❌ Counselor address (if assigned)

### Access Control

```solidity
// Only patient can decrypt their own data
require(msg.sender == patient, "Only patient");

// Counselor can decrypt assigned patient's data
require(patient_counselor[patient] == msg.sender, "Not assigned counselor");

// No one else has access
require(false, "Unauthorized");  // Would revert for anyone else
```

## Secure Decryption Pattern

### Complete Workflow

```solidity
/// @notice Secure patient data access workflow
function secureGetPatientHealth(address _patient)
    external
    view
    returns (uint8, uint8, uint8)
{
    // Step 1: Verify caller has permission
    require(
        msg.sender == _patient ||
        msg.sender == patient_counselor[_patient],
        "Unauthorized"
    );

    // Step 2: Check patient is active
    require(patientProfiles[_patient].isActive,
        "Patient not registered");

    // Step 3: Return encrypted values
    // Client will decrypt these using their private key
    PatientProfile storage profile = patientProfiles[_patient];
    return (
        profile.anxietyLevel,
        profile.depressionLevel,
        profile.stressLevel
    );
}
```

### Client-Side Implementation

```typescript
async function secureDecryption(patientAddress) {
    // 1. Check if user has permission
    const canAccess = await contract.canAccess(patientAddress);
    if (!canAccess) {
        throw new Error("Access denied");
    }

    // 2. Request encrypted data
    const [anxiety, depression, stress] =
        await contract.secureGetPatientHealth(patientAddress);

    // 3. Decrypt client-side
    const decrypted = {
        anxiety: await fhevm.decrypt(contractAddress, anxiety),
        depression: await fhevm.decrypt(contractAddress, depression),
        stress: await fhevm.decrypt(contractAddress, stress)
    };

    return decrypted;
}
```

## Key Takeaways

### User Decryption Pattern ✅

1. **Grant Permission** - Contract calls `FHE.allow(value, userAddress)`
2. **User Requests** - User calls view function or transaction
3. **Client Decrypts** - User's client decrypts using their key
4. **User Sees Data** - Decrypted value remains on user's device

### Security Benefits ✅

- ✅ Only authorized users can decrypt
- ✅ Contract never stores plaintext
- ✅ Decryption happens client-side
- ✅ User's private key never exposed to contract

### Privacy Guarantees ✅

- ✅ On-chain data always encrypted
- ✅ Observers can't see health metrics
- ✅ Only authorized access possible
- ✅ Audit trail through events

## Practice Exercises

1. Implement a view function that returns encrypted patient data
2. Add permissions for both patient and counselor
3. Create a client-side decryption function
4. Handle decryption errors gracefully
5. Implement audit logging of access

## Next Steps

- Learn [Public Decryption](public-decryption.md) for emergency alerts
- Study [Encrypted Workflows](encrypted-workflows.md) for complex operations
- Review [Security](security.md) for validation patterns

---

[← Back to Summary](SUMMARY.md) | [Next: Public Decryption →](public-decryption.md)
