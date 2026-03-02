
import { Hairstyle } from './types';

export const AVAILABLE_HAIRSTYLES: Hairstyle[] = [
  // New Male Styles
  {
    id: 'curly-mullet',
    name: 'Curly Mullet',
    thumbnailUrl: '/hairstyles/Curly_mullet.png',
    prompt: 'Change ONLY the hairstyle to a curly mullet with textured curls on top and longer curly hair at the back. Keep all facial features exactly the same. Short and tighter on the sides, voluminous curls flowing at the back. Do not modify face, eyes, nose, mouth, or any other facial features.',
    gender: 'male',
  },
  {
    id: 'french-crop-hair',
    name: 'French Crop',
    thumbnailUrl: '/hairstyles/french_crop_hair.png',
    prompt: 'Change ONLY the hairstyle to a clean French crop with short textured fringe on the forehead and tapered sides. Keep all facial features exactly the same. Neat, modern, and low-maintenance look. Do not modify face, eyes, nose, mouth, or any other facial features.',
    gender: 'male',
  },
  {
    id: 'undercut-hair',
    name: 'Undercut',
    thumbnailUrl: '/hairstyles/under_cut_hair.png',
    prompt: 'Change ONLY the hairstyle to a sharp undercut with closely shaved sides and back, and longer styled hair on top. Keep all facial features exactly the same. Bold, edgy, and contemporary look. Do not modify face, eyes, nose, mouth, or any other facial features.',
    gender: 'male',
  },
  // India-Specific Popular Styles
  {
    id: 'classic-side-part',
    name: 'Classic Side Part',
    thumbnailUrl: '/hairstyles/classic-side-part.png',
    prompt: 'Change ONLY the hairstyle to a timeless classic side part. Keep all facial features exactly the same. Clean side part with medium length on top and shorter sides. Professional and business-appropriate look. Do not modify face, eyes, nose, mouth, or any other facial features.',
    gender: 'male',
  },
  {
    id: 'pompadour-quiff',
    name: 'Pompadour / Quiff',
    thumbnailUrl: '/hairstyles/pompadour-quiff.png',
    prompt: 'Change ONLY the hairstyle to a voluminous pompadour or quiff. Keep all facial features exactly the same. Voluminous top with neatly styled back or sides. Fashion-conscious and event-ready look. Do not modify face, eyes, nose, mouth, or any other facial features.',
    gender: 'male',
  },
  {
    id: 'undercut-fade',
    name: 'Undercut with Fade',
    thumbnailUrl: '/hairstyles/undercut-fade.png',
    prompt: 'Change ONLY the hairstyle to an undercut with fade. Keep all facial features exactly the same. Short sides with skin fade or taper, medium-to-long hair on top. Trendy and modern look popular among younger men. Do not modify face, eyes, nose, mouth, or any other facial features.',
    gender: 'male',
  },
  {
    id: 'buzz-crew-cut',
    name: 'Buzz Cut / Crew Cut',
    thumbnailUrl: '/hairstyles/buzz-crew-cut.png',
    prompt: 'Change ONLY the hairstyle to a short, low-maintenance buzz cut or crew cut. Keep all facial features exactly the same. Masculine and natural look, often chosen for its simplicity and ease of maintenance. Do not modify face, eyes, nose, mouth, or any other facial features.',
    gender: 'male',
  },
  {
    id: 'bollywood-layered',
    name: 'Bollywood Layered Medium',
    thumbnailUrl: '/hairstyles/bollywood-layered.png',
    prompt: 'Change ONLY the hairstyle to a medium length layered cut inspired by Bollywood actors like Hrithik Roshan or Shahid Kapoor. Keep all facial features exactly the same. Good for casual and semi-formal styles. Do not modify face, eyes, nose, mouth, or any other facial features.',
    gender: 'male',
  },
  {
    id: 'curly-wavy-top',
    name: 'Curly / Wavy Top',
    thumbnailUrl: '/hairstyles/curly-wavy-top.png',
    prompt: 'Change ONLY the hairstyle to natural curls or waves on top. Keep all facial features exactly the same. Youthful and modern look, popular in South India where curly hair textures blend well naturally. Do not modify face, eyes, nose, mouth, or any other facial features.',
    gender: 'male',
  },
  {
    id: 'french-crop-caesar',
    name: 'French Crop / Caesar Cut',
    thumbnailUrl: '/hairstyles/french-crop.png',
    prompt: 'Change ONLY the hairstyle to a French crop or Caesar cut. Keep all facial features exactly the same. Short bangs in the front with tapered sides. Low-maintenance, edgy, and suits oval or square faces. Do not modify face, eyes, nose, mouth, or any other facial features.',
    gender: 'male',
  },
  // New Female Styles
  {
    id: 'medium-layers-cut',
    name: 'Medium Layers',
    thumbnailUrl: '/hairstyles/Medium_layers_cut.png',
    prompt: 'Change ONLY the hairstyle to a Long Layered Cut with Tapered Ends. Keep all facial features exactly the same. Hair is kept long with layers cut into the bottom half to prevent it from looking heavy or boxy. The ends are tapered and thinned out slightly so they lay flat against the chest and back. Do not modify face, eyes, nose, mouth, or any other facial features.',
    gender: 'female',
  },
  {
    id: 'up-sweep-style',
    name: 'Up Sweep',
    thumbnailUrl: '/hairstyles/Up_sweep_style.png',
    prompt: 'Change ONLY the hairstyle to a Butterfly Cut with Wispy Bangs. Keep all facial features exactly the same. Heavy dramatic layers that are shorter around the face and much longer in the back, creating a wing effect. Include face-framing layers starting around the chin and a full fringe cut straight across but textured so they are not too thick. Maximum volume and movement. Do not modify face, eyes, nose, mouth, or any other facial features.',
    gender: 'female',
  },
  {
    id: 'long-straight-hair',
    name: 'Long Straight',
    thumbnailUrl: '/hairstyles/long_straight_hair.png',
    prompt: 'Change ONLY the hairstyle to a U-Cut with Face-Framing and Internal Layering. Keep all facial features exactly the same. The hemline forms a U shape rather than a straight line when hair hangs down the back. Invisible internal layers provide body to the waves without a choppy look. Long face-framing pieces start at the collarbone. Sleek, polished look with bounce. Do not modify face, eyes, nose, mouth, or any other facial features.',
    gender: 'female',
  },
  // Original Styles (kept for variety)
  {
    id: 'wavy-bob',
    name: 'Wavy Bob',
    thumbnailUrl: '/hairstyles/wavy-bob.png',
    prompt: 'Change ONLY the hairstyle to a shoulder-length wavy bob with soft, natural-looking waves. Keep all facial features exactly the same. Do not modify face, eyes, nose, mouth, or any other facial features.',
    gender: 'female',
  },
  {
    id: 'long-layers',
    name: 'Long Layers',
    thumbnailUrl: '/hairstyles/long-layers.png',
    prompt: 'Change ONLY the hairstyle to long, flowing hair with subtle layers for volume and movement. Keep all facial features exactly the same. Do not modify face, eyes, nose, mouth, or any other facial features.',
    gender: 'female',
  },
  {
    id: 'sleek-ponytail',
    name: 'Sleek Ponytail',
    thumbnailUrl: '/hairstyles/sleek-ponytail.png',
    prompt: 'Change ONLY the hairstyle to a high, sleek ponytail. Keep all facial features exactly the same. The hair should be smooth and pulled back tightly. Do not modify face, eyes, nose, mouth, or any other facial features.',
    gender: 'female',
  },
  {
    id: 'curly-afro',
    name: 'Curly Afro',
    thumbnailUrl: '/hairstyles/curly-afro.png',
    prompt: 'Change ONLY the hairstyle to a beautiful, voluminous curly afro. Keep all facial features exactly the same. Emphasize the texture and shape. Do not modify face, eyes, nose, mouth, or any other facial features.',
    gender: 'female',
  },
  {
    id: 'long-straight-layered',
    name: 'Long Straight Layered',
    thumbnailUrl: '/hairstyles/long-straight-layered.png',
    prompt: 'Change ONLY the hairstyle to shoulder-length straight hair with subtle layers. Keep all facial features exactly the same. Inspired by film stars and musicians. Fashion-forward and stylish look. Do not modify face, eyes, nose, mouth, or any other facial features.',
    gender: 'female',
  },
  {
    id: 'pixie-cut',
    name: 'Chic Pixie Cut',
    thumbnailUrl: '/hairstyles/pixie-cut.png',
    prompt: 'Change ONLY the hairstyle to a chic, textured pixie cut. Keep all facial features exactly the same. Make it look stylish and modern. Do not modify face, eyes, nose, mouth, or any other facial features.',
    gender: 'female',
  },
  {
    id: 'modern-mullet',
    name: 'Modern Mullet',
    thumbnailUrl: '/hairstyles/modern-mullet.png',
    prompt: 'Change ONLY the hairstyle to a modern mullet, short on the sides and top, longer in the back. Keep all facial features exactly the same. Do not modify face, eyes, nose, mouth, or any other facial features.',
    gender: 'female',
  },
];

// Additional preset list for facial hair try-ons (beard and mustache)
export const AVAILABLE_FACIAL_HAIR: Hairstyle[] = [
  {
    id: 'light-stubble',
    name: 'Light Stubble',
    thumbnailUrl: '/beard_styles/light-stubble.png',
    prompt:
      'Add light, evenly distributed stubble that follows natural hair growth patterns. Preserve Adam\'s apple, neck contours, and all facial anatomy. Blend naturally with skin texture. Keep head hair exactly the same.',
    gender: 'male',
  },
  {
    id: 'heavy-stubble',
    name: 'Heavy Stubble',
    thumbnailUrl: '/beard_styles/heavy-stubble%20(2).png',
    prompt:
      'Add dense stubble across jawline and upper lip with natural hair growth patterns. Preserve Adam\'s apple visibility, neck anatomy, and facial structure. Blend seamlessly with skin tone.',
    gender: 'male',
  },
  {
    id: 'short-boxed-beard',
    name: 'Short Boxed Beard',
    thumbnailUrl: '/beard_styles/short-boxed-beard.png',
    prompt:
      'Add a well-groomed short boxed beard with natural cheek lines that preserve facial contours. Maintain neckline while preserving throat anatomy and Adam\'s apple. Natural hair density and growth direction.',
    gender: 'male',
  },
  {
    id: 'full-beard',
    name: 'Full Beard',
    thumbnailUrl: '/beard_styles/full-beard%20(2).png',
    prompt:
      'Add a full beard with natural hair growth patterns and organic edges. Preserve underlying facial structure, Adam\'s apple, and neck contours. Natural hair density that complements face shape.',
    gender: 'male',
  },
  {
    id: 'van-dyke',
    name: 'Van Dyke (Goatee + Mustache)',
    thumbnailUrl: '/beard_styles/van-dyke%20(2).png',
    prompt:
      'Add a refined Van Dyke style with natural hair growth: pointed chin goatee and disconnected mustache. Preserve Adam\'s apple, neck anatomy, and facial structure. Natural hair texture and density.',
    gender: 'male',
  },
  {
    id: 'handlebar-mustache',
    name: 'Handlebar Mustache',
    thumbnailUrl: '/beard_styles/handlebar-mustache%20(2).png',
    prompt:
      'Add a classic handlebar mustache with naturally curled tips that follow the lip line. No beard. Preserve all facial anatomy and natural skin texture. Blend seamlessly with skin tone.',
    gender: 'male',
  },
  {
    id: 'chevron-mustache',
    name: 'Chevron Mustache',
    thumbnailUrl: '/beard_styles/chevron-mustache%20(2).png',
    prompt:
      'Add a thick chevron mustache with natural hair growth patterns covering the upper lip. No beard. Preserve facial structure and blend naturally with skin tone.',
    gender: 'male',
  },
  {
    id: 'goatee',
    name: 'Goatee (No Mustache)',
    thumbnailUrl: '/beard_styles/goatee%20(2).png',
    prompt:
      'Add a rounded goatee on the chin with natural hair density and growth direction. No mustache. Preserve Adam\'s apple, chin contours, and all facial anatomy. Natural blending with skin.',
    gender: 'male',
  },
  {
    id: 'anchor-beard',
    name: 'Anchor Beard',
    thumbnailUrl: '/beard_styles/anchor-beard%20(2).png',
    prompt:
      'Add an anchor-style beard with natural hair growth: pointed chin beard and disconnected pencil mustache forming anchor shape. Preserve facial anatomy, Adam\'s apple, and neck contours. Natural hair texture.',
    gender: 'male',
  },
  {
    id: 'mutton-chops',
    name: 'Mutton Chops',
    thumbnailUrl: '/beard_styles/mutton-chops%20(2).png',
    prompt:
      'Add thick mutton chops sideburns with natural hair growth patterns extending from ears to jaw. No chin or mustache connection. Preserve facial structure and blend naturally with skin. Classic Victorian style.',
    gender: 'male',
  },
  {
    id: 'soul-patch',
    name: 'Soul Patch',
    thumbnailUrl: '/beard_styles/soul-patch%20(2).png',
    prompt:
      'Add a small triangular soul patch below the lower lip with natural hair density. No other facial hair. Preserve all facial anatomy and blend seamlessly with skin tone. Minimalist style.',
    gender: 'male',
  },
  {
    id: 'circle-beard',
    name: 'Circle Beard',
    thumbnailUrl: '/beard_styles/circle-beard.png',
    prompt:
      'Add a circle beard with natural hair growth: rounded goatee smoothly connected to mustache around mouth. Preserve facial structure, Adam\'s apple, and natural anatomy. Well-groomed appearance.',
    gender: 'male',
  },
  {
    id: 'balbo-beard',
    name: 'Balbo Beard',
    thumbnailUrl: '/beard_styles/balbo-beard.png',
    prompt:
      'Add a Balbo beard with natural hair growth: wide chin beard and separate mustache along jawline, disconnected from sideburns. Preserve facial anatomy and Adam\'s apple. Sophisticated Italian style.',
    gender: 'male',
  },
  {
    id: 'pencil-mustache',
    name: 'Pencil Mustache',
    thumbnailUrl: '/beard_styles/pencil-mustache%20(2).png',
    prompt:
      'Add a thin pencil mustache that naturally outlines the upper lip with precise, narrow hair growth. Classic 1930s style. No beard. Preserve all facial features and blend with skin tone.',
    gender: 'male',
  },
];