#!/usr/bin/env node
// @ts-check

const path = require('path');
const fs = require('fs/promises');

const cwd = process.cwd();
const NORMALIZED_VERSION = '0.0.0';

// Utility function to read JSON from a file
const readJson = async (filePath) => JSON.parse(await fs.readFile(filePath, 'utf8'));

// Utility function to write JSON to a file
const writeJson = async (filePath, data) =>
  fs.writeFile(filePath, JSON.stringify(data, null, 2) + '\n');

// Function to normalize versions in a given package
const normalizePackageVersions = async (pkgDir, pkgNames) => {
  const filePath = path.join(cwd, 'packages', pkgDir, 'package.json');
  const data = await readJson(filePath);
  const version = data.version;

  if (version) {
    data.version = NORMALIZED_VERSION;

    const normalizeEntry = (type, key) => {
      const pkgVersion = data[type][key];

      if (pkgNames.includes(key) && pkgVersion === version) {
        data[type][key] = NORMALIZED_VERSION;
      }
    };

    Object.keys(data.dependencies || {}).forEach((key) => normalizeEntry('dependencies', key));
    Object.keys(data.devDependencies || {}).forEach((key) => normalizeEntry('devDependencies', key));

    await writeJson(filePath, data);
  }
};

// Main function to normalize versions in all packages
const normalizeVersionsInPackages = async () => {
  const packages = await fs.readdir(path.join(cwd, 'packages'));
  const pkgNames = [];

  const pkgJsonData = await Promise.all(
    packages.map(async (pkgDir) => {
      const data = await readJson(path.join(cwd, 'packages', pkgDir, 'package.json'));
      pkgNames.push(data.name);
      return { pkgDir, data };
    })
  );

  await Promise.all(pkgJsonData.map(({ pkgDir }) => normalizePackageVersions(pkgDir, pkgNames)));
};

// Main function to run the version normalization script
const runVersionNormalizationScript = async () => {
  await normalizeVersionsInPackages();
  await normalizePackageVersions('', []); // Normalize lerna.json
  await fs.unlink(path.join(cwd, 'pnpm-lock.yaml'));
  await fs.writeFile(path.join(cwd, 'pnpm-lock.yaml'), '');

  const rootPkgJsonPath = path.join(cwd, 'package.json');
  await writeJson(rootPkgJsonPath, {
    name: 'nextjs-project',
    version: '0.0.0',
    private: true,
    workspaces: ['packages/*'],
    scripts: {},
  });
};

// Execute the main script
runVersionNormalizationScript();
