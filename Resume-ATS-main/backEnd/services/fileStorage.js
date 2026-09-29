import { cloudinary, cloudinaryConfigured } from '../config/cloudinary.js';

export function uploadResume(file) {
  if (!file || !cloudinaryConfigured) return Promise.resolve(null);

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'resumely/resumes',
        resource_type: 'raw',
        type: 'private',
        use_filename: true,
        unique_filename: true,
        overwrite: false,
        context: { original_name: file.originalname }
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({ publicId: result.public_id, url: result.secure_url, resourceType: result.resource_type });
      }
    );
    stream.end(file.buffer);
  });
}
