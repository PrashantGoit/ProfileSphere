# Gemini Development Plan: Browser Lab CLI

This document outlines the step-by-step missions to build and test the Browser Lab CLI prototype. Each mission is a self-contained, verifiable step.

### **Mission 0: Project Initialization**

**Goal:** Set up the project structure and install all necessary dependencies.

1.  Create the full directory structure as defined in the architecture plan.
2.  Create the `package.json` file.
3.  Run `npm install` to fetch dependencies.
4.  Create the `.gitignore` file.
5.  Create empty placeholder files for all `.js` and `.json` files in the plan.

**Verification:** The command `npm install` runs without errors. The directory structure matches the plan exactly.

### **Mission 1: The Core Orchestrator & CLI Entry**

**Goal:** Create the basic CLI command and make it call the orchestrator. The orchestrator will simply log the received arguments for now.

1.  Implement `index.js` to be the executable entry point.
2.  Implement `src/cli.js` to define the `run` command and its options (`--profile`, `--url`) using `yargs`.
3.  Implement a skeleton `src/orchestrator.js` with an `async function runTest(args)` that `console.log(args)`.

**Verification:** Running `node index.js run --profile ./profiles/android-moto-g4.json --url https://example.com` should print the arguments object to the console.

### **Mission 2: Profile-Driven Browser Launch**

**Goal:** Load a profile and launch a browser configured with its basic settings (UA, viewport).

1.  Implement the logic in `src/orchestrator.js` to read the profile path from args.
2.  Implement `src/browserEngine.js` with a function `launchTest`. This function will take the profile data and a URL.
3.  In `browserEngine.js`, use Playwright to launch a browser, create a new context with the `userAgent` and `viewport` from the profile, navigate to the URL, and take a screenshot.
4.  Implement `src/utils.js` to create a timestamped results directory.
5.  Update `orchestrator.js` to call `browserEngine.launchTest` and save the screenshot in the results directory.

**Verification:** Running the command from Mission 1 should now launch a browser, navigate to the URL, and save a `screenshot.png` in a new folder inside `/results`. The screenshot should show the mobile version of the site.

### **Mission 3: Advanced Emulation**

**Goal:** Enhance the `browserEngine` to support advanced emulation features from our profile.

1.  Populate `profiles/firefox-germany-3g.json` with timezone, locale, and network data.
2.  Modify `src/browserEngine.js` to read `locale`, `timezoneId`, and `geolocation` from the profile and apply them to the Playwright context.
3.  Add the logic to `browserEngine.js` to apply network emulation using `page.context().newCDPSession()`. This is only for Chromium-based browsers, so add a check.
4.  Update `orchestrator.js` to handle profiles with these new keys gracefully.

**Verification:** Run a test with `firefox-germany-3g.json` against `https://webbrowsertools.com/`. The resulting screenshot should show a location in Berlin, the page should load slowly, and the time should reflect the German timezone.

### **Mission 4: Finalizing and Polishing**

**Goal:** Make the tool robust and user-friendly.

1.  Add comprehensive JSDoc comments to all functions.
2.  Add error handling (e.g., what if the profile file doesn't exist? What if the URL is invalid?).
3.  Improve console output to show progress (e.g., "Loading profile...", "Launching browser...", "Test complete. Results saved to...").
4.  Add a `log.txt` to the results directory, capturing console output or other metadata.

**Verification:** The tool provides clear feedback, handles common errors gracefully, and produces a neat, self-contained result folder.
