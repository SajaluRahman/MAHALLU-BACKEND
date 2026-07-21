import mongoose, { Document } from 'mongoose';
export declare enum RegistrationType {
    MEMBER = "MEMBER",
    STUDENT = "STUDENT",
    TEACHER = "TEACHER",
    SADAR_MUALIM = "SADAR_MUALIM"
}
export declare enum RegistrationStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED"
}
export interface RegistrationRequestDocument extends Document {
    tenantId: mongoose.Types.ObjectId;
    type: RegistrationType;
    status: RegistrationStatus;
    payload: Record<string, any>;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const RegistrationRequest: mongoose.Model<RegistrationRequestDocument, {}, {}, {}, any, any>;
//# sourceMappingURL=RegistrationRequest.d.ts.map