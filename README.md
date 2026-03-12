# `@taleland/tsconfig`

Shared TypeScript configurations for Taleland Node.js projects.

## Install

```sh
npm install --save-dev @taleland/tsconfig
```

## Presets

This package publishes three presets:

- `@taleland/tsconfig/base` for common Node.js projects
- `@taleland/tsconfig/service` for backend services
- `@taleland/tsconfig/lib` for reusable libraries and monorepo packages

## Usage

### Base

```json
{
  "extends": "@taleland/tsconfig/base",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src/**/*.ts"]
}
```

### Service

```json
{
  "extends": "@taleland/tsconfig/service",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src/**/*.ts"]
}
```

### Library

```json
{
  "extends": "@taleland/tsconfig/lib",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*.ts"]
}
```

## What is included

Base config includes:

- `target` and `lib` set for modern Node.js runtimes
- `module` and `moduleResolution` set to `NodeNext`
- strict type checking
- JSON module support
- decorator support with metadata

Additional preset behavior:

- `service` enables `sourceMap` and `incremental`
- `lib` enables `composite`, `declaration`, `declarationMap`, `incremental`, and `sourceMap`

## License

Apache-2.0

## Release

Package publishing is handled by GitHub Actions in `.github/workflows/publish.yml` with `semantic-release`.

The workflow runs when:

- a pull request is merged into `main`
- the workflow is started manually with `workflow_dispatch`

Versioning is derived from Conventional Commits:

- `fix:` publishes a patch release
- `feat:` publishes a minor release
- `BREAKING CHANGE:` or `!` publishes a major release

During release, the workflow:

- calculates the next version from commit history
- updates `package.json` and `package-lock.json`
- generates `CHANGELOG.md`
- creates a GitHub release
- publishes the package to npm with provenance

To enable publishing, configure one of these options on npm:

- preferred: npm trusted publishing for this GitHub repository
- fallback: add an `NPM_TOKEN` repository secret with publish access
