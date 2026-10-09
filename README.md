# Data Formatter

A modern, client-side web application for viewing and formatting structured data. Paste JSON, XML, YAML, CSV, or Python-style data and view it as a clean collapsible tree or table.

**Live Demo:** [https://christopheralberts.github.io/data-formatter/](https://christopheralberts.github.io/data-formatter/)

## Features

### Input Formats

- **JSON** - Standard JSON with strict parsing
- **JSON5/Lenient JSON** - Supports trailing commas, comments (`//` and `/* */`), single quotes
- **Python Dict/List** - Handles `True`, `False`, `None`, single-quoted strings, tuples
- **XML** - Converts to nested objects with attributes prefixed by `@`
- **YAML** - Full YAML 1.2 support
- **CSV/TSV** - Auto-detects comma or tab delimiters, parses with headers

### Auto-Detection

The app automatically detects the input format with a confidence score. You can also manually override the detected format using the dropdown.

### Views

#### Tree View

- Collapsible nodes with expand/collapse controls
- **Expand All** / **Collapse All** buttons
- **Expand to Depth** selector for controlled expansion
- Type-colored values (strings in green, numbers in blue, booleans in purple, null in gray)
- Child counts on collapsed nodes (e.g., `[3 items]`, `{5 keys}`)
- Empty values clearly marked with badges (`"" empty`, `[] empty`, `{} empty`, `null`)
- Hover actions to copy value or path

#### Table View

- Available when data is an array of objects
- Union of all keys across objects as columns
- Expandable rows to show nested data
- **Card View** option for wide records with many fields
- Row expansion shows full nested structure

### Search & Filter

- Search across keys and values
- Highlights matches in the tree
- Auto-expands to show matching nodes
- Navigate between matches with prev/next buttons

### Copy & Download

- **Copy value** - Copies the selected node's value as JSON
- **Copy path** - Copies the path (e.g., `journeys[0].email`)
- **Copy all** - Copies entire data as pretty-printed JSON
- **Download as JSON** - Downloads with `.json` extension
- **Download as YAML** - Converts and downloads as `.yaml`
- **Download as CSV** - Available for array-of-objects data

### UI Features

- **Light/Dark mode** with system preference detection
- **Responsive design** that works on different screen sizes
- **File drop/upload** support
- **Built-in samples** for quick testing (JSON, XML, YAML, CSV, Python formats)
- **Performance optimized** for large inputs with React memoization

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/christopheralberts/data-formatter.git
cd data-formatter

# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev
```

The app will be available at `http://localhost:5173/data-formatter/`

### Build

```bash
# Build for production
npm run build

# Preview the production build
npm run preview
```

### Testing

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch
```

## Project Structure

```
src/
├── components/
│   ├── Header.tsx       # App header with theme toggle
│   ├── InputPanel.tsx   # Text input area with file upload
│   ├── OutputPanel.tsx  # Tree/Table view container
│   ├── TreeView.tsx     # Collapsible tree renderer
│   ├── TableView.tsx    # Table and card views
│   └── Toast.tsx        # Toast notifications
├── hooks/
│   ├── useTheme.ts      # Dark/light mode hook
│   └── useExpandedNodes.ts  # Tree expansion state
├── utils/
│   ├── formatDetection.ts   # Auto-detect input format
│   ├── parsers.ts           # Parse all supported formats
│   ├── treeModel.ts         # Build tree data structure
│   ├── search.ts            # Search functionality
│   └── copy.ts              # Clipboard and download utils
├── data/
│   └── samples.ts       # Built-in sample data
├── types/
│   └── index.ts         # TypeScript type definitions
└── test/
    └── setup.ts         # Test setup
```

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS 4** - Styling
- **js-yaml** - YAML parsing
- **papaparse** - CSV parsing
- **lucide-react** - Icons
- **Vitest** - Testing framework

## Deployment

The app is automatically deployed to GitHub Pages when changes are pushed to the `main` branch. The deployment workflow:

1. Runs tests
2. Builds the production bundle
3. Deploys to GitHub Pages

To deploy manually, push to the `main` branch or trigger the workflow from the Actions tab.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT
