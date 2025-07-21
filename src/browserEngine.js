const { chromium, firefox, webkit } = require('playwright');
const path = require('path');
const fs = require('fs/promises'); // Add fs

/**
 * Launches a browser with the specified profile, runs the test, and saves artifacts.
 * @param {object} profile - The loaded profile object.
 * @param {string} url - The target URL.
 * @param {string} resultsDir - The directory to save results in.
 */
async function launchTest(profile, url, options) {
  const { resultsDir } = options;
  const browserType = { chromium, firefox, webkit }[profile.browser];
  if (!browserType) {
    throw new Error(`Unsupported browser type in profile: "${profile.browser}"`);
  }

  const browser = await browserType.launch({ headless: options.headless });
  const context = await browser.newContext(profile.config);
  const page = await context.newPage();

  // --- NEW: FINGERPRINT INJECTION LOGIC ---
  if (profile.fingerprint) {
    console.log('> Applying fingerprint modifications...');
    let injectorScript = await fs.readFile(path.join(__dirname, 'fingerprint-injector.js'), 'utf-8');
    
    // Pass fingerprint data from the profile into the script
    const fingerprintArgs = JSON.stringify(profile.fingerprint);
    injectorScript = injectorScript.replace('/* FINGERPRINT_ARGS_PLACEHOLDER */', fingerprintArgs);
    
    await page.addInitScript({ content: injectorScript });
  }

  // Apply network conditions (currently for Chromium only via CDP)
  if (profile.network && profile.browser === 'chromium') {
    console.log('> Applying network emulation...');
    const client = await page.context().newCDPSession(page);
    await client.send('Network.emulateNetworkConditions', profile.network);
  }

  console.log(`> Navigating to ${url}...`);
  await page.goto(url, { waitUntil: 'networkidle' });
  console.log('> Page loaded.');

  const screenshotPath = path.join(resultsDir, 'screenshot.png');
  console.log('> Taking screenshot...');
  await page.screenshot({ path: screenshotPath, fullPage: true });

  await browser.close();
}

module.exports = { launchTest };
