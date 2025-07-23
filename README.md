# JSON Schema Validator

A web-based JSON Schema validator that supports Draft 7 specification with real-time validation and error highlighting.  Designed to work with `speccheck` 

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm (comes with Node.js)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd spec-validator
```

2. Install dependencies:
```bash
npm install
```

### Running the App

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

The built files will be in the `dist` directory.

## Usage

1. **Enter a JSON Schema** in the top editor
2. **Enter JSON Data** in the bottom editor to validate against your schema
3. **View validation results** in real-time
4. **Click on error messages** to highlight the problematic lines in the editor
5. **Use the "Prettify" button** to format your JSON

## Example

The app includes an `eth_chainId` example that demonstrates JSON-RPC 2.0 validation with hex string patterns.
