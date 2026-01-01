# Generate Video Thumbnail - Bun.js

Tạo thumbnail từ frame đầu tiên của video sử dụng Bun.js, Canvas API và Puppeteer (headless browser).

## Yêu cầu

- [Bun](https://bun.sh) runtime

## Cài đặt

```bash
bun install
```

## Sử dụng

```bash
bun run index.ts
```

Mặc định sẽ đọc `example.mp4` và tạo `thumbnail.jpg`

## Tùy chỉnh

Chỉnh sửa file [index.ts](index.ts) để thay đổi:
- `videoFile`: đường dẫn video input
- `outputFile`: đường dẫn thumbnail output

## Cách hoạt động

1. Sử dụng Puppeteer để khởi chạy headless Chrome browser
2. Load video file trong browser context
3. Sử dụng HTML5 Canvas API để vẽ frame đầu tiên
4. Export canvas thành JPEG và lưu file

## Ưu điểm

✅ Sử dụng Canvas API chuẩn HTML5  
✅ Không cần FFmpeg hay tools external  
✅ Hoạt động cross-platform  
✅ Chất lượng ảnh tốt với canvas rendering

This project was created using `bun init` in bun v1.3.5. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
