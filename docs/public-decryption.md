# Public Decryption

## Overview

Public decryption allows smart contracts to trigger actions based on encrypted data thresholds without revealing the actual values. This chapter demonstrates emergency alert systems that work with encrypted mental health metrics.

## Emergency Alert System

### Concept

An emergency alert can trigger when encrypted health metrics exceed critical thresholds, without revealing the actual values to observers.

### Code Example

```solidity
/// @notice Internal function to check emergency levels
/// @dev Uses encrypted values without revealing them
function _checkEmergencyLevel(
    uint8 anxiety,
    uint8 depression,
    uint8 stress
) private {
    // Check single metric thresholds (each >= 9)
    if (anxiety >= 9 || depression >= 9 || stress >= 9) {
        emit EmergencyAlert(msg.sender, block.timestamp);
        return;
    }

    // Check combined threshold (all >= 7)
    if (anxiety >= 7 && depression >= 7 && stress >= 7) {
        emit EmergencyAlert(msg.sender, block.timestamp);
        return;
    }

    // No emergency, silent return
}
```

### What's Public vs. Private?

```solidity
// ✅ PUBLIC: Emergency status
event EmergencyAlert(address indexed patient, uint256 timestamp);

// ❌ PRIVATE: Actual health values
// Only the caller and authorized parties know the true values
```

## Threshold-Based Alerting

### Single Metric Thresholds

```solidity
/// @notice Register patient and check for emergencies
function registerPatient(
    uint8 _anxietyLevel,
    uint8 _depressionLevel,
    uint8 _stressLevel
) external {
    // Validate and encrypt...
    require(_anxietyLevel <= 10 && _depressionLevel <= 10 && _stressLevel <= 10,
        "Levels must be 0-10");

    // ... encryption code ...

    // Threshold checking without revealing values
    _checkEmergencyLevel(_anxietyLevel, _depressionLevel, _stressLevel);
}

function _checkEmergencyLevel(
    uint8 anxiety,
    uint8 depression,
    uint8 stress
) private {
    // Single metrics: Critical if >= 9
    if (anxiety >= 9) {
        emit EmergencyAlert(msg.sender, "High Anxiety", block.timestamp);
    }
    if (depression >= 9) {
        emit EmergencyAlert(msg.sender, "High Depression", block.timestamp);
    }
    if (stress >= 9) {
        emit EmergencyAlert(msg.sender, "High Stress", block.timestamp);
    }
}
```

### Combined Metrics Thresholds

```solidity
function _checkCombinedThresholds(
    uint8 anxiety,
    uint8 depression,
    uint8 stress
) private {
    uint8 count = 0;

    if (anxiety >= 7) count++;
    if (depression >= 7) count++;
    if (stress >= 7) count++;

    // All three metrics elevated
    if (count >= 3) {
        emit EmergencyCombinedAlert(
            msg.sender,
            "Multiple metrics elevated",
            block.timestamp
        );
    }

    // Two or more metrics elevated
    if (count >= 2) {
        emit WarningAlert(
            msg.sender,
            "Multiple metrics of concern",
            block.timestamp
        );
    }
}
```

## Emergency Detection Patterns

### Pattern 1: Simple Threshold

```solidity
// Alert if single value exceeds threshold
if (value >= THRESHOLD) {
    emit Alert(user, block.timestamp);
}
```

**Use Case:** Blood pressure, temperature, glucose level

### Pattern 2: Range Checking

```solidity
// Alert if value outside healthy range
if (value < MIN_HEALTHY || value > MAX_HEALTHY) {
    emit Alert(user, block.timestamp);
}
```

**Use Case:** Normal range detection, anomaly detection

### Pattern 3: Combined Metrics

```solidity
// Alert if multiple metrics are concerning
if (metric1 >= THRESHOLD && metric2 >= THRESHOLD) {
    emit EmergencyAlert(user, block.timestamp);
}
```

**Use Case:** Multi-factor risk assessment

### Pattern 4: Time-Based Escalation

```solidity
// More severe alert if condition persists
if (value >= THRESHOLD && lastChecked + TIME_WINDOW < block.timestamp) {
    emit EscalatedAlert(user, block.timestamp);
}
```

**Use Case:** Persistent warning monitoring

## Privacy-Preserving Notifications

### Event Structure

```solidity
// ✅ Good: Alert without revealing metrics
event EmergencyAlert(
    address indexed patient,
    uint256 timestamp
);

// Better: Categorized alert
event EmergencyAlert(
    address indexed patient,
    uint256 timestamp,
    uint8 severityLevel  // 1=low, 2=medium, 3=high
);

// ❌ Bad: Reveals actual values
event EmergencyAlert(
    address indexed patient,
    uint8 anxietyLevel,  // Don't include plaintext!
    uint8 depressionLevel
);
```

### Alert Categories

```solidity
enum AlertLevel {
    Normal,      // No alert
    Warning,     // Monitor closely
    Severe,      // Immediate attention needed
    Critical     // Emergency intervention required
}

event HealthAlert(
    address indexed patient,
    AlertLevel level,
    uint256 timestamp
);

function _categorizeAlert(
    uint8 anxiety,
    uint8 depression,
    uint8 stress
) private view returns (AlertLevel) {
    // Critical: Any metric at 9+
    if (anxiety >= 9 || depression >= 9 || stress >= 9) {
        return AlertLevel.Critical;
    }

    // Severe: All metrics at 7+
    if (anxiety >= 7 && depression >= 7 && stress >= 7) {
        return AlertLevel.Severe;
    }

    // Warning: At least one metric at 6+
    if (anxiety >= 6 || depression >= 6 || stress >= 6) {
        return AlertLevel.Warning;
    }

    return AlertLevel.Normal;
}
```

## Real-World Emergency Example

### Complete Emergency System

```solidity
/// @notice Register patient with emergency detection
function registerPatient(
    uint8 _anxietyLevel,
    uint8 _depressionLevel,
    uint8 _stressLevel
) external {
    // Validation
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

    // Permissions
    FHE.allowThis(anxiety);
    FHE.allowThis(depression);
    FHE.allowThis(stress);

    FHE.allow(anxiety, msg.sender);
    FHE.allow(depression, msg.sender);
    FHE.allow(stress, msg.sender);

    // Emergency detection (based on plaintext thresholds)
    _checkEmergencyLevel(_anxietyLevel, _depressionLevel, _stressLevel);

    emit PatientRegistered(msg.sender, block.timestamp);
}

/// @notice Emergency detection logic
function _checkEmergencyLevel(
    uint8 anxiety,
    uint8 depression,
    uint8 stress
) private {
    // Single metric critical
    if (anxiety >= 9) {
        emit EmergencyAlert(msg.sender, "Critical Anxiety", block.timestamp);
        _triggerCounselorNotification(msg.sender);
    }
    if (depression >= 9) {
        emit EmergencyAlert(msg.sender, "Critical Depression", block.timestamp);
        _triggerCounselorNotification(msg.sender);
    }
    if (stress >= 9) {
        emit EmergencyAlert(msg.sender, "Critical Stress", block.timestamp);
        _triggerCounselorNotification(msg.sender);
    }

    // Combined metrics elevated
    if (anxiety >= 7 && depression >= 7 && stress >= 7) {
        emit SevereAlert(msg.sender, "Multiple metrics elevated", block.timestamp);
        _triggerCounselorNotification(msg.sender);
    }
}

/// @notice Notify assigned counselor without revealing values
function _triggerCounselorNotification(address _patient) private {
    address counselor = patient_counselor[_patient];
    if (counselor != address(0)) {
        emit CounselorNotification(
            counselor,
            _patient,
            "Patient requires immediate attention",
            block.timestamp
        );
    }
}
```

## Key Differences: User vs Public Decryption

| Aspect | User Decryption | Public Decryption |
|--------|-----------------|-------------------|
| **Who accesses** | Authorized user | Smart contract |
| **What they see** | Full plaintext value | Only boolean result |
| **Encryption remains** | Yes (on-chain) | Yes (on-chain) |
| **Use case** | Patient viewing their data | System triggering alerts |
| **Privacy level** | High (individual) | Medium (aggregated) |

## Security Considerations

### ✅ Good Practices

- ✅ Use plaintext thresholds in logic (for performance)
- ✅ Only emit alerts, not values
- ✅ Keep encrypted data on-chain
- ✅ Validate inputs before checking
- ✅ Categorize alerts without exposing metrics

### ❌ Avoid

- ❌ Returning actual values in public events
- ❌ Logging plaintext metrics
- ❌ Exposing threshold values
- ❌ Creating linkable patterns
- ❌ Storing plaintext anywhere

## Monitoring and Response

### Off-Chain Monitoring

```typescript
// Monitor for emergency alerts
contract.on("EmergencyAlert", (patient, timestamp) => {
    console.log(`Emergency alert for ${patient} at ${timestamp}`);

    // Trigger notification system
    notifyEmergencyTeam(patient);

    // Log for audit trail
    logEmergencyEvent(patient, timestamp);
});

async function notifyEmergencyTeam(patient) {
    // Send SMS, email, or push notification
    // All without knowing the actual health metrics
}
```

## Key Takeaways

### Public Decryption Pattern ✅

1. **Smart Contract Logic** - Contract checks plaintext thresholds
2. **Private Decision** - Only contract knows the values
3. **Public Event** - Emit alert event (without values)
4. **System Response** - Off-chain systems act on alert
5. **Encrypted Data Preserved** - Values remain encrypted on-chain

### Privacy Guarantees ✅

- ✅ Actual metrics never exposed
- ✅ Alerts are categorical
- ✅ Observers can't reverse-engineer values
- ✅ Only boolean decisions revealed

### Emergency Detection ✅

- ✅ Real-time threshold checking
- ✅ Multi-metric analysis
- ✅ Automatic escalation
- ✅ Counselor notification

## Next Steps

- Learn [Encrypted Workflows](encrypted-workflows.md) for complex operations
- Study [Security](security.md) for validation patterns
- Explore [Healthcare Use Cases](healthcare-use-cases.md) for real-world applications

---

[← Back to Summary](SUMMARY.md) | [Next: Encrypted Workflows →](encrypted-workflows.md)
