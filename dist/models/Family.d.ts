import mongoose, { Document } from 'mongoose';
export interface FamilyDocument extends Document {
    tenantId: mongoose.Types.ObjectId;
    familyCode: string;
    headMemberId: mongoose.Types.ObjectId;
    members: Array<{
        memberId: mongoose.Types.ObjectId;
        relationship: string;
        isHead: boolean;
    }>;
    address: {
        line1: string;
        line2?: string;
        city: string;
        district: string;
        state: string;
        pincode: string;
        country: string;
        gps?: {
            type: string;
            coordinates: [number, number];
        };
    };
    wardNo?: string;
    outstandingBalance: number;
    qrCode?: string;
    photo?: {
        url: string;
        publicId?: string;
    };
    recurringDonationType: 'monthly' | 'yearly' | 'none';
    recurringDonationAmount: number;
    isDeleted: boolean;
    deletedAt?: Date;
}
export declare const Family: mongoose.Model<FamilyDocument, {}, {}, {}, Document<unknown, {}, FamilyDocument, {}, {}> & FamilyDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Family.d.ts.map