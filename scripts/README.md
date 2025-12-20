# Automation Scripts Documentation

## Anonymous Mental Health Platform - FHEVM Example Generator

This directory contains automation scripts for generating standalone FHEVM example repositories, creating documentation, and deploying contracts.

---

## Table of Contents

- [Overview](#overview)
- [Scripts](#scripts)
  - [create-fhevm-example.ts](#create-fhevm-examplets)
  - [generate-docs.ts](#generate-docsts)
  - [deploy.ts](#deployts)
- [Usage Examples](#usage-examples)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)

---

## Overview

These TypeScript scripts provide automated tooling for:

1. **Project Scaffolding** - Generate new FHEVM example repositories
2. **Documentation Generation** - Auto-create GitBook-compatible docs from code
3. **Contract Deployment** - Deploy to local and test networks

All scripts are written in TypeScript and can be run via npm scripts or directly with ts-node.

---

## Scripts

### create-fhevm-example.ts

**Purpose:** Generate standalone FHEVM example repositories with proper structure, configuration, and documentation.

**Location:** `scripts/create-fhevm-example.ts`

#### Features

- ✅ Creates standardized directory structure
- ✅ Generates `package.json` with FHEVM dependencies
- ✅ Copies Hardhat configuration templates
- ✅ Sets up test scaffolding
- ✅ Initializes documentation structure
- ✅ Prepares deployment scripts

#### Usage

```bash
# Using npm script (recommended)
npm run create-example

# Direct execution
npx ts-node scripts/create-fhevm-example.ts
```

#### What It Creates

```
examples/<example-name>/
├── contracts/           # Smart contract directory
├── test/                # Test file directory
├── scripts/             # Deployment scripts
├── docs/                # Documentation directory
├── package.json         # Project dependencies
├── hardhat.config.ts    # Hardhat configuration
├── tsconfig.json        # TypeScript configuration
└── .env.example         # Environment variables template
```

#### Configuration

Edit the `exampleConfig` object in the script:

```typescript
const exampleConfig: ExampleConfig = {
    name: 'Your Example Name',
    description: 'Brief description of what this demonstrates',
    category: 'healthcare',  // or 'defi', 'gaming', 'identity', etc.
    features: [
        'encrypted-storage',
        'access-control',
        'user-decryption',
    ],
};
```

#### Example Output

```
🚀 Creating FHEVM Example: Anonymous Mental Health Platform
📝 Description: Demonstrates FHE encryption, access control, and privacy-preserving healthcare data
📂 Category: healthcare

✅ Created directory: examples/anonymous-mental-health-platform
✅ Created directory: examples/anonymous-mental-health-platform/contracts
✅ Created directory: examples/anonymous-mental-health-platform/test
✅ Created directory: examples/anonymous-mental-health-platform/scripts
✅ Created directory: examples/anonymous-mental-health-platform/docs
✅ Generated package.json
✅ Copied hardhat.config.ts
✅ Copied tsconfig.json
✅ Copied .env.example

✨ Example repository created successfully!

📁 Location: examples/anonymous-mental-health-platform

Next steps:
  1. cd examples/anonymous-mental-health-platform
  2. npm install
  3. Add your contract to contracts/
  4. Add tests to test/
  5. Run npm run generate-docs
```

---

### generate-docs.ts

**Purpose:** Automatically generate GitBook-compatible documentation from JSDoc comments in test files.

**Location:** `scripts/generate-docs.ts`

#### Features

- ✅ Extracts JSDoc/TSDoc comments from TypeScript tests
- ✅ Parses chapter and category metadata (`@chapter`, `@category`)
- ✅ Generates markdown documentation files
- ✅ Creates `SUMMARY.md` for GitBook navigation
- ✅ Organizes documentation by concept categories
- ✅ Formats code examples with proper syntax highlighting

#### Usage

```bash
# Using npm script (recommended)
npm run generate-docs

# Direct execution
npx ts-node scripts/generate-docs.ts
```

#### Documentation Format

The script expects JSDoc comments in test files:

```typescript
/**
 * Test: Feature Description
 *
 * @chapter: access-control
 * @category: permissions
 *
 * This test demonstrates:
 * - How to use FHE.allow() for permission management
 * - Why FHE.allowThis() is required
 * - Common permission-related mistakes
 *
 * Key Learning: Always grant both contract and user permissions
 */
describe("Access Control", function () {
    // Test implementation
});
```

#### Generated Files

```
docs/
├── SUMMARY.md                  # GitBook navigation index
├── access-control.md           # Chapter: Access Control
├── encryption.md               # Chapter: Encryption
├── decryption.md               # Chapter: Decryption
├── anti-patterns.md            # Chapter: Anti-Patterns
└── DOCUMENTATION.md            # Consolidated documentation
```

#### Chapter Organization

Available chapters:
- `encryption` - Encryption patterns and techniques
- `access-control` - Permission management
- `decryption` - User and public decryption
- `anti-patterns` - Common mistakes to avoid
- `workflows` - Complex encrypted operations
- `security` - Input validation and best practices

#### Example Output

```
📚 Generating documentation...

📄 Processed: AnonymousMentalHealth.test.ts (8 sections)

✅ Generated documentation: DOCUMENTATION.md
✅ Generated GitBook SUMMARY.md
✅ Generated access-control.md
✅ Generated encryption.md
✅ Generated anti-patterns.md

✨ Documentation generation complete!
```

---

### deploy.ts

**Purpose:** Deploy the Anonymous Mental Health smart contract to local or test networks.

**Location:** `scripts/deploy.ts`

#### Features

- ✅ Deploys contract with proper configuration
- ✅ Displays deployment information
- ✅ Checks deployer account balance
- ✅ Saves deployment metadata
- ✅ Provides next-step guidance

#### Usage

```bash
# Deploy to local Hardhat network
npm run deploy

# Deploy to specific network (configure .env first)
NETWORK=sepolia npm run deploy
```

#### Environment Configuration

Create a `.env` file (copy from `.env.example`):

```bash
# Network Configuration
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_infura_key
ETHERSCAN_API_KEY=your_etherscan_api_key
```

#### Example Output

```
🚀 Deploying Anonymous Mental Health Platform...

📝 Deploying with account: 0x1234567890123456789012345678901234567890
💰 Account balance: 1.5 ETH

⏳ Deploying contract...
✅ Contract deployed to: 0xabcdefabcdefabcdefabcdefabcdefabcdefabcd
👨‍⚕️ Counselor address: 0x1234567890123456789012345678901234567890

📋 Deployment Summary:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Contract Address: 0xabcdefabcdefabcdefabcdefabcdefabcdefabcd
Network: sepolia
Deployer: 0x1234567890123456789012345678901234567890
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💾 Deployment Info: {
  "contractAddress": "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
  "network": "sepolia",
  "deployer": "0x1234567890123456789012345678901234567890",
  "timestamp": "2025-12-13T10:30:00.000Z"
}

✨ Deployment complete!

📝 Next steps:
  1. Update frontend configuration with contract address
  2. Verify contract on block explorer
  3. Test contract functionality
```

---

## Usage Examples

### Complete Workflow: Create New Example

```bash
# 1. Generate example repository structure
npm run create-example

# 2. Navigate to the new example
cd examples/your-example-name

# 3. Install dependencies
npm install

# 4. Add your smart contract
# Edit contracts/YourContract.sol

# 5. Add comprehensive tests
# Edit test/YourContract.test.ts

# 6. Compile contracts
npm run compile

# 7. Run tests
npm test

# 8. Generate documentation
npm run generate-docs

# 9. Deploy (optional)
npm run deploy
```

### Documentation Generation Workflow

```bash
# 1. Write tests with JSDoc comments
# Include @chapter and @category tags

# 2. Generate documentation
npm run generate-docs

# 3. Review generated docs
ls docs/

# 4. Check SUMMARY.md
cat docs/SUMMARY.md

# 5. Preview documentation (if using GitBook)
gitbook serve
```

### Deployment Workflow

```bash
# 1. Configure environment
cp .env.example .env
# Edit .env with your credentials

# 2. Test deployment locally
npm run deploy

# 3. Deploy to testnet
NETWORK=sepolia npm run deploy

# 4. Verify on block explorer
# Use the contract address from deployment output
```

---

## Configuration

### Package.json Scripts

The following npm scripts are configured:

```json
{
  "scripts": {
    "test": "hardhat test",
    "compile": "hardhat compile",
    "node": "hardhat node",
    "deploy": "hardhat run scripts/deploy.ts",
    "generate-docs": "ts-node scripts/generate-docs.ts",
    "create-example": "ts-node scripts/create-fhevm-example.ts"
  }
}
```

### TypeScript Configuration

Scripts use the root `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  }
}
```

### Hardhat Configuration

Deployment scripts use settings from `hardhat.config.ts`:

```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    hardhat: {
      // Local network config
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
};

export default config;
```

---

## Troubleshooting

### Common Issues

#### Script Won't Run

**Problem:** `ts-node: command not found`

**Solution:**
```bash
# Install ts-node locally
npm install --save-dev ts-node

# Or use npx
npx ts-node scripts/create-fhevm-example.ts
```

#### TypeScript Errors

**Problem:** Type errors when running scripts

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check TypeScript version
npx tsc --version
```

#### Documentation Not Generating

**Problem:** `generate-docs` produces no output

**Solution:**
1. Verify test files include `@chapter` tags
2. Check test file location (should be in `test/`)
3. Ensure JSDoc comment format is correct:

```typescript
/**
 * @chapter: chapter-name
 * @category: category-name
 */
```

#### Deployment Fails

**Problem:** Deployment script fails

**Solutions:**
```bash
# Check account balance
npx hardhat run scripts/check-balance.ts

# Verify .env configuration
cat .env

# Try local deployment first
npx hardhat node
# In another terminal:
npm run deploy
```

#### Permission Errors

**Problem:** "Cannot write to directory" errors

**Solution:**
```bash
# Check directory permissions
ls -la examples/

# Create directory manually if needed
mkdir -p examples/your-example

# Run with appropriate permissions
npm run create-example
```

---

## Advanced Usage

### Custom Example Configuration

You can create multiple example configurations:

```typescript
// scripts/create-fhevm-example.ts

const examples = {
    'mental-health': {
        name: 'Anonymous Mental Health Platform',
        description: 'Privacy-preserving healthcare',
        category: 'healthcare',
        features: ['encrypted-storage', 'access-control'],
    },
    'voting': {
        name: 'Confidential Voting System',
        description: 'Private ballot system',
        category: 'governance',
        features: ['anonymous-voting', 'vote-counting'],
    },
};

// Select example
const selectedExample = examples['mental-health'];
createFHEVMExample(selectedExample);
```

### Batch Documentation Generation

Generate docs for multiple examples:

```typescript
// scripts/generate-all-docs.ts

const examples = ['example1', 'example2', 'example3'];

for (const example of examples) {
    console.log(`Generating docs for ${example}...`);
    generateDocs(example);
}
```

### Custom Deployment Scripts

Create network-specific deployment:

```typescript
// scripts/deploy-sepolia.ts

async function deploySepolia() {
    const network = await ethers.provider.getNetwork();

    if (network.name !== 'sepolia') {
        throw new Error('Must deploy to Sepolia');
    }

    // Deploy with Sepolia-specific configuration
}
```

---

## Best Practices

### Script Development

1. **Use TypeScript** - Better type safety and IDE support
2. **Handle Errors** - Always include try-catch blocks
3. **Provide Feedback** - Use console.log for progress updates
4. **Validate Inputs** - Check parameters before execution
5. **Document Thoroughly** - Include JSDoc comments

### Example Generation

1. **Keep Templates Simple** - Minimal base configuration
2. **Include Comments** - Explain generated code
3. **Validate Structure** - Check all directories exist
4. **Test Generation** - Try the generated example immediately

### Documentation

1. **Use Consistent Tags** - Standardize @chapter/@category values
2. **Keep Comments Updated** - Sync with code changes
3. **Include Examples** - Show actual usage patterns
4. **Organize Logically** - Group related concepts

### Deployment

1. **Test Locally First** - Use Hardhat network
2. **Verify Configuration** - Check .env before deploying
3. **Save Artifacts** - Store deployment addresses
4. **Document Networks** - Note which networks are supported

---

## Contributing

### Adding New Scripts

1. Create script in `scripts/` directory
2. Add npm script to `package.json`
3. Document in this README
4. Include error handling
5. Add usage examples

### Improving Existing Scripts

1. Maintain backward compatibility
2. Update documentation
3. Add tests if possible
4. Follow existing code style

---

## Dependencies

These scripts require:

```json
{
  "devDependencies": {
    "@types/node": "^20.10.6",
    "ts-node": "^10.9.2",
    "typescript": "^5.3.3"
  },
  "dependencies": {
    "ethers": "^6.9.2"
  }
}
```

---

## Support

For issues or questions:

1. Check this documentation
2. Review the [Developer Guide](../DEVELOPER_GUIDE.md)
3. Examine the script source code
4. Check Zama FHEVM documentation
5. Ask in Zama Discord community

---

## License

MIT License - See [LICENSE](../LICENSE) file for details.

---

**Last Updated:** December 2025
**Version:** 1.0.0
**Zama Bounty Track:** December 2025
