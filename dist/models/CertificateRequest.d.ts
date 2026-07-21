import mongoose, { Document } from 'mongoose';
import { CertificateType } from '@mahallu/shared-types';
export interface CertificateRequestDocument extends Document {
    tenantId: mongoose.Types.ObjectId;
    requestedBy: mongoose.Types.ObjectId;
    type: CertificateType;
    purpose: string;
    details?: Record<string, any>;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    certificateId?: mongoose.Types.ObjectId;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const CertificateRequest: mongoose.Model<CertificateRequestDocument, {}, {}, {}, Document<unknown, {}, CertificateRequestDocument, {}, {}> & CertificateRequestDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=CertificateRequest.d.ts.map