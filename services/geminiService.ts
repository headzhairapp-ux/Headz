import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";

// Utility function to convert a file to a base64 string
const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        if (typeof reader.result === 'string') {
            resolve(reader.result.split(',')[1]);
        } else {
            resolve(''); // Should not happen with readAsDataURL
        }
    };
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

// Utility function to fetch image from URL and convert to base64
const urlToGenerativePart = async (imageUrl: string) => {
  // Convert relative URLs to absolute URLs
  let absoluteUrl = imageUrl;
  if (imageUrl.startsWith('/')) {
    absoluteUrl = `${window.location.origin}${imageUrl}`;
  }

  try {
    const response = await fetch(absoluteUrl, {
      method: 'GET',
      mode: 'cors',
      cache: 'default',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const blob = await response.blob();
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result.split(',')[1]);
        } else {
          resolve('');
        }
      };
      reader.readAsDataURL(blob);
    });
    return {
      inlineData: { data: base64, mimeType: blob.type || 'image/png' },
    };
  } catch (error) {
    console.error('Error fetching reference image:', error);
    throw new Error('Failed to load hairstyle reference image. Please try again.');
  }
};

export const editImageWithGemini = async (
  imageFile: File,
  prompt: string
): Promise<string> => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable is not set. Please create a .env file with your Gemini API key.");
    }
    const ai = new GoogleGenAI({ apiKey });

  const imagePart = await fileToGenerativePart(imageFile);

  let response: GenerateContentResponse;
  let retryCount = 0;
  const maxRetries = 3;

  while (retryCount < maxRetries) {
    try {
      console.log('Calling Gemini API with model: gemini-2.5-flash');
      response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            imagePart,
            { text: prompt },
          ],
        },
        config: {
          responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
      });
      console.log('Gemini response:', response);
      break;
    } catch (error) {
      retryCount++;
      if (retryCount >= maxRetries) {
        if (error instanceof Error) {
          if (error.message.includes('Failed to fetch')) {
            throw new Error('Network connection failed. Please check your internet connection and try again.');
          }
          throw error;
        }
        throw new Error('Failed to generate image after multiple attempts. Please try again.');
      }
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
    }
  }

  // Check for valid response and candidates
  if (!response.candidates || response.candidates.length === 0) {
      // This can happen if the prompt is blocked for safety reasons.
      const blockReason = response.promptFeedback?.blockReason;
      if (blockReason) {
          throw new Error(`Image generation was blocked. Reason: ${blockReason}. Please try a different prompt.`);
      }
      throw new Error("The AI did not return a valid response. This might be due to a safety filter or an issue with the prompt.");
  }

  const firstCandidate = response.candidates[0];

  // Find the image part in the response
  for (const part of firstCandidate.content.parts) {
    if (part.inlineData && part.inlineData.data) {
        const mimeType = part.inlineData.mimeType;
        const base64ImageBytes: string = part.inlineData.data;
        return `data:${mimeType};base64,${base64ImageBytes}`;
    }
  }

  throw new Error("No image was generated in the response. The AI may have only returned text.");
};

// New function that sends BOTH user image and reference hairstyle image to Gemini
export const editImageWithReference = async (
  imageFile: File,
  referenceImageUrl: string,
  styleName: string
): Promise<string> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set.");
  }
  const ai = new GoogleGenAI({ apiKey });

  const userImagePart = await fileToGenerativePart(imageFile);
  const referenceImagePart = await urlToGenerativePart(referenceImageUrl);

  const prompt = `PHOTO EDITING TASK: Change ONLY the hairstyle

IMAGE 1: The person (KEEP THIS EXACT FACE - same person, same identity)
IMAGE 2: The hairstyle to copy (ONLY copy the hair from this image)

TASK: Edit the FIRST image by replacing ONLY the hair with the hairstyle from the SECOND image.

CRITICAL REQUIREMENTS:
- The output must show the SAME PERSON from Image 1 (same face, same skin tone, same facial features)
- ONLY the hair should change - copy the hairstyle, hair color, and hair texture from Image 2
- Keep everything else from Image 1: face, eyes, nose, mouth, ears, neck, background, clothing

Style: ${styleName}

Generate an edited version of Image 1 with the new hairstyle applied. The person must remain recognizable.`;

  let response: GenerateContentResponse;
  let retryCount = 0;
  const maxRetries = 3;

  while (retryCount < maxRetries) {
    try {
      console.log('Calling Gemini API (with reference) using model: gemini-2.5-flash');
      response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            userImagePart,
            referenceImagePart,
            { text: prompt },
          ],
        },
        config: {
          responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
      });
      console.log('Gemini response (with reference):', response);

      // Debug: Log the parts in the response to see what we're getting
      if (response.candidates && response.candidates[0]?.content?.parts) {
        console.log('Response parts count:', response.candidates[0].content.parts.length);
        response.candidates[0].content.parts.forEach((part, index) => {
          if (part.text) {
            console.log(`Part ${index}: TEXT - "${part.text.substring(0, 200)}..."`);
          }
          if (part.inlineData) {
            console.log(`Part ${index}: IMAGE - mimeType: ${part.inlineData.mimeType}, data length: ${part.inlineData.data?.length || 0} chars`);
          }
        });
      }
      break;
    } catch (error) {
      retryCount++;
      if (retryCount >= maxRetries) {
        if (error instanceof Error) {
          if (error.message.includes('Failed to fetch')) {
            throw new Error('Network connection failed. Please check your internet connection and try again.');
          }
          throw error;
        }
        throw new Error('Failed to generate image after multiple attempts. Please try again.');
      }
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
    }
  }

  if (!response.candidates || response.candidates.length === 0) {
    const blockReason = response.promptFeedback?.blockReason;
    if (blockReason) {
      throw new Error(`Image generation was blocked. Reason: ${blockReason}. Please try a different style.`);
    }
    throw new Error("The AI did not return a valid response.");
  }

  const firstCandidate = response.candidates[0];

  for (const part of firstCandidate.content.parts) {
    if (part.inlineData && part.inlineData.data) {
      const mimeType = part.inlineData.mimeType;
      const base64ImageBytes: string = part.inlineData.data;
      return `data:${mimeType};base64,${base64ImageBytes}`;
    }
  }

  throw new Error("No image was generated in the response.");
};
