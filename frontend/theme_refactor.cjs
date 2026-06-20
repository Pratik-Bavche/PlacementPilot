const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');
const appFile = path.join(__dirname, 'src', 'App.jsx');

const replacements = [
  { regex: /(?<!dark:)text-white/g, replace: 'text-slate-900 dark:text-white' },
  { regex: /(?<!dark:)bg-slate-900(?!\/)/g, replace: 'bg-white dark:bg-slate-900' },
  { regex: /(?<!dark:)bg-slate-900\//g, replace: 'bg-slate-100/80 dark:bg-slate-900/' },
  { regex: /(?<!dark:)bg-slate-950\//g, replace: 'bg-slate-200/50 dark:bg-slate-950/' },
  { regex: /(?<!dark:)bg-slate-800/g, replace: 'bg-slate-100 dark:bg-slate-800' },
  { regex: /(?<!dark:)bg-slate-850/g, replace: 'bg-slate-50 dark:bg-slate-850' },
  { regex: /(?<!dark:)text-slate-400/g, replace: 'text-slate-600 dark:text-slate-400' },
  { regex: /(?<!dark:)text-slate-300/g, replace: 'text-slate-700 dark:text-slate-300' },
  { regex: /(?<!dark:)text-slate-200/g, replace: 'text-slate-800 dark:text-slate-200' },
  { regex: /(?<!dark:)border-white\/5/g, replace: 'border-slate-200 dark:border-white/5' },
  { regex: /(?<!dark:)border-white\/10/g, replace: 'border-slate-300 dark:border-white/10' },
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  replacements.forEach(({ regex, replace }) => {
    content = content.replace(regex, replace);
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${path.basename(filePath)}`);
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
// processFile(appFile); // Already updated manually
console.log("Refactoring complete.");
