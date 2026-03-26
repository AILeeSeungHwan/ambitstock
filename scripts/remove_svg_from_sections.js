const fs = require('fs');
const path = require('path');

const postsDir = path.join(__dirname, '..', 'posts');
const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.js'));

let totalFixed = 0;
let details = [];

for (const file of files) {
  const id = parseInt(file.replace('.js', ''));
  if (id === 63) continue; // already fixed
  
  const filePath = path.join(postsDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Count SVG image sections before
  const svgMatches = content.match(/type:\s*['"]image['"].*?src:\s*['"][^'"]*\.svg['"]/gs);
  if (!svgMatches || svgMatches.length === 0) continue;
  
  // Remove SVG image sections from sections array
  // Pattern: { type: 'image', src: '...svg', alt: '...', caption: '...' },
  // Handle multiline and single-line variants
  const originalContent = content;
  
  // Remove full image objects with .svg src (handles both single and multi-line)
  content = content.replace(/\s*\{\s*type:\s*['"]image['"]\s*,\s*src:\s*['"][^'"]*\.svg['"]\s*(?:,\s*alt:\s*['"][^'"]*['"])?\s*(?:,\s*caption:\s*['"][^'"]*['"])?\s*\}\s*,?/g, '');
  
  // Clean up any double commas or trailing commas before ]
  content = content.replace(/,(\s*,)+/g, ',');
  content = content.replace(/,(\s*\])/g, '$1');
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    totalFixed++;
    details.push(`${id}: removed ${svgMatches.length} SVG(s)`);
  }
}

console.log(`Fixed ${totalFixed} files`);
console.log(details.slice(0, 20).join('\n'));
if (details.length > 20) console.log(`... and ${details.length - 20} more`);
