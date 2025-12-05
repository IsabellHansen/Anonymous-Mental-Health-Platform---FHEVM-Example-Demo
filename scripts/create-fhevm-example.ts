#!/usr/bin/env ts-node

/**
 * FHEVM Example Generator
 *
 * This automation script demonstrates how to create standalone FHEVM example repositories
 * with proper structure, documentation, and testing setup.
 *
 * Usage: npm run create-example
 *
 * @chapter: automation
 * @category: scaffolding
 */

import * as fs from 'fs';
import * as path from 'path';

interface ExampleConfig {
  name: string;
  description: string;
  category: string;
  features: string[];
}

/**
 * Creates a new FHEVM example repository with all necessary files
 *
 * This function demonstrates:
 * - Automated project scaffolding
 * - Template-based file generation
 * - Documentation generation
 * - Test suite setup
 *
 * @param config - Configuration for the new example
 */
function createFHEVMExample(config: ExampleConfig): void {
  console.log(`\n🚀 Creating FHEVM Example: ${config.name}`);
  console.log(`📝 Description: ${config.description}`);
  console.log(`📂 Category: ${config.category}\n`);

  const exampleDir = path.join(process.cwd(), 'examples', config.name);

  // Create directory structure
  const directories = [
    exampleDir,
    path.join(exampleDir, 'contracts'),
    path.join(exampleDir, 'test'),
    path.join(exampleDir, 'scripts'),
    path.join(exampleDir, 'docs'),
  ];

  directories.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Created directory: ${path.relative(process.cwd(), dir)}`);
    }
  });

  // Generate package.json
  const packageJson = {
    name: `fhevm-example-${config.name.toLowerCase().replace(/\s+/g, '-')}`,
    version: '1.0.0',
    description: config.description,
    scripts: {
      test: 'hardhat test',
      compile: 'hardhat compile',
      deploy: 'hardhat run scripts/deploy.ts',
    },
    keywords: ['fhevm', 'fhe', 'privacy', config.category, ...config.features],
    license: 'MIT',
  };

  fs.writeFileSync(
    path.join(exampleDir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
  console.log('✅ Generated package.json');

  // Copy base Hardhat configuration
  copyTemplate('hardhat.config.ts', exampleDir);
  copyTemplate('tsconfig.json', exampleDir);
  copyTemplate('.env.example', exampleDir);

  console.log('\n✨ Example repository created successfully!');
  console.log(`\n📁 Location: ${exampleDir}`);
  console.log('\nNext steps:');
  console.log(`  1. cd ${path.relative(process.cwd(), exampleDir)}`);
  console.log('  2. npm install');
  console.log('  3. Add your contract to contracts/');
  console.log('  4. Add tests to test/');
  console.log('  5. Run npm run generate-docs\n');
}

/**
 * Copies a template file to the example directory
 */
function copyTemplate(filename: string, targetDir: string): void {
  const templatePath = path.join(process.cwd(), filename);
  const targetPath = path.join(targetDir, filename);

  if (fs.existsSync(templatePath)) {
    fs.copyFileSync(templatePath, targetPath);
    console.log(`✅ Copied ${filename}`);
  }
}

/**
 * Main execution
 */
if (require.main === module) {
  const exampleConfig: ExampleConfig = {
    name: 'Anonymous Mental Health Platform',
    description:
      'Demonstrates FHE encryption, access control, and privacy-preserving healthcare data',
    category: 'healthcare',
    features: [
      'encrypted-storage',
      'access-control',
      'user-decryption',
      'public-decryption',
      'emergency-alerts',
    ],
  };

  createFHEVMExample(exampleConfig);
}

export { createFHEVMExample, ExampleConfig };
