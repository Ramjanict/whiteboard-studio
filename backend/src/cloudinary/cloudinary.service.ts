import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private configService: ConfigService) {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME') || 'dmeg0t89b';
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY') || '339263365641588';
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET') || 'tO2-H99SQy6Fuhd97Yi59v0elu4';

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });

    this.logger.log(`Cloudinary configured for cloud: ${cloudName}`);
  }

  async uploadImage(
    imageDataOrUrl: string,
    folder: string = 'whiteboard-drawings',
  ): Promise<{ url: string; publicId?: string }> {
    if (!imageDataOrUrl) {
      return { url: '' };
    }

    // If it's already an uploaded Cloudinary / HTTP URL, skip re-uploading
    if (imageDataOrUrl.startsWith('http://') || imageDataOrUrl.startsWith('https://')) {
      return { url: imageDataOrUrl };
    }

    try {
      const uploadResult: UploadApiResponse = await cloudinary.uploader.upload(
        imageDataOrUrl,
        {
          folder,
          resource_type: 'image',
          transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        },
      );

      return {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      };
    } catch (error) {
      this.logger.error(`Cloudinary upload failed: ${error?.message || error}`);
      // Fallback: return data uri if upload fails
      return { url: imageDataOrUrl };
    }
  }

  async deleteImage(publicId?: string): Promise<boolean> {
    if (!publicId) return true;
    try {
      await cloudinary.uploader.destroy(publicId);
      return true;
    } catch (error) {
      this.logger.warn(`Failed to delete Cloudinary asset ${publicId}: ${error?.message || error}`);
      return false;
    }
  }
}
