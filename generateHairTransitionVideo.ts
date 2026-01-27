/**
 * Generate a hair transition video using Kling 2.1 Pro API
 */
export async function generateHairTransitionVideo(
  beforeImageUrl: string, 
  afterImageUrl: string, 
  falKey: string
): Promise<string> {
  const endpoint = 'https://fal.run/fal-ai/kling-video/v2.1/pro/image-to-video';
  
  const payload = {
    image_url: beforeImageUrl,
    tail_image_url: afterImageUrl,
    duration: "5",
    prompt: "natural smooth transition from original photo to hairstyle applied photo, keep identity and face consistent, focus on hair change"
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${falKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`API Error ${response.status}: ${errorData}`);
    }

    const data = await response.json();
    
    if (data.video && data.video.url) {
      return data.video.url;
    } else if (data.request_id) {
      throw new Error(`Video generation initiated. Request ID: ${data.request_id}. Check status later.`);
    } else {
      throw new Error('Unexpected response format');
    }

  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Request failed: ${String(error)}`);
  }
}