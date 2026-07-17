import mongoose, { Document } from 'mongoose';
export interface DonationDocument extends Document {
    tenantId: mongoose.Types.ObjectId;
    donorId?: mongoose.Types.ObjectId;
    familyId?: mongoose.Types.ObjectId;
    donorName?: string;
    amount: number;
    campaign?: string;
    purpose?: string;
    paymentId: mongoose.Types.ObjectId;
    isAnonymous: boolean;
    receiptId?: mongoose.Types.ObjectId;
    status?: 'pending' | 'paid' | 'partial';
    dueDate?: Date;
}
export declare const Donation: mongoose.Model<DonationDocument, {}, {}, {}, mongoose.Document<unknown, {}, DonationDocument, {}, {}> & DonationDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Donation.d.ts.map