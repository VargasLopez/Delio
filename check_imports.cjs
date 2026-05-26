const fs = require('fs');
const path = require('path');

function checkFile(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      checkFile(fullPath);
    } else if (fullPath.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const importRegex = /import\s+.*?from\s+['"](.*?)['"]/g;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];
        if (importPath.startsWith('.')) {
          let resolvedDir = path.dirname(path.resolve(dir, importPath));
          let baseName = path.basename(importPath);
          
          if (!fs.existsSync(resolvedDir)) {
             console.log('MISSING DIR', resolvedDir);
          } else {
             const actualFiles = fs.readdirSync(resolvedDir);
             const matched = actualFiles.find(f => f === baseName || f === baseName + '.js' || (baseName === '' && f === 'index.js'));
             if (!matched && !actualFiles.find(f => f === baseName && fs.statSync(path.join(resolvedDir, f)).isDirectory())) {
               console.log('CASE MISMATCH or MISSING IMPORT in', fullPath, '->', importPath, 'expected', baseName, 'but not found in', actualFiles);
             }
          }
        }
      }
    }
  }
}
checkFile('./src');
console.log('Done checking imports.');
