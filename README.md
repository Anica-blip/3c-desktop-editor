# 3C Desktop Editor

A powerful desktop application for editing 3C files with syntax highlighting, file management, and modern UI features.

## Features

- **Syntax Highlighting**: Full syntax highlighting for 3C file format
- **File Management**: Built-in file explorer with tree view
- **Modern UI**: Clean, responsive interface with dark/light theme support
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **Real-time Editing**: Live syntax validation and error highlighting
- **Multiple File Support**: Work with multiple files simultaneously
- **Search & Replace**: Advanced find and replace functionality
- **Auto-save**: Automatic saving of your work

## Screenshots

![Main Interface](screenshots/main-interface.png)
*Main editing interface with syntax highlighting*

![File Explorer](screenshots/file-explorer.png)
*Built-in file explorer*

## Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### From Source

1. Clone the repository:
```bash
git clone https://github.com/yourusername/3c-desktop-editor.git
cd 3c-desktop-editor
```

2. Install dependencies:
```bash
npm install
```

3. Run in development mode:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

### Binary Releases

Download the latest release for your platform from the [Releases](https://github.com/yourusername/3c-desktop-editor/releases) page.

## Usage

### Basic Usage

1. Launch the application
2. Use the file explorer to navigate to your 3C files
3. Click on a file to open it in the editor
4. Edit your code with full syntax highlighting
5. Save your changes with `Ctrl+S` (or `Cmd+S` on macOS)

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+N` | New file |
| `Ctrl+O` | Open file |
| `Ctrl+S` | Save file |
| `Ctrl+Shift+S` | Save as |
| `Ctrl+F` | Find |
| `Ctrl+H` | Find and replace |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `Ctrl+/` | Toggle comment |
| `F11` | Toggle fullscreen |

### 3C File Format

The editor supports the complete 3C file format specification, including:

- Variable declarations
- Function definitions
- Control structures
- Comments and documentation
- Import/export statements
- Type annotations

## Configuration

The editor can be configured through the settings panel (`File > Settings`) or by editing the `config.json` file in your user data directory.

### Available Settings

- **Theme**: Light or dark theme
- **Font Size**: Editor font size (8-32px)
- **Tab Size**: Number of spaces per tab (2, 4, 8)
- **Auto Save**: Enable/disable automatic saving
- **Word Wrap**: Enable/disable line wrapping
- **Show Line Numbers**: Display line numbers in editor

## Development

### Project Structure

```
3c-desktop-editor/
├── src/
│   ├── main/           # Main process files
│   ├── renderer/       # Renderer process files
│   ├── shared/         # Shared utilities
│   └── assets/         # Images, icons, etc.
├── build/              # Build configuration
├── dist/               # Built application
├── screenshots/        # Application screenshots
└── docs/               # Documentation
```

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup

1. Install dependencies: `npm install`
2. Run in development mode: `npm run dev`
3. Run tests: `npm test`
4. Lint code: `npm run lint`
5. Format code: `npm run format`

### Building

- Development build: `npm run build:dev`
- Production build: `npm run build:prod`
- Package for distribution: `npm run package`

## Testing

Run the test suite:

```bash
npm test
```

Run tests with coverage:

```bash
npm run test:coverage
```

## Technology Stack

- **Electron**: Cross-platform desktop app framework
- **React**: UI framework
- **TypeScript**: Type-safe JavaScript
- **Monaco Editor**: Code editor (VS Code editor)
- **Electron Builder**: App packaging and distribution
- **Jest**: Testing framework
- **ESLint**: Code linting
- **Prettier**: Code formatting

## Roadmap

- [ ] Plugin system for custom extensions
- [ ] Git integration
- [ ] Collaborative editing features
- [ ] Advanced debugging tools
- [ ] Project templates
- [ ] Code completion and IntelliSense
- [ ] Integrated terminal
- [ ] File comparison tool

## FAQ

### Q: What is the 3C file format?
A: 3C is a modern programming language format designed for clarity, conciseness, and correctness.

### Q: Can I use this editor for other file types?
A: While optimized for 3C files, the editor can open and edit most text-based files.

### Q: How do I report bugs?
A: Please use the [Issues](https://github.com/yourusername/3c-desktop-editor/issues) page on GitHub.

### Q: Is there a mobile version?
A: Currently, this is a desktop-only application. Mobile support is being considered for future releases.

## Support

If you encounter any issues or have questions:

1. Check the [FAQ](#faq) section
2. Search existing [Issues](https://github.com/yourusername/3c-desktop-editor/issues)
3. Create a new issue if needed
4. Join our [Discord community](https://discord.gg/3c-editor)

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed history of changes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to the Monaco Editor team for the excellent code editor component
- Thanks to the Electron team for making cross-platform desktop apps possible
- Thanks to all contributors who have helped improve this project

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/3c-desktop-editor&type=Date)](https://star-history.com/#yourusername/3c-desktop-editor&Date)

---

Made with ❤️ by the 3C Desktop Editor team
