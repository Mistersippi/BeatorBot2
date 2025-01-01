import { supabase } from './client';
import { v4 as uuidv4 } from 'uuid';

const AUDIO_BUCKET = 'audio-tracks';
const IMAGE_BUCKET = 'track-artwork';
const MAX_IMAGE_SIZE = 500; // Max dimension in pixels

async function verifyBucketAccess(bucketName: string): Promise<void> {
  console.log('Starting verifyBucketAccess for bucket:', bucketName);
  console.log('Supabase client:', supabase);
  
  try {
    // First verify authentication
    console.log('Checking authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Current user in verifyBucketAccess:', user);
    console.log('Auth error in verifyBucketAccess:', authError);
    
    if (authError || !user) {
      console.error('Authentication failed:', { authError, user });
      throw new Error('You must be logged in to upload files');
    }

    // Then verify bucket exists and is accessible
    console.log('Checking buckets...');
    const { data: buckets, error } = await supabase.storage.listBuckets();
    console.log('Available buckets:', buckets);
    console.log('Bucket error:', error);
    
    if (error) {
      console.error('Storage error:', error);
      if (error.message.includes('security policy')) {
        throw new Error(
          'Storage access denied. Please ensure storage policies are set up:\n' +
          '1. Go to Supabase Dashboard > Storage\n' +
          '2. Click on bucket name\n' +
          '3. Go to "Policies" tab\n' +
          '4. Add policies for authenticated uploads and public downloads'
        );
      }
      throw new Error(`Error accessing storage: ${error.message}`);
    }

    const bucketExists = buckets?.some(b => b.name === bucketName);
    console.log(`Checking if bucket ${bucketName} exists:`, bucketExists);
    console.log('All bucket names:', buckets?.map(b => b.name));
    
    if (!bucketExists) {
      throw new Error(
        `Storage bucket "${bucketName}" not found. Please ensure it exists in your Supabase dashboard:\n` +
        '1. Go to Supabase Dashboard > Storage\n' +
        '2. Click "Create new bucket"\n' +
        `3. Create bucket named "${bucketName}"\n` +
        '4. Enable public access'
      );
    }

    // Try to list files in the bucket to verify access
    console.log('Trying to list files in bucket...');
    const { data: files, error: listError } = await supabase.storage
      .from(bucketName)
      .list();
    console.log('Files in bucket:', files);
    console.log('List error:', listError);

  } catch (error) {
    console.error(`Error verifying bucket ${bucketName}:`, error);
    throw error;
  }
}

export async function uploadAudioTrack(file: File): Promise<string> {
  try {
    // Validate file
    if (!file) throw new Error('No audio file provided');
    if (!file.type.includes('audio')) throw new Error('Invalid audio file type');

    // Verify bucket access
    await verifyBucketAccess(AUDIO_BUCKET);

    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Upload file with retry logic
    let retries = 3;
    let lastError = null;

    while (retries > 0) {
      try {
        const { data, error } = await supabase.storage
          .from(AUDIO_BUCKET)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          if (error.message.includes('security policy')) {
            throw new Error(
              'Upload denied. Please ensure storage policies allow authenticated uploads:\n' +
              '1. Go to Supabase Dashboard > Storage > audio-tracks\n' +
              '2. Click "Policies"\n' +
              '3. Add policy for INSERT with (auth.role() = \'authenticated\')'
            );
          }
          throw error;
        }

        // Return the storage path instead of public URL
        return `${AUDIO_BUCKET}/${filePath}`;
      } catch (error) {
        lastError = error;
        retries--;
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
        }
      }
    }

    throw lastError;
  } catch (error) {
    console.error('Audio upload error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to upload audio file');
  }
}

export async function uploadTrackArtwork(file: File): Promise<string> {
  try {
    // Validate file
    if (!file) throw new Error('No image file provided');
    if (!file.type.includes('image')) throw new Error('Invalid image file type');

    // Verify bucket access
    await verifyBucketAccess(IMAGE_BUCKET);

    // First, resize the image
    const resizedImage = await resizeImage(file, MAX_IMAGE_SIZE);
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Upload file with retry logic
    let retries = 3;
    let lastError = null;

    while (retries > 0) {
      try {
        const { data, error } = await supabase.storage
          .from(IMAGE_BUCKET)
          .upload(filePath, resizedImage, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          if (error.message.includes('security policy')) {
            throw new Error(
              'Upload denied. Please ensure storage policies allow authenticated uploads:\n' +
              '1. Go to Supabase Dashboard > Storage > track-artwork\n' +
              '2. Click "Policies"\n' +
              '3. Add policy for INSERT with (auth.role() = \'authenticated\')'
            );
          }
          throw error;
        }

        // Return the storage path instead of public URL
        return `${IMAGE_BUCKET}/${filePath}`;
      } catch (error) {
        lastError = error;
        retries--;
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
        }
      }
    }

    throw lastError;
  } catch (error) {
    console.error('Image upload error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to upload image file');
  }
}

async function resizeImage(file: File, maxDimension: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      // Calculate new dimensions while maintaining aspect ratio
      if (width > height) {
        if (width > maxDimension) {
          height = Math.round(height * maxDimension / width);
          width = maxDimension;
        }
      } else {
        if (height > maxDimension) {
          width = Math.round(width * maxDimension / height);
          height = maxDimension;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      // Use better quality image scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Could not create blob'));
            return;
          }
          resolve(blob);
        },
        'image/jpeg',
        0.9 // Quality setting
      );
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
  });
}
