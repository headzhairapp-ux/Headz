/**
 * Utility functions for image processing and resizing
 */

/**
 * Resize an image to meet minimum dimension requirements
 * @param imageFile - The original image file
 * @param minWidth - Minimum width required (default: 300)
 * @param minHeight - Minimum height required (default: 300)
 * @param quality - JPEG quality (0-1, default: 0.9)
 * @returns Promise<File> - Resized image file
 */
export async function resizeImageForKling(
  imageFile: File,
  minWidth: number = 300,
  minHeight: number = 300,
  quality: number = 0.9
): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      const { width: originalWidth, height: originalHeight } = img;

      // Calculate new dimensions maintaining aspect ratio
      let newWidth = originalWidth;
      let newHeight = originalHeight;

      // Scale up if either dimension is too small
      if (originalWidth < minWidth || originalHeight < minHeight) {
        const scaleX = minWidth / originalWidth;
        const scaleY = minHeight / originalHeight;
        const scale = Math.max(scaleX, scaleY); // Use the larger scale to ensure both dimensions meet minimum

        newWidth = Math.round(originalWidth * scale);
        newHeight = Math.round(originalHeight * scale);
      }

      // Set canvas dimensions
      canvas.width = newWidth;
      canvas.height = newHeight;

      // Draw and resize the image
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      // Convert canvas to blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to create image blob'));
            return;
          }

          // Create new file with resized image
          const resizedFile = new File(
            [blob],
            `resized-${imageFile.name}`,
            {
              type: 'image/jpeg',
              lastModified: Date.now()
            }
          );

          resolve(resizedFile);
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for resizing'));
    };

    // Load the image
    img.src = URL.createObjectURL(imageFile);
  });
}

/**
 * Convert data URL to resized File for Kling API
 * @param dataUrl - Data URL of the image
 * @param fileName - Name for the output file
 * @param minWidth - Minimum width required (default: 300)
 * @param minHeight - Minimum height required (default: 300)
 * @returns Promise<File> - Resized image file
 */
export async function dataUrlToResizedFile(
  dataUrl: string,
  fileName: string,
  minWidth: number = 300,
  minHeight: number = 300
): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      const { width: originalWidth, height: originalHeight } = img;

      // Calculate new dimensions maintaining aspect ratio
      let newWidth = originalWidth;
      let newHeight = originalHeight;

      // Scale up if either dimension is too small
      if (originalWidth < minWidth || originalHeight < minHeight) {
        const scaleX = minWidth / originalWidth;
        const scaleY = minHeight / originalHeight;
        const scale = Math.max(scaleX, scaleY);

        newWidth = Math.round(originalWidth * scale);
        newHeight = Math.round(originalHeight * scale);
      }

      // Set canvas dimensions
      canvas.width = newWidth;
      canvas.height = newHeight;

      // Draw and resize the image
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      // Convert canvas to blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to create image blob'));
            return;
          }

          // Create new file with resized image
          const resizedFile = new File(
            [blob],
            fileName,
            {
              type: 'image/jpeg',
              lastModified: Date.now()
            }
          );

          resolve(resizedFile);
        },
        'image/jpeg',
        0.9
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image from data URL'));
    };

    img.src = dataUrl;
  });
}

/**
 * Get image dimensions from a file
 * @param imageFile - Image file to analyze
 * @returns Promise<{width: number, height: number}> - Image dimensions
 */
export async function getImageDimensions(imageFile: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };

    img.onerror = () => {
      reject(new Error('Failed to load image to get dimensions'));
    };

    img.src = URL.createObjectURL(imageFile);
  });
}