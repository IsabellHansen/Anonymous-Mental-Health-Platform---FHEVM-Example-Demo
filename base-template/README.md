# FHEVM Hardhat Base Template

## Overview

This is the base Hardhat template for creating FHEVM (Fully Homomorphic Encryption Virtual Machine) smart contract projects. Use this template as a starting point for building privacy-preserving applications.

## Quick Start

### 1. Copy this template

```bash
# Using automation script (recommended)
npm run create-example

# Or manually copy
cp -r base-template/ my-new-project/
cd my-new-project/
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create your contract

Edit `contracts/YourContract.sol` with your FHEVM contract implementation.

### 4. Write tests

Edit `test/YourContract.test.ts` with comprehensive tests.

### 5. Compile and test

```bash
npm run compile
npm test
```

## What's Included

### Smart Contract Template

- **FHECounter.sol** - Example FHEVM counter contract
- Template structure with ZamaEthereumConfig
- Basic FHE operations demonstration

### Test Template

- **FHECounter.test.ts** - Example test suite
- TypeScript testing setup
- Hardhat integration

### Configuration Files

- **hardhat.config.ts** - Hardhat configuration with FHEVM plugin
- **tsconfig.json** - TypeScript configuration
- **package.json** - Dependencies and scripts
- **.env.example** - Environment variables template

### Scripts

- **deploy.ts** - Deployment script template

## Dependencies

### Core FHEVM

```json
{
  "@fhevm/contracts": "^0.5.0",
  "@openzeppelin/contracts": "^5.0.1",
  "ethers": "^6.9.2"
}
```

### Development Tools

```json
{
  "@nomicfoundation/hardhat-toolbox": "^4.0.0",
  "hardhat": "^2.19.4",
  "typescript": "^5.3.3",
  "ts-node": "^10.9.2"
}
```

## Customization

### Rename Your Contract

1. Copy `FHECounter.sol` to your contract name
2. Update contract name and imports
3. Update deployment script
4. Update test file references

### Configure Networks

Edit `hardhat.config.ts`:

```typescript
networks: {
  hardhat: {
    // Local development
  },
  sepolia: {
    url: process.env.SEPOLIA_RPC_URL || "",
    accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
  },
}
```

### Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
```

## Available Scripts

```bash
npm test              # Run tests
npm run compile       # Compile contracts
npm run deploy        # Deploy to network
npm run node          # Start local network
```

## FHEVM Basics

### Encrypted Types

```solidity
euint8   // 0-255
euint16  // 0-65,535
euint32  // 0-4,294,967,295
euint64  // Larger values
```

### Essential Pattern

```solidity
import { FHE, euint32 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract MyContract is ZamaEthereumConfig {
    euint32 private encryptedValue;

    function store(uint32 value) external {
        euint32 encrypted = FHE.asEuint32(value);

        // CRITICAL: Grant permissions
        FHE.allowThis(encrypted);
        FHE.allow(encrypted, msg.sender);

        encryptedValue = encrypted;
    }
}
```

## Next Steps

1. ✅ Review FHECounter.sol example
2. ✅ Study FHECounter.test.ts patterns
3. ✅ Create your own contract
4. ✅ Write comprehensive tests
5. ✅ Deploy to testnet
6. ✅ Build your application

## Resources

- [Zama FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Example Project](../)

## License

MIT License - See LICENSE file for details

---

**Template Version:** 1.0.0
**FHEVM Version:** 0.5.0+
**Hardhat Version:** 2.19.4+
