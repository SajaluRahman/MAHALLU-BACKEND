import mongoose, { Document } from 'mongoose';
export interface SubscriptionDocument extends Document {
    tenantId: mongoose.Types.ObjectId;
    familyId: mongoose.Types.ObjectId;
    amount: number;
    period: 'monthly' | 'quarterly' | 'annual';
    startDate: Date;
    dueDate: Date;
    status: 'active' | 'overdue' | 'cancelled';
    lastPaidAt?: Date;
    paymentId?: mongoose.Types.ObjectId;
}
export declare const Subscription: mongoose.Model<SubscriptionDocument, {}, {}, {}, Document<unknown, {}, SubscriptionDocument, {}, {}> & SubscriptionDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Subscription.d.ts.map