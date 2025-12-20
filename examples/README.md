# Generated Examples Directory

## Overview

This directory contains example projects generated using the automation scripts. Each example is a standalone Hardhat project demonstrating specific FHEVM concepts.

## How to Generate Examples

### Create Standalone Example

```bash
# From project root
npm run create-example

# This will create a new example in examples/ directory
```

### Create Category Project

```bash
# Generate healthcare category examples
npm run create-category healthcare

# Generate basic FHEVM examples
npm run create-category basic
```

## Generated Project Structure

Each generated example will have:

```
examples/<example-name>/
├── contracts/              # Smart contracts
├── test/                   # Test suites
├── scripts/                # Deployment scripts
├── docs/                   # Documentation
├── hardhat.config.ts       # Hardhat configuration
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
└── README.md               # Example-specific documentation
```

## Working with Generated Examples

### Install Dependencies

```bash
cd examples/<example-name>
npm install
```

### Compile Contracts

```bash
npm run compile
```

### Run Tests

```bash
npm test
```

### Deploy

```bash
npm run deploy
```

## Customizing Examples

Each generated example is fully independent and can be customized:

1. **Modify Contracts** - Edit files in `contracts/`
2. **Update Tests** - Edit files in `test/`
3. **Change Configuration** - Edit `hardhat.config.ts`
4. **Add Scripts** - Create new scripts in `scripts/`

## Example Categories

### Healthcare Examples
- Mental health support platform
- Patient record management
- Emergency detection systems
- Counselor-patient collaboration

### Basic Examples
- Encrypted counters
- Simple arithmetic operations
- Access control patterns
- Basic encryption/decryption

## Directory Structure

```
examples/
├── README.md                    # This file
├── <generated-example-1>/       # First generated example
├── <generated-example-2>/       # Second generated example
└── ...                          # Additional examples
```

## Best Practices

1. **Test Before Modifying** - Run tests to ensure example works
2. **Keep Examples Isolated** - Each example is independent
3. **Document Changes** - Update README if you modify examples
4. **Version Control** - Consider git for tracking changes
5. **Clean Build** - Run `npm run clean` before rebuilding

## Troubleshooting

### Example Won't Compile

```bash
# Clean and rebuild
npm run clean
npm run compile
```

### Tests Fail

```bash
# Check dependencies
npm install

# Run with verbose output
npm test -- --reporter spec
```

### Missing Dependencies

```bash
# Reinstall all dependencies
rm -rf node_modules package-lock.json
npm install
```

## Resources

- **Main Project** - See parent README.md
- **Developer Guide** - See DEVELOPER_GUIDE.md
- **Base Template** - See base-template/
- **Documentation** - See docs/

## Contributing

To contribute new example templates:

1. Create the example contract
2. Write comprehensive tests
3. Document FHEVM concepts demonstrated
4. Add to automation script configuration
5. Generate documentation

See DEVELOPER_GUIDE.md for detailed instructions.

---

**Note:** This directory is typically empty initially. Examples are generated on-demand using the automation scripts.
