#!/usr/bin/env bun

import { existsSync, writeFileSync, readFileSync } from "fs";
import { resolve, extname } from "path";

/**
 * Generate a thumbnail from the first frame of a video
 * Uses the Canvas API via Puppeteer (headless browser)
 */
async function generateThumbnail(
  videoPath: string,
  outputPath: string = "thumbnail.jpg"
): Promise<void> {
  let server: any = null;

  try {
    // Check if the video file exists
    if (!existsSync(videoPath)) {
      throw new Error(`Video file does not exist: ${videoPath}`);
    }

    console.log(`📹 Reading video: ${videoPath}`);
    console.log(`🖼️  Generating thumbnail with Canvas: ${outputPath}`);

    // Create a temporary HTTP server to serve the video file
    const absoluteVideoPath = resolve(videoPath);
    const videoBuffer = readFileSync(absoluteVideoPath);
    const videoExt = extname(videoPath).toLowerCase();

    const mimeTypes: Record<string, string> = {
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.ogg': 'video/ogg',
      '.mov': 'video/quicktime',
    };

    const mimeType = mimeTypes[videoExt] || 'video/mp4';

    server = Bun.serve({
      port: 0, // Random port
      fetch(req) {
        return new Response(videoBuffer, {
          headers: {
            'Content-Type': mimeType,
            'Access-Control-Allow-Origin': '*',
          },
        });
      },
    });

    const videoUrl = `http://localhost:${server.port}/video${videoExt}`;
    console.log(`🌐 Temporary server: ${videoUrl}`);

    // Dynamically import Puppeteer
    const puppeteer = await import("puppeteer");

    // Launch headless browser with disabled web security to avoid CORS issues
    const browser = await puppeteer.default.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--autoplay-policy=no-user-gesture-required',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process'
      ]
    });

    const page = await browser.newPage();

    // Set HTML content with video and canvas
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
        </head>
        <body>
          <video id="video" style="display:none;"></video>
          <canvas id="canvas" style="display:none;"></canvas>
        </body>
      </html>
    `);

    // Execute code in the browser context to extract the frame
    const imageBase64 = await page.evaluate(async (videoSrc) => {
      const video = document.getElementById('video') as HTMLVideoElement;
      const canvas = document.getElementById('canvas') as HTMLCanvasElement;

      return new Promise<string>((resolve, reject) => {
        let hasResolved = false;

        video.onloadedmetadata = () => {
          // Set canvas size based on video dimensions
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          // Seek to the first frame
          video.currentTime = 0;
        };

        video.onseeked = () => {
          if (hasResolved) return;
          hasResolved = true;

          try {
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              reject(new Error('Unable to create canvas context'));
              return;
            }

            // Draw the current frame onto the canvas
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Convert the canvas to a base64 JPEG
            const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
            resolve(dataUrl);
          } catch (err) {
            reject(err);
          }
        };

        video.onerror = (e) => {
          reject(new Error('Error loading video'));
        };

        // Timeout fallback
        setTimeout(() => {
          if (!hasResolved) {
            reject(new Error('Timeout while loading video'));
          }
        }, 10000);

        video.src = videoSrc;
        video.load();
      });
    }, videoUrl);

    // Convert base64 to binary and save the file
    const base64Data = imageBase64.replace(/^data:image\/jpeg;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    writeFileSync(outputPath, imageBuffer);

    await browser.close();

    console.log(`✅ Thumbnail successfully created: ${outputPath}`);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Cannot find package 'puppeteer'")) {
        console.error("❌ Puppeteer is not installed!");
        console.error("📦 Install it with: bun add puppeteer");
      } else {
        console.error(`❌ Error: ${error.message}`);
      }
    }
    throw error;
  } finally {
    // Stop the server
    if (server) {
      server.stop();
      console.log("🛑 Temporary server stopped");
    }
  }
}

// Main execution
const videoFile = "example.mp4";
const outputFile = "thumbnail.jpg";

await generateThumbnail(videoFile, outputFile);