import mongoose, { Document } from 'mongoose';
export interface RentalRequestDocument extends Document {
    tenantId: mongoose.Types.ObjectId;
    propertyId: mongoose.Types.ObjectId;
    requestedBy: mongoose.Types.ObjectId;
    quantityRequested: number;
    startDate?: Date;
    endDate?: Date;
    purpose: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RETURNED';
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const RentalRequest: mongoose.Model<RentalRequestDocument, {}, {}, {}, mongoose.Document<unknown, {}, RentalRequestDocument, {}, {}> & RentalRequestDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=RentalRequest.d.ts.map