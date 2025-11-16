import cloudinary from '../config/cloudinary';
import { Readable } from 'stream';

/**
 * Extract public_id from Cloudinary URL
 * Example: https://res.cloudinary.com/demo/image/upload/v1234/matchbox/profiles/abc123.jpg
 * Returns: matchbox/profiles/abc123
 */
export const extractPublicId = (url: string): string | null => {
  if (!url || typeof url !== 'string') return null;

  try {
    const regex = /\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/;
    const match = url.match(regex);
    return match ? match[1] : null;
  } catch (error) {
    console.error('Error extracting public_id from URL:', error);
    return null;
  }
};

/**
 * Delete a file from Cloudinary
 * @param publicId - The public ID of the file to delete
 * @param resourceType - The type of resource ('image', 'raw', 'video')
 */
export const deleteFromCloudinary = async (
  publicId: string,
  resourceType: 'image' | 'raw' | 'video' = 'image'
): Promise<boolean> => {
  if (!publicId) return false;

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result.result === 'ok' || result.result === 'not found';
  } catch (error) {
    console.error('Error deleting file from Cloudinary:', error);
    return false;
  }
};

/**
 * Upload a file buffer to Cloudinary
 * @param buffer - The file buffer
 * @param folder - The folder to upload to
 * @param resourceType - The type of resource
 * @param transformation - Optional transformation parameters
 */
export const uploadToCloudinary = (
  buffer: Buffer,
  folder: string,
  resourceType: 'image' | 'raw' = 'image',
  transformation?: any
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        transformation,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    // Convert buffer to stream and pipe to Cloudinary
    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);
    readableStream.pipe(uploadStream);
  });
};

/**
 * Upload profile picture to Cloudinary
 */
export const uploadProfilePicture = async (buffer: Buffer): Promise<{ url: string; publicId: string }> => {
  const result = await uploadToCloudinary(
    buffer,
    'matchbox/profiles',
    'image',
    [{ width: 500, height: 500, crop: 'limit', quality: 'auto' }]
  );

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
};

/**
 * Upload resume to Cloudinary
 */
export const uploadResumeFile = async (buffer: Buffer, filename: string): Promise<{ url: string; publicId: string }> => {
  const result = await uploadToCloudinary(
    buffer,
    'matchbox/resumes',
    'raw'
  );

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
};

/**
 * Delete old file when updating
 */
export const deleteOldFile = async (url: string | undefined, resourceType: 'image' | 'raw' = 'image'): Promise<void> => {
  if (!url) return;

  const publicId = extractPublicId(url);
  if (publicId) {
    await deleteFromCloudinary(publicId, resourceType);
  }
};
