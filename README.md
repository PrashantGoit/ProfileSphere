# Browser Lab CLI

A CLI tool for running browser-based tests with different profiles.

## Installation

```bash
npm install
```

## Usage

```bash
node index.js run --profiles <profile1.json> [<profile2.json> ...] --url <url>
```

### Options

- `--profiles`: (Required) A list of paths to browser profile JSON files.
- `--url`: (Required) The URL to test.
- `--headless`: (Optional) Run in headless mode. Defaults to `true`.
- `--recordVideo`: (Optional) Record a video of the test. Defaults to `false`.
- `--har`: (Optional) Generate a HAR file. Defaults to `false`.
- `--offline`: (Optional) Simulate offline mode. Defaults to `false`.

### Example

```bash
node index.js run --profiles ./profiles/android-moto-g4.json ./profiles/firefox-germany-3g.json --url https://www.google.com
```

## Profiles

Profiles are JSON files that define the browser configuration. See the files in the `profiles` directory for examples.
