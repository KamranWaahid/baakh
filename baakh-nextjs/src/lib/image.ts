export type CompressOptions = {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0..1 for JPEG/WebP
  mimeType?: string; // e.g. 'image/jpeg' or 'image/webp'
  removeBackground?: boolean; // Whether to remove background
  generateAvatarColors?: boolean; // Whether to generate avatar colors
};

export type AvatarColor = {
  primary: string;
  secondary: string;
  accent: string;
};

// Modern, minimal avatar color palette
const AVATAR_COLORS: AvatarColor[] = [
  { primary: '#3B82F6', secondary: '#DBEAFE', accent: '#1E40AF' }, // Blue
  { primary: '#10B981', secondary: '#D1FAE5', accent: '#047857' }, // Emerald
  { primary: '#F59E0B', secondary: '#FEF3C7', accent: '#D97706' }, // Amber
  { primary: '#EF4444', secondary: '#FEE2E2', accent: '#DC2626' }, // Red
  { primary: '#8B5CF6', secondary: '#EDE9FE', accent: '#7C3AED' }, // Violet
  { primary: '#EC4899', secondary: '#FCE7F3', accent: '#DB2777' }, // Pink
  { primary: '#06B6D4', secondary: '#CFFAFE', accent: '#0891B2' }, // Cyan
  { primary: '#84CC16', secondary: '#F7FEE7', accent: '#65A30D' }, // Lime
  { primary: '#F97316', secondary: '#FED7AA', accent: '#EA580C' }, // Orange
  { primary: '#14B8A6', secondary: '#CCFBF1', accent: '#0D9488' }, // Teal
  { primary: '#A855F7', secondary: '#F3E8FF', accent: '#9333EA' }, // Purple
  { primary: '#0EA5E9', secondary: '#E0F2FE', accent: '#0284C7' }, // Sky
  { primary: '#64748B', secondary: '#F1F5F9', accent: '#475569' }, // Slate
  { primary: '#71717A', secondary: '#F4F4F7', accent: '#52525B' }, // Zinc
  { primary: '#78716A', secondary: '#F5F5F4', accent: '#57534E' }, // Stone
  { primary: '#525252', secondary: '#FAFAFA', accent: '#404040' }, // Neutral
];

// Generate a consistent avatar color based on poet name
export function generateAvatarColor(poetName: string): AvatarColor {
  const hash = poetName.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

// Remove background from image using AI
async function removeBackground(imageFile: File): Promise<File> {
  try {
    // Use @xenova/transformers for background removal
    const { pipeline } = await import('@xenova/transformers');
    
    // Load the image segmentation model
    const segmenter = await pipeline('image-segmentation', 'Xenova/segformer-b0-finetuned-ade-512-512');
    
    // Convert file to base64 for processing
    const arrayBuffer = await imageFile.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Process image to get segmentation mask
    const result = await segmenter(uint8Array);
    
    // Find the person/object mask (usually the largest connected component)
    const mask = result[0].mask;
    
    // Create canvas with transparent background
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');
    
    // Load original image
    const img = await createImageBitmap(imageFile);
    canvas.width = img.width;
    canvas.height = img.height;
    
    // Draw original image
    ctx.drawImage(img, 0, 0);
    
    // Get image data to apply mask
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Apply mask to make background transparent
    for (let i = 0; i < mask.length; i++) {
      const maskValue = mask[i];
      // If mask value is low (background), make pixel transparent
      if (maskValue < 0.5) {
        data[i * 4 + 3] = 0; // Set alpha to 0
      }
    }
    
    // Put modified image data back
    ctx.putImageData(imageData, 0, 0);
    
    // Convert to blob with transparency
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b!), 'image/png', 1.0);
    });
    
    // Create new file with transparent background
    const fileName = imageFile.name.replace(/\.[^.]+$/, '.png');
    return new File([blob], fileName, { type: 'image/png', lastModified: Date.now() });
    
  } catch (error) {
    console.warn('Background removal failed, using original image:', error);
    return imageFile;
  }
}

// Enhanced image compression with background removal and avatar color generation
export async function processPoetImage(
  file: File,
  poetName: string,
  options: CompressOptions = {}
): Promise<{ file: File; avatarColor: AvatarColor }> {
  const {
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.85,
    mimeType = "image/webp",
    removeBackground = true,
    generateAvatarColors = true,
  } = options;

  let processedFile = file;
  
  // Step 1: Remove background if requested
  if (removeBackground) {
    try {
      processedFile = await removeBackground(file);
    } catch (error) {
      console.warn('Background removal failed, continuing with compression:', error);
    }
  }

  // Step 2: Compress image
  const imageBitmap = await createImageBitmap(processedFile);
  
  const { width, height } = imageBitmap;
  const scale = Math.min(maxWidth / width, maxHeight / height, 1);
  const targetWidth = Math.round(width * scale);
  const targetHeight = Math.round(height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error('Failed to get canvas context');

  // Enable alpha channel for transparency
  ctx.globalCompositeOperation = 'source-over';
  
  // Clear canvas with transparent background
  ctx.clearRect(0, 0, targetWidth, targetHeight);
  
  // Draw image with transparency support
  ctx.drawImage(imageBitmap, 0, 0, targetWidth, targetHeight);

  // Use PNG for transparency, WebP for better compression
  const finalMimeType = processedFile.type === 'image/png' ? 'image/png' : mimeType;
  const finalQuality = finalMimeType === 'image/png' ? 1.0 : quality;
  
  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b), finalMimeType, finalQuality)
  );

  if (!blob) throw new Error('Failed to create compressed image');

  const ext = finalMimeType === "image/webp" ? "webp" : 
              finalMimeType === "image/png" ? "png" : "jpg";
  const newName = file.name.replace(/\.[^.]+$/, '') + `.${ext}`;
  const compressed = new File([blob], newName, { 
    type: finalMimeType, 
    lastModified: Date.now() 
  });

  // Step 3: Generate avatar colors
  const avatarColor = generateAvatarColors ? generateAvatarColor(poetName) : {
    primary: '#3B82F6',
    secondary: '#DBEAFE', 
    accent: '#1E40AF'
  };

  return { file: compressed, avatarColor };
}

// Legacy compression function for backward compatibility
export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<File> {
  const result = await processPoetImage(file, 'Unknown', options);
  return result.file;
}

// Utility function to create avatar fallback with generated colors
export function createAvatarFallback(poetName: string, size: 'sm' | 'md' | 'lg' = 'md') {
  const avatarColor = generateAvatarColor(poetName);
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-xl'
  };
  
  return {
    className: `${sizeClasses[size]} rounded-full flex items-center justify-center font-semibold text-white`,
    style: {
      backgroundColor: avatarColor.primary,
      color: 'white'
    },
    initials: poetName.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2)
  };
}


