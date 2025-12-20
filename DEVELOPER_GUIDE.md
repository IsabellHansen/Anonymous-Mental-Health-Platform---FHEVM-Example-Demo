# Developer Guide

## Anonymous Mental Health Platform - FHEVM Example

This guide explains how to maintain, extend, and update this FHEVM example repository for the Zama December 2025 Bounty Track.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Adding New Examples](#adding-new-examples)
- [Updating Dependencies](#updating-dependencies)
- [Running Automation Scripts](#running-automation-scripts)
- [Testing Guidelines](#testing-guidelines)
- [Documentation Workflow](#documentation-workflow)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

---

## Getting Started

### Prerequisites

Ensure you have the following installed:

```bash
Node.js >= 16.x
npm >= 7.x
TypeScript >= 5.x
Git
```

### Initial Setup

```bash
# Clone the repository
cd AnonymousMentalHealth

# Install dependencies
npm install

# Compile contracts
npm run compile

# Run tests
npm test
```

---

## Adding New Examples

### Step 1: Create the Smart Contract

Create a new Solidity file in `contracts/`:

```solidity
// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Your Example Contract
/// @notice Brief description of what this contract demonstrates
contract YourExample is ZamaEthereumConfig {
    // Your encrypted state variables
    euint32 private _encryptedData;

    /// @notice Function description
    /// @dev Implementation notes, especially FHE-specific patterns
    function yourFunction(externalEuint32 input, bytes calldata inputProof) external {
        // Convert external encrypted input to internal type
        euint32 encrypted = FHE.fromExternal(input, inputProof);

        // Perform FHE operations
        _encryptedData = FHE.add(_encryptedData, encrypted);

        // ✅ CRITICAL: Grant permissions
        FHE.allowThis(_encryptedData);  // Contract permission
        FHE.allow(_encryptedData, msg.sender);  // User permission
    }
}
```

**Key Requirements:**
- Inherit from `ZamaEthereumConfig`
- Import from `@fhevm/solidity`
- Always call `FHE.allowThis()` and `FHE.allow()` for encrypted values
- Include comprehensive comments
- Follow the BSD-3-Clause-Clear license

---

### Step 2: Create Test Suite

Create a corresponding test file in `test/`:

```typescript
import { expect } from "chai";
import { ethers } from "hardhat";
import type { YourExample } from "../typechain-types";
import type { Signer } from "ethers";

/**
 * Test: Your Example Feature
 *
 * @chapter: your-chapter-name
 * @category: your-category-name
 *
 * This test demonstrates:
 * - Key concept 1
 * - Key concept 2
 * - Key concept 3
 *
 * Key Learning: Main takeaway from this example
 */
describe("YourExample", function () {
    let contract: YourExample;
    let owner: Signer;
    let user1: Signer;

    beforeEach(async function () {
        // Get signers
        [owner, user1] = await ethers.getSigners();

        // Deploy contract
        const YourExampleFactory = await ethers.getContractFactory("YourExample");
        contract = await YourExampleFactory.deploy();
        await contract.waitForDeployment();
    });

    it("Should perform encrypted operation correctly", async function () {
        // Your test implementation
        const tx = await contract.connect(user1).yourFunction(/* params */);
        await tx.wait();

        expect(/* assertion */).to.be.true;
    });

    it("Should demonstrate error handling", async function () {
        // Test failure cases
        await expect(
            contract.connect(user1).yourFunction(/* invalid params */)
        ).to.be.revertedWith("Expected error message");
    });
});
```

**Test Requirements:**
- Include JSDoc comments with `@chapter` and `@category` tags
- Test both success and failure cases
- Demonstrate correct FHE patterns
- Show common mistakes to avoid

---

### Step 3: Update Automation Configuration

Edit `scripts/create-fhevm-example.ts` to add your example:

```typescript
// Add to the exampleConfig in the main execution block
const exampleConfig: ExampleConfig = {
    name: 'Your Example Name',
    description: 'Brief description of what this demonstrates',
    category: 'your-category',
    features: [
        'feature-1',
        'feature-2',
        'fhe-encryption',
    ],
};
```

---

### Step 4: Generate Documentation

Run the documentation generator:

```bash
npm run generate-docs
```

This will:
- Extract documentation from your test comments
- Generate markdown files in `docs/`
- Update `docs/SUMMARY.md`
- Create GitBook-compatible output

---

### Step 5: Verify Everything Works

```bash
# Compile contracts
npm run compile

# Run tests
npm test

# Check generated documentation
ls docs/

# Test example generation
npm run create-example
```

---

## Updating Dependencies

### Updating FHEVM Libraries

When Zama releases new versions of FHEVM libraries:

1. **Check for Updates**

```bash
npm outdated
```

2. **Update package.json**

```json
{
  "dependencies": {
    "@fhevm/contracts": "^0.6.0",  // Update version
    "@openzeppelin/contracts": "^5.1.0"
  }
}
```

3. **Install Updates**

```bash
npm install
```

4. **Update Import Paths (if needed)**

Check for breaking changes in:
- Import statements in contracts
- Configuration classes (e.g., `ZamaEthereumConfig`)
- FHE function signatures

5. **Update Hardhat Configuration**

If required, update `hardhat.config.ts`:

```typescript
import "@fhevm/hardhat-plugin";

const config: HardhatUserConfig = {
  solidity: "0.8.24",  // Update if needed
  // ... other config
};
```

6. **Run Full Test Suite**

```bash
npm run compile
npm test
```

7. **Update Documentation**

Update README.md with:
- New dependency versions
- Breaking changes
- Migration guide (if applicable)

---

### Updating TypeScript and Build Tools

```bash
# Update TypeScript
npm install -D typescript@latest

# Update ts-node
npm install -D ts-node@latest

# Update Hardhat toolbox
npm install -D @nomicfoundation/hardhat-toolbox@latest
```

After updating:

```bash
# Clean build artifacts
rm -rf artifacts cache typechain-types

# Rebuild
npm run compile
```

---

## Running Automation Scripts

### 1. Create FHEVM Example

Generate a new standalone example repository:

```bash
npm run create-example
```

This creates a new example with:
- Proper directory structure
- Base Hardhat configuration
- Template contracts and tests
- Documentation scaffolding

**Output Location:** `examples/` directory

---

### 2. Generate Documentation

Auto-generate GitBook-compatible documentation:

```bash
npm run generate-docs
```

**What It Does:**
- Extracts JSDoc comments from test files
- Parses `@chapter` and `@category` tags
- Generates markdown files
- Creates `SUMMARY.md` index
- Organizes by concept categories

**Output Location:** `docs/` directory

---

### 3. Deploy Contract

Deploy to local or testnet:

```bash
# Local deployment
npm run deploy

# Sepolia testnet (configure .env first)
NETWORK=sepolia npm run deploy
```

---

## Testing Guidelines

### Writing Comprehensive Tests

Follow these patterns for effective tests:

#### 1. Test Structure

```typescript
describe("Feature Name", function () {
    // Setup
    let contract: ContractType;
    let signers: Signer[];

    beforeEach(async function () {
        // Deploy fresh contract
    });

    // Test cases organized by functionality
    describe("Encrypted Operations", function () {
        it("Should encrypt and store data", async function () {
            // Test implementation
        });
    });

    describe("Access Control", function () {
        it("Should grant permissions correctly", async function () {
            // Test implementation
        });
    });

    describe("Error Cases", function () {
        it("Should revert on invalid input", async function () {
            // Test implementation
        });
    });
});
```

#### 2. FHE-Specific Test Patterns

```typescript
// ✅ DO: Test encryption and permission granting
it("Should encrypt and grant access", async function () {
    const value = 42;
    await contract.encryptAndStore(value);

    // Verify encryption worked
    const isRegistered = await contract.checkRegistration();
    expect(isRegistered).to.be.true;
});

// ✅ DO: Test access control
it("Should allow only authorized access", async function () {
    await contract.connect(owner).grantAccess(user1.address);

    // User1 should have access
    const hasAccess = await contract.checkAccess(user1.address);
    expect(hasAccess).to.be.true;
});

// ✅ DO: Test error conditions
it("Should revert on unauthorized access", async function () {
    await expect(
        contract.connect(unauthorized).accessData()
    ).to.be.revertedWith("Unauthorized");
});
```

#### 3. Testing Anti-Patterns

Include tests that demonstrate common mistakes:

```typescript
/**
 * @chapter: anti-patterns
 * @category: common-mistakes
 */
describe("Common Mistakes to Avoid", function () {
    it("Should demonstrate why FHE.allowThis() is required", async function () {
        // Show correct vs incorrect implementation
    });
});
```

---

## Documentation Workflow

### Documentation Annotations

Use JSDoc-style comments in test files:

```typescript
/**
 * Test: Feature Description
 *
 * @chapter: access-control
 * @category: permissions
 *
 * This test demonstrates:
 * - How to use FHE.allow()
 * - Permission management patterns
 * - Common pitfalls
 *
 * Key Learning: Always grant both contract and user permissions
 */
```

### Available Chapters

Organize tests into these chapters:
- `encryption` - Basic and advanced encryption
- `access-control` - Permission management
- `decryption` - User and public decryption
- `anti-patterns` - Common mistakes
- `workflows` - Complex operations
- `security` - Input validation and best practices

### Available Categories

Use specific categories within chapters:
- `basic-encryption`
- `multi-value-encryption`
- `permissions`
- `user-access`
- `common-mistakes`
- `session-management`
- `input-validation`

---

## Troubleshooting

### Common Issues

#### 1. Compilation Errors

**Issue:** Contract fails to compile

**Solutions:**
```bash
# Clean build artifacts
rm -rf artifacts cache typechain-types

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Try compiling again
npm run compile
```

#### 2. FHE Permission Errors

**Issue:** "FHE operation not allowed" errors

**Solution:** Ensure you call both:
```solidity
FHE.allowThis(encryptedValue);  // ← Don't forget this
FHE.allow(encryptedValue, msg.sender);
```

#### 3. Test Failures

**Issue:** Tests fail unexpectedly

**Solutions:**
```bash
# Run tests with detailed output
npm test -- --reporter spec

# Run specific test file
npx hardhat test test/YourTest.test.ts

# Check Hardhat network
npx hardhat node
# Then in another terminal:
npm test
```

#### 4. Documentation Not Generating

**Issue:** `generate-docs` produces empty output

**Solution:** Verify test files include `@chapter` tags:
```typescript
/**
 * @chapter: your-chapter
 * @category: your-category
 */
```

---

## Best Practices

### Smart Contract Development

1. **Always Use FHE Permissions**
   ```solidity
   // ✅ Correct
   euint32 value = FHE.asEuint32(123);
   FHE.allowThis(value);
   FHE.allow(value, user);

   // ❌ Incorrect - missing permissions
   euint32 value = FHE.asEuint32(123);
   ```

2. **Validate Before Encrypting**
   ```solidity
   // ✅ Correct
   require(input <= 10, "Value too large");
   euint8 encrypted = FHE.asEuint8(input);

   // ❌ Incorrect - encrypt then validate
   euint8 encrypted = FHE.asEuint8(input);
   require(input <= 10, "Value too large");
   ```

3. **Use Appropriate Encrypted Types**
   ```solidity
   euint8   // 0-255
   euint16  // 0-65535
   euint32  // 0-4294967295
   euint64  // Larger values
   ```

4. **Document FHE-Specific Behavior**
   ```solidity
   /// @dev This function uses FHE.add() to maintain encryption
   /// @notice Values remain encrypted throughout the operation
   ```

### Testing Best Practices

1. **Test Both Success and Failure**
   ```typescript
   it("Should succeed with valid input", async function () { });
   it("Should fail with invalid input", async function () { });
   ```

2. **Use Descriptive Test Names**
   ```typescript
   // ✅ Good
   it("Should grant access to counselor for patient data", async function () {});

   // ❌ Bad
   it("Test 1", async function () {});
   ```

3. **Include Setup and Teardown**
   ```typescript
   beforeEach(async function () {
       // Deploy fresh contract for each test
   });
   ```

### Documentation Best Practices

1. **Keep Documentation in Sync**
   - Update docs when changing code
   - Run `npm run generate-docs` after test changes

2. **Use Clear Examples**
   - Show complete code snippets
   - Include expected outputs
   - Explain why, not just what

3. **Organize by Learning Path**
   - Start with basic concepts
   - Progress to advanced patterns
   - Include real-world use cases

---

## Maintenance Checklist

### Monthly Maintenance

- [ ] Check for FHEVM library updates
- [ ] Review and update dependencies
- [ ] Run full test suite
- [ ] Regenerate documentation
- [ ] Review GitHub issues/discussions

### Before Major Updates

- [ ] Create backup branch
- [ ] Update all dependencies
- [ ] Run comprehensive tests
- [ ] Update README and guides
- [ ] Regenerate all documentation
- [ ] Test example generation scripts

### Release Checklist

- [ ] All tests passing
- [ ] Documentation up to date
- [ ] Example scripts working
- [ ] README reflects current state
- [ ] No hardcoded secrets
- [ ] License files present
- [ ] Git tags created

---

## Additional Resources

### FHEVM Resources

- [Zama FHEVM Documentation](https://docs.zama.ai/fhevm)
- [FHEVM GitHub Repository](https://github.com/zama-ai/fhevm)
- [FHEVM Solidity Library](https://github.com/zama-ai/fhevm-solidity)

### Development Tools

- [Hardhat Documentation](https://hardhat.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Ethers.js Documentation](https://docs.ethers.org/)

### Community

- [Zama Discord](https://discord.com/invite/zama)
- [Zama Community Forum](https://www.zama.ai/community)
- [Zama on GitHub](https://github.com/zama-ai)

---

## Contributing

### How to Contribute

1. Fork the repository
2. Create a feature branch
3. Add your example or improvement
4. Write comprehensive tests
5. Generate documentation
6. Submit a pull request

### Code Review Guidelines

All contributions should:
- Follow existing code style
- Include comprehensive tests
- Update documentation
- Pass all CI checks
- Include clear commit messages

---

## Support

### Getting Help

1. **Review Documentation**
   - Check this guide first
   - Read the README.md
   - Review test files for examples

2. **Community Resources**
   - Zama Discord server
   - GitHub Discussions
   - Community Forum

3. **Debugging**
   - Use `console.log()` in tests
   - Run tests with `--reporter spec`
   - Check Hardhat console output

---

## Version History

### Current Version: 1.0.0

**Features:**
- Complete FHEVM example implementation
- Automated documentation generation
- Comprehensive test suite
- Example generation scripts

**Dependencies:**
- @fhevm/contracts: ^0.5.0
- Hardhat: ^2.19.4
- TypeScript: ^5.3.3

---

## License

This project is licensed under the MIT License. See LICENSE file for details.

---

**Last Updated:** December 2025
**Maintainer:** FHEVM Developer Community
**Bounty Track:** Zama December 2025
