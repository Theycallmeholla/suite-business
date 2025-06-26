/**
 * Image Optimization System
 * 
 * Handles automatic image optimization, resizing, and format conversion
 * for all images used in generated websites.
 */

import sharp from 'sharp';
import { logger } from '@/lib/logger';

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  fit?: 'cover' | 'contain' | 'fill';
}

export interface OptimizedImage {
  url: string;
  width: number;
  height: number;
  format: string;
  size: number;
  blurDataURL?: string;
}

/**
 * Image optimization service
 */
export class ImageOptimizer {
  private baseUrl: string;
  private uploadDir: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    this.uploadDir = process.env.UPLOAD_DIR || './public/uploads';
  }

  /**
   * Optimize image for different use cases
   */
  async optimizeImage(
    imageUrl: string,
    options: ImageOptimizationOptions = {}
  ): Promise<OptimizedImage> {
    const {
      width = 1200,
      height,
      quality = 85,
      format = 'webp',
      fit = 'cover'
    } = options;

    try {
      // Download image if it's external
      const imageBuffer = await this.downloadImage(imageUrl);
      
      // Process with Sharp
      let sharpInstance = sharp(imageBuffer);
      
      // Get original metadata
      const metadata = await sharpInstance.metadata();
      
      // Resize if needed
      if (width || height) {
        sharpInstance = sharpInstance.resize(width, height, { fit });
      }
      
      // Convert format and optimize
      switch (format) {
        case 'webp':
          sharpInstance = sharpInstance.webp({ quality });
          break;
        case 'jpeg':
          sharpInstance = sharpInstance.jpeg({ quality });
          break;
        case 'png':
          sharpInstance = sharpInstance.png({ quality });
          break;
      }
      
      // Generate optimized image
      const optimizedBuffer = await sharpInstance.toBuffer();
      
      // Generate blur placeholder
      const blurBuffer = await sharp(imageBuffer)
        .resize(20, 20, { fit: 'cover' })
        .blur(2)
        .jpeg({ quality: 20 })
        .toBuffer();
      
      const blurDataURL = `data:image/jpeg;base64,${blurBuffer.toString('base64')}`;
      
      // Save optimized image
      const filename = this.generateFilename(format);
      const filepath = `${this.uploadDir}/${filename}`;
      
      await sharp(optimizedBuffer).toFile(filepath);
      
      const finalMetadata = await sharp(optimizedBuffer).metadata();
      
      return {
        url: `/uploads/${filename}`,
        width: finalMetadata.width || width,
        height: finalMetadata.height || height || Math.round((finalMetadata.width || width) * 0.6),
        format,
        size: optimizedBuffer.length,
        blurDataURL,
      };
      
    } catch (error) {
      logger.error('Image optimization failed', { imageUrl, options }, error as Error);
      
      // Return original image as fallback
      return {
        url: imageUrl,
        width: width,
        height: height || Math.round(width * 0.6),
        format: 'jpeg',
        size: 0,
      };
    }
  }

  /**
   * Optimize images for different website sections
   */
  async optimizeForSection(imageUrl: string, sectionType: string): Promise<OptimizedImage> {
    const sectionConfigs = {
      hero: { width: 1920, height: 1080, quality: 90 },
      gallery: { width: 800, height: 600, quality: 85 },
      service: { width: 600, height: 400, quality: 80 },
      team: { width: 400, height: 400, quality: 85, fit: 'cover' as const },
      logo: { width: 300, height: 300, quality: 90, format: 'png' as const },
      thumbnail: { width: 200, height: 150, quality: 75 },
    };

    const config = sectionConfigs[sectionType as keyof typeof sectionConfigs] || sectionConfigs.gallery;
    return this.optimizeImage(imageUrl, config);
  }

  /**
   * Generate responsive image set
   */
  async generateResponsiveSet(imageUrl: string): Promise<{
    mobile: OptimizedImage;
    tablet: OptimizedImage;
    desktop: OptimizedImage;
  }> {
    const [mobile, tablet, desktop] = await Promise.all([
      this.optimizeImage(imageUrl, { width: 480, quality: 80 }),
      this.optimizeImage(imageUrl, { width: 768, quality: 85 }),
      this.optimizeImage(imageUrl, { width: 1200, quality: 90 }),
    ]);

    return { mobile, tablet, desktop };
  }

  /**
   * Batch optimize multiple images
   */
  async batchOptimize(
    images: Array<{ url: string; sectionType: string }>
  ): Promise<Array<{ original: string; optimized: OptimizedImage }>> {
    const results = await Promise.allSettled(
      images.map(async ({ url, sectionType }) => ({
        original: url,
        optimized: await this.optimizeForSection(url, sectionType),
      }))
    );

    return results
      .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
      .map(result => result.value);
  }

  /**
   * Download external image
   */
  private async downloadImage(url: string): Promise<Buffer> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  /**
   * Generate unique filename
   */
  private generateFilename(format: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    return `optimized-${timestamp}-${random}.${format}`;
  }
}

/**
 * Utility functions for Next.js Image component
 */
export function getImageProps(optimizedImage: OptimizedImage) {
  return {
    src: optimizedImage.url,
    width: optimizedImage.width,
    height: optimizedImage.height,
    placeholder: optimizedImage.blurDataURL ? 'blur' as const : undefined,
    blurDataURL: optimizedImage.blurDataURL,
    quality: 85,
  };
}

/**
 * Generate srcSet for responsive images
 */
export function generateSrcSet(responsiveSet: {
  mobile: OptimizedImage;
  tablet: OptimizedImage;
  desktop: OptimizedImage;
}): string {
  return [
    `${responsiveSet.mobile.url} ${responsiveSet.mobile.width}w`,
    `${responsiveSet.tablet.url} ${responsiveSet.tablet.width}w`,
    `${responsiveSet.desktop.url} ${responsiveSet.desktop.width}w`,
  ].join(', ');
}

/**
 * Export singleton instance
 */
export const imageOptimizer = new ImageOptimizer();