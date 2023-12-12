const semver = require('next/dist/compiled/semver');
const nextPackage = require('next/package.json');

// Validate next version
if (semver.lt(nextPackage.version, '13.0.0')) {
  throw new Error('`@next/font` is only available in Next.js 13 and newer.');
}

// Prepare error message
let message = '@next/font/local failed to run or is incorrectly configured.';

// Provide additional information in development mode
if (process.env.NODE_ENV === 'development') {
  message += `\nIf you just installed \`@next/font\`, please try restarting \`next dev\` and resaving your file.`;
}

// Add a link to documentation
message += '\n\nRead more: https://nextjs.org/docs/basic-features/font-optimization';

// Throw an error with the prepared message
throw new Error(message);
