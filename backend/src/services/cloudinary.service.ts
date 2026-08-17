import { UploadApiResponse } from 'cloudinary';
import { cloudinary } from '../config/cloudinary';

export function uploadBuffer(
  buffer: Buffer,
  folder: string,
  resourceType: 'image' | 'raw' = 'image'
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `cea-amc/${folder}`, resource_type: resourceType },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error('Error al subir archivo a Cloudinary'));
        }
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}
