import { cloudinary } from "../config/cloudinary";

export class CloudinaryService {
  uploadImage(buffer: Buffer, folder: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder },
        (error, result) => {
          if (error || !result) return reject(error);
          resolve(result.secure_url);
        }
      );
      uploadStream.end(buffer);
    });
  }

  async uploadImages(files: Express.Multer.File[], folder: string): Promise<string[]> {
    const uploads = files.map((file) => this.uploadImage(file.buffer, folder));
    return Promise.all(uploads);
  }

  async deleteImage(photoUrl: string): Promise<void> {
    try {
      const parts = photoUrl.split("/");
      const folderAndFile = parts.slice(parts.indexOf("upload") + 1).join("/");
      const publicId = folderAndFile.replace(/\.[^.]+$/, "");
      console.log("[CloudinaryService] Deleting image, publicId:", publicId);
      const result = await cloudinary.uploader.destroy(publicId);
      console.log("[CloudinaryService] Delete result:", result);
    } catch (err) {
      console.error("[CloudinaryService] Failed to delete image from Cloudinary:", photoUrl, err);
    }
  }
}