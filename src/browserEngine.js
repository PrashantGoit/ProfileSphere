const playwright = require('playwright');

async function launchTest(profile, url, options) {
    const browserType = profile.browser || 'chromium';
    const browser = await playwright[browserType].launch({
        headless: options.headless,
    });
    const contextOptions = {
        ...profile.config,
        recordVideo: options.recordVideo ? { dir: options.resultsDir } : undefined,
    };
    const context = await browser.newContext(contextOptions);
    const page = await context.newPage();

    if (options.offline) {
        await context.setOffline(true);
    }

    const resultsDir = options.resultsDir;
    let harPath;
    // HAR is not applicable in offline mode
    if (options.har && !options.offline) {
        harPath = `${resultsDir}/trace.har`;
        await context.tracing.start({ name: 'trace', screenshots: true, snapshots: true });
    }

    const waitUntil = options.offline ? 'load' : 'networkidle';
    try {
        await page.goto(url, { waitUntil });
    } catch (error) {
        if (options.offline) {
            console.log(`(Offline mode) Navigation to ${url} failed as expected. Capturing screenshot of the result.`);
        } else {
            // Stop tracing on error before re-throwing
            if (harPath) {
                await context.tracing.stop({ path: harPath });
            }
            throw error;
        }
    }

    if (harPath) {
        await context.tracing.stop({ path: harPath });
    }

    const screenshotPath = `${resultsDir}/screenshot.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });

    await browser.close();
    return { screenshotPath, harPath };
}

module.exports = { launchTest };
