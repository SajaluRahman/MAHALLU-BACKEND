import mongoose, { Document } from 'mongoose';
import { LeaseStatus } from '@mahallu/shared-types';
export interface LeaseDocument extends Document {
    tenantId: mongoose.Types.ObjectId;
    propertyId: mongoose.Types.ObjectId;
    tenantMemberId: mongoose.Types.ObjectId;
    startDate: Date;
    endDate: Date;
    rentAmount: number;
    status: LeaseStatus;
    rentHistory: Array<{
        month: string;
        amount: number;
        paidAt: Date;
        paymentId: mongoose.Types.ObjectId;
    }>;
    documents: Array<{
        url: string;
        fileName?: string;
    }>;
}
export declare const Lease: mongoose.Model<LeaseDocument, {}, {}, {}, any, any>;
//# sourceMappingURL=Lease.d.ts.map