# FHEVM Example: Anonymous Mental Health Platform

## Overview

Welcome to the **Anonymous Mental Health Platform** FHEVM example repository. This comprehensive guide demonstrates how to build privacy-preserving healthcare applications using **Fully Homomorphic Encryption (FHE)** on the blockchain.

## What You'll Learn

This example covers all essential FHEVM concepts:

### 🔐 Encryption Fundamentals
- Converting plaintext to encrypted types (`euint8`, `euint32`)
- Storing encrypted data on-chain
- Understanding encrypted handle lifecycle
- Input validation before encryption

### 🔑 Access Control
- Using `FHE.allowThis()` for contract permissions
- Using `FHE.allow()` for user permissions
- Implementing multi-party access control
- Managing permission lifecycles

### 📤 Decryption Patterns
- User decryption (patients accessing their own data)
- Public decryption (emergency alerts)
- Threshold-based conditional logic
- Privacy-preserving data retrieval

### 🏥 Real-World Application
- Mental health data protection
- Patient registration and profiling
- Counseling session management
- Emergency detection system
- Role-based access control

## Why This Example Matters

Mental health data is among the most sensitive personal information. This example demonstrates how FHEVM enables:

- ✅ **Complete Privacy** - Health indicators remain encrypted throughout
- ✅ **Selective Access** - Only authorized parties can decrypt specific data
- ✅ **Confidential Operations** - Perform computations without revealing values
- ✅ **Emergency Response** - Trigger alerts from encrypted thresholds
- ✅ **Regulatory Compliance** - HIPAA/GDPR-friendly architecture

## Quick Start

```bash
# Install dependencies
npm install

# Compile contracts
npm run compile

# Run comprehensive tests
npm test

# Generate documentation
npm run generate-docs

# Deploy contract
npm run deploy
```

## Project Structure

```
AnonymousMentalHealth/
├── contracts/
│   └── AnonymousMentalHealth.sol    # Main FHEVM smart contract
├── test/
│   └── AnonymousMentalHealth.test.ts # Comprehensive test suite (20+ tests)
├── scripts/
│   ├── create-fhevm-example.ts      # Example generator
│   ├── generate-docs.ts             # Documentation generator
│   └── deploy.ts                    # Deployment script
├── docs/                             # GitBook documentation (this folder)
└── README.md                         # Main documentation
```

## Learning Path

### Beginner
1. Start with [Encryption](encryption.md) - Learn basic FHE operations
2. Understand [Access Control](access-control.md) - Master permission patterns
3. Study [Security](security.md) - Learn input validation

### Intermediate
4. Explore [User Decryption](user-decryption.md) - Build decryption workflows
5. Review [Anti-Patterns](anti-patterns.md) - Understand common mistakes
6. Practice [Encrypted Workflows](encrypted-workflows.md) - Complex operations

### Advanced
7. Study [Public Decryption](public-decryption.md) - Conditional logic
8. Examine [Healthcare Use Cases](healthcare-use-cases.md) - Real-world patterns
9. Build your own FHEVM application

## Key Concepts

### Encrypted Types

FHEVM provides encrypted integer types:

```solidity
euint8   // 0-255
euint16  // 0-65,535
euint32  // 0-4,294,967,295
euint64  // Larger values
```

### Permission Management

Always grant both permissions:

```solidity
// Convert plaintext to encrypted
euint32 encrypted = FHE.asEuint32(value);

// ✅ Grant contract permission
FHE.allowThis(encrypted);

// ✅ Grant user permission
FHE.allow(encrypted, msg.sender);
```

### Input Validation

Validate **before** encrypting:

```solidity
// ✅ Correct order
require(value <= 10, "Invalid value");
euint8 encrypted = FHE.asEuint8(value);

// ❌ Incorrect - wasteful
euint8 encrypted = FHE.asEuint8(value);
require(value <= 10, "Invalid value");
```

## Use Cases

This pattern extends to many domains:

- 💰 **Finance** - Encrypted trading, private portfolios
- 🏥 **Healthcare** - Patient records, genetic data, mental health
- 🗳️ **Voting** - Anonymous ballot systems, private polls
- 📦 **Supply Chain** - Confidential pricing, inventory
- 🛡️ **Insurance** - Private risk assessment, claims
- 🎓 **Education** - Confidential academic records

## Documentation Organization

Our documentation is organized by concept:

- **Basic Concepts** - Encryption and access control fundamentals
- **Advanced Topics** - Decryption patterns and workflows
- **Best Practices** - Anti-patterns and security
- **Real-World Applications** - Healthcare use cases

Navigate using the sidebar or [Summary](SUMMARY.md) page.

## Test Coverage

This example includes **20+ comprehensive tests** organized into:

1. Encryption: Basic encrypted value storage (2 tests)
2. Access Control: FHE.allow and FHE.allowThis (3 tests)
3. Anti-Patterns: Missing FHE.allowThis() (1 test)
4. User Decryption: Single value access (2 tests)
5. Encrypted Workflows: Session management (3 tests)
6. Role-Based Access: Counselor functions (3 tests)
7. Emergency Detection: Public alerts (4 tests)
8. Time-Based Control: Session availability (3 tests)
9. Input Validation: Secure parameter checking (3 tests)
10. End-to-End: Complete patient journey (1 test)

Each test demonstrates specific FHEVM concepts with detailed explanations.

## Resources

### FHEVM Documentation
- [Zama FHEVM Official Docs](https://docs.zama.ai/fhevm)
- [FHEVM GitHub Repository](https://github.com/zama-ai/fhevm)
- [FHEVM Solidity Library](https://github.com/zama-ai/fhevm-solidity)

### Development Tools
- [Hardhat Documentation](https://hardhat.org/docs)
- [Ethers.js Documentation](https://docs.ethers.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Community
- [Zama Discord](https://discord.com/invite/zama)
- [Zama Community Forum](https://www.zama.ai/community)
- [Zama on GitHub](https://github.com/zama-ai)

## Next Steps

1. **Read the Guides** - Start with [Encryption](encryption.md)
2. **Run the Tests** - Execute `npm test` and study the output
3. **Modify the Contract** - Add new encrypted fields
4. **Build Your Own** - Use `npm run create-example` to start fresh

## License

MIT License - See [LICENSE](../LICENSE) file for details.

---

**Built for Zama FHEVM Bounty Track - December 2025**

**Privacy-Preserving Healthcare | Educational FHEVM Example | Production-Ready Code**
