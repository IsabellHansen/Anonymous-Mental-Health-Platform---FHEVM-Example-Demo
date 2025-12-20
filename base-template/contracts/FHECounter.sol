// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title FHECounter
 * @notice A simple encrypted counter demonstrating basic FHEVM operations
 * @dev This contract shows how to:
 *      - Create encrypted values
 *      - Grant permissions (FHE.allowThis and FHE.allow)
 *      - Perform encrypted arithmetic
 *      - Handle external encrypted inputs
 */
contract FHECounter is ZamaEthereumConfig {
    // Encrypted counter value
    euint32 private _count;

    // Events
    event CounterIncremented(address indexed user, uint256 timestamp);
    event CounterDecremented(address indexed user, uint256 timestamp);

    /**
     * @notice Get the current encrypted count
     * @dev Returns the encrypted handle, not the plaintext value
     * @return The encrypted counter value
     */
    function getCount() external view returns (euint32) {
        return _count;
    }

    /**
     * @notice Increment the counter by a specified value
     * @dev This example omits overflow checks for simplicity.
     *      In production, implement proper range validation.
     * @param value The amount to increment (plaintext)
     */
    function increment(uint32 value) external {
        // Convert plaintext to encrypted
        euint32 encryptedValue = FHE.asEuint32(value);

        // Perform encrypted addition
        _count = FHE.add(_count, encryptedValue);

        // CRITICAL: Grant permissions
        FHE.allowThis(_count);         // Contract can use this value
        FHE.allow(_count, msg.sender);  // Caller can decrypt this value

        emit CounterIncremented(msg.sender, block.timestamp);
    }

    /**
     * @notice Increment with external encrypted input
     * @dev Demonstrates using encrypted input from client
     * @param inputEuint32 External encrypted value
     * @param inputProof Proof that encryption is valid
     */
    function incrementEncrypted(
        externalEuint32 inputEuint32,
        bytes calldata inputProof
    ) external {
        // Convert external encrypted to internal encrypted
        euint32 encryptedValue = FHE.fromExternal(inputEuint32, inputProof);

        // Perform encrypted addition
        _count = FHE.add(_count, encryptedValue);

        // Grant permissions
        FHE.allowThis(_count);
        FHE.allow(_count, msg.sender);

        emit CounterIncremented(msg.sender, block.timestamp);
    }

    /**
     * @notice Decrement the counter by a specified value
     * @dev This example omits underflow checks for simplicity.
     *      In production, implement proper range validation.
     * @param value The amount to decrement (plaintext)
     */
    function decrement(uint32 value) external {
        // Convert plaintext to encrypted
        euint32 encryptedValue = FHE.asEuint32(value);

        // Perform encrypted subtraction
        _count = FHE.sub(_count, encryptedValue);

        // Grant permissions
        FHE.allowThis(_count);
        FHE.allow(_count, msg.sender);

        emit CounterDecremented(msg.sender, block.timestamp);
    }

    /**
     * @notice Reset the counter to zero
     */
    function reset() external {
        _count = FHE.asEuint32(0);

        FHE.allowThis(_count);
        FHE.allow(_count, msg.sender);
    }
}
