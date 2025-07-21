const yargs = require('yargs');
const orchestrator = require('./orchestrator');

function run() {
    yargs
        .command('run', 'Run a browser test', (yargs) => {
            yargs
                .option('profiles', {
                    describe: 'Paths to the browser profile JSONs',
                    demandOption: true,
                    type: 'array'
                })
                .option('url', {
                    describe: 'URL to test',
                    demandOption: true,
                    type: 'string'
                })
                .option('headless', {
                    describe: 'Run in headless mode',
                    type: 'boolean',
                    default: true
                })
                .option('recordVideo', {
                    describe: 'Record a video of the test',
                    type: 'boolean',
                    default: false
                })
                .option('har', {
                    describe: 'Generate a HAR file',
                    type: 'boolean',
                    default: false
                })
                .option('offline', {
                    describe: 'Simulate offline mode',
                    type: 'boolean',
                    default: false
                });
        }, (argv) => {
            orchestrator.runAllTests(argv);
        })
        .demandCommand(1, 'You need at least one command before moving on')
        .help()
        .argv;
}

module.exports = { run };
