### **Mission 5: Advanced Fingerprint Spoofing**

**Goal:** Implement active spoofing for Canvas and WebGL fingerprints to make the browser profile resilient to advanced interrogation.

1.  Create a new profile, `profiles/mac-m1.json`, which includes a new `fingerprint` section containing spoofed WebGL data.
2.  Create a new file, `src/fingerprint-injector.js`, to house the JavaScript code that will be injected into the browser.
3.  Implement Canvas spoofing in `fingerprint-injector.js` by overriding `HTMLCanvasElement.prototype.toDataURL` to add subtle noise to the output, mimicking privacy-enhancing tools.
4.  Implement WebGL spoofing in `fingerprint-injector.js` by wrapping `WebGLRenderingContext.prototype.getParameter` to return the spoofed data from our profile.
5.  Modify `src/browserEngine.js` to read `fingerprint-injector.js` and use `page.addInitScript()` to inject it, passing the profile's fingerprint data to the script.

**Verification:** Run a test with the new `mac-m1.json` profile against `https://browserleaks.com/canvas` and `https://browserleaks.com/webgl`. The reported WebGL vendor should be the spoofed value ("Apple"), and the Canvas fingerprint should be unique on each run due to the noise injection.