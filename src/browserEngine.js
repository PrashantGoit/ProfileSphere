const { chromium, firefox, webkit } = require('playwright');
const path = require('path');
const fs = require('fs/promises');

async function launchTest(profile, url, options) {
  const { resultsDir } = options;
  const browserType = { chromium, firefox, webkit }[profile.browser];
  if (!browserType) {
    throw new Error(`Unsupported browser type in profile: "${profile.browser}"`);
  }

  const browser = await browserType.launch({ headless: options.headless });
  const context = await browser.newContext(profile.config);

  // *** NEW: Start tracing for HAR file ***
  await context.tracing.start({ screenshots: false, snapshots: false });

  const page = await context.newPage();

  // --- FINGERPRINT INJECTION LOGIC ---
  if (profile.fingerprint) {
    console.log('> Applying fingerprint modifications...');
    let injectorScript = await fs.readFile(path.join(__dirname, 'fingerprint-injector.js'), 'utf-8');
    
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

  // *** NEW: Stop tracing and save the HAR file ***
  const harPath = path.join(resultsDir, 'network.har');
  console.log('> Saving network HAR file...');
  await context.tracing.stop({ path: harPath });

  await browser.close();

  // Return artifact paths for the report
  return { screenshotPath, harPath };
}

module.exports = { launchTest };
