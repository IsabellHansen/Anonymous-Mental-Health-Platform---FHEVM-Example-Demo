#!/usr/bin/env ts-node

/**
 * Documentation Generator for FHEVM Examples
 *
 * This script automatically generates GitBook-compatible documentation
 * from code comments and test files.
 *
 * Features:
 * - Extracts JSDoc/TSDoc comments from tests
 * - Generates markdown documentation
 * - Creates chapter-based organization
 * - Produces GitBook-compatible output
 *
 * @chapter: automation
 * @category: documentation
 */

import * as fs from 'fs';
import * as path from 'path';

interface DocSection {
  title: string;
  chapter: string;
  content: string;
  code?: string;
}

/**
 * Extracts documentation from TypeScript test files
 *
 * This function demonstrates how to:
 * - Parse TypeScript files for comments
 * - Extract chapter and category metadata
 * - Generate structured documentation
 *
 * @param filePath - Path to the test file
 * @returns Array of documentation sections
 */
function extractDocsFromTest(filePath: string): DocSection[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const sections: DocSection[] = [];

  // Regular expression to match JSDoc-style comments
  const commentRegex = /\/\*\*([\s\S]*?)\*\//g;
  const chapterRegex = /@chapter:\s*(\S+)/;
  const categoryRegex = /@category:\s*(\S+)/;

  let match;
  while ((match = commentRegex.exec(content)) !== null) {
    const comment = match[1];
    const chapterMatch = comment.match(chapterRegex);
    const categoryMatch = comment.match(categoryRegex);

    if (chapterMatch) {
      // Extract the description
      const description = comment
        .split('\n')
        .filter((line) => !line.includes('@chapter') && !line.includes('@category'))
        .map((line) => line.trim().replace(/^\*\s?/, ''))
        .join('\n')
        .trim();

      sections.push({
        title: chapterMatch[1],
        chapter: chapterMatch[1],
        content: description,
      });
    }
  }

  return sections;
}

/**
 * Generates a markdown README file
 *
 * This function creates a comprehensive README that includes:
 * - Project overview
 * - Quick start guide
 * - Feature descriptions
 * - Code examples
 * - API documentation
 *
 * @param sections - Documentation sections to include
 * @param outputPath - Path where README will be written
 */
function generateMarkdownDocs(sections: DocSection[], outputPath: string): void {
  let markdown = '# FHEVM Example: Anonymous Mental Health Platform\n\n';

  markdown += '## Overview\n\n';
  markdown +=
    'This example demonstrates how to build privacy-preserving healthcare applications using FHEVM (Fully Homomorphic Encryption Virtual Machine).\n\n';

  markdown += '## Key Concepts Demonstrated\n\n';

  const chapters = new Map<string, DocSection[]>();
  sections.forEach((section) => {
    if (!chapters.has(section.chapter)) {
      chapters.set(section.chapter, []);
    }
    chapters.get(section.chapter)!.push(section);
  });

  chapters.forEach((chapterSections, chapterName) => {
    markdown += `### ${formatChapterTitle(chapterName)}\n\n`;
    chapterSections.forEach((section) => {
      markdown += `${section.content}\n\n`;
    });
  });

  markdown += '## Installation\n\n';
  markdown += '```bash\n';
  markdown += 'npm install\n';
  markdown += '```\n\n';

  markdown += '## Running Tests\n\n';
  markdown += '```bash\n';
  markdown += 'npm test\n';
  markdown += '```\n\n';

  markdown += '## Deployment\n\n';
  markdown += '```bash\n';
  markdown += 'npm run deploy\n';
  markdown += '```\n\n';

  markdown += '## Documentation\n\n';
  markdown +=
    'For detailed documentation, see the [GitBook documentation](./docs/README.md).\n\n';

  markdown += '## License\n\n';
  markdown += 'MIT\n';

  fs.writeFileSync(outputPath, markdown);
  console.log(`✅ Generated documentation: ${outputPath}`);
}

/**
 * Formats chapter names for display
 */
function formatChapterTitle(chapter: string): string {
  return chapter
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Generates GitBook-compatible documentation structure
 */
function generateGitBookDocs(sections: DocSection[], docsDir: string): void {
  // Create docs directory if it doesn't exist
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  // Generate SUMMARY.md for GitBook
  let summary = '# Summary\n\n';
  summary += '* [Introduction](README.md)\n\n';

  const chapters = new Map<string, DocSection[]>();
  sections.forEach((section) => {
    if (!chapters.has(section.chapter)) {
      chapters.set(section.chapter, []);
    }
    chapters.get(section.chapter)!.push(section);
  });

  chapters.forEach((_, chapterName) => {
    const chapterFile = `${chapterName}.md`;
    summary += `* [${formatChapterTitle(chapterName)}](${chapterFile})\n`;
  });

  fs.writeFileSync(path.join(docsDir, 'SUMMARY.md'), summary);
  console.log('✅ Generated GitBook SUMMARY.md');

  // Generate individual chapter files
  chapters.forEach((chapterSections, chapterName) => {
    let chapterContent = `# ${formatChapterTitle(chapterName)}\n\n`;

    chapterSections.forEach((section) => {
      chapterContent += `${section.content}\n\n`;
    });

    fs.writeFileSync(path.join(docsDir, `${chapterName}.md`), chapterContent);
    console.log(`✅ Generated ${chapterName}.md`);
  });
}

/**
 * Main execution
 */
if (require.main === module) {
  console.log('📚 Generating documentation...\n');

  const testDir = path.join(process.cwd(), 'test');
  const docsDir = path.join(process.cwd(), 'docs');
  const allSections: DocSection[] = [];

  // Find all test files
  if (fs.existsSync(testDir)) {
    const testFiles = fs
      .readdirSync(testDir)
      .filter((file) => file.endsWith('.test.ts') || file.endsWith('.spec.ts'));

    testFiles.forEach((file) => {
      const filePath = path.join(testDir, file);
      const sections = extractDocsFromTest(filePath);
      allSections.push(...sections);
      console.log(`📄 Processed: ${file} (${sections.length} sections)`);
    });
  }

  // Generate documentation
  if (allSections.length > 0) {
    const readmePath = path.join(process.cwd(), 'DOCUMENTATION.md');
    generateMarkdownDocs(allSections, readmePath);
    generateGitBookDocs(allSections, docsDir);

    console.log('\n✨ Documentation generation complete!');
  } else {
    console.log('\n⚠️  No documentation sections found in test files.');
    console.log('Make sure your test files include @chapter and @category tags in comments.');
  }
}

export { extractDocsFromTest, generateMarkdownDocs, generateGitBookDocs };
