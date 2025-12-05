// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint8, euint16, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract AnonymousMentalHealth is SepoliaConfig {

    address public counselor;
    uint16 public currentSessionId;
    uint256 public lastSessionTime;

    // Session duration constants
    uint256 constant SESSION_DURATION = 3600; // 1 hour
    uint256 constant BREAK_DURATION = 1800;   // 30 minutes break between sessions

    struct PatientProfile {
        euint8 anxietyLevel;     // 0-10 scale, encrypted
        euint8 depressionLevel;  // 0-10 scale, encrypted
        euint8 stressLevel;      // 0-10 scale, encrypted
        bool isActive;
        uint256 registrationTime;
    }

    struct CounselingSession {
        euint8 sessionType;      // 1=anxiety, 2=depression, 3=stress, 4=general
        euint8 severityLevel;    // 1-10 severity reported by patient
        bool sessionActive;
        bool sessionCompleted;
        address patient;
        uint256 startTime;
        uint256 endTime;
        euint8 improvementScore; // Post-session improvement rating
    }

    struct TherapyPlan {
        euint8 recommendedSessions;
        euint8 priorityLevel;    // 1=low, 2=medium, 3=high, 4=urgent
        bool planActive;
        uint256 createdTime;
    }

    mapping(address => PatientProfile) public patientProfiles;
    mapping(uint16 => CounselingSession) public sessions;
    mapping(address => TherapyPlan) public therapyPlans;
    mapping(address => uint16[]) public patientSessions;

    event PatientRegistered(address indexed patient, uint256 timestamp);
    event SessionStarted(uint16 indexed sessionId, address indexed patient, uint256 startTime);
    event SessionCompleted(uint16 indexed sessionId, address indexed patient, uint256 endTime);
    event TherapyPlanCreated(address indexed patient, uint256 timestamp);
    event EmergencyAlert(address indexed patient, uint256 timestamp);

    modifier onlyCounselor() {
        require(msg.sender == counselor, "Not authorized counselor");
        _;
    }

    modifier onlyRegisteredPatient() {
        require(patientProfiles[msg.sender].isActive, "Patient not registered");
        _;
    }

    modifier sessionAvailable() {
        require(isSessionTimeAvailable(), "No session slots available");
        _;
    }

    constructor() {
        counselor = msg.sender;
        currentSessionId = 1;
        lastSessionTime = block.timestamp;
    }

    // Check if session time slot is available
    function isSessionTimeAvailable() public view returns (bool) {
        return block.timestamp >= lastSessionTime + BREAK_DURATION;
    }

    // Register as anonymous patient with encrypted mental health indicators
    function registerPatient(
        uint8 _anxietyLevel,
        uint8 _depressionLevel,
        uint8 _stressLevel
    ) external {
        require(_anxietyLevel <= 10 && _depressionLevel <= 10 && _stressLevel <= 10, "Levels must be 0-10");
        require(!patientProfiles[msg.sender].isActive, "Patient already registered");

        // Encrypt sensitive mental health data
        euint8 encryptedAnxiety = FHE.asEuint8(_anxietyLevel);
        euint8 encryptedDepression = FHE.asEuint8(_depressionLevel);
        euint8 encryptedStress = FHE.asEuint8(_stressLevel);

        patientProfiles[msg.sender] = PatientProfile({
            anxietyLevel: encryptedAnxiety,
            depressionLevel: encryptedDepression,
            stressLevel: encryptedStress,
            isActive: true,
            registrationTime: block.timestamp
        });

        // Grant access permissions for encrypted data
        FHE.allowThis(encryptedAnxiety);
        FHE.allowThis(encryptedDepression);
        FHE.allowThis(encryptedStress);
        FHE.allow(encryptedAnxiety, msg.sender);
        FHE.allow(encryptedDepression, msg.sender);
        FHE.allow(encryptedStress, msg.sender);
        FHE.allow(encryptedAnxiety, counselor);
        FHE.allow(encryptedDepression, counselor);
        FHE.allow(encryptedStress, counselor);

        // Check for emergency intervention needs
        _checkEmergencyLevel(_anxietyLevel, _depressionLevel, _stressLevel);

        emit PatientRegistered(msg.sender, block.timestamp);
    }

    // Start anonymous counseling session
    function startCounselingSession(
        uint8 _sessionType,
        uint8 _severityLevel
    ) external onlyRegisteredPatient sessionAvailable {
        require(_sessionType >= 1 && _sessionType <= 4, "Invalid session type");
        require(_severityLevel >= 1 && _severityLevel <= 10, "Severity must be 1-10");

        // Encrypt session details
        euint8 encryptedType = FHE.asEuint8(_sessionType);
        euint8 encryptedSeverity = FHE.asEuint8(_severityLevel);

        sessions[currentSessionId] = CounselingSession({
            sessionType: encryptedType,
            severityLevel: encryptedSeverity,
            sessionActive: true,
            sessionCompleted: false,
            patient: msg.sender,
            startTime: block.timestamp,
            endTime: 0,
            improvementScore: FHE.asEuint8(0)
        });

        patientSessions[msg.sender].push(currentSessionId);

        // Grant access permissions
        FHE.allowThis(encryptedType);
        FHE.allowThis(encryptedSeverity);
        FHE.allow(encryptedType, counselor);
        FHE.allow(encryptedSeverity, counselor);

        emit SessionStarted(currentSessionId, msg.sender, block.timestamp);
        currentSessionId++;
        lastSessionTime = block.timestamp;
    }

    // Complete session with improvement rating
    function completeSession(uint16 _sessionId, uint8 _improvementScore) external {
        require(_improvementScore <= 10, "Improvement score must be 0-10");
        CounselingSession storage session = sessions[_sessionId];
        require(session.patient == msg.sender || msg.sender == counselor, "Not authorized");
        require(session.sessionActive, "Session not active");
        require(!session.sessionCompleted, "Session already completed");

        euint8 encryptedImprovement = FHE.asEuint8(_improvementScore);

        session.improvementScore = encryptedImprovement;
        session.sessionActive = false;
        session.sessionCompleted = true;
        session.endTime = block.timestamp;

        FHE.allowThis(encryptedImprovement);
        FHE.allow(encryptedImprovement, session.patient);
        FHE.allow(encryptedImprovement, counselor);

        emit SessionCompleted(_sessionId, session.patient, block.timestamp);
    }

    // Create personalized therapy plan (counselor only)
    function createTherapyPlan(
        address _patient,
        uint8 _recommendedSessions,
        uint8 _priorityLevel
    ) external onlyCounselor {
        require(patientProfiles[_patient].isActive, "Patient not registered");
        require(_recommendedSessions > 0 && _recommendedSessions <= 20, "Sessions must be 1-20");
        require(_priorityLevel >= 1 && _priorityLevel <= 4, "Priority must be 1-4");

        euint8 encryptedSessions = FHE.asEuint8(_recommendedSessions);
        euint8 encryptedPriority = FHE.asEuint8(_priorityLevel);

        therapyPlans[_patient] = TherapyPlan({
            recommendedSessions: encryptedSessions,
            priorityLevel: encryptedPriority,
            planActive: true,
            createdTime: block.timestamp
        });

        FHE.allowThis(encryptedSessions);
        FHE.allowThis(encryptedPriority);
        FHE.allow(encryptedSessions, _patient);
        FHE.allow(encryptedPriority, _patient);

        emit TherapyPlanCreated(_patient, block.timestamp);
    }

    // Update mental health levels (patient only)
    function updateMentalHealthLevels(
        uint8 _anxietyLevel,
        uint8 _depressionLevel,
        uint8 _stressLevel
    ) external onlyRegisteredPatient {
        require(_anxietyLevel <= 10 && _depressionLevel <= 10 && _stressLevel <= 10, "Levels must be 0-10");

        PatientProfile storage profile = patientProfiles[msg.sender];

        euint8 newAnxiety = FHE.asEuint8(_anxietyLevel);
        euint8 newDepression = FHE.asEuint8(_depressionLevel);
        euint8 newStress = FHE.asEuint8(_stressLevel);

        profile.anxietyLevel = newAnxiety;
        profile.depressionLevel = newDepression;
        profile.stressLevel = newStress;

        FHE.allowThis(newAnxiety);
        FHE.allowThis(newDepression);
        FHE.allowThis(newStress);
        FHE.allow(newAnxiety, msg.sender);
        FHE.allow(newDepression, msg.sender);
        FHE.allow(newStress, msg.sender);
        FHE.allow(newAnxiety, counselor);
        FHE.allow(newDepression, counselor);
        FHE.allow(newStress, counselor);

        _checkEmergencyLevel(_anxietyLevel, _depressionLevel, _stressLevel);
    }

    // Check for emergency intervention needs (private function)
    function _checkEmergencyLevel(uint8 anxiety, uint8 depression, uint8 stress) private {
        // Emergency threshold: any level >= 9 or all levels >= 7
        if (anxiety >= 9 || depression >= 9 || stress >= 9 ||
            (anxiety >= 7 && depression >= 7 && stress >= 7)) {
            emit EmergencyAlert(msg.sender, block.timestamp);
        }
    }

    // Get current session availability
    function getSessionAvailability() external view returns (
        bool available,
        uint256 nextAvailableTime,
        uint256 currentTime
    ) {
        bool isAvailable = isSessionTimeAvailable();
        uint256 nextTime = isAvailable ? block.timestamp : lastSessionTime + BREAK_DURATION;
        return (isAvailable, nextTime, block.timestamp);
    }

    // Get patient session count
    function getPatientSessionCount(address _patient) external view returns (uint256) {
        return patientSessions[_patient].length;
    }

    // Get session basic info (non-sensitive data only)
    function getSessionInfo(uint16 _sessionId) external view returns (
        bool sessionActive,
        bool sessionCompleted,
        uint256 startTime,
        uint256 endTime,
        address patient
    ) {
        CounselingSession storage session = sessions[_sessionId];
        return (
            session.sessionActive,
            session.sessionCompleted,
            session.startTime,
            session.endTime,
            session.patient
        );
    }

    // Get current session ID and total sessions
    function getSessionStats() external view returns (
        uint16 nextSessionId,
        uint256 totalSessions,
        uint256 lastSession
    ) {
        return (currentSessionId, currentSessionId - 1, lastSessionTime);
    }

    // Check if patient is registered
    function isPatientRegistered(address _patient) external view returns (bool) {
        return patientProfiles[_patient].isActive;
    }

    // Get therapy plan status
    function getTherapyPlanStatus(address _patient) external view returns (
        bool planActive,
        uint256 createdTime
    ) {
        TherapyPlan storage plan = therapyPlans[_patient];
        return (plan.planActive, plan.createdTime);
    }
}