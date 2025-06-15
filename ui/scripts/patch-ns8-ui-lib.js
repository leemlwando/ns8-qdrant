#!/usr/bin/env node

/**
 * Post-install patch script to fix NS8 UI library icon imports
 * This script replaces the missing app-switcher icon with the available apps icon
 */

const fs = require('fs');
const path = require('path');

const ESM_FILE = path.join(__dirname, '..', 'node_modules', '@nethserver', 'ns8-ui-lib', 'dist', 'ns8-ui-lib.esm.js');
const SSR_FILE = path.join(__dirname, '..', 'node_modules', '@nethserver', 'ns8-ui-lib', 'dist', 'ns8-ui-lib.ssr.js');

function patchFile(filePath, searchPattern, replacement, description) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes(replacement)) {
      console.log(`✅ ${description} - already patched`);
      return true;
    }

    if (content.includes(searchPattern)) {
      content = content.replace(searchPattern, replacement);
      fs.writeFileSync(filePath, content);
      console.log(`✅ ${description} - patched successfully`);
      return true;
    } else {
      console.log(`⚠️  ${description} - search pattern not found`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error patching ${description}:`, error.message);
    return false;
  }
}

console.log('🔧 Patching NS8 UI library icon imports...');

// Patch ESM version
const esmPatched = patchFile(
  ESM_FILE,
  "import AppSwitcher20 from '@carbon/icons-vue/es/app-switcher/20';",
  "import AppSwitcher20 from '@carbon/icons-vue/es/apps/20';",
  'ESM file icon import'
);

// Patch SSR version  
const ssrPatched = patchFile(
  SSR_FILE,
  "AppSwitcher20=require('@carbon/icons-vue/es/app-switcher/20')",
  "AppSwitcher20=require('@carbon/icons-vue/es/apps/20')",
  'SSR file icon import'
);

if (esmPatched && ssrPatched) {
  console.log('🎉 NS8 UI library patching completed successfully!');
  process.exit(0);
} else {
  console.log('⚠️  Some patches failed, but continuing...');
  process.exit(0); // Don't fail the build
}
