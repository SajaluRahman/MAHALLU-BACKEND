import mongoose, { Document } from 'mongoose';
import { CertificateType } from '@mahallu/shared-types';
export interface CertificateRequestDocument extends Document {
    tenantId: mongoose.Types.ObjectId;
    requestedBy: mongoose.Types.ObjectId;
    type: CertificateType;
    purpose: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    certificateId?: mongoose.Types.ObjectId;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const CertificateRequest: mongoose.Model<CertificateRequestDocument, {}, {}, {}, any, any>;
//# sourceMappingURL=CertificateRequest.d.ts.map