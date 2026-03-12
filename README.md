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

## License

Apache-2.0
