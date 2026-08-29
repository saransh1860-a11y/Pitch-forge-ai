import pkg from '../dist/api-bundle.cjs';

// Robust interop for CommonJS bundled files across ES Module runtimes
const createApp = pkg.createApp || (pkg.default && pkg.default.createApp) || pkg;
const app = createApp();

export default app;
