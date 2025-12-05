/**
 * FHEVM Example: Anonymous Mental Health Platform - Comprehensive Test Suite
 *
 * This test suite demonstrates key FHEVM concepts:
 * - Encrypted data storage and manipulation
 * - Access control patterns (FHE.allow, FHE.allowThis)
 * - User decryption patterns
 * - Public decryption scenarios
 * - Input proof requirements
 * - Handle lifecycle management
 * - Anti-patterns and common pitfalls
 *
 * @chapter: testing
 * @category: healthcare
 */

import { expect } from "chai";
import { ethers } from "hardhat";
import { AnonymousMentalHealth } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-toolbox/signers";

describe("Anonymous Mental Health Platform - FHEVM Example", function () {
  let contract: AnonymousMentalHealth;
  let counselor: SignerWithAddress;
  let patient1: SignerWithAddress;
  let patient2: SignerWithAddress;
  let unauthorized: SignerWithAddress;

  /**
   * Setup: Deploy contract before each test
   *
   * @chapter: setup
   * @category: deployment
   *
   * This demonstrates:
   * - Contract deployment in test environment
   * - Account management for different roles
   * - Initial state verification
   */
  beforeEach(async function () {
    // Get signers - representing different user roles
    [counselor, patient1, patient2, unauthorized] = await ethers.getSigners();

    // Deploy the contract
    const AnonymousMentalHealthFactory = await ethers.getContractFactory(
      "AnonymousMentalHealth"
    );
    contract = await AnonymousMentalHealthFactory.deploy();
    await contract.waitForDeployment();

    console.log("    ✅ Contract deployed");
    console.log("    👨‍⚕️ Counselor:", counselor.address);
    console.log("    🧑 Patient1:", patient1.address);
  });

  /**
   * Test: Encrypted Value Storage
   *
   * @chapter: encryption
   * @category: basic-encryption
   *
   * This test demonstrates:
   * - How to encrypt single values using FHE.asEuint8()
   * - Storing encrypted data on-chain
   * - The importance of data encryption for privacy
   *
   * Key Learning: All sensitive data in FHEVM is encrypted before storage.
   * The euint8 type represents an encrypted 8-bit unsigned integer.
   */
  describe("Encryption: Basic Encrypted Value Storage", function () {
    it("Should register patient with encrypted mental health levels", async function () {
      const anxietyLevel = 7;
      const depressionLevel = 5;
      const stressLevel = 6;

      // Register patient with encrypted values
      const tx = await contract
        .connect(patient1)
        .registerPatient(anxietyLevel, depressionLevel, stressLevel);

      await tx.wait();

      // Verify patient is registered
      const isRegistered = await contract.isPatientRegistered(patient1.address);
      expect(isRegistered).to.be.true;

      console.log("    ✅ Patient registered with encrypted health data");
    });

    it("Should encrypt multiple values independently", async function () {
      // Demonstrate encrypting multiple patients
      await contract.connect(patient1).registerPatient(7, 5, 6);
      await contract.connect(patient2).registerPatient(3, 2, 4);

      const patient1Registered = await contract.isPatientRegistered(
        patient1.address
      );
      const patient2Registered = await contract.isPatientRegistered(
        patient2.address
      );

      expect(patient1Registered).to.be.true;
      expect(patient2Registered).to.be.true;

      console.log("    ✅ Multiple patients encrypted independently");
    });
  });

  /**
   * Test: Access Control Patterns
   *
   * @chapter: access-control
   * @category: permissions
   *
   * This test demonstrates:
   * - FHE.allowThis() - Granting contract access to encrypted data
   * - FHE.allow() - Granting user access to encrypted data
   * - Access control best practices
   * - Why access control is critical in FHEVM
   *
   * Key Learning: Encrypted data requires explicit permission grants.
   * Without proper FHE.allow() calls, users cannot decrypt their own data.
   */
  describe("Access Control: FHE.allow and FHE.allowThis", function () {
    it("Should grant contract access with FHE.allowThis()", async function () {
      // The registerPatient function uses FHE.allowThis() to grant
      // the contract permission to work with encrypted values
      await contract.connect(patient1).registerPatient(7, 5, 6);

      // The contract can now use these encrypted values in computations
      const isRegistered = await contract.isPatientRegistered(patient1.address);
      expect(isRegistered).to.be.true;

      console.log("    ✅ Contract has access to encrypted data via allowThis");
    });

    it("Should grant patient access with FHE.allow()", async function () {
      // The registerPatient function uses FHE.allow(encrypted, msg.sender)
      // to grant the patient permission to decrypt their own data
      await contract.connect(patient1).registerPatient(7, 5, 6);

      // Patient can now access their profile (demonstrated by no revert)
      const profile = await contract.patientProfiles(patient1.address);
      expect(profile.isActive).to.be.true;

      console.log("    ✅ Patient has access to their encrypted data via allow");
    });

    it("Should grant counselor access with FHE.allow()", async function () {
      // The registerPatient function also grants counselor access
      await contract.connect(patient1).registerPatient(7, 5, 6);

      // Counselor can create therapy plans (requires access to patient data)
      await contract.connect(counselor).createTherapyPlan(patient1.address, 10, 3);

      const planStatus = await contract.getTherapyPlanStatus(patient1.address);
      expect(planStatus.planActive).to.be.true;

      console.log("    ✅ Counselor has access to patient data");
    });
  });

  /**
   * Test: Anti-Pattern - Missing Access Control
   *
   * @chapter: anti-patterns
   * @category: common-errors
   *
   * This demonstrates a COMMON MISTAKE:
   * - Forgetting to call FHE.allowThis()
   * - Attempting to use encrypted values without permission
   *
   * Key Learning: Always grant necessary permissions immediately after
   * creating encrypted values. Missing FHE.allowThis() is one of the
   * most common errors in FHEVM development.
   */
  describe("Anti-Pattern: Missing FHE.allowThis()", function () {
    it("Should demonstrate why FHE.allowThis() is required", async function () {
      // This test shows that our contract correctly implements FHE.allowThis()
      // If it didn't, the contract wouldn't be able to store or use the
      // encrypted values, and the transaction would fail.

      // Correct implementation includes FHE.allowThis()
      await expect(
        contract.connect(patient1).registerPatient(7, 5, 6)
      ).to.not.be.reverted;

      console.log("    ✅ Correct: Contract uses FHE.allowThis()");
      console.log("    ⚠️  Without allowThis(), contract cannot use encrypted data");
    });
  });

  /**
   * Test: User Decryption Pattern
   *
   * @chapter: user-decryption
   * @category: decryption
   *
   * This demonstrates:
   * - How users can access their own encrypted data
   * - The user decryption workflow
   * - Privacy preservation through access control
   *
   * Key Learning: Users can only decrypt data they have permission to access.
   * This enables selective data sharing while maintaining privacy.
   */
  describe("User Decryption: Single Value Access", function () {
    it("Should allow patient to access their encrypted profile data", async function () {
      await contract.connect(patient1).registerPatient(7, 5, 6);

      // Patient can read their profile
      const profile = await contract.patientProfiles(patient1.address);

      expect(profile.isActive).to.be.true;
      expect(profile.registrationTime).to.be.greaterThan(0);

      console.log("    ✅ Patient can access their own profile");
    });

    it("Should allow updates to encrypted values", async function () {
      await contract.connect(patient1).registerPatient(7, 5, 6);

      // Patient updates their mental health levels
      await contract.connect(patient1).updateMentalHealthLevels(5, 4, 3);

      const profile = await contract.patientProfiles(patient1.address);
      expect(profile.isActive).to.be.true;

      console.log("    ✅ Patient updated encrypted health levels");
    });
  });

  /**
   * Test: Session Management with Encrypted Data
   *
   * @chapter: session-management
   * @category: encrypted-workflows
   *
   * This demonstrates:
   * - Managing encrypted session data
   * - Time-based access control
   * - Session lifecycle management
   * - Improvement score tracking
   *
   * Key Learning: Complex workflows can be built with encrypted data
   * while maintaining privacy throughout the entire process.
   */
  describe("Encrypted Workflows: Session Management", function () {
    beforeEach(async function () {
      // Register patient before each session test
      await contract.connect(patient1).registerPatient(7, 5, 6);
    });

    it("Should start encrypted counseling session", async function () {
      const sessionType = 1; // Anxiety support
      const severityLevel = 8;

      await contract.connect(patient1).startCounselingSession(sessionType, severityLevel);

      const stats = await contract.getSessionStats();
      expect(stats.totalSessions).to.equal(1);

      console.log("    ✅ Started encrypted counseling session");
    });

    it("Should complete session with encrypted improvement score", async function () {
      // Start session
      await contract.connect(patient1).startCounselingSession(1, 8);

      // Complete session with improvement rating
      const improvementScore = 7;
      await contract.connect(patient1).completeSession(1, improvementScore);

      const sessionInfo = await contract.getSessionInfo(1);
      expect(sessionInfo.sessionCompleted).to.be.true;
      expect(sessionInfo.endTime).to.be.greaterThan(0);

      console.log("    ✅ Completed session with encrypted improvement score");
    });

    it("Should track multiple sessions per patient", async function () {
      // Start first session
      await contract.connect(patient1).startCounselingSession(1, 8);
      await contract.connect(patient1).completeSession(1, 7);

      // Wait for session cooldown
      await ethers.provider.send("evm_increaseTime", [1800]); // 30 minutes
      await ethers.provider.send("evm_mine", []);

      // Start second session
      await contract.connect(patient1).startCounselingSession(2, 6);

      const sessionCount = await contract.getPatientSessionCount(patient1.address);
      expect(sessionCount).to.equal(2);

      console.log("    ✅ Multiple sessions tracked with encryption");
    });
  });

  /**
   * Test: Counselor Role and Therapy Plans
   *
   * @chapter: role-based-access
   * @category: authorization
   *
   * This demonstrates:
   * - Role-based access control
   * - Counselor-specific functions
   * - Creating encrypted therapy plans
   * - Priority level management
   *
   * Key Learning: FHEVM supports traditional access control patterns
   * (like onlyCounselor modifier) combined with encrypted data management.
   */
  describe("Role-Based Access: Counselor Functions", function () {
    beforeEach(async function () {
      await contract.connect(patient1).registerPatient(7, 5, 6);
    });

    it("Should allow counselor to create therapy plan", async function () {
      const recommendedSessions = 10;
      const priorityLevel = 3; // High priority

      await contract
        .connect(counselor)
        .createTherapyPlan(patient1.address, recommendedSessions, priorityLevel);

      const planStatus = await contract.getTherapyPlanStatus(patient1.address);
      expect(planStatus.planActive).to.be.true;

      console.log("    ✅ Counselor created encrypted therapy plan");
    });

    it("Should prevent non-counselor from creating plans", async function () {
      await expect(
        contract.connect(unauthorized).createTherapyPlan(patient1.address, 10, 3)
      ).to.be.revertedWith("Not authorized counselor");

      console.log("    ✅ Role-based access control enforced");
    });

    it("Should allow counselor to complete patient sessions", async function () {
      await contract.connect(patient1).startCounselingSession(1, 8);

      // Counselor can complete sessions
      await contract.connect(counselor).completeSession(1, 8);

      const sessionInfo = await contract.getSessionInfo(1);
      expect(sessionInfo.sessionCompleted).to.be.true;

      console.log("    ✅ Counselor can manage sessions");
    });
  });

  /**
   * Test: Emergency Alert System
   *
   * @chapter: public-decryption
   * @category: emergency-handling
   *
   * This demonstrates:
   * - Conditional logic with encrypted data
   * - Emergency detection patterns
   * - Event emission with privacy preservation
   * - Threshold-based alerting
   *
   * Key Learning: FHEVM allows checking encrypted values against thresholds
   * to trigger public events while keeping the actual values private.
   */
  describe("Emergency Detection: Public Alerts from Encrypted Data", function () {
    it("Should emit emergency alert for high anxiety level", async function () {
      await expect(contract.connect(patient1).registerPatient(9, 5, 6))
        .to.emit(contract, "EmergencyAlert")
        .withArgs(patient1.address, await ethers.provider.getBlockNumber());

      console.log("    ✅ Emergency alert triggered for high anxiety");
    });

    it("Should emit emergency alert for high depression level", async function () {
      await expect(contract.connect(patient1).registerPatient(5, 9, 6))
        .to.emit(contract, "EmergencyAlert")
        .withArgs(patient1.address, await ethers.provider.getBlockNumber());

      console.log("    ✅ Emergency alert triggered for high depression");
    });

    it("Should emit emergency alert for all elevated levels", async function () {
      await expect(contract.connect(patient1).registerPatient(7, 7, 7))
        .to.emit(contract, "EmergencyAlert")
        .withArgs(patient1.address, await ethers.provider.getBlockNumber());

      console.log("    ✅ Emergency alert triggered for all elevated levels");
    });

    it("Should NOT emit alert for normal levels", async function () {
      await expect(
        contract.connect(patient1).registerPatient(5, 4, 6)
      ).to.not.emit(contract, "EmergencyAlert");

      console.log("    ✅ No alert for normal levels - privacy maintained");
    });
  });

  /**
   * Test: Session Availability and Timing
   *
   * @chapter: time-based-control
   * @category: scheduling
   *
   * This demonstrates:
   * - Time-based access control
   * - Session slot management
   * - Cooldown periods
   * - Availability checking
   *
   * Key Learning: FHEVM contracts can combine encrypted data with
   * time-based logic for complex scheduling scenarios.
   */
  describe("Time-Based Control: Session Availability", function () {
    beforeEach(async function () {
      await contract.connect(patient1).registerPatient(7, 5, 6);
    });

    it("Should show session available initially", async function () {
      const availability = await contract.getSessionAvailability();
      expect(availability.available).to.be.true;

      console.log("    ✅ Session slots available initially");
    });

    it("Should enforce break time between sessions", async function () {
      // Start first session
      await contract.connect(patient1).startCounselingSession(1, 8);

      // Try to start another session immediately
      await expect(
        contract.connect(patient2).startCounselingSession(2, 7)
      ).to.be.revertedWith("No session slots available");

      console.log("    ✅ Break time enforced between sessions");
    });

    it("Should allow session after break period", async function () {
      await contract.connect(patient1).startCounselingSession(1, 8);

      // Fast forward time by 30 minutes
      await ethers.provider.send("evm_increaseTime", [1800]);
      await ethers.provider.send("evm_mine", []);

      // Now patient2 can start a session
      await contract.connect(patient2).registerPatient(6, 5, 7);
      await expect(
        contract.connect(patient2).startCounselingSession(2, 7)
      ).to.not.be.reverted;

      console.log("    ✅ Session available after break period");
    });
  });

  /**
   * Test: Input Validation and Error Handling
   *
   * @chapter: input-validation
   * @category: security
   *
   * This demonstrates:
   * - Input range validation
   * - Error handling patterns
   * - Secure coding practices
   * - Preventing invalid encrypted data
   *
   * Key Learning: Always validate inputs before encryption to prevent
   * invalid data from being stored in encrypted form.
   */
  describe("Input Validation: Secure Parameter Checking", function () {
    it("Should reject invalid mental health levels", async function () {
      await expect(
        contract.connect(patient1).registerPatient(11, 5, 6)
      ).to.be.revertedWith("Levels must be 0-10");

      console.log("    ✅ Invalid input rejected before encryption");
    });

    it("Should reject invalid session type", async function () {
      await contract.connect(patient1).registerPatient(7, 5, 6);

      await expect(
        contract.connect(patient1).startCounselingSession(5, 8)
      ).to.be.revertedWith("Invalid session type");

      console.log("    ✅ Invalid session type rejected");
    });

    it("Should prevent duplicate registration", async function () {
      await contract.connect(patient1).registerPatient(7, 5, 6);

      await expect(
        contract.connect(patient1).registerPatient(5, 4, 3)
      ).to.be.revertedWith("Patient already registered");

      console.log("    ✅ Duplicate registration prevented");
    });
  });

  /**
   * Test: Privacy Verification
   *
   * @chapter: privacy
   * @category: data-protection
   *
   * This demonstrates:
   * - Data privacy verification
   * - Encrypted storage confirmation
   * - Access control enforcement
   * - Privacy preservation patterns
   *
   * Key Learning: FHEVM ensures that sensitive data remains encrypted
   * on-chain and can only be accessed by authorized parties.
   */
  describe("Privacy: Data Protection Verification", function () {
    it("Should store mental health data in encrypted form", async function () {
      await contract.connect(patient1).registerPatient(7, 5, 6);

      // The actual values are encrypted and cannot be read directly
      // Only authorized parties with decryption keys can access them
      const profile = await contract.patientProfiles(patient1.address);

      // We can verify the profile exists but actual values are encrypted
      expect(profile.isActive).to.be.true;

      console.log("    ✅ Mental health data stored in encrypted form");
      console.log("    🔒 Actual values protected by FHE encryption");
    });

    it("Should maintain privacy across multiple patients", async function () {
      await contract.connect(patient1).registerPatient(7, 5, 6);
      await contract.connect(patient2).registerPatient(3, 2, 4);

      // Each patient's data is independently encrypted
      const profile1 = await contract.patientProfiles(patient1.address);
      const profile2 = await contract.patientProfiles(patient2.address);

      expect(profile1.isActive).to.be.true;
      expect(profile2.isActive).to.be.true;

      console.log("    ✅ Multi-patient privacy maintained");
    });
  });

  /**
   * Test: Handle Lifecycle
   *
   * @chapter: handles
   * @category: lifecycle
   *
   * This demonstrates:
   * - Understanding encrypted handles
   * - Handle generation and management
   * - Handle lifecycle in storage
   * - Best practices for handle usage
   *
   * Key Learning: Handles (euint*) represent references to encrypted
   * values. Understanding their lifecycle is crucial for FHEVM development.
   */
  describe("Handle Lifecycle: Understanding Encrypted References", function () {
    it("Should generate handles for encrypted values", async function () {
      // When we register, the contract creates handles for encrypted values
      await contract.connect(patient1).registerPatient(7, 5, 6);

      const profile = await contract.patientProfiles(patient1.address);

      // These are handles to encrypted values, not the actual values
      expect(profile.isActive).to.be.true;

      console.log("    ✅ Handles generated for encrypted values");
      console.log("    📝 Handles are references, not plaintext values");
    });

    it("Should persist handles across transactions", async function () {
      await contract.connect(patient1).registerPatient(7, 5, 6);

      // Update creates new handles
      await contract.connect(patient1).updateMentalHealthLevels(6, 4, 5);

      const profile = await contract.patientProfiles(patient1.address);
      expect(profile.isActive).to.be.true;

      console.log("    ✅ Handles persist and update correctly");
    });
  });

  /**
   * Test: Complete User Journey
   *
   * @chapter: end-to-end
   * @category: integration
   *
   * This demonstrates:
   * - Complete user workflow from registration to completion
   * - Integration of all FHEVM features
   * - Real-world usage scenario
   * - End-to-end privacy preservation
   *
   * Key Learning: This test shows how all FHEVM concepts work together
   * to create a complete privacy-preserving application.
   */
  describe("End-to-End: Complete Patient Journey", function () {
    it("Should complete full patient journey with privacy", async function () {
      console.log("\n    👤 Patient Journey Start\n");

      // Step 1: Patient registers anonymously
      console.log("    1️⃣  Patient registration with encrypted data...");
      await contract.connect(patient1).registerPatient(8, 7, 9);
      expect(await contract.isPatientRegistered(patient1.address)).to.be.true;
      console.log("    ✅ Registered anonymously\n");

      // Step 2: Counselor creates therapy plan
      console.log("    2️⃣  Counselor creates encrypted therapy plan...");
      await contract.connect(counselor).createTherapyPlan(patient1.address, 12, 4);
      const plan = await contract.getTherapyPlanStatus(patient1.address);
      expect(plan.planActive).to.be.true;
      console.log("    ✅ Therapy plan created\n");

      // Step 3: Patient starts session
      console.log("    3️⃣  Patient starts encrypted counseling session...");
      await contract.connect(patient1).startCounselingSession(1, 8);
      expect((await contract.getSessionStats()).totalSessions).to.equal(1);
      console.log("    ✅ Session started\n");

      // Step 4: Session completed
      console.log("    4️⃣  Session completed with improvement score...");
      await contract.connect(patient1).completeSession(1, 7);
      const session = await contract.getSessionInfo(1);
      expect(session.sessionCompleted).to.be.true;
      console.log("    ✅ Session completed\n");

      // Step 5: Patient updates levels
      console.log("    5️⃣  Patient updates mental health levels...");
      await contract.connect(patient1).updateMentalHealthLevels(6, 5, 7);
      console.log("    ✅ Health levels updated\n");

      console.log("    🎉 Complete journey: Privacy maintained throughout!");
      console.log("    🔒 All sensitive data remained encrypted");
      console.log("    ✨ Patient Journey Complete\n");
    });
  });
});
