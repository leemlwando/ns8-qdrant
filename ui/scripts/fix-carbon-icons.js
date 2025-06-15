#!/usr/bin/env node

/**
 * Fix for missing @carbon/icons-vue/es/app-switcher/20 icon
 * 
 * This script works around a bug in @nethserver/ns8-ui-lib that imports
 * a non-existent app-switcher icon. We copy the switcher icon as app-switcher.
 * 
 * Author: Lee M. Lwando
 * Copyright (c) 2024 Lee M. Lwando
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

const fs = require('fs');
const path = require('path');

// Paths
const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
const iconsPath = path.join(nodeModulesPath, '@carbon', 'icons-vue', 'es');
const switcherPath = path.join(iconsPath, 'switcher');
const appSwitcherPath = path.join(iconsPath, 'app-switcher');

// Check if we need to apply the fix
if (fs.existsSync(switcherPath) && !fs.existsSync(appSwitcherPath)) {
  try {
    console.log('Applying Carbon Icons fix for app-switcher...');
      // Create the app-switcher directory
    if (!fs.existsSync(appSwitcherPath)) {
      fs.mkdirSync(appSwitcherPath, { recursive: true });
    }
    
    // Copy switcher files to app-switcher
    const switcherFiles = fs.readdirSync(switcherPath);
    for (const file of switcherFiles) {
      const srcFile = path.join(switcherPath, file);
      const destFile = path.join(appSwitcherPath, file);
      
      if (fs.statSync(srcFile).isFile()) {
        fs.copyFileSync(srcFile, destFile);
        console.log(`Copied: ${file}`);
      }
    }
    
    console.log('Carbon Icons fix applied successfully!');
  } catch (error) {
    console.warn('Warning: Could not apply Carbon Icons fix:', error.message);
    // Don't fail the build - this is a workaround for a dependency issue
    process.exit(0);
  }
} else if (!fs.existsSync(switcherPath)) {
  console.log('Warning: switcher/20 directory not found in @carbon/icons-vue');
} else {
  console.log('Carbon Icons fix not needed or already applied.');
}
