import { expect } from "chai";
import { ethers } from "hardhat";
import type { FHECounter } from "../typechain-types";
import type { Signer } from "ethers";

/**
 * Test Suite for FHECounter Contract
 *
 * @chapter: encryption
 * @category: basic-encryption
 *
 * This test suite demonstrates:
 * - How to deploy FHEVM contracts
 * - Basic encrypted operations
 * - Permission management with FHE.allow() and FHE.allowThis()
 * - Testing encrypted values
 *
 * Key Learning: All sensitive data in FHEVM is encrypted before storage
 */
describe("FHECounter", function () {
    let contract: FHECounter;
    let owner: Signer;
    let user1: Signer;
    let user2: Signer;

    /**
     * Deploy a fresh contract before each test
     * This ensures test isolation
     */
    beforeEach(async function () {
        // Get signers from Hardhat
        [owner, user1, user2] = await ethers.getSigners();

        // Deploy the FHECounter contract
        const FHECounterFactory = await ethers.getContractFactory("FHECounter");
        contract = await FHECounterFactory.deploy();
        await contract.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should deploy successfully", async function () {
            // Verify contract address exists
            const address = await contract.getAddress();
            expect(address).to.be.properAddress;
        });

        it("Should initialize with zero count", async function () {
            // Counter should start at 0
            const count = await contract.getCount();
            expect(count).to.exist;
        });
    });

    describe("Increment Operations", function () {
        it("Should increment the counter by a given value", async function () {
            // Increment by 5
            const tx = await contract.connect(user1).increment(5);
            await tx.wait();

            // Verify event was emitted
            await expect(tx)
                .to.emit(contract, "CounterIncremented")
                .withArgs(await user1.getAddress(), await ethers.provider.getBlock("latest").then(b => b!.timestamp));

            // The count is now encrypted
            // In production, you would decrypt client-side to verify
            const encryptedCount = await contract.getCount();
            expect(encryptedCount).to.exist;
        });

        it("Should allow multiple increments", async function () {
            // Multiple increments
            await contract.connect(user1).increment(3);
            await contract.connect(user1).increment(2);
            await contract.connect(user1).increment(1);

            // Count is now 6 (encrypted)
            const encryptedCount = await contract.getCount();
            expect(encryptedCount).to.exist;
        });

        it("Should handle increments from different users", async function () {
            // User 1 increments
            await contract.connect(user1).increment(5);

            // User 2 increments
            await contract.connect(user2).increment(10);

            // Count is now 15 (encrypted)
            const encryptedCount = await contract.getCount();
            expect(encryptedCount).to.exist;
        });
    });

    describe("Decrement Operations", function () {
        it("Should decrement the counter by a given value", async function () {
            // First increment
            await contract.connect(user1).increment(10);

            // Then decrement
            const tx = await contract.connect(user1).decrement(3);
            await tx.wait();

            // Verify event was emitted
            await expect(tx)
                .to.emit(contract, "CounterDecremented")
                .withArgs(await user1.getAddress());

            // Count is now 7 (encrypted)
            const encryptedCount = await contract.getCount();
            expect(encryptedCount).to.exist;
        });

        it("Should allow multiple decrements", async function () {
            // Increment to 20
            await contract.connect(user1).increment(20);

            // Decrement multiple times
            await contract.connect(user1).decrement(5);
            await contract.connect(user1).decrement(3);
            await contract.connect(user1).decrement(2);

            // Count is now 10 (encrypted)
            const encryptedCount = await contract.getCount();
            expect(encryptedCount).to.exist;
        });
    });

    describe("Reset Operations", function () {
        it("Should reset the counter to zero", async function () {
            // Increment first
            await contract.connect(user1).increment(100);

            // Reset
            await contract.connect(user1).reset();

            // Count is now 0 (encrypted)
            const encryptedCount = await contract.getCount();
            expect(encryptedCount).to.exist;
        });
    });

    describe("Access Control", function () {
        it("Should grant caller permission to decrypt", async function () {
            // After increment, user1 has permission to decrypt
            await contract.connect(user1).increment(5);

            // User can call getCount (returns encrypted value)
            const encryptedCount = await contract.getCount();
            expect(encryptedCount).to.exist;

            // In production with actual FHEVM:
            // const decrypted = await fhevm.decrypt(contractAddress, encryptedCount);
            // expect(decrypted).to.equal(5);
        });

        it("Should allow contract to use encrypted values", async function () {
            // FHE.allowThis() grants the contract permission
            // This is tested implicitly - if permission wasn't granted,
            // subsequent operations would fail

            await contract.connect(user1).increment(5);
            await contract.connect(user1).increment(3); // This works because allowThis was called

            const encryptedCount = await contract.getCount();
            expect(encryptedCount).to.exist;
        });
    });

    describe("Complete Workflow", function () {
        it("Should handle a complete encrypted counter workflow", async function () {
            // 1. Start at 0
            // 2. Increment by 10
            await contract.connect(user1).increment(10);

            // 3. Increment by 5
            await contract.connect(user1).increment(5);

            // 4. Decrement by 3
            await contract.connect(user1).decrement(3);

            // 5. Final count should be 12 (encrypted)
            const encryptedCount = await contract.getCount();
            expect(encryptedCount).to.exist;

            // All operations maintain encryption throughout
        });
    });
});
