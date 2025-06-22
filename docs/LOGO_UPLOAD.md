# Logo Upload Feature Documentation

## Overview

The Logo Upload feature allows users to upload and manage logos for their sites directly from the preview bar. This feature enhances the site customization capabilities by allowing businesses to display their brand logo in the site header.

## Implementation Details

### Components Created

1. **LogoUpload Component** (`/components/LogoUpload.tsx`)
   - Dialog-based interface for logo upload
   - Drag and drop support
   - File validation (type and size)
   - Preview functionality
   - Logo removal option

### API Endpoints

1. **Upload Logo** (`/api/sites/upload-logo/route.ts`)
   - Handles file upload
   - Validates file type (PNG, JPG, SVG, WebP)
   - Validates file size (5MB limit)
   - Saves file to `/public/uploads/logos/`
   - Returns public URL for the uploaded logo

2. **Update Logo URL** (`/api/sites/[siteId]/update-logo/route.ts`)
   - Updates the site's logo field in database
   - Handles logo removal (setting to null)
   - Deletes old logo file when removing

### Database Changes

No database changes were required - the Site model already had a `logo` field (String, nullable).

### File Storage

- Logos are stored in `/public/uploads/logos/`
- Files are named with pattern: `{subdomain}-{timestamp}.{extension}`
- Directory structure is preserved with `.gitkeep` files
- Uploaded files are excluded from git via `.gitignore`

### UI Integration

1. **Preview Bar** (`/app/preview/[siteId]/PreviewBar.tsx`)
   - Added LogoUpload component button
   - Shows "Logo" button next to color picker

2. **Site Display**
   - Logo is displayed in site header (both preview and live site)
   - Falls back to business name text if no logo
   - Logo displayed at height of 32px (h-8 class)

## Usage Instructions

### For End Users

1. Navigate to site preview
2. Click "Logo" button in preview bar
3. Either:
   - Drag and drop an image file
   - Click "Select File" to browse
4. Preview the logo before saving
5. Click outside dialog to save
6. To remove: Click the X button on the logo preview

### Technical Specifications

- **Supported formats**: PNG, JPG, SVG, WebP
- **Max file size**: 5MB
- **Recommended dimensions**: 200x50px or similar aspect ratio
- **Storage location**: `/public/uploads/logos/`

## Security Considerations

1. **Authentication**: All endpoints require user authentication
2. **Authorization**: Site ownership is verified before allowing upload
3. **File validation**: Strict type and size validation
4. **Multi-tenant isolation**: Each logo is associated with specific site

## Error Handling

- Invalid file type: Shows error toast
- File too large: Shows error toast  
- Upload failure: Shows error toast with message
- Network errors: Graceful fallback with user feedback

## Future Enhancements

1. **Image optimization**: Automatically resize/compress uploaded images
2. **Multiple logo variants**: Support for dark/light mode logos
3. **Logo positioning**: Allow users to choose logo alignment
4. **Favicon generation**: Auto-generate favicon from logo
5. **CDN integration**: Store logos on CDN for better performance

## Code Quality

Following CLAUDE.md guidelines:
- ✅ Zero technical debt
- ✅ No console.log statements (uses logger.ts)
- ✅ Native fetch for all HTTP requests
- ✅ Proper error handling with user feedback
- ✅ TypeScript types throughout
- ✅ Multi-tenant isolation maintained
- ✅ Self-documenting code

## Testing Checklist

- [ ] Upload PNG logo
- [ ] Upload JPG logo
- [ ] Upload SVG logo
- [ ] Test drag and drop
- [ ] Test file size limit (>5MB)
- [ ] Test invalid file type
- [ ] Remove uploaded logo
- [ ] Verify logo displays in header
- [ ] Test on mobile viewport
- [ ] Verify persistence after page reload
