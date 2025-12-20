# Healthcare Use Cases

## Overview

This chapter explores real-world healthcare applications using the Anonymous Mental Health Platform as a reference implementation.

## Mental Health Support Platform

### Problem Statement

Mental health support requires:
- Complete privacy for sensitive data
- Secure counselor-patient relationships
- Emergency detection without exposing values
- Long-term data retention with confidentiality

### FHEVM Solution

```solidity
// Patient registers with encrypted mental health levels
registerPatient(
    anxietyLevel: 7,      // Encrypted
    depressionLevel: 5,   // Encrypted
    stressLevel: 6        // Encrypted
);

// System detects emergency from encrypted thresholds
// Counselor notified WITHOUT seeing actual values
if (anxiety >= 9) {
    emit EmergencyAlert(patient);  // Alert, not values
}

// Patient and counselor can access their assigned data
function getPatientProfile(address _patient)
    returns (PatientProfile)
{
    require(canAccess(_patient));
    return patientProfiles[_patient];  // Encrypted data
}
```

## Patient Privacy Architecture

### Data Classification

```solidity
// Public (anyone can read)
- Patient address (pseudonymous)
- Registration timestamp
- Session dates

// Semi-Private (patient + counselor)
- Mental health metrics (encrypted)
- Session outcomes (encrypted)
- Therapy plans (encrypted)

// Private (patient only)
- Medical history (never stored plaintext)
- Personal notes (encrypted)
```

### Access Patterns

```solidity
// Patient can always access their own data
if (msg.sender == patientAddress) {
    grantDecryption(patientData);
}

// Counselor accesses assigned patient data
if (patient_counselor[patientAddress] == msg.sender) {
    grantDecryption(patientData);
}

// Doctor can access escalated cases
if (patient_doctor[patientAddress] == msg.sender) {
    grantDecryption(patientData);
}

// Emergency services access without actual values
if (emergencyDetected(patientAddress)) {
    notifyServices(patientAddress);  // Location only
}
```

## Therapy Plan Management

### Multi-Stage Treatment

```
Registration → Assessment → Planning → Treatment → Review
     ↓             ↓           ↓          ↓          ↓
  Encrypted    Encrypted    Encrypted   Sessions   Outcomes
   metrics      levels       therapy     tracked    recorded
```

### Implementation

```solidity
// Stage 1: Patient registration
function registerPatient(uint8 anxiety, uint8 depression, uint8 stress) {
    // All metrics encrypted
    patientProfiles[msg.sender] = encryptedProfile();
    _checkEmergencyLevel(anxiety, depression, stress);
}

// Stage 2: Counselor assessment
function createTherapyPlan(
    address patient,
    uint8 maxSessions,
    uint256 duration
) {
    // Encrypted session limits
    therapyPlans[patient] = encryptedPlan(maxSessions);
    FHE.allow(maxSessions, patient);   // Patient sees
    FHE.allow(maxSessions, msg.sender); // Counselor manages
}

// Stage 3: Session tracking
function recordSession(uint256 sessionId, uint8 outcome) {
    // Encrypted outcome
    sessions[sessionId].outcome = FHE.asEuint8(outcome);
    FHE.allowThis(outcome);
    FHE.allow(outcome, patient);
}

// Stage 4: Review
function getTherapyReview(address patient) {
    return aggregatedResults(patient);
}
```

## Emergency Response System

### Automated Detection

```solidity
/// @notice Emergency detection without exposing values
function _checkEmergencyLevel(
    uint8 anxiety,
    uint8 depression,
    uint8 stress
) private {
    // Level 1: Single critical metric
    if (anxiety >= 9 || depression >= 9 || stress >= 9) {
        emit EmergencyCritical(msg.sender);
        _notifyCounselor(msg.sender, "Critical");
    }

    // Level 2: Multiple concerning metrics
    if ((anxiety >= 7) + (depression >= 7) + (stress >= 7) >= 2) {
        emit EmergencySevere(msg.sender);
        _notifyCounselor(msg.sender, "Severe");
    }
}
```

### Counselor Notification

```solidity
/// @notice Notify counselor without revealing metrics
function _notifyCounselor(address patient, string memory level) private {
    address counselor = patient_counselor[patient];
    if (counselor != address(0)) {
        emit CounselorAlert(
            counselor,
            patient,
            level,
            block.timestamp
        );

        // Log for audit trail
        alertHistory[patient].push(AlertLog({
            severity: level,
            timestamp: block.timestamp,
            responder: counselor
        }));
    }
}
```

## Multi-Party Collaboration

### Counselor Workflow

```solidity
// 1. Receive patient assignment
function assignPatient(address patient) external onlyCounselor {
    patient_counselor[patient] = msg.sender;
    emit PatientAssigned(patient, msg.sender);
}

// 2. Access patient data
function getPatientProfile(address patient)
    external
    view
    onlyCounselor
    returns (PatientProfile)
{
    require(patient_counselor[patient] == msg.sender);
    return patientProfiles[patient];
}

// 3. Create therapy plan
function createTherapyPlan(
    address patient,
    uint8 maxSessions,
    uint256 duration
) external onlyCounselor {
    // ... encrypted plan creation ...
}

// 4. Track sessions
function recordSession(uint256 sessionId, uint8 outcome)
    external
    onlyCounselor
{
    // ... encrypted session recording ...
}
```

### Patient Workflow

```solidity
// 1. Register and provide initial assessment
function registerPatient(uint8 anxiety, uint8 depression, uint8 stress)
    external
{
    // ... encrypted registration ...
}

// 2. View personal data
function getMyProfile() external view returns (PatientProfile) {
    return patientProfiles[msg.sender];
}

// 3. Start therapy session
function startSession(uint8 sessionType, uint8 severity)
    external
{
    // ... encrypted session creation ...
}

// 4. Provide update during treatment
function updateHealthLevels(uint8 anxiety, uint8 depression, uint8 stress)
    external
{
    // ... encrypted update ...
}
```

## HIPAA-Friendly Architecture

### Privacy Compliance

```solidity
// ✅ HIPAA-Compatible Patterns

// 1. No plaintext storage
euint8 encrypted = FHE.asEuint8(value);
// Plaintext `value` never stored

// 2. Encrypted at rest
mapping(address => PatientProfile) private patientProfiles;
// All fields are encrypted euint* types

// 3. Access controls
require(hasAccess(msg.sender, patient));
// Explicit permission checks

// 4. Audit trail
emit AccessLog(accessor, patient, timestamp);
// Immutable record of who accessed what, when

// 5. Data minimization
// Only store necessary encrypted fields
// No extra data collection
```

### Compliance Considerations

```solidity
// Retention policies
mapping(address => uint256) public accountDeletionTime;

function requestDataDeletion() external {
    accountDeletionTime[msg.sender] = block.timestamp + 30 days;
    emit DataDeletionRequested(msg.sender, accountDeletionTime[msg.sender]);
}

// After 30 days, data marked for deletion (off-chain execution)
// On-chain: only flag, off-chain systems handle actual deletion
```

## Long-Term Care Management

### Progress Tracking

```solidity
/// @notice Track encrypted outcomes over time
struct TherapyOutcome {
    uint256 date;
    euint8 anxiety;
    euint8 depression;
    euint8 stress;
    euint8 improvement;
}

mapping(address => TherapyOutcome[]) public patientHistory;

function recordOutcome(
    uint8 anxiety,
    uint8 depression,
    uint8 stress,
    uint8 improvement
) external onlyRegisteredPatient {
    euint8 a = FHE.asEuint8(anxiety);
    euint8 d = FHE.asEuint8(depression);
    euint8 s = FHE.asEuint8(stress);
    euint8 i = FHE.asEuint8(improvement);

    // Grant permissions
    FHE.allowThis(a);
    FHE.allowThis(d);
    FHE.allowThis(s);
    FHE.allowThis(i);

    FHE.allow(a, msg.sender);
    FHE.allow(d, msg.sender);
    FHE.allow(s, msg.sender);
    FHE.allow(i, msg.sender);

    // Store in history
    patientHistory[msg.sender].push(TherapyOutcome({
        date: block.timestamp,
        anxiety: a,
        depression: d,
        stress: s,
        improvement: i
    }));

    emit OutcomeRecorded(msg.sender, block.timestamp);
}
```

## Crisis Management

### Risk Assessment

```solidity
/// @notice Emergency severity assessment
enum CrisisSeverity {
    None,
    Low,
    Medium,
    High,
    Critical
}

function assessCrisisSeverity(address patient)
    external
    view
    returns (CrisisSeverity)
{
    // Assessment based on encrypted metrics
    // Never returns actual values, only severity level
}

/// @notice Immediate intervention protocol
function triggerCrisisIntervention(address patient)
    external
    onlyAuthorized
{
    require(patient_crisis_status[patient] == true);

    // Grant emergency access to crisis team
    address crisisTeam = authorized_crisis_teams[0];
    FHE.allow(patientProfiles[patient].anxietyLevel, crisisTeam);
    FHE.allow(patientProfiles[patient].depressionLevel, crisisTeam);
    FHE.allow(patientProfiles[patient].stressLevel, crisisTeam);

    emit CrisisInterventionTriggered(patient, crisisTeam);
}
```

## Telemedicine Integration

### Remote Session Management

```solidity
/// @notice Record remote counseling session
function startTelehealthSession(
    address counselor,
    uint8 sessionType,
    uint8 severity
) external onlyRegisteredPatient {
    require(patient_counselor[msg.sender] == counselor);

    // Create encrypted session record
    uint256 sessionId = nextSessionId++;
    sessions[sessionId] = CounselingSession({
        patient: msg.sender,
        counselor: counselor,
        startTime: block.timestamp,
        sessionType: FHE.asEuint8(sessionType),
        severityLevel: FHE.asEuint8(severity),
        completed: false,
        isRemote: true  // Telemedicine flag
    });

    emit TelehealthSessionStarted(sessionId, msg.sender, counselor);
}
```

## Predictive Analytics (Privacy-Preserving)

### Trend Analysis Without Exposure

```solidity
/// @notice Analyze trends on encrypted data
function analyzeTrendNeedsCounselor(address patient)
    external
    view
    returns (bool)
{
    TherapyOutcome[] storage history = patientHistory[patient];

    // Analyze encrypted values without decrypting
    // This would require advanced FHEVM computation
    // For now, return counselor needs intervention flag
    // Actual analysis happens off-chain on decrypted data

    return needsCounselorReview[patient];
}
```

## Cost and Scalability

### Considerations for Production

```solidity
// 1. Gas Optimization
// Use euint8 instead of euint32 for small values
// Batch operations when possible

// 2. Storage Optimization
// Don't store unnecessary encrypted values
// Archive old records off-chain

// 3. Throughput
// Sharding by patient cohort
// Off-chain computation for analytics

// 4. Cost Management
// Patient shares gas costs for critical operations
// Subsidy pool for disadvantaged patients
```

## Key Takeaways

### Real-World Benefits ✅

- ✅ Complete patient privacy maintained
- ✅ HIPAA/GDPR compliance possible
- ✅ Emergency detection and response
- ✅ Multi-party collaboration securely
- ✅ Long-term care documentation
- ✅ Audit trail of all access

### Implementation Patterns ✅

- ✅ Encrypt all sensitive data before storage
- ✅ Classify data by sensitivity level
- ✅ Implement role-based access control
- ✅ Provide emergency override mechanisms
- ✅ Log all access without exposing data
- ✅ Support long-term care workflows

## Next Steps

- Review [API Documentation](api-reference.md) for contract interfaces
- Study [Testing Guide](testing-guide.md) for real-world test patterns
- Examine actual implementation in AnonymousMentalHealth.sol

---

[← Back to Summary](SUMMARY.md) | [Next: API Documentation →](api-reference.md)
