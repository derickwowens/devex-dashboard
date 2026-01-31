# Installation

## Prerequisites

- **Node.js** 18.0.0 or higher
- **npm** 9.0.0 or higher

## Quick Install

```bash
# Clone the repository
git clone https://github.com/org/federated-devex-platform.git
cd federated-devex-platform

# Run the installation script
./scripts/install.sh
```

The installation script will:

1. ✅ Verify Node.js version
2. ✅ Install root dependencies
3. ✅ Install package dependencies
4. ✅ Install dashboard dependencies
5. ✅ Make scripts executable

## Manual Installation

If you prefer to install manually:

```bash
# Install root dependencies
npm install

# Install dashboard dependencies
cd apps/dashboard
npm install
cd ../..

# Make scripts executable
chmod +x scripts/*.sh
```

## Package Installation

To use the SDK in your own project:

```bash
# Install the facade (includes all dependencies)
npm install @federated/facade

# Or install individual packages
npm install @federated/auth
npm install @federated/error-handling
npm install @federated/ui-config
npm install @federated/telemetry
```

## Verify Installation

```bash
# Start the dashboard
npm run dev

# The dashboard should be available at http://localhost:3000
```

## Next Steps

- [Quick Start Guide](quick-start.md) — Get up and running in 5 minutes
- [Configuration](configuration.md) — Configure the SDK for your environment
