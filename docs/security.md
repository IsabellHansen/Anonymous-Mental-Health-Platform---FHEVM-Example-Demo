# Security

## Overview

Security patterns for FHEVM applications focus on input validation, access control, and maintaining encryption integrity.

## Input Validation

### Validate Before Encrypting

```solidity
/// @notice Register patient with validated inputs
function registerPatient(
    uint8 _anxietyLevel,
    uint8 _depressionLevel,
    uint8 _stressLevel
) external {
    // ✅ Validate BEFORE encrypting
    require(!isPatientRegistered(msg.sender),
        "Patient already registered");

    require(_anxietyLevel <= 10 && _depressionLevel <= 10 && _stressLevel <= 10,
        "Levels must be 0-10");

    // Only encrypt valid inputs
    euint8 anxiety = FHE.asEuint8(_anxietyLevel);
    euint8 depression = FHE.asEuint8(_depressionLevel);
    euint8 stress = FHE.asEuint8(_stressLevel);

    // ... rest of function
}
```

### Range Checking

```solidity
// Mental health levels: 0-10
require(level >= 0 && level <= 10, "Level must be 0-10");

// Session types: 0-3
require(sessionType <= 3, "Invalid session type");

// Duration: must be positive
require(duration > 0, "Duration must be positive");

// Addresses: cannot be zero address
require(address_param != address(0), "Invalid address");
```

### Duplicate Prevention

```solidity
/// @notice Register patient (prevent duplicates)
function registerPatient(
    uint8 _anxietyLevel,
    uint8 _depressionLevel,
    uint8 _stressLevel
) external {
    // Prevent re-registration
    require(!isPatientRegistered(msg.sender),
        "Already registered");

    // ... encryption and storage ...

    patientProfiles[msg.sender].isActive = true;
}

/// @notice Helper function
function isPatientRegistered(address _patient)
    internal
    view
    returns (bool)
{
    return patientProfiles[_patient].isActive;
}
```

## Access Control

### Modifier-Based Access Control

```solidity
/// @notice Restrict to registered patients
modifier onlyRegisteredPatient() {
    require(isPatientRegistered(msg.sender),
        "Patient not registered");
    _;
}

/// @notice Restrict to authorized counselor
modifier onlyCounselor() {
    require(isCounselor(msg.sender),
        "Not authorized counselor");
    _;
}

/// @notice Restrict to patient or their counselor
modifier onlyPatientOrCounselor(address _patient) {
    require(
        msg.sender == _patient ||
        msg.sender == patient_counselor[_patient],
        "Unauthorized access"
    );
    _;
}
```

### Role-Based Access

```solidity
// Patient roles
mapping(address => bool) public patients;

// Counselor roles
mapping(address => bool) public counselors;

// Doctor roles
mapping(address => bool) public doctors;

// Patient assignments
mapping(address => address) public patient_counselor;
mapping(address => address) public patient_doctor;

/// @notice Verify role
function isCounselor(address _address) public view returns (bool) {
    return counselors[_address];
}

function isDoctor(address _address) public view returns (bool) {
    return doctors[_address];
}
```

## Permission Management

### Proper Permission Granting

```solidity
/// @notice Grant permissions correctly
function _grantPermissions(euint8 value, address user) private {
    // Contract permission (mandatory)
    FHE.allowThis(value);

    // User permission (if needed)
    if (user != address(0)) {
        FHE.allow(value, user);
    }
}

/// @notice Grant dual permissions (patient + counselor)
function _grantDualPermissions(
    euint8 value,
    address patient,
    address counselor
) private {
    FHE.allowThis(value);
    FHE.allow(value, patient);

    if (counselor != address(0)) {
        FHE.allow(value, counselor);
    }
}
```

## Error Handling

### Comprehensive Error Messages

```solidity
// ✅ Good: Clear, specific error messages
require(msg.sender == owner, "Only owner can call this");
require(amount > 0, "Amount must be greater than zero");
require(newValue <= MAX_VALUE, "Value exceeds maximum");

// ❌ Bad: Generic or missing error messages
require(condition);  // No message
require(condition, "Error");  // Too vague
```

### Revert Conditions

```solidity
/// @notice Check session availability
function startCounselingSession(
    uint8 _sessionType,
    uint8 _severity
) external onlyRegisteredPatient {
    // Check capacity
    require(
        totalSessions < MAX_CONCURRENT_SESSIONS,
        "No session slots available"
    );

    // Check patient status
    require(
        patientProfiles[msg.sender].isActive,
        "Patient account inactive"
    );

    // Check break time
    uint256 lastSessionTime = patientLastSessionTime[msg.sender];
    require(
        block.timestamp >= lastSessionTime + SESSION_BREAK_PERIOD,
        "Must wait before next session"
    );

    // ... continue with session creation
}
```

## Encryption Security

### Safe Encryption Patterns

```solidity
// ✅ Correct pattern
uint8 plaintext = 7;
require(plaintext <= 10, "Invalid value");
euint8 encrypted = FHE.asEuint8(plaintext);
FHE.allowThis(encrypted);
FHE.allow(encrypted, msg.sender);

// ❌ Incorrect: No validation
uint8 plaintext = 7;
euint8 encrypted = FHE.asEuint8(plaintext);
// Missing allowThis and allow!
```

### Avoiding Plaintext Leaks

```solidity
// ❌ Bad: Plaintext visible in event
event HealthUpdate(address indexed patient, uint8 level);

// ✅ Better: Generic event without values
event HealthUpdate(address indexed patient);

// ✅ Best: Categorized event
event HealthUpdate(address indexed patient, uint8 category);
```

## Emergency Safety Mechanisms

### Time-Based Limits

```solidity
/// @notice Enforce rate limiting
mapping(address => uint256) public lastUpdateTime;

function updateHealthLevel(uint8 _level) external onlyRegisteredPatient {
    // Prevent spam
    require(
        block.timestamp >= lastUpdateTime[msg.sender] + MIN_UPDATE_INTERVAL,
        "Updates too frequent"
    );

    // ... update logic ...

    lastUpdateTime[msg.sender] = block.timestamp;
}
```

### Session Limits

```solidity
/// @notice Prevent excessive session creation
uint256 public constant MAX_SESSIONS_PER_PATIENT = 100;

function startCounselingSession(
    uint8 _type,
    uint8 _severity
) external onlyRegisteredPatient {
    uint256 sessionCount = getPatientSessionCount(msg.sender);

    require(
        sessionCount < MAX_SESSIONS_PER_PATIENT,
        "Maximum sessions reached"
    );

    // ... create session ...
}
```

## Data Integrity

### Immutable Records

```solidity
/// @notice Create immutable session record
struct CounselingSession {
    address patient;           // Immutable: set once
    uint256 startTime;         // Immutable: set once
    euint8 sessionType;        // Immutable: encrypted type
    euint8 severityLevel;      // Immutable: encrypted level
    bool completed;            // Mutable: completion status
    uint256 completionTime;    // Mutable: when completed
}
```

### Audit Trail

```solidity
/// @notice Maintain immutable audit log
event AuditLog(
    address indexed actor,
    string action,
    address indexed target,
    uint256 timestamp
);

function _logAction(
    string memory _action,
    address _target
) private {
    emit AuditLog(msg.sender, _action, _target, block.timestamp);
}
```

## Security Checklist

### Before Deployment ✅

- [ ] All inputs validated before encryption
- [ ] All encrypted values granted `FHE.allowThis()`
- [ ] User permissions granted via `FHE.allow()` when needed
- [ ] Access control modifiers applied
- [ ] No plaintext in events or logs
- [ ] Error messages are clear and specific
- [ ] Emergency procedures documented
- [ ] Rate limiting implemented
- [ ] Audit logging enabled
- [ ] Contracts tested with edge cases

### During Development ✅

- [ ] Use appropriate encrypted types (euint8, not euint32 for 0-10)
- [ ] Validate early, encrypt late
- [ ] Grant permissions immediately after creation
- [ ] Handle zero addresses explicitly
- [ ] Prevent reentrancy (use checks-effects-interactions)
- [ ] Document encrypted fields
- [ ] Comment FHE-specific patterns
- [ ] Test both success and failure paths

## Key Takeaways

### Security Best Practices ✅

- ✅ Always validate inputs before encryption
- ✅ Always call `FHE.allowThis()` after creating encrypted values
- ✅ Grant user permissions only when needed
- ✅ Use role-based access control
- ✅ Implement rate limiting
- ✅ Log actions without exposing values
- ✅ Handle errors with clear messages
- ✅ Test edge cases thoroughly

### Common Vulnerabilities ❌

- ❌ Missing input validation
- ❌ Forgetting `FHE.allowThis()`
- ❌ Oversized encrypted types
- ❌ Plaintext in events
- ❌ Missing access control
- ❌ No rate limiting
- ❌ Generic error messages
- ❌ Insufficient testing

## Next Steps

- Study [Healthcare Use Cases](healthcare-use-cases.md) for real-world security patterns
- Review [Anti-Patterns](anti-patterns.md) for common mistakes
- Check test cases for security examples

---

[← Back to Summary](SUMMARY.md) | [Next: Healthcare Use Cases →](healthcare-use-cases.md)
