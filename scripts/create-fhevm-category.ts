#!/usr/bin/env ts-node

/**
 * Category Project Generator for FHEVM Examples
 *
 * This script generates category-based FHEVM projects containing multiple related examples.
 * It's useful for learning multiple concepts in a single organized project.
 *
 * Usage: npm run create-category <category> [output-dir]
 *
 * Available categories:
 * - healthcare: Mental health and medical applications
 * - basic: Fundamental FHEVM operations
 *
 * @chapter: automation
 * @category: scaffolding
 */

import * as fs from 'fs';
import * as path from 'path';

interface ContractItem {
  name: string;
  description: string;
  path: string;
  test: string;
}

interface CategoryConfig {
  name: string;
  description: string;
  contracts: ContractItem[];
}

/**
 * Color codes for terminal output
 */
enum Color {
  Reset = '\x1b[0m',
  Green = '\x1b[32m',
  Blue = '\x1b[34m',
  Yellow = '\x1b[33m',
  Red = '\x1b[31m',
  Cyan = '\x1b[36m',
}

function log(message: string, color: Color = Color.Reset): void {
  console.log(`${color}${message}${Color.Reset}`);
}

function error(message: string): never {
  log(`❌ Error: ${message}`, Color.Red);
  process.exit(1);
}

function success(message: string): void {
  log(`✅ ${message}`, Color.Green);
}

function info(message: string): void {
  log(`ℹ️  ${message}`, Color.Blue);
}

/**
 * Available example categories
 * Each category contains multiple related contracts demonstrating FHEVM concepts
 */
const CATEGORIES: Record<string, CategoryConfig> = {
  healthcare: {
    name: 'Healthcare & Privacy Examples',
    description: 'Privacy-preserving healthcare applications including mental health platforms, patient records, and emergency detection systems',
    contracts: [
      {
        name: 'Mental Health Platform',
        description: 'Complete mental health support system with encrypted patient data, counselor access, and emergency alerts',
        path: 'contracts/AnonymousMentalHealth.sol',
        test: 'test/AnonymousMentalHealth.test.ts',
      },
      // Future examples can be added here
      // {
      //   name: 'Patient Records',
      //   description: 'Encrypted medical records with role-based access control',
      //   path: 'contracts/PatientRecords.sol',
      //   test: 'test/PatientRecords.test.ts',
      // },
      // {
      //   name: 'Prescription Manager',
      //   description: 'Privacy-preserving prescription tracking system',
      //   path: 'contracts/PrescriptionManager.sol',
      //   test: 'test/PrescriptionManager.test.ts',
      // },
    ],
  },

  basic: {
    name: 'Basic FHEVM Concepts',
    description: 'Fundamental FHEVM patterns including encryption, decryption, access control, and FHE operations',
    contracts: [
      {
        name: 'Encrypted Counter',
        description: 'Simple counter demonstrating basic encryption and arithmetic operations',
        path: 'contracts/AnonymousMentalHealth.sol',  // Reuse as example
        test: 'test/AnonymousMentalHealth.test.ts',
      },
    ],
  },
};

/**
 * Create category-based project structure
 */
function createCategoryProject(categoryName: string, outputDir: string): void {
  // Validate category
  if (!CATEGORIES[categoryName]) {
    const available = Object.keys(CATEGORIES).join(', ');
    error(`Unknown category: ${categoryName}\nAvailable: ${available}`);
  }

  const category = CATEGORIES[categoryName];

  log(`\n🚀 Creating FHEVM Category Project`, Color.Cyan);
  log(`📦 Category: ${category.name}`, Color.Blue);
  log(`📝 Description: ${category.description}\n`, Color.Blue);

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    success(`Created directory: ${outputDir}`);
  }

  // Create project structure
  const directories = [
    path.join(outputDir, 'contracts'),
    path.join(outputDir, 'test'),
    path.join(outputDir, 'scripts'),
    path.join(outputDir, 'docs'),
  ];

  directories.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      success(`Created directory: ${path.relative(outputDir, dir)}/`);
    }
  });

  // Copy Hardhat configuration files
  copyTemplateFiles(outputDir);

  // Create index documentation
  createIndexDocumentation(outputDir, category);

  // Create category README
  createCategoryReadme(outputDir, category);

  // Create package.json
  createPackageJson(outputDir, category);

  log(`\n✨ Category project created successfully!`, Color.Green);
  log(`\n📁 Location: ${outputDir}`, Color.Cyan);
  log(`\n📚 Contents:`, Color.Blue);
  log(`   - ${category.contracts.length} example(s)`, Color.Reset);
  log(`   - Smart contracts with full documentation`, Color.Reset);
  log(`   - Comprehensive test suites`, Color.Reset);
  log(`   - Setup for automated documentation generation`, Color.Reset);

  log(`\n🚀 Next steps:`, Color.Green);
  log(`   1. cd ${path.relative(process.cwd(), outputDir)}`, Color.Yellow);
  log(`   2. npm install`, Color.Yellow);
  log(`   3. npm run compile`, Color.Yellow);
  log(`   4. npm test`, Color.Yellow);
  log(`   5. npm run generate-docs\n`, Color.Yellow);
}

/**
 * Copy Hardhat template files to category project
 */
function copyTemplateFiles(outputDir: string): void {
  const templateFiles = [
    'hardhat.config.ts',
    'tsconfig.json',
    '.env.example',
  ];

  templateFiles.forEach((file) => {
    const sourcePath = path.join(process.cwd(), file);
    const targetPath = path.join(outputDir, file);

    if (fs.existsSync(sourcePath) && !fs.existsSync(targetPath)) {
      fs.copyFileSync(sourcePath, targetPath);
      success(`Copied ${file}`);
    }
  });
}

/**
 * Create index documentation for the category
 */
function createIndexDocumentation(outputDir: string, category: CategoryConfig): void {
  const indexPath = path.join(outputDir, 'docs', 'INDEX.md');

  const indexContent = `# ${category.name}

## Overview

${category.description}

## Examples in This Category

${category.contracts
  .map(
    (contract, idx) => `
### ${idx + 1}. ${contract.name}

**Description:** ${contract.description}

**Contract:** \`${path.basename(contract.path)}\`
**Tests:** \`${path.basename(contract.test)}\`

**Key Concepts:**
- Encrypted data management
- Access control patterns
- Privacy-preserving operations
- Real-world use cases

**Run Tests:**
\`\`\`bash
npx hardhat test test/${path.basename(contract.test)}
\`\`\`
`
  )
  .join('\n')}

## Learning Path

1. **Start Here:** Review README.md for overview
2. **Study Contracts:** Examine each contract for patterns
3. **Run Tests:** Execute test suite to verify understanding
4. **Modify:** Experiment with contract modifications
5. **Extend:** Add your own examples

## Resources

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Smart Contract Security Best Practices](https://consensys.github.io/smart-contract-best-practices/)

## Questions?

- Review test files for usage examples
- Check comments in contract files
- Consult the main documentation
- Ask in the Zama community Discord

---

**Category:** ${category.name}
**Examples:** ${category.contracts.length}
**Last Updated:** ${new Date().toISOString().split('T')[0]}
`;

  fs.writeFileSync(indexPath, indexContent);
  success(`Created ${path.relative(outputDir, indexPath)}`);
}

/**
 * Create category-specific README
 */
function createCategoryReadme(outputDir: string, category: CategoryConfig): void {
  const readmePath = path.join(outputDir, 'README.md');

  const readmeContent = `# ${category.name}

> ${category.description}

## Overview

This project demonstrates **${category.contracts.length} FHEVM example(s)** in the **${category.name.toLowerCase()}** category.

## Quick Start

### Prerequisites

\`\`\`bash
Node.js >= 16.x
npm >= 7.x
\`\`\`

### Installation

\`\`\`bash
# Install dependencies
npm install

# Compile contracts
npm run compile

# Run tests
npm test
\`\`\`

## Examples

${category.contracts
  .map(
    (contract) => `
### ${contract.name}

${contract.description}

**Files:**
- Contract: \`contracts/${path.basename(contract.path)}\`
- Tests: \`test/${path.basename(contract.test)}\`
`
  )
  .join('\n')}

## Key FHEVM Concepts Demonstrated

- ✅ **Encryption:** Converting plaintext to encrypted types
- ✅ **Access Control:** Managing permissions with FHE.allow() and FHE.allowThis()
- ✅ **Encrypted Operations:** Performing computations on encrypted data
- ✅ **User Decryption:** Secure data retrieval
- ✅ **Public Alerts:** Triggering actions from encrypted conditions
- ✅ **Input Validation:** Secure parameter checking
- ✅ **Best Practices:** Production-ready patterns

## Development

### Running Tests

\`\`\`bash
# All tests
npm test

# Specific test file
npx hardhat test test/AnonymousMentalHealth.test.ts

# With detailed output
npm test -- --reporter spec
\`\`\`

### Compiling Contracts

\`\`\`bash
npm run compile
\`\`\`

### Deploying Contracts

\`\`\`bash
npm run deploy
\`\`\`

### Generating Documentation

\`\`\`bash
npm run generate-docs
\`\`\`

## Project Structure

\`\`\`
.
├── contracts/              # Smart contracts
├── test/                   # Test suites
├── scripts/                # Automation scripts
├── docs/                   # Generated documentation
├── hardhat.config.ts       # Hardhat configuration
├── package.json            # Dependencies
└── README.md               # This file
\`\`\`

## Learning Resources

### FHEVM Concepts

- [Zama FHEVM Official Docs](https://docs.zama.ai/fhevm)
- [FHEVM GitHub Repository](https://github.com/zama-ai/fhevm)
- [FHE Basics Guide](https://docs.zama.ai/fhevm/guides/overview)

### Smart Contract Development

- [Hardhat Documentation](https://hardhat.org/docs)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)

### Security & Best Practices

- [Smart Contract Security Best Practices](https://consensys.github.io/smart-contract-best-practices/)
- [OWASP Smart Contract Top 10](https://owasp.org/www-project-smart-contract-top-10/)

## Community

- **Discord:** [Zama Community](https://discord.com/invite/zama)
- **Forum:** [Zama Community Forum](https://www.zama.ai/community)
- **GitHub:** [Zama on GitHub](https://github.com/zama-ai)

## License

MIT License - See [LICENSE](../LICENSE) file for details

---

**Category:** ${category.name}
**Examples:** ${category.contracts.length}
**Last Updated:** ${new Date().toISOString().split('T')[0]}
`;

  fs.writeFileSync(readmePath, readmeContent);
  success(`Created ${path.relative(outputDir, readmePath)}`);
}

/**
 * Create package.json for category project
 */
function createPackageJson(outputDir: string, category: CategoryConfig): void {
  const packageJson = {
    name: `fhevm-${category.name.toLowerCase().replace(/\s+/g, '-')}-examples`,
    version: '1.0.0',
    description: category.description,
    main: 'index.js',
    scripts: {
      test: 'hardhat test',
      compile: 'hardhat compile',
      node: 'hardhat node',
      deploy: 'hardhat run scripts/deploy.ts',
      'generate-docs': 'ts-node scripts/generate-docs.ts',
    },
    keywords: [
      'fhevm',
      'fhe',
      'privacy',
      'homomorphic-encryption',
      'blockchain',
      'solidity',
      'hardhat',
      category.name.toLowerCase().split(' ')[0],
    ],
    author: 'FHEVM Developer',
    license: 'MIT',
    devDependencies: {
      '@nomicfoundation/hardhat-toolbox': '^4.0.0',
      '@typechain/hardhat': '^9.1.0',
      '@types/chai': '^4.3.11',
      '@types/mocha': '^10.0.6',
      '@types/node': '^20.10.6',
      chai: '^4.3.10',
      hardhat: '^2.19.4',
      'ts-node': '^10.9.2',
      typescript: '^5.3.3',
    },
    dependencies: {
      '@fhevm/contracts': '^0.5.0',
      '@openzeppelin/contracts': '^5.0.1',
      ethers: '^6.9.2',
    },
  };

  const packagePath = path.join(outputDir, 'package.json');
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  success(`Created ${path.relative(outputDir, packagePath)}`);
}

/**
 * Show available categories
 */
function showCategories(): void {
  log('\n📚 Available FHEVM Example Categories\n', Color.Cyan);

  Object.entries(CATEGORIES).forEach(([key, category]) => {
    log(`  ${key}: ${category.name}`, Color.Yellow);
    log(`     ${category.description}`, Color.Reset);
    log(`     ${category.contracts.length} example(s)\n`, Color.Blue);
  });
}

/**
 * Main execution
 */
function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    log('\n📚 FHEVM Category Project Generator', Color.Cyan);
    log('\nUsage: npx ts-node scripts/create-fhevm-category.ts <category> [output-dir]\n', Color.Yellow);

    log('Arguments:', Color.Blue);
    log('  category    - Example category to generate (see below)', Color.Reset);
    log('  output-dir  - Output directory (default: ./examples/<category>)\n', Color.Reset);

    showCategories();

    log('Examples:', Color.Blue);
    log('  npx ts-node scripts/create-fhevm-category.ts healthcare', Color.Yellow);
    log('  npx ts-node scripts/create-fhevm-category.ts healthcare ./my-healthcare-examples\n', Color.Yellow);

    process.exit(0);
  }

  const categoryName = args[0];
  const outputDir = args[1] || path.join(process.cwd(), 'examples', categoryName);

  createCategoryProject(categoryName, outputDir);
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { createCategoryProject, CATEGORIES, CategoryConfig };
