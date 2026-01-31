#!/usr/bin/env node

// Sync Knowledge Base for Chat API
//
// This script reads documentation files from the project and generates a
// knowledge base file that the chatbot can use to answer questions about
// the platform.
//
// Source files:
//   - docs/architecture/infrastructure.md
//   - docs/architecture/patterns.md
//   - pipelines/gitlab/README.md
//
// Output:
//   - apps/chat-api/src/knowledge-base.ts
//
// Usage:
//   node scripts/sync-knowledge.cjs

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '../../..');
const OUTPUT_FILE = path.resolve(__dirname, '../src/knowledge-base.ts');

// Documentation sources to include in knowledge base
const KNOWLEDGE_SOURCES = [
  {
    path: 'docs/architecture/patterns.md',
    category: 'Architecture Patterns',
    priority: 1,
  },
  {
    path: 'docs/architecture/infrastructure.md',
    category: 'Infrastructure Patterns',
    priority: 1,
  },
  {
    path: 'pipelines/gitlab/README.md',
    category: 'CI/CD Philosophy',
    priority: 1,
  },
  {
    path: 'docs/sdk/overview.md',
    category: 'SDK Documentation',
    priority: 2,
  },
  {
    path: 'docs/sdk/authentication.md',
    category: 'SDK Authentication',
    priority: 2,
  },
  {
    path: 'docs/sdk/error-handling.md',
    category: 'SDK Error Handling',
    priority: 2,
  },
  {
    path: 'docs/sdk/telemetry.md',
    category: 'SDK Telemetry',
    priority: 2,
  },
  {
    path: 'docs/api/facade.md',
    category: 'API Facade',
    priority: 2,
  },
  {
    path: 'docs/standards/code-style.md',
    category: 'Code Standards',
    priority: 3,
  },
  {
    path: 'docs/standards/structured-logging.md',
    category: 'Logging Standards',
    priority: 3,
  },
  {
    path: 'README.md',
    category: 'Project Overview',
    priority: 3,
  },
];

function readMarkdownFile(filePath) {
  const fullPath = path.join(PROJECT_ROOT, filePath);
  if (fs.existsSync(fullPath)) {
    return fs.readFileSync(fullPath, 'utf8');
  }
  return null;
}

function cleanMarkdown(content) {
  // Remove excessive whitespace but preserve structure
  return content
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function generateKnowledgeBase() {
  const knowledgeItems = [];
  
  for (const source of KNOWLEDGE_SOURCES) {
    const content = readMarkdownFile(source.path);
    if (content) {
      knowledgeItems.push({
        path: source.path,
        category: source.category,
        priority: source.priority,
        content: cleanMarkdown(content),
      });
      console.log(`  Loaded: ${source.path} (${source.category})`);
    } else {
      console.log(`  Skipped: ${source.path} (not found)`);
    }
  }
  
  return knowledgeItems;
}

function generateTypeScript(knowledgeItems) {
  const timestamp = new Date().toISOString();
  
  // Build the knowledge base content as a formatted string for the system prompt
  let knowledgeContent = '';
  
  // Group by priority
  const byPriority = {};
  for (const item of knowledgeItems) {
    if (!byPriority[item.priority]) {
      byPriority[item.priority] = [];
    }
    byPriority[item.priority].push(item);
  }
  
  // Build content string
  for (const priority of Object.keys(byPriority).sort()) {
    for (const item of byPriority[priority]) {
      knowledgeContent += `\n## ${item.category}\n\n${item.content}\n`;
    }
  }
  
  return `/**
 * Knowledge Base for DevEx Platform Chatbot
 * 
 * AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY
 * 
 * This file is generated from documentation files in the project.
 * To update, modify the source markdown files and run:
 *   node scripts/sync-knowledge.cjs
 * 
 * Generated: ${timestamp}
 */

export interface KnowledgeItem {
  path: string
  category: string
  priority: number
  content: string
}

export const knowledgeItems: KnowledgeItem[] = ${JSON.stringify(knowledgeItems, null, 2)}

export const lastUpdated = '${timestamp}'

/**
 * Get the full knowledge base content as a formatted string
 * suitable for including in a system prompt.
 */
export function getKnowledgeBaseContent(): string {
  return knowledgeItems
    .sort((a, b) => a.priority - b.priority)
    .map(item => \`## \${item.category}\\n\\n\${item.content}\`)
    .join('\\n\\n')
}

/**
 * Get knowledge for a specific category
 */
export function getKnowledgeByCategory(category: string): KnowledgeItem | undefined {
  return knowledgeItems.find(item => 
    item.category.toLowerCase().includes(category.toLowerCase())
  )
}

/**
 * Search knowledge base for relevant content
 */
export function searchKnowledge(query: string): KnowledgeItem[] {
  const queryLower = query.toLowerCase()
  return knowledgeItems.filter(item =>
    item.content.toLowerCase().includes(queryLower) ||
    item.category.toLowerCase().includes(queryLower)
  )
}
`;
}

function main() {
  console.log('Syncing knowledge base for chat-api...');
  
  const knowledgeItems = generateKnowledgeBase();
  
  if (knowledgeItems.length === 0) {
    console.error('Error: No knowledge items found');
    process.exit(1);
  }
  
  console.log(`  Total: ${knowledgeItems.length} knowledge items`);
  
  // Generate TypeScript
  const output = generateTypeScript(knowledgeItems);
  
  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Write output
  fs.writeFileSync(OUTPUT_FILE, output);
  console.log(`  Written to: ${OUTPUT_FILE}`);
  console.log('Done!');
}

main();
