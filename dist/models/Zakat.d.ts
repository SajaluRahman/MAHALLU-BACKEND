import mongoose, { Document } from 'mongoose';
export interface ZakatDocument extends Document {
    tenantId: mongoose.Types.ObjectId;
    year: number;
    totalCollected: number;
    totalDistributed: number;
    applicants: Array<{
        memberId: mongoose.Types.ObjectId;
        amountRequested: number;
        amountApproved?: number;
        status: 'pending' | 'approved' | 'rejected' | 'distributed';
        notes?: string;
        verifiedBy?: mongoose.Types.ObjectId;
        verifiedAt?: Date;
    }>;
    status: 'open' | 'closed';
}
export declare const Zakat: mongoose.Model<ZakatDocument, {}, {}, {}, mongoose.Document<unknown, {}, ZakatDocument, {}, {}> & ZakatDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Zakat.d.ts.map