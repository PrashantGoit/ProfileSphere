const fs = require('fs');
const path = require('path');
const browserEngine = require('./browserEngine');
const { createResultsDir } = require('./utils');

async function runTest(profile, url, options) {
    try {
        const resultsDir = createResultsDir();
        const testOptions = { ...options, resultsDir };
        console.log(`Running test for profile: ${profile.name}...`);
        await browserEngine.launchTest(profile, url, testOptions);

        console.log(`Test complete for profile: ${profile.name}. Results saved to: ${resultsDir}`);
    } catch (error) {
        console.error(`Test failed for profile: ${profile.name}. Error: ${error.message}`);
    }
}

async function runAllTests(args) {
    const { profiles, url, ...options } = args;

    const testPromises = profiles.map(profilePath => {
        try {
            const absoluteProfilePath = path.resolve(profilePath);
            if (!fs.existsSync(absoluteProfilePath)) {
                throw new Error(`Profile not found at ${absoluteProfilePath}`);
            }
            const profile = JSON.parse(fs.readFileSync(absoluteProfilePath, 'utf8'));
            profile.name = path.basename(profilePath, '.json');
            return runTest(profile, url, options);
        } catch (error) {
            console.error(`Failed to load profile: ${profilePath}. Error: ${error.message}`);
            return Promise.resolve(); // Resolve so Promise.all doesn't fail
        }
    });

    await Promise.all(testPromises);
    console.log('All tests complete.');
}

module.exports = { runAllTests };
