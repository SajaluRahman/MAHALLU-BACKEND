import { v2 as cloudinary } from 'cloudinary';
export { cloudinary };
export declare const CLOUDINARY_FOLDERS: {
    MEMBERS: string;
    STUDENTS: string;
    TEACHERS: string;
    FAMILIES: string;
    DOCUMENTS: string;
    CERTIFICATES: string;
    RECEIPTS: string;
    EVENTS: string;
    CEMETERY: string;
    QR_CODES: string;
};
export declare function uploadToCloudinary(buffer: Buffer, folder: string, fileName: string, resourceType?: 'image' | 'raw' | 'auto'): Promise<{
    url: string;
    publicId: string;
}>;
export declare function deleteFromCloudinary(publicId: string): Promise<void>;
//# sourceMappingURL=cloudinary.d.ts.map