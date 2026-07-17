import mongoose, { Document } from 'mongoose';
export declare enum RegistrationType {
    MEMBER = "MEMBER",
    STUDENT = "STUDENT",
    TEACHER = "TEACHER"
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
export declare const RegistrationRequest: mongoose.Model<RegistrationRequestDocument, {}, {}, {}, mongoose.Document<unknown, {}, RegistrationRequestDocument, {}, {}> & RegistrationRequestDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=RegistrationRequest.d.ts.map