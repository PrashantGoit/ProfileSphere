const fs = require('fs/promises');
const fsSync = require('fs');
const path = require('path');
const browserEngine = require('./browserEngine');
const { createResultsDir } = require('./utils');

async function runTest(profile, url, options) {
    const resultsDir = createResultsDir();
    let report;
    try {
        const testOptions = { ...options, resultsDir };
        console.log(`Running test for profile: ${profile.name}...`);
        const artifacts = await browserEngine.launchTest(profile, url, testOptions);
        console.log('> Test execution complete.');

        console.log('Generating final report...');
        report = {
            success: true,
            profileName: profile.profileName || profile.name,
            targetUrl: url,
            timestamp: new Date().toISOString(),
            results: {
                report: path.join(resultsDir, 'report.json'),
                screenshot: artifacts.screenshotPath,
                network: artifacts.harPath,
            },
        };

        const reportPath = path.join(resultsDir, 'report.json');
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
        console.log('> Report saved.');

        console.log(`Test complete for profile: ${profile.name}. Results saved to: ${resultsDir}`);
    } catch (error) {
        console.error(`Test failed for profile: ${profile.name}. Error: ${error.message}`);
        report = {
            success: false,
            profileName: profile.profileName || profile.name,
            targetUrl: url,
            timestamp: new Date().toISOString(),
            error: error.message,
        };
        const reportPath = path.join(resultsDir, 'report.json');
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    }
    return report;
}

async function runAllTests(args) {
    const { profiles, url, ...options } = args;

    const testPromises = profiles.map(profilePath => {
        try {
            const absoluteProfilePath = path.resolve(profilePath);
            if (!fsSync.existsSync(absoluteProfilePath)) {
                throw new Error(`Profile not found at ${absoluteProfilePath}`);
            }
            const profile = JSON.parse(fsSync.readFileSync(absoluteProfilePath, 'utf8'));
            profile.name = path.basename(profilePath, '.json');
            return runTest(profile, url, options);
        } catch (error) {
            console.error(`Failed to load profile: ${profilePath}. Error: ${error.message}`);
            return Promise.resolve();
        }
    });

    await Promise.all(testPromises);
    console.log('All tests complete.');
}

module.exports = { runAllTests, runTest };
