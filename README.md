# Generate Video Thumbnail - Bun.js

Generate a thumbnail from the first frame of a video using Bun.js, the Canvas API, and Puppeteer (headless browser).

## Requirements

- [Bun](https://bun.sh) runtime
- Puppeteer (installed automatically via `bun add puppeteer`)

## Installation

```bash
bun install
```

## Usage

```bash
bun run index.ts
```

By default, the script reads `example.mp4` and generates `thumbnail.jpg`.

## Customization

Edit the [index.ts](index.ts) file to change:
- `videoFile`: the input video path
- `outputFile`: the output thumbnail path

## How It Works

1. A temporary HTTP server is created using `Bun.serve()` to serve the video file.
2. Puppeteer launches a headless Chrome browser.
3. The video is loaded in the browser context.
4. The HTML5 Canvas API is used to draw the first frame of the video.
5. The canvas is exported as a JPEG image and saved to a file.

## Advantages

✅ Uses the standard HTML5 Canvas API  
✅ No need for FFmpeg or external tools  
✅ Cross-platform compatibility  
✅ High-quality images with canvas rendering

This project was created using `bun init` in bun v1.3.5. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
