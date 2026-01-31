#!/usr/bin/env node
/**
 * Sync Architecture Documentation
 * 
 * This script reads the architecture markdown files and generates a TypeScript
 * data file that can be imported by the Architecture page component.
 * 
 * Source files:
 *   - docs/architecture/infrastructure.md
 *   - docs/architecture/patterns.md
 * 
 * Output:
 *   - apps/dashboard/src/data/architecture-docs.ts
 * 
 * Usage:
 *   node scripts/sync-architecture-docs.js
 * 
 * This script is run automatically during build via the prebuild npm script.
 */

const fs = require('fs');
const path = require('path');

const DOCS_ROOT = path.resolve(__dirname, '../../../docs/architecture');
const OUTPUT_FILE = path.resolve(__dirname, '../src/data/architecture-docs.ts');

function parseMarkdownSection(content, sectionTitle) {
  const regex = new RegExp(`## ${sectionTitle}[\\s\\S]*?(?=## |$)`, 'g');
  const match = content.match(regex);
  return match ? match[0] : '';
}

function extractCodeBlock(section) {
  const codeMatch = section.match(/```[\w]*\n([\s\S]*?)```/);
  return codeMatch ? codeMatch[1].trim() : '';
}

function extractBulletList(section, header) {
  const headerIndex = section.indexOf(header);
  if (headerIndex === -1) return [];
  
  const afterHeader = section.slice(headerIndex);
  const lines = afterHeader.split('\n');
  const items = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('- ')) {
      items.push(line.slice(2));
    } else if (line.startsWith('## ') || line.startsWith('### ')) {
      break;
    }
  }
  
  return items;
}

function parseInfrastructureDoc(content) {
  const patterns = [];
  const sections = content.split(/## \d+\. /).slice(1);
  
  sections.forEach(section => {
    const titleMatch = section.match(/^([^\n]+)/);
    if (!titleMatch) return;
    
    const title = titleMatch[1].trim();
    const descMatch = section.match(/\n\n([^`\n]+)/);
    const description = descMatch ? descMatch[1].trim() : '';
    const diagram = extractCodeBlock(section);
    const benefits = extractBulletList(section, '### Benefits');
    const whenToUse = extractBulletList(section, '### When to Use');
    
    patterns.push({
      title,
      description,
      diagram,
      benefits,
      whenToUse,
    });
  });
  
  return patterns;
}

function parsePatternsDoc(content) {
  const patterns = [];
  const sections = content.split(/## \d+\. /).slice(1);
  
  sections.forEach(section => {
    const titleMatch = section.match(/^([^\n]+)/);
    if (!titleMatch) return;
    
    const title = titleMatch[1].trim();
    const descMatch = section.match(/\n\n([^`\n|]+)/);
    const description = descMatch ? descMatch[1].trim() : '';
    const codeExample = extractCodeBlock(section);
    
    // Extract benefits if they exist
    const benefitsSection = section.match(/### Benefits[\s\S]*?(?=## |$)/);
    let benefits = [];
    if (benefitsSection) {
      const benefitLines = benefitsSection[0].match(/- \*\*([^*]+)\*\* — ([^\n]+)/g) || [];
      benefits = benefitLines.map(line => {
        const match = line.match(/- \*\*([^*]+)\*\* — ([^\n]+)/);
        return match ? { title: match[1], description: match[2] } : null;
      }).filter(Boolean);
    }
    
    // Extract table if it exists
    const tableMatch = section.match(/\|[^\n]+\|\n\|[-|]+\|\n([\s\S]*?)(?=\n\n|$)/);
    let table = null;
    if (tableMatch) {
      const headerLine = section.match(/\|([^\n]+)\|/);
      if (headerLine) {
        const headers = headerLine[1].split('|').map(h => h.trim()).filter(Boolean);
        const rows = tableMatch[1].trim().split('\n').map(row => {
          return row.split('|').map(cell => cell.trim()).filter(Boolean);
        });
        table = { headers, rows };
      }
    }
    
    patterns.push({
      title,
      description,
      codeExample: codeExample || undefined,
      benefits: benefits.length > 0 ? benefits : undefined,
      table: table || undefined,
    });
  });
  
  return patterns;
}

function generateTypeScript(infraPatterns, archPatterns) {
  const timestamp = new Date().toISOString();
  
  return `/**
 * Architecture Documentation Data
 * 
 * AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY
 * 
 * This file is generated from:
 *   - docs/architecture/infrastructure.md
 *   - docs/architecture/patterns.md
 * 
 * To update, modify the source markdown files and run:
 *   npm run sync:docs
 * 
 * Generated: ${timestamp}
 */

export interface InfrastructurePattern {
  title: string
  description: string
  diagram: string
  benefits: string[]
  whenToUse: string[]
}

export interface ArchitecturePatternBenefit {
  title: string
  description: string
}

export interface ArchitecturePatternTable {
  headers: string[]
  rows: string[][]
}

export interface ArchitecturePattern {
  title: string
  description: string
  codeExample?: string
  benefits?: ArchitecturePatternBenefit[]
  table?: ArchitecturePatternTable
}

export const infrastructurePatterns: InfrastructurePattern[] = ${JSON.stringify(infraPatterns, null, 2)}

export const architecturePatterns: ArchitecturePattern[] = ${JSON.stringify(archPatterns, null, 2)}

export const lastUpdated = '${timestamp}'
`;
}

function main() {
  console.log('Syncing architecture documentation...');
  
  // Read source files
  const infraPath = path.join(DOCS_ROOT, 'infrastructure.md');
  const patternsPath = path.join(DOCS_ROOT, 'patterns.md');
  
  if (!fs.existsSync(infraPath)) {
    console.error(`Error: ${infraPath} not found`);
    process.exit(1);
  }
  
  if (!fs.existsSync(patternsPath)) {
    console.error(`Error: ${patternsPath} not found`);
    process.exit(1);
  }
  
  const infraContent = fs.readFileSync(infraPath, 'utf8');
  const patternsContent = fs.readFileSync(patternsPath, 'utf8');
  
  // Parse markdown
  const infraPatterns = parseInfrastructureDoc(infraContent);
  const archPatterns = parsePatternsDoc(patternsContent);
  
  console.log(`  Parsed ${infraPatterns.length} infrastructure patterns`);
  console.log(`  Parsed ${archPatterns.length} architecture patterns`);
  
  // Generate TypeScript
  const output = generateTypeScript(infraPatterns, archPatterns);
  
  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Write output
  fs.writeFileSync(OUTPUT_FILE, output);
  console.log(`  Written to ${OUTPUT_FILE}`);
  console.log('Done!');
}

main();
