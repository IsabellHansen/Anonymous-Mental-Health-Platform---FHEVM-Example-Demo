# Contributing to Anonymous Mental Health Platform

Thank you for your interest in contributing to this FHEVM example project!

## How to Contribute

### Reporting Issues

If you find bugs, documentation errors, or have suggestions:

1. Check existing issues first
2. Create a detailed issue with:
   - Clear description of the problem
   - Steps to reproduce (for bugs)
   - Expected vs actual behavior
   - Your environment (OS, Node version, etc.)

### Code Contributions

#### 1. Fork and Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/AnonymousMentalHealth.git
cd AnonymousMentalHealth
```

#### 2. Set Up Development Environment

```bash
# Install dependencies
npm install

# Compile contracts
npm run compile

# Run tests to verify setup
npm test
```

#### 3. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

#### 4. Make Your Changes

Follow these guidelines:

**For Smart Contracts:**
- Use Solidity ^0.8.24
- Follow existing code style
- Add comprehensive comments
- Include NatSpec documentation
- Validate inputs before encryption
- Always call FHE.allowThis() and FHE.allow()

**For Tests:**
- Write clear test descriptions
- Follow Arrange-Act-Assert pattern
- Test both success and failure cases
- Add JSDoc comments with @chapter and @category tags
- Maintain 100% coverage for new code

**For Documentation:**
- Update README.md if needed
- Add JSDoc comments for auto-generation
- Keep documentation concise and clear
- Include code examples

**For Scripts:**
- Use TypeScript
- Add error handling
- Include usage examples
- Document parameters

#### 5. Test Your Changes

```bash
# Run all tests
npm test

# Compile contracts
npm run compile

# Generate documentation
npm run generate-docs

# Test automation scripts
npm run create-example
```

#### 6. Commit Your Changes

```bash
# Stage changes
git add .

# Commit with clear message
git commit -m "Add feature: description of changes"
```

**Commit Message Guidelines:**
- Use present tense ("Add feature" not "Added feature")
- Be specific and descriptive
- Reference issue numbers if applicable
- Keep first line under 72 characters

Examples:
```
Add encrypted session timeout feature
Fix permission grant in therapy plan creation
Update documentation for access control patterns
```

#### 7. Push and Create Pull Request

```bash
# Push to your fork
git push origin feature/your-feature-name

# Create Pull Request on GitHub
# Include:
# - Clear description of changes
# - Why the change is needed
# - How to test it
# - Related issues
```

## Code Style Guidelines

### Solidity

```solidity
// ✅ Good
contract ExampleContract is ZamaEthereumConfig {
    euint32 private _encryptedValue;

    /// @notice Clear function description
    /// @param _value Description of parameter
    function setValue(uint32 _value) external {
        require(_value > 0, "Value must be positive");

        euint32 encrypted = FHE.asEuint32(_value);
        FHE.allowThis(encrypted);
        FHE.allow(encrypted, msg.sender);

        _encryptedValue = encrypted;
    }
}
```

### TypeScript

```typescript
// ✅ Good
async function deployContract(): Promise<Contract> {
    const [deployer] = await ethers.getSigners();
    const factory = await ethers.getContractFactory("ContractName");
    const contract = await factory.deploy();
    await contract.waitForDeployment();
    return contract;
}
```

### Documentation

```typescript
/**
 * Test: Feature Description
 *
 * @chapter: encryption
 * @category: basic-encryption
 *
 * This test demonstrates:
 * - Key concept 1
 * - Key concept 2
 * - Key concept 3
 */
```

## What to Contribute

### High Priority

- Additional FHEVM examples
- Improved test coverage
- Documentation improvements
- Bug fixes
- Performance optimizations

### Medium Priority

- New automation features
- Additional healthcare use cases
- Integration examples
- Security enhancements

### Low Priority

- Code refactoring
- Style improvements
- Additional tooling

## Review Process

1. **Automated Checks** - Tests must pass
2. **Code Review** - Maintainer reviews changes
3. **Discussion** - Address any feedback
4. **Approval** - Changes are merged

## Development Workflow

### Adding a New Example

1. Create contract in `contracts/`
2. Write tests in `test/`
3. Add to automation script config
4. Generate documentation
5. Update README if needed

### Updating Documentation

1. Edit source files (contracts, tests)
2. Update JSDoc comments
3. Run `npm run generate-docs`
4. Review generated files
5. Commit both source and generated docs

### Fixing Bugs

1. Write failing test that reproduces bug
2. Fix the bug
3. Ensure test passes
4. Add regression test if needed
5. Update documentation if behavior changed

## Testing Guidelines

### Required Tests

- ✅ Success cases with valid inputs
- ✅ Failure cases with invalid inputs
- ✅ Edge cases and boundary conditions
- ✅ Permission and access control
- ✅ Event emissions
- ✅ State changes

### Test Structure

```typescript
describe("Feature Name", function () {
    describe("Scenario", function () {
        it("Should [expected behavior]", async function () {
            // Arrange
            const value = 10;

            // Act
            await contract.setValue(value);

            // Assert
            expect(result).to.equal(expected);
        });
    });
});
```

## Documentation Standards

### README Files

- Clear overview
- Installation instructions
- Usage examples
- API documentation
- Contributing section

### Code Comments

- Explain "why", not "what"
- Document FHEVM-specific patterns
- Include warnings for common mistakes
- Reference related code sections

### Auto-Generated Docs

- Use @chapter tags for organization
- Use @category for grouping
- Include learning objectives
- Provide code examples

## Security Guidelines

- ✅ Validate all inputs before encryption
- ✅ Always call FHE.allowThis() and FHE.allow()
- ✅ Never expose plaintext in events or logs
- ✅ Use appropriate encrypted types
- ✅ Follow access control best practices
- ✅ Handle errors gracefully
- ✅ Test permission boundaries

## Getting Help

- **Documentation** - Check README.md and DEVELOPER_GUIDE.md
- **Issues** - Search existing issues
- **Discussions** - Ask in project discussions
- **Zama Community** - Join Zama Discord for FHEVM questions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome newcomers
- Accept constructive criticism
- Focus on what's best for the community
- Show empathy towards others

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Personal or political attacks
- Publishing others' private information
- Other unprofessional conduct

## Recognition

Contributors will be:
- Listed in project documentation
- Credited in release notes
- Acknowledged in the community

## Questions?

Feel free to ask questions by:
- Opening an issue
- Starting a discussion
- Reaching out to maintainers

Thank you for contributing to privacy-preserving healthcare technology! 🎉

---

**Last Updated:** December 2025
**Project:** Anonymous Mental Health Platform
**License:** MIT
