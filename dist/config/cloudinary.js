"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLOUDINARY_FOLDERS = exports.cloudinary = void 0;
exports.uploadToCloudinary = uploadToCloudinary;
exports.deleteFromCloudinary = deleteFromCloudinary;
const cloudinary_1 = require("cloudinary");
Object.defineProperty(exports, "cloudinary", { enumerable: true, get: function () { return cloudinary_1.v2; } });
const logger_1 = require("./logger");
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});
exports.CLOUDINARY_FOLDERS = {
    MEMBERS: 'mahallu/members',
    STUDENTS: 'mahallu/students',
    TEACHERS: 'mahallu/teachers',
    FAMILIES: 'mahallu/families',
    DOCUMENTS: 'mahallu/documents',
    CERTIFICATES: 'mahallu/certificates',
    RECEIPTS: 'mahallu/receipts',
    EVENTS: 'mahallu/events',
    CEMETERY: 'mahallu/cemetery',
    QR_CODES: 'mahallu/qr-codes',
};
async function uploadToCloudinary(buffer, folder, fileName, resourceType = 'image') {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_1.v2.uploader.upload_stream({
            folder,
            public_id: fileName,
            resource_type: resourceType,
            overwrite: true,
            quality: 'auto',
            fetch_format: 'auto',
        }, (error, result) => {
            if (error || !result) {
                logger_1.logger.error('Cloudinary upload error:', error);
                reject(error || new Error('Upload failed'));
            }
            else {
                resolve({ url: result.secure_url, publicId: result.public_id });
            }
        });
        uploadStream.end(buffer);
    });
}
async function deleteFromCloudinary(publicId) {
    try {
        await cloudinary_1.v2.uploader.destroy(publicId);
    }
    catch (error) {
        logger_1.logger.error('Cloudinary delete error:', error);
    }
}
//# sourceMappingURL=cloudinary.js.map