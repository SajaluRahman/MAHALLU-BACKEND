import mongoose, { Document } from 'mongoose';
import { CertificateType } from '@mahallu/shared-types';
export interface CertificateDocument extends Document {
    tenantId: mongoose.Types.ObjectId;
    certificateNo: string;
    type: CertificateType;
    recipientId: mongoose.Types.ObjectId;
    issuedBy: mongoose.Types.ObjectId;
    issuedAt: Date;
    expiresAt?: Date;
    pdfUrl?: string;
    publicId?: string;
    data: Record<string, unknown>;
    eSign?: {
        isSigned: boolean;
        signedBy?: string;
        designation?: string;
    };
    eStamp?: {
        isStamped: boolean;
        sealTitle?: string;
    };
    isRevoked: boolean;
}
export declare const Certificate: mongoose.Model<CertificateDocument, {}, {}, {}, Document<unknown, {}, CertificateDocument, {}, {}> & CertificateDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Certificate.d.ts.map