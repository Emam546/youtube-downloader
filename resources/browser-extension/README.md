# Browser Extension

This directory contains the browser extension that is distributed with the YouTube Downloader desktop application.

## Automated Download

The extension is automatically downloaded from GitHub during the build process. You do not need to manually update it.

## Build Process

When you run the desktop build command:

```bash
npm run build:desk
```

The build process will:

1. Automatically fetch the latest release from the GitHub repository: `Emam546/youtube-downloader-browser-extension`
2. Download the Chrome extension zip file
3. Extract it to `resources/browser-extension/chrome-built/`
4. Include it in the packaged application via electron-builder

## Manual Download

If you need to manually download the extension (for development purposes):

```bash
npm run download:extension
```

This will download and extract the latest version to the correct location.

## Extension Source

The extension is maintained at: https://github.com/Emam546/youtube-downloader-browser-extension

## Ignored from Git

The `chrome-built/` directory is ignored by Git since it's automatically generated during the build process.
