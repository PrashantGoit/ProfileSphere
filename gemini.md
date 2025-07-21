### **Mission 5: Advanced Fingerprint Spoofing**

**Goal:** Implement active spoofing for Canvas and WebGL fingerprints to make the browser profile resilient to advanced interrogation.

1.  Create a new profile, `profiles/mac-m1.json`, which includes a new `fingerprint` section containing spoofed WebGL data.
2.  Create a new file, `src/fingerprint-injector.js`, to house the JavaScript code that will be injected into the browser.
3.  Implement Canvas spoofing in `fingerprint-injector.js` by overriding `HTMLCanvasElement.prototype.toDataURL` to add subtle noise to the output, mimicking privacy-enhancing tools.
4.  Implement WebGL spoofing in `fingerprint-injector.js` by wrapping `WebGLRenderingContext.prototype.getParameter` to return the spoofed data from our profile.
5.  Modify `src/browserEngine.js` to read `fingerprint-injector.js` and use `page.addInitScript()` to inject it, passing the profile's fingerprint data to the script.

**Verification:** Run a test with the new `mac-m1.json` profile against `https://browserleaks.com/canvas` and `https://browserleaks.com/webgl`. The reported WebGL vendor should be the spoofed value ("Apple"), and the Canvas fingerprint should be unique on each run due to the noise injection.

### **Mission 6: Professionalizing the Output (HAR & JSON Reports)**

**Goal:** Go beyond screenshots and generate industry-standard, machine-readable test artifacts.

**Why it Matters:** While screenshots are great for visual verification, professional QA and development workflows rely on structured data. HAR (HTTP Archive) files are essential for diagnosing network performance issues. A JSON report makes it easy to integrate your tool into automated CI/CD pipelines.

**Implementation Steps:**
1.  Modify `src/browserEngine.js` to use Playwright's tracing capabilities to record a HAR file for the test run.
2.  Modify `src/orchestrator.js` to create a `report.json` file in the results directory.
3.  This `report.json` should contain metadata: the profile used, the target URL, the timestamp, and the path to the screenshot and HAR file.

**Verification:** Running a test will now produce a results directory containing three files: `screenshot.png`, `network.har`, and `report.json`. The HAR file can be dragged into the Chrome or Firefox DevTools "Network" tab for analysis.

### **Mission 7: Containerization & Portability (Docker)**

**Goal:** Package the entire application and its dependencies into a portable Docker image.

**Why it Matters:** This is the single most important step for scalability. A Docker image can be run anywhere—on another developer's machine, in a CI/CD runner, or on a cloud server (AWS, GCP, Azure)—with 100% consistency. This eliminates "it works on my machine" problems and is the foundation of a microservices architecture.

**Implementation Steps:**
1.  Create a `Dockerfile` in the project root.
2.  The `Dockerfile` will:
    *   Start from a base image that includes Node.js and the necessary browser dependencies. Playwright provides official images for this (`mcr.microsoft.com/playwright:v1.44.0-jammy`).
    *   Copy your `package.json` and install dependencies (this layer gets cached for faster builds).
    *   Copy the rest of your application code (`src`, `profiles`, `index.js`).
    *   Set the `ENTRYPOINT` to make the container executable.
3.  Create a `.dockerignore` file to exclude `node_modules` and `results` from the image.

**Verification:** You can build the image using `docker build -t browser-lab .` and then run a test inside the container using a `docker run` command, mounting the results directory to your host machine. The test should run identically to how it runs locally.

### **Mission 8: The Bridge to SaaS - A Simple API Server**

**Goal:** Wrap the CLI's core logic in a simple Express.js web server, creating an API endpoint to run tests.

**Why it Matters:** Your future SaaS front-end (e.g., a React or Vue app) cannot directly execute a command-line tool. It needs to communicate with a backend over HTTP. This mission builds the bridge, transforming your tool into a true service.

**Implementation Steps:**
1.  Install Express: `npm install express`.
2.  Create a new file, `server.js`.
3.  In `server.js`, create a simple Express app with one API endpoint: `POST /api/run-test`.
4.  This endpoint will accept a JSON body containing a `profileName` and a `url`.
5.  The endpoint handler will call your existing `orchestrator.runTest` function, effectively reusing all the logic you've already built. It will then return the `report.json` data as the API response.
6.  Update your `Dockerfile` to run `server.js` instead of `index.js`.

**Verification:** After starting the server, you can use a tool like Postman or `curl` to send a request to `http://localhost:3000/api/run-test`. The server should run the test and return a JSON response confirming success and providing paths to the artifacts.