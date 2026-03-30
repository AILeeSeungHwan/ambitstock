#!/usr/bin/env node
/**
 * add_middle_ad.js
 * Adds a middle ad section to post files that currently have exactly 2 ads.
 * Target files: posts/51.js to posts/474.js
 */

const fs = require('fs');
const path = require('path');

const POSTS_DIR = path.join(__dirname, '..', 'posts');
const AD_SECTION = { type: 'ad', slot: '6297515693', format: 'auto' };

let totalModified = 0;
let totalSkipped = 0;
let totalFailed = 0;
let failures = [];

// Serialize a sections array back to JS source (single-quote style matching existing format)
function serializeSections(sections) {
  const lines = sections.map(section => {
    return '    ' + serializeSection(section);
  });
  return lines.join(',\n');
}

function serializeSection(obj) {
  // Use JSON.stringify but convert double quotes to single where safe
  // Actually, we'll use a custom serializer that matches the existing compact style
  const type = obj.type;

  if (type === 'toc') {
    return "{ type: 'toc' }";
  }

  if (type === 'ad') {
    return `{ type: 'ad', slot: '${obj.slot}', format: '${obj.format}' }`;
  }

  if (type === 'intro') {
    const escaped = escapeForSingleQuote(obj.html);
    return `{ type: 'intro', html: '${escaped}' }`;
  }

  if (type === 'body') {
    const escaped = escapeForSingleQuote(obj.html);
    return `{ type: 'body', html: '${escaped}' }`;
  }

  if (type === 'ending') {
    const escaped = escapeForSingleQuote(obj.html);
    return `{ type: 'ending', html: '${escaped}' }`;
  }

  if (type === 'h2') {
    const text = escapeForSingleQuote(obj.text);
    const id = escapeForSingleQuote(obj.id || '');
    const grad = escapeForSingleQuote(obj.gradientStyle || '');
    return `{ type: 'h2', id: '${id}', text: '${text}', gradientStyle: '${grad}' }`;
  }

  if (type === 'image') {
    const src = escapeForSingleQuote(obj.src || '');
    const alt = escapeForSingleQuote(obj.alt || '');
    const caption = escapeForSingleQuote(obj.caption || '');
    return `{ type: 'image', src: '${src}', alt: '${alt}', caption: '${caption}' }`;
  }

  if (type === 'cta') {
    const href = escapeForSingleQuote(obj.href || '');
    const text = escapeForSingleQuote(obj.text || '');
    return `{ type: 'cta', href: '${href}', text: '${text}' }`;
  }

  // Fallback: JSON stringify
  return JSON.stringify(obj);
}

function escapeForSingleQuote(str) {
  if (typeof str !== 'string') return '';
  // Escape backslashes first, then single quotes
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function findInsertionPoint(sections) {
  // Count ads
  const adIndices = [];
  for (let i = 0; i < sections.length; i++) {
    if (sections[i].type === 'ad') adIndices.push(i);
  }

  if (adIndices.length >= 3) {
    return { skip: true, reason: `already has ${adIndices.length} ads` };
  }

  if (adIndices.length < 2) {
    return { skip: true, reason: `has only ${adIndices.length} ads (unexpected)` };
  }

  const firstAdIdx = adIndices[0];
  const lastAdIdx = adIndices[adIndices.length - 1];

  // Content zone: sections between first ad and last ad
  const contentStart = firstAdIdx + 1;
  const contentEnd = lastAdIdx - 1; // inclusive

  if (contentEnd <= contentStart) {
    return { skip: true, reason: 'content zone too small' };
  }

  // Find midpoint of content zone
  const midpoint = Math.floor((contentStart + contentEnd) / 2);

  // Find first h2 index (must not insert before it)
  let firstH2Idx = -1;
  for (let i = 0; i < sections.length; i++) {
    if (sections[i].type === 'h2') {
      firstH2Idx = i;
      break;
    }
  }

  // Check if a position is valid for insertion AFTER index i
  // (ad will be inserted at position i+1, i.e., after sections[i])
  function isValidInsertAfter(i) {
    const section = sections[i];
    const nextSection = sections[i + 1];

    // Must be after body or h2
    if (section.type !== 'body' && section.type !== 'h2') return false;

    // Must not be before first h2 (i must be >= firstH2Idx)
    if (firstH2Idx >= 0 && i < firstH2Idx) return false;

    // Must not be adjacent to another ad
    if (nextSection && nextSection.type === 'ad') return false;
    if (section.type === 'ad') return false; // shouldn't happen given first check

    // Must not be within content zone bounds
    if (i < contentStart || i >= lastAdIdx) return false;

    // Check that prev section is not ad (inserting after i means checking sections[i-1])
    // Actually we're inserting AT position i+1, so:
    // - sections[i] (before new ad) must be body or h2 ✓ already checked
    // - sections[i+1] (after new ad, currently) must not be ad
    if (nextSection && nextSection.type === 'ad') return false;

    // Must not have image before or after the inserted ad
    // "MUST NOT be placed between two consecutive image sections"
    // Also "MUST NOT be placed right before or after another image"?
    // Let's check: nextSection is not image (to avoid ad between images)
    // Actually rule says "MUST NOT be placed between two consecutive image sections"
    // so if sections[i] is image, that's already invalid (must be after body/h2)
    // Just need to check nextSection is not image to avoid ad between image sections
    // (image -> ad -> image would be acceptable per rules, image -> image is consecutive images)
    // Rule says ad must not be between two consecutive images, which means:
    // don't insert if sections[i] is image AND sections[i+2] (original) is image
    // But sections[i] being image already fails the body/h2 check.

    return true;
  }

  // Scan forward from midpoint
  for (let i = midpoint; i <= contentEnd; i++) {
    if (isValidInsertAfter(i)) {
      return { insertAfter: i };
    }
  }

  // Scan backward from midpoint
  for (let i = midpoint - 1; i >= contentStart; i--) {
    if (isValidInsertAfter(i)) {
      return { insertAfter: i };
    }
  }

  return { skip: true, reason: 'no valid insertion point found' };
}

function processFile(filePath) {
  const filename = path.basename(filePath);

  // Load the post using require
  // Clear cache first to allow re-requiring
  delete require.cache[require.resolve(filePath)];

  let post;
  try {
    post = require(filePath);
  } catch (e) {
    failures.push({ file: filename, reason: `require failed: ${e.message}` });
    totalFailed++;
    return;
  }

  if (!post || !Array.isArray(post.sections)) {
    totalSkipped++;
    return;
  }

  const result = findInsertionPoint(post.sections);

  if (result.skip) {
    totalSkipped++;
    return;
  }

  // Insert the ad after position result.insertAfter
  const newSections = [
    ...post.sections.slice(0, result.insertAfter + 1),
    AD_SECTION,
    ...post.sections.slice(result.insertAfter + 1)
  ];

  // Reconstruct the file
  const newContent = `const post = {\n  id: ${post.id},\n  sections: [\n${serializeSections(newSections)}\n  ]\n}\n\nmodule.exports = post\n`;

  fs.writeFileSync(filePath, newContent, 'utf8');

  // Verify with node --check
  const { execSync } = require('child_process');
  try {
    execSync(`node --check "${filePath}"`, { stdio: 'pipe' });
  } catch (e) {
    failures.push({ file: filename, reason: `node --check failed: ${e.stderr ? e.stderr.toString() : e.message}` });
    totalFailed++;
    return;
  }

  totalModified++;
}

// Get all post files from 51 to 474
const allFiles = fs.readdirSync(POSTS_DIR)
  .filter(f => /^\d+\.js$/.test(f))
  .map(f => ({ name: f, num: parseInt(f) }))
  .filter(f => f.num >= 51 && f.num <= 474)
  .sort((a, b) => a.num - b.num)
  .map(f => path.join(POSTS_DIR, f.name));

console.log(`Processing ${allFiles.length} files...`);

for (const filePath of allFiles) {
  processFile(filePath);

  // Progress every 50 files
  const processed = totalModified + totalSkipped + totalFailed;
  if (processed % 50 === 0) {
    console.log(`  Progress: ${processed}/${allFiles.length} (modified: ${totalModified}, skipped: ${totalSkipped}, failed: ${totalFailed})`);
  }
}

console.log('\n=== RESULTS ===');
console.log(`Total files processed: ${allFiles.length}`);
console.log(`Modified (added middle ad): ${totalModified}`);
console.log(`Skipped (already 3+ ads or invalid): ${totalSkipped}`);
console.log(`Failed: ${totalFailed}`);

if (failures.length > 0) {
  console.log('\nFailures:');
  failures.forEach(f => console.log(`  ${f.file}: ${f.reason}`));
}
