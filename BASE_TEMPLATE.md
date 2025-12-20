# Base Hardhat Template

## Overview

This project uses a minimal Hardhat-based template as the foundation for FHEVM development. The base template provides the essential structure for building privacy-preserving smart contracts using Fully Homomorphic Encryption.

## Base Template Structure

The base template (`fhevm-hardhat-template-main`) provides:

```
fhevm-hardhat-template/
├── contracts/
│   ├── FHECounter.sol               # Example contract template
│   └── YourContract.sol             # Placeholder for your contract
│
├── test/
│   ├── FHECounter.test.ts           # Example test template
│   └── YourTest.test.ts             # Placeholder for your tests
│
├── scripts/
│   ├── deploy.ts                    # Deployment script template
│   └── # Add your scripts here
│
├── hardhat.config.ts                # Hardhat configuration
├── package.json                     # Dependencies and scripts
├── tsconfig.json                    # TypeScript configuration
├── .env.example                     # Environment variables template
├── .gitignore                       # Git ignore rules
└── README.md                        # Template documentation
```

## Key Components

### Hardhat Configuration

The `hardhat.config.ts` file configures:

```typescript
import "@fhevm/hardhat-plugin";  // FHEVM plugin
import "@nomicfoundation/hardhat-toolbox";  // Essential tools

const config: HardhatUserConfig = {
  solidity: "0.8.24",  // Solidity version for FHEVM
  networks: {
    hardhat: {
      // Local network for testing
    },
    sepolia: {
      // Sepolia testnet configuration
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
};

export default config;
```

### Package Dependencies

Core dependencies for FHEVM development:

```json
{
  "dependencies": {
    "@fhevm/contracts": "^0.5.0",      // FHEVM library
    "@openzeppelin/contracts": "^5.0.1", // OpenZeppelin standards
    "ethers": "^6.9.2"                 // Web3 library
  },
  "devDependencies": {
    "@nomicfoundation/hardhat-toolbox": "^4.0.0",
    "@typechain/hardhat": "^9.1.0",
    "hardhat": "^2.19.4",
    "ts-node": "^10.9.2",
    "typescript": "^5.3.3"
  }
}
```

### TypeScript Configuration

Ensures proper type checking for FHEVM contracts:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

## Environment Configuration

Create a `.env` file (copy from `.env.example`):

```bash
# Private key for deployment (testnet only)
PRIVATE_KEY=your_private_key_here

# RPC endpoints
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY

# API keys for verification
ETHERSCAN_API_KEY=your_etherscan_key
```

**⚠️ Security:** Never commit `.env` file. Use `.env.example` for templates.

## Customization for Your Project

### Step 1: Install Dependencies

```bash
# From template directory
npm install

# Or for existing project
npm install @fhevm/contracts @openzeppelin/contracts ethers
```

### Step 2: Create Your Contract

Create `contracts/YourContract.sol`:

```solidity
// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract YourContract is ZamaEthereumConfig {
    // Your implementation
}
```

### Step 3: Write Tests

Create `test/YourTest.test.ts`:

```typescript
import { ethers } from "hardhat";
import { expect } from "chai";

describe("YourContract", function () {
    let contract;

    beforeEach(async function () {
        const YourContract = await ethers.getContractFactory("YourContract");
        contract = await YourContract.deploy();
        await contract.waitForDeployment();
    });

    it("Should work correctly", async function () {
        // Your test here
    });
});
```

### Step 4: Compile and Test

```bash
npm run compile
npm test
```

### Step 5: Deploy

Create `scripts/deploy.ts` or use the template:

```typescript
import { ethers } from "hardhat";

async function main() {
    const YourContract = await ethers.getContractFactory("YourContract");
    const contract = await YourContract.deploy();
    await contract.waitForDeployment();
    console.log("Deployed to:", await contract.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
```

Deploy:

```bash
npm run deploy
```

## Available npm Scripts

```bash
npm test              # Run tests
npm run compile      # Compile contracts
npm run deploy       # Deploy to network
npm run node         # Start local Hardhat network

# Custom scripts (in this project)
npm run generate-docs # Generate documentation
npm run create-example # Create new example
npm run create-category # Create category project
```

## Hardhat Network

### Running Local Network

```bash
npm run node
```

The local network runs at `http://localhost:8545`

### Using in Tests

```typescript
it("Should work on Hardhat network", async function () {
    const [signer] = await ethers.getSigners();
    // signer is pre-funded on local network
});
```

### Deploying to Local Network

```bash
# Terminal 1: Start network
npm run node

# Terminal 2: Deploy
npm run deploy
```

## Network Configuration

### Sepolia Testnet

Configure in `.env`:

```bash
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your_private_key_here
```

Deploy:

```bash
NETWORK=sepolia npm run deploy
```

### Adding New Networks

Edit `hardhat.config.ts`:

```typescript
networks: {
    // Existing networks...
    myNetwork: {
        url: process.env.MY_NETWORK_RPC || "",
        accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
}
```

## FHEVM-Specific Features

### Encrypted Types

```solidity
euint8   // 0-255
euint16  // 0-65,535
euint32  // 0-4,294,967,295
euint64  // Larger values
```

### FHE Operations

```solidity
// Permission management
FHE.allowThis(encrypted);  // Contract permission
FHE.allow(encrypted, user); // User permission

// Arithmetic
FHE.add(a, b)
FHE.sub(a, b)
FHE.mul(a, b)
FHE.div(a, b)

// Comparison
FHE.eq(a, b)
FHE.ne(a, b)
FHE.lt(a, b)
FHE.le(a, b)
FHE.gt(a, b)
FHE.ge(a, b)

// Logic
FHE.and(a, b)
FHE.or(a, b)
FHE.xor(a, b)
FHE.not(a)

// Conditional
FHE.cmux(condition, a, b)  // If condition then a else b
```

### Encryption/Decryption

```solidity
// Encryption
euint8 encrypted = FHE.asEuint8(plaintext);

// External encryption (from client)
function process(externalEuint32 input, bytes calldata inputProof) external {
    euint32 encrypted = FHE.fromExternal(input, inputProof);
}
```

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| "@fhevm not found" | Run `npm install @fhevm/contracts` |
| "ZamaEthereumConfig not found" | Update @fhevm/contracts version |
| Compilation errors | Check Solidity version (^0.8.24 required) |
| Test failures | Verify Hardhat network is running |
| Deployment fails | Check .env configuration and balance |

### Debug Mode

```bash
# Verbose logging
DEBUG=* npm test

# Hardhat internal logs
npx hardhat run scripts/deploy.ts --verbose
```

## Version Management

### Updating FHEVM

```bash
# Check latest version
npm outdated

# Update library
npm install @fhevm/contracts@latest

# Test for breaking changes
npm test
```

### Updating Hardhat

```bash
npm install --save-dev hardhat@latest
npm install --save-dev @nomicfoundation/hardhat-toolbox@latest
```

## Best Practices

### Contract Development

1. ✅ Import `ZamaEthereumConfig` for FHEVM contracts
2. ✅ Use `@fhevm/solidity/lib/FHE.sol` for operations
3. ✅ Call `FHE.allowThis()` after creating encrypted values
4. ✅ Validate inputs before encryption
5. ✅ Use appropriate encrypted types

### Testing

1. ✅ Test both success and failure paths
2. ✅ Use clear test descriptions
3. ✅ Follow Arrange-Act-Assert pattern
4. ✅ Test access control boundaries
5. ✅ Verify event emissions

### Deployment

1. ✅ Test on local network first
2. ✅ Use testnet before mainnet
3. ✅ Secure your private key
4. ✅ Verify contract on block explorer
5. ✅ Document deployment addresses

## Project Organization

### Recommended Structure

```
your-project/
├── contracts/
│   ├── core/
│   │   ├── Contract1.sol
│   │   └── Contract2.sol
│   ├── interfaces/
│   │   ├── IContract1.sol
│   │   └── IContract2.sol
│   └── libraries/
│       └── MyLibrary.sol
│
├── test/
│   ├── core/
│   │   ├── Contract1.test.ts
│   │   └── Contract2.test.ts
│   └── integration/
│       └── Integration.test.ts
│
├── scripts/
│   ├── deploy.ts
│   └── verify.ts
│
├── docs/
│   ├── SUMMARY.md
│   ├── usage.md
│   └── api.md
│
├── hardhat.config.ts
├── package.json
├── tsconfig.json
└── .env.example
```

## Additional Resources

### FHEVM Documentation

- [Zama FHEVM Official Docs](https://docs.zama.ai/fhevm)
- [FHEVM Solidity Library](https://github.com/zama-ai/fhevm-solidity)
- [FHEVM Hardhat Plugin](https://github.com/zama-ai/fhevm-hardhat-plugin)

### Hardhat Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [Hardhat Tutorial](https://hardhat.org/tutorial)
- [TypeScript Support](https://hardhat.org/hardhat-runner/docs/guides/typescript)

### Smart Contract Resources

- [Solidity Documentation](https://docs.soliditylang.org/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Smart Contract Best Practices](https://consensys.github.io/smart-contract-best-practices/)

## Getting Help

### Documentation

1. Check the README.md files in this project
2. Review the DEVELOPER_GUIDE.md
3. Examine test files for examples
4. Study the example contracts

### Community

- **Zama Discord:** [Join Community](https://discord.com/invite/zama)
- **GitHub Issues:** [Report Issues](https://github.com/zama-ai/fhevm/issues)
- **Community Forum:** [Ask Questions](https://www.zama.ai/community)

## Next Steps

1. ✅ Review this template structure
2. ✅ Understand Hardhat configuration
3. ✅ Study FHEVM-specific patterns
4. ✅ Create your first contract
5. ✅ Write comprehensive tests
6. ✅ Generate documentation
7. ✅ Deploy to testnet

---

**Base Template:** Zama FHEVM Hardhat Template
**Version:** 2.19.4 (Hardhat)
**FHEVM Version:** 0.5.0+
**Last Updated:** December 2025
