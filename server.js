
const express = require('express');
const fs = require('fs');
const path = require('path');
const orchestrator = require('./src/orchestrator');

const app = express();
const port = 3000;

app.use(express.json());

app.post('/api/run-test', async (req, res) => {
  const { profileName, url } = req.body;

  if (!profileName || !url) {
    return res.status(400).json({ error: 'profileName and url are required' });
  }

  try {
    const profilePath = path.resolve(profileName);
    if (!fs.existsSync(profilePath)) {
      return res.status(404).json({ error: `Profile not found at ${profilePath}` });
    }
    const profile = JSON.parse(fs.readFileSync(profilePath, 'utf8'));
    profile.name = path.basename(profileName, '.json');

    const report = await orchestrator.runTest(profile, url);
    res.json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while running the test' });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
