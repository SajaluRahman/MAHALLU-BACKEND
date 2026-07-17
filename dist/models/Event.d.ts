import mongoose, { Document } from 'mongoose';
export interface EventDocument extends Document {
    tenantId: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    date: Date;
    endDate?: Date;
    venue?: string;
    capacity?: number;
    registrations: Array<{
        memberId: mongoose.Types.ObjectId;
        registeredAt: Date;
        paymentId?: mongoose.Types.ObjectId;
        attended: boolean;
    }>;
    isFeatured: boolean;
    isPaid: boolean;
    fee?: number;
    banner?: {
        url: string;
        publicId?: string;
    };
    idCardBgImage?: {
        url: string;
        publicId?: string;
    };
    committeeMembers: Array<{
        memberId: mongoose.Types.ObjectId;
        role: string;
    }>;
}
export declare const Event: mongoose.Model<EventDocument, {}, {}, {}, mongoose.Document<unknown, {}, EventDocument, {}, {}> & EventDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Event.d.ts.map