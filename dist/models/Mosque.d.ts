import mongoose, { Document } from 'mongoose';
export interface MosqueDocument extends Document {
    tenantId: mongoose.Types.ObjectId;
    name: string;
    nameAr?: string;
    registrationNo?: string;
    yearEstablished?: number;
    address: Record<string, unknown>;
    phone?: string;
    email?: string;
    imamId?: mongoose.Types.ObjectId;
    muazzinId?: mongoose.Types.ObjectId;
    capacity?: number;
    facilities: string[];
    committee: Array<{
        memberId: mongoose.Types.ObjectId;
        position: string;
        startDate: Date;
        endDate?: Date;
    }>;
    assets: Array<{
        name: string;
        description?: string;
        value?: number;
        purchasedAt?: Date;
        condition: string;
    }>;
    bankAccounts: Array<{
        bankName: string;
        accountNo: string;
        ifscCode: string;
        accountType: string;
        balance?: number;
    }>;
}
export declare const Mosque: mongoose.Model<MosqueDocument, {}, {}, {}, Document<unknown, {}, MosqueDocument, {}, {}> & MosqueDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Mosque.d.ts.map