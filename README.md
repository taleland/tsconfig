# @taleland/tsconfig

Shared TypeScript configurations for Taleland services and libraries.

## Installation

```bash
npm install -D @taleland/tsconfig
```

## Presets

- `@taleland/tsconfig/base` - shared base configuration
- `@taleland/tsconfig/lib` - base config with declaration output
- `@taleland/tsconfig/service` - base config for services

## Usage

Use the preset that matches your package type.

### Library

```json
{
  "extends": "@taleland/tsconfig/lib",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*"]
}
```

### Service

```json
{
  "extends": "@taleland/tsconfig/service",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*"]
}
```

### Override options

You can still override any option locally:

```json
{
  "extends": "@taleland/tsconfig/base",
  "compilerOptions": {
    "noEmit": true
  }
}
```

## Releases

Merges into `main` publish through `publish.yml` with semantic-release and npm
Trusted Publishing. The npm trusted publisher must authorize GitHub organization
`taleland`, repository `tsconfig`, workflow `publish.yml`, with direct publishing
allowed and no environment restriction. No `NPM_TOKEN` is used. Manual workflow
dispatches must target `main`; release jobs run sequentially and test the package
before publishing.

The Conventional Commits preset stays on major 9 while release-notes-generator 14
uses changelog-writer 8. The release-note regression test checks this compatibility.

## License

Apache-2.0
