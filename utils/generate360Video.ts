/**
 * Utility for generating 360° rotating videos from multiple angle views
 */

/**
 * Create a 360° rotating video from multiple images
 * @param images - Array of image URLs representing different angles
 * @param duration - Duration of the video in seconds (default: 3)
 * @returns Promise<string> - Data URL of the generated video
 */
export async function create360RotatingVideo(
  images: string[],
  duration: number = 3
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    const loadImages = async (): Promise<HTMLImageElement[]> => {
      const imagePromises = images.map((url) => {
        return new Promise<HTMLImageElement>((resolveImg, rejectImg) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolveImg(img);
          img.onerror = () => rejectImg(new Error(`Failed to load image: ${url}`));
          img.src = url;
        });
      });
      return Promise.all(imagePromises);
    };

    loadImages()
      .then((loadedImages) => {
        if (loadedImages.length === 0) {
          reject(new Error('No images provided'));
          return;
        }

        // Set canvas size based on first image
        const firstImg = loadedImages[0];
        canvas.width = firstImg.width;
        canvas.height = firstImg.height;

        // Create MediaRecorder for video recording
        const stream = canvas.captureStream(30); // 30 FPS
        const recorder = new MediaRecorder(stream, {
          mimeType: 'video/webm;codecs=vp8'
        });

        const chunks: Blob[] = [];
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };

        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          const videoURL = URL.createObjectURL(blob);
          resolve(videoURL);
        };

        recorder.onerror = (event) => {
          reject(new Error('MediaRecorder error: ' + event));
        };

        // Start recording
        recorder.start();

        // Animation parameters
        const fps = 30;
        const totalFrames = duration * fps;
        const framesPerImage = Math.ceil(totalFrames / loadedImages.length);
        let currentFrame = 0;

        const animate = () => {
          if (currentFrame >= totalFrames) {
            recorder.stop();
            return;
          }

          // Calculate which image to show based on current frame
          const imageIndex = Math.floor((currentFrame / totalFrames) * loadedImages.length) % loadedImages.length;
          const currentImage = loadedImages[imageIndex];

          // Clear canvas and draw current image
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height);

          currentFrame++;
          setTimeout(animate, 1000 / fps);
        };

        // Start animation
        animate();
      })
      .catch(reject);
  });
}

/**
 * Create a smooth morphing 360° video using image interpolation
 * @param images - Array of image URLs representing different angles
 * @param duration - Duration of the video in seconds (default: 5)
 * @returns Promise<string> - Data URL of the generated video
 */
export async function createSmooth360Video(
  images: string[],
  duration: number = 5
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    const loadImages = async (): Promise<HTMLImageElement[]> => {
      const imagePromises = images.map((url) => {
        return new Promise<HTMLImageElement>((resolveImg, rejectImg) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolveImg(img);
          img.onerror = () => rejectImg(new Error(`Failed to load image: ${url}`));
          img.src = url;
        });
      });
      return Promise.all(imagePromises);
    };

    loadImages()
      .then((loadedImages) => {
        if (loadedImages.length < 2) {
          reject(new Error('Need at least 2 images for smooth rotation'));
          return;
        }

        console.log(`Creating smooth 360° video with ${loadedImages.length} images, ${duration} seconds duration`);

        // Set canvas size
        const firstImg = loadedImages[0];
        canvas.width = firstImg.width;
        canvas.height = firstImg.height;

        // Create MediaRecorder with higher quality settings
        const stream = canvas.captureStream(60); // 60 FPS for smoother video
        const recorder = new MediaRecorder(stream, {
          mimeType: 'video/webm;codecs=vp9',
          videoBitsPerSecond: 2500000 // Higher bitrate for better quality
        });

        const chunks: Blob[] = [];
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };

        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          const videoURL = URL.createObjectURL(blob);
          console.log('360° video created successfully');
          resolve(videoURL);
        };

        recorder.onerror = (event) => {
          reject(new Error('MediaRecorder error: ' + event));
        };

        // Start recording
        recorder.start();

        // Animation parameters for smooth continuous rotation
        const fps = 60; // Higher FPS for smoother animation
        const totalFrames = duration * fps;
        let currentFrame = 0;

        const animate = () => {
          if (currentFrame >= totalFrames) {
            recorder.stop();
            return;
          }

          // Calculate smooth continuous rotation progress (0 to 1)
          const progress = currentFrame / totalFrames;
          
          // Create continuous circular motion through all images
          const fullRotation = progress * loadedImages.length;
          const imageIndex1 = Math.floor(fullRotation) % loadedImages.length;
          const imageIndex2 = (imageIndex1 + 1) % loadedImages.length;
          
          // Use sine/cosine for smoother interpolation instead of linear
          const rawAlpha = fullRotation - Math.floor(fullRotation);
          const smoothAlpha = 0.5 + 0.5 * Math.cos(rawAlpha * Math.PI); // Cosine interpolation for smoothness
          const alpha = 1 - smoothAlpha; // Invert for proper blending

          // Clear canvas with black background
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw first image
          ctx.globalAlpha = 1 - alpha;
          ctx.globalCompositeOperation = 'source-over';
          ctx.drawImage(loadedImages[imageIndex1], 0, 0, canvas.width, canvas.height);

          // Draw second image with transparency for smooth transition
          ctx.globalAlpha = alpha;
          ctx.globalCompositeOperation = 'source-over';
          ctx.drawImage(loadedImages[imageIndex2], 0, 0, canvas.width, canvas.height);

          // Reset alpha and composite operation
          ctx.globalAlpha = 1;
          ctx.globalCompositeOperation = 'source-over';

          currentFrame++;
          
          // Use requestAnimationFrame for smoother timing, but control with fps
          if (currentFrame % Math.ceil(60 / fps) === 0 || fps >= 60) {
            setTimeout(animate, 1000 / fps);
          } else {
            requestAnimationFrame(animate);
          }
        };

        // Start animation
        console.log('Starting 360° rotation animation...');
        animate();
      })
      .catch(reject);
  });
}