# Contract Functions

## Overview

Complete documentation of all smart contract functions in the Anonymous Mental Health Platform.

## Function Categories

### Patient Management Functions

1. **registerPatient**
   - Type: External, State-Changing
   - Access: Public
   - Purpose: Initial patient registration
   - Parameters: anxiety, depression, stress levels
   - Effects: Creates encrypted profile, checks emergency levels

2. **updateMentalHealthLevels**
   - Type: External, State-Changing
   - Access: Registered patients only
   - Purpose: Update current mental health metrics
   - Parameters: New anxiety, depression, stress levels
   - Effects: Updates encrypted profile, grants permissions

3. **isPatientRegistered**
   - Type: External, View
   - Access: Public
   - Purpose: Check registration status
   - Parameters: Patient address
   - Returns: Boolean

### Session Management Functions

4. **startCounselingSession**
   - Type: External, State-Changing
   - Access: Registered patients
   - Purpose: Initiate a new counseling session
   - Parameters: Session type, severity level
   - Effects: Creates session record, increments counters
   - Constraints: Session limits, break periods

5. **completeSession**
   - Type: External, State-Changing
   - Access: Patient or counselor
   - Purpose: Conclude a session with outcome
   - Parameters: Session ID, improvement score
   - Effects: Records outcome, updates statistics

6. **getSessionInfo**
   - Type: External, View
   - Access: Public (encrypted data)
   - Purpose: Retrieve session details
   - Parameters: Session ID
   - Returns: Session structure with encrypted fields

7. **getSessionStats**
   - Type: External, View
   - Access: Public
   - Purpose: Get session statistics
   - Parameters: None
   - Returns: Total sessions, completed, improvement sum

8. **getPatientSessionCount**
   - Type: External, View
   - Access: Public
   - Purpose: Count patient's sessions
   - Parameters: Patient address
   - Returns: Number of sessions

### Therapy Plan Functions

9. **createTherapyPlan**
   - Type: External, State-Changing
   - Access: Counselor only
   - Purpose: Design treatment plan for patient
   - Parameters: Patient address, max sessions, duration
   - Effects: Stores encrypted plan, grants dual permissions
   - Constraints: Patient must exist

10. **getTherapyPlanStatus**
    - Type: External, View
    - Access: Public
    - Purpose: Check plan active status
    - Parameters: Patient address
    - Returns: Active status, creation timestamp

### Data Retrieval Functions

11. **getPatientProfile**
    - Type: External, View
    - Access: Patient and authorized counselor
    - Purpose: Retrieve full patient profile
    - Parameters: Patient address
    - Returns: PatientProfile with encrypted data
    - Encryption: Requires client-side decryption

12. **patientProfiles**
    - Type: External, View
    - Access: Public (read encrypted data)
    - Purpose: Direct access to profile mapping
    - Parameters: Patient address
    - Returns: PatientProfile struct

## Access Control Functions

### Internal Access Checks

```solidity
function isPatientRegistered(address _patient)
    internal view returns (bool)
// Checks if patient has active profile

function isCounselor(address _account)
    internal view returns (bool)
// Verifies counselor role

function canAccessPatientData(address accessor, address patient)
    internal view returns (bool)
// Checks if accessor has permission
```

### Modifiers

```solidity
modifier onlyRegisteredPatient()
// Restricts to registered patients

modifier onlyCounselor()
// Restricts to authorized counselors

modifier sessionLimitNotExceeded()
// Ensures session capacity available

modifier patientExists(address _patient)
// Validates patient exists
```

## Emergency Functions

### Emergency Detection

```solidity
function _checkEmergencyLevel(
    uint8 anxiety,
    uint8 depression,
    uint8 stress
) private
// Checks thresholds:
// - Single metric >= 9: Critical
// - All metrics >= 7: Severe
// - Triggers alerts and notifications
```

### Emergency Notification

```solidity
function _triggerCounselorNotification(address _patient)
    private
// Notifies assigned counselor
// Emits CounselorNotification event
// No sensitive data in notification
```

## Permission Management Functions

### Internal Permission Grants

```solidity
function _grantPermissions(
    euint8 value,
    address user
) private
// Grants FHE.allowThis() and FHE.allow()

function _grantDualPermissions(
    euint8 value,
    address patient,
    address counselor
) private
// Grants permissions to both parties
```

## State Mutation Functions

### Profile Creation

```solidity
function _createPatientProfile(
    address patient,
    euint8 anxiety,
    euint8 depression,
    euint8 stress
) private
// Creates encrypted profile
// Stores in patientProfiles mapping
// Sets isActive flag
```

### Session Recording

```solidity
function _recordSession(
    address patient,
    uint8 sessionType,
    uint8 severity
) private returns (uint256)
// Creates session record
// Increments session counters
// Returns session ID
```

## Encryption Functions

### Value Encryption

```solidity
euint8 encrypted = FHE.asEuint8(plaintext);
// Converts uint8 to encrypted type

FHE.allowThis(encrypted);
// Grants contract permission

FHE.allow(encrypted, user);
// Grants user permission
```

## Query Functions

### Statistics Queries

```solidity
function getTotalSessions()
    external view returns (uint256)
// Returns total sessions created

function getTotalCompleted()
    external view returns (uint256)
// Returns total completed sessions

function getTotalImprovement()
    external view returns (uint256)
// Returns sum of improvement scores
```

### Patient Queries

```solidity
function getPatientCount()
    external view returns (uint256)
// Returns number of registered patients

function getPatientSessionCount(address _patient)
    external view returns (uint256)
// Returns sessions for specific patient

function isPatientRegistered(address _patient)
    external view returns (bool)
// Checks registration status
```

### Availability Queries

```solidity
function getSessionAvailability()
    external view returns (bool available, uint256 remaining, uint256 maxCapacity)
// Returns:
// - available: Whether slots exist
// - remaining: Slots left
// - maxCapacity: Total capacity
```

## Testing Functions

### Getters for Testing

```solidity
function getContractState()
    external view returns (uint256 totalPatients, uint256 totalSessions)
// Returns key metrics for testing
```

## Error Conditions

### Validation Errors

| Function | Error | Condition |
|----------|-------|-----------|
| registerPatient | "Already registered" | Patient exists |
| registerPatient | "Levels must be 0-10" | Invalid input range |
| startCounselingSession | "No session slots available" | Capacity exceeded |
| startCounselingSession | "Patient not registered" | Not registered |
| completeSession | "Session not found" | Invalid session ID |
| completeSession | "Not authorized" | Wrong caller |
| completeSession | "Already completed" | Session finished |
| createTherapyPlan | "Not authorized counselor" | Wrong caller |
| createTherapyPlan | "Patient not found" | Invalid patient |

## Gas Considerations

### Expensive Operations

1. **registerPatient** - High
   - Multiple FHE operations
   - Emergency level checking
   - Event emission

2. **startCounselingSession** - High
   - Session creation
   - Permission grants
   - Limit checking

3. **completeSession** - High
   - State updates
   - Outcome recording
   - Permission grants

### Cheap Operations

1. **isPatientRegistered** - Very Low
   - Single mapping lookup
   - No computation

2. **getSessionStats** - Low
   - Read from storage
   - No encryption

3. **View functions** - Very Low
   - No state changes
   - Read-only

## Function Call Graph

```
registerPatient
├── _validateInputs()
├── FHE.asEuint8() x3
├── FHE.allowThis() x3
├── FHE.allow() x3
├── _checkEmergencyLevel()
└── emit PatientRegistered

startCounselingSession
├── onlyRegisteredPatient
├── sessionLimitNotExceeded
├── FHE.asEuint8() x2
├── FHE.allowThis() x2
├── FHE.allow() x2
└── emit SessionStarted

createTherapyPlan
├── onlyCounselor
├── patientExists
├── FHE.asEuint8()
├── FHE.allowThis()
├── FHE.allow() x2
└── emit TherapyPlanCreated
```

## Development Notes

### Important Function Patterns

1. **Always validate before encrypting**
   - Check inputs early
   - Fail fast with clear errors

2. **Grant permissions immediately**
   - Call FHE.allowThis() after creation
   - Call FHE.allow() for users

3. **Log actions with events**
   - Don't include sensitive data
   - Provide actionable information

4. **Check access in view functions**
   - Even though no state change
   - Prevents information leakage

## Next Steps

- Study [Testing Guide](testing-guide.md) for function usage
- Review [API Reference](api-reference.md) for detailed parameters
- Check actual implementation in AnonymousMentalHealth.sol

---

[← Back to Summary](SUMMARY.md)
