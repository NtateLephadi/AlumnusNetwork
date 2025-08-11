# Attached Assets

This directory contains static assets and uploaded files used throughout the UCT SCF Alumni Hub application.

## 📁 Contents

### Images
- User-uploaded profile images
- Event images and banners
- Generated images for content
- Screenshots and documentation images

### File Management
- All uploaded assets are stored with unique identifiers
- Images are optimized for web delivery
- Assets are referenced using the `@assets` import alias

## 🔧 Usage in Code

Import assets using the configured alias:

```typescript
import imageUrl from '@assets/image_name.png';

function MyComponent() {
  return <img src={imageUrl} alt="Description" />;
}
```

## 📝 File Naming Convention

- Use descriptive names with underscores
- Include timestamps for uniqueness
- Follow format: `descriptive_name_timestamp.extension`

## 🚫 Guidelines

- Keep file sizes optimized for web
- Use appropriate image formats (PNG, JPG, SVG)
- Avoid uploading sensitive or personal content
- Regular cleanup of unused assets

## 🔒 Security

- All uploads are validated for file type
- File size limits are enforced
- No executable files are permitted
- Assets are served through secure endpoints