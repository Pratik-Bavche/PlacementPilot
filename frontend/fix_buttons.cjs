const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');

const regex = /(bg-(blue|emerald|violet)-600[^"]*)text-slate-900 dark:text-white/g;

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  content = content.replace(regex, '$1text-white');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed buttons in ${path.basename(filePath)}`);
  }
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      processFile(fullPath);
    }
  });
}

processDirectory(pagesDir);
// Also check App.jsx
const appFile = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(appFile, 'utf8');
let original = content;
content = content.replace(regex, '$1text-white');
if(content !== original) {
  fs.writeFileSync(appFile, content, 'utf8');
  console.log('Fixed buttons in App.jsx');
}
