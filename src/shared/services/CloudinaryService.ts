import { cloudinary } from "../config/cloudinary";
import { env } from "../config/env";

export class CloudinaryService {
  uploadImage(buffer: Buffer, folder: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // If Cloudinary credentials are not configured, fallback to base64 Data URL so upload never fails
      if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
        console.warn("[CloudinaryService] Missing Cloudinary config in environment. Falling back to data URI.");
        const base64 = `data:image/jpeg;base64,${buffer.toString("base64")}`;
        return resolve(base64);
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        { folder },
        (error, result) => {
          if (error) {
            console.error("[CloudinaryService] Upload error from Cloudinary:", error);
            // Fallback to data URI so images are not lost on network/api error
            const base64 = `data:image/jpeg;base64,${buffer.toString("base64")}`;
            return resolve(base64);
          }
          if (!result?.secure_url) {
            const base64 = `data:image/jpeg;base64,${buffer.toString("base64")}`;
            return resolve(base64);
          }
          resolve(result.secure_url);
        }
      );
      uploadStream.end(buffer);
    });
  }

  async uploadImages(files: Express.Multer.File[], folder: string): Promise<string[]> {
    if (!files || files.length === 0) return [];
    const uploads = files.map((file) => this.uploadImage(file.buffer, folder));
    return Promise.all(uploads);
  }

  async deleteImage(photoUrl: string): Promise<void> {
    try {
      if (!photoUrl || photoUrl.startsWith("data:")) return;
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