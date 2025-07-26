const fs = require('fs');
const path = require('path');

// Get all translation keys from English file
const getKeys = (obj, prefix = '') => {
  let keys = [];
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys = keys.concat(getKeys(obj[key], prefix + key + '.'));
    } else {
      keys.push(prefix + key);
    }
  }
  return keys;
};

// Check translation completeness
const checkTranslations = () => {
  const localesDir = '/workspaces/HNV1/frontend/public/locales';
  const enFile = path.join(localesDir, 'en/translation.json');
  
  if (!fs.existsSync(enFile)) {
    console.error('English translation file not found');
    return;
  }
  
  const enTranslations = JSON.parse(fs.readFileSync(enFile, 'utf8'));
  const enKeys = getKeys(enTranslations);
  
  console.log(`Total translation keys: ${enKeys.length}`);
  console.log('\nChecking language files...\n');
  
  const languages = fs.readdirSync(localesDir).filter(dir => 
    fs.statSync(path.join(localesDir, dir)).isDirectory() && dir !== 'en'
  );
  
  let allComplete = true;
  
  languages.forEach(lang => {
    const langFile = path.join(localesDir, lang, 'translation.json');
    
    if (!fs.existsSync(langFile)) {
      console.log(`❌ ${lang}: File missing`);
      allComplete = false;
      return;
    }
    
    try {
      const langTranslations = JSON.parse(fs.readFileSync(langFile, 'utf8'));
      const langKeys = getKeys(langTranslations);
      
      const missingKeys = enKeys.filter(key => !langKeys.includes(key));
      
      if (missingKeys.length === 0) {
        console.log(`✅ ${lang}: Complete (${langKeys.length} keys)`);
      } else {
        console.log(`⚠️  ${lang}: Missing ${missingKeys.length} keys`);
        if (missingKeys.length <= 5) {
          missingKeys.forEach(key => console.log(`   - ${key}`));
        }
        allComplete = false;
      }
    } catch (error) {
      console.log(`❌ ${lang}: Invalid JSON`);
      allComplete = false;
    }
  });
  
  console.log(`\n${allComplete ? '✅ All translations complete!' : '⚠️  Some translations incomplete'}`);
  
  // Check for hardcoded text in components
  console.log('\nChecking for hardcoded text...');
  const srcDir = '/workspaces/HNV1/frontend/src';
  const checkHardcodedText = (dir) => {
    const files = fs.readdirSync(dir);
    let hardcodedFound = false;
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !['node_modules', '.git', 'dist', 'build'].includes(file)) {
        if (checkHardcodedText(filePath)) hardcodedFound = true;
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Look for hardcoded strings (simple check)
        const hardcodedMatches = content.match(/"[A-Z][a-zA-Z\s]{3,}"/g);
        if (hardcodedMatches) {
          const filtered = hardcodedMatches.filter(match => 
            !match.includes('className') && 
            !match.includes('data-') && 
            !match.includes('aria-') &&
            !match.includes('http') &&
            !match.includes('mailto') &&
            !match.includes('.') &&
            !match.includes('/') &&
            !match.includes('px') &&
            !match.includes('%') &&
            match.length > 6
          );
          
          if (filtered.length > 0) {
            console.log(`⚠️  ${filePath.replace(srcDir, '')}: ${filtered.slice(0, 3).join(', ')}`);
            hardcodedFound = true;
          }
        }
      }
    });
    
    return hardcodedFound;
  };
  
  const hasHardcoded = checkHardcodedText(srcDir);
  console.log(hasHardcoded ? '\n⚠️  Found potential hardcoded text' : '\n✅ No obvious hardcoded text found');
};

checkTranslations();