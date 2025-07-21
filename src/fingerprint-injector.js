// This script is not run by Node.js, but is injected into the browser page.
// It receives the fingerprint options from our Playwright script.
((args) => {
  // --- Canvas Spoofing ---
  const originalGetCanvasData = HTMLCanvasElement.prototype.toDataURL;
  HTMLCanvasElement.prototype.toDataURL = function (type, ...rest) {
    const data = originalGetCanvasData.apply(this, [type, ...rest]);
    // A simple way to add noise is to add a random character to the end.
    // A more sophisticated method would involve manipulating the image data directly.
    return data.replace(/.$/, String.fromCharCode(Math.floor(Math.random() * 10) + 65)); // Add a random capital letter A-J
  };

  // --- WebGL Spoofing ---
  if (args.webglVendor && args.webglRenderer) {
    try {
      const getParameter = WebGLRenderingContext.prototype.getParameter;
      WebGLRenderingContext.prototype.getParameter = function (parameter) {
        // UNMASKED_VENDOR_WEBGL
        if (parameter === 37445) {
          return args.webglVendor;
        }
        // UNMASKED_RENDERER_WEBGL
        if (parameter === 37446) {
          return args.webglRenderer;
        }
        return getParameter.apply(this, [parameter]);
      };
    } catch (e) {
      // Ignore errors, as WebGL may not be supported.
    }
  }

  // Announce that the injector is active
  console.log('Fingerprint injector script is active.');
})(/* FINGERPRINT_ARGS_PLACEHOLDER */);