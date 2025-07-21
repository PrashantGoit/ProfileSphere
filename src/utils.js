const fs = require('fs');
const path = require('path');

function createResultsDir() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const dirPath = path.join(__dirname, '..', 'results', timestamp);
    fs.mkdirSync(dirPath, { recursive: true });
    return dirPath;
}

module.exports = { createResultsDir };