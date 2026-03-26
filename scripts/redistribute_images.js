const fs = require('fs');
const path = require('path');

// Posts with H2 structure but images bunched at bottom
const targetIds = [109, 134, 145, 153, 155, 189, 193, 220, 392, 474];

for (const id of targetIds) {
  const filePath = path.join(__dirname, '..', 'posts', `${id}.js`);
  const post = require(filePath);
  const sections = post.sections;
  
  // Find consecutive image sequences of 3+
  let bunchedImages = [];
  let bunchStart = -1;
  let consecutive = 0;
  
  for (let i = 0; i < sections.length; i++) {
    if (sections[i].type === 'image') {
      if (consecutive === 0) bunchStart = i;
      consecutive++;
    } else {
      if (consecutive >= 3) {
        // Record this bunch
        bunchedImages.push({ start: bunchStart, count: consecutive });
      }
      consecutive = 0;
    }
  }
  if (consecutive >= 3) {
    bunchedImages.push({ start: bunchStart, count: consecutive });
  }
  
  if (bunchedImages.length === 0) {
    console.log(`${id}: no bunched images found, skipping`);
    continue;
  }
  
  // Extract all bunched images (remove from current positions)
  let extractedImages = [];
  let indicesToRemove = new Set();
  
  for (const bunch of bunchedImages) {
    for (let i = bunch.start; i < bunch.start + bunch.count; i++) {
      extractedImages.push(sections[i]);
      indicesToRemove.add(i);
    }
  }
  
  // Remove bunched images
  let newSections = sections.filter((_, i) => !indicesToRemove.has(i));
  
  // Find h2 positions that don't have an image right after them
  let h2Positions = [];
  for (let i = 0; i < newSections.length; i++) {
    if (newSections[i].type === 'h2') {
      const next = newSections[i + 1];
      const hasImage = next && next.type === 'image';
      if (!hasImage) {
        h2Positions.push(i);
      }
    }
  }
  
  // Distribute extracted images to h2 positions (1 image per h2, in order)
  let imgIdx = 0;
  let insertions = []; // {position, image}
  
  for (const h2Pos of h2Positions) {
    if (imgIdx >= extractedImages.length) break;
    insertions.push({ afterIndex: h2Pos, image: extractedImages[imgIdx] });
    imgIdx++;
  }
  
  // If remaining images, add them to existing h2 sections (after body)
  // or keep them at the last h2 section
  let remainingImages = extractedImages.slice(imgIdx);
  
  // Insert images (reverse order to maintain correct indices)
  for (let i = insertions.length - 1; i >= 0; i--) {
    const ins = insertions[i];
    newSections.splice(ins.afterIndex + 1, 0, ins.image);
  }
  
  // If there are remaining images, insert them after the last h2's image
  if (remainingImages.length > 0) {
    // Find the last h2 and add remaining after its first body
    for (let i = newSections.length - 1; i >= 0; i--) {
      if (newSections[i].type === 'h2') {
        // Find the next body after this h2
        let insertAt = i + 1;
        while (insertAt < newSections.length && newSections[insertAt].type === 'image') {
          insertAt++;
        }
        // Insert after first body
        if (insertAt < newSections.length && newSections[insertAt].type === 'body') {
          insertAt++;
        }
        for (let j = remainingImages.length - 1; j >= 0; j--) {
          newSections.splice(insertAt, 0, remainingImages[j]);
        }
        break;
      }
    }
  }
  
  post.sections = newSections;
  
  // Write back
  const output = `const post = ${JSON.stringify(post, null, 2)}\n\nmodule.exports = post\n`;
  fs.writeFileSync(filePath, output, 'utf-8');
  
  const h2Count = newSections.filter(s => s.type === 'h2').length;
  const imgCount = newSections.filter(s => s.type === 'image').length;
  
  // Check for remaining consecutive images
  let maxConsec = 0, curConsec = 0;
  for (const s of newSections) {
    if (s.type === 'image') { curConsec++; maxConsec = Math.max(maxConsec, curConsec); }
    else curConsec = 0;
  }
  
  console.log(`${id}: h2=${h2Count} img=${imgCount} maxConsecutive=${maxConsec} extracted=${extractedImages.length} distributed=${insertions.length} remaining=${remainingImages.length}`);
}
