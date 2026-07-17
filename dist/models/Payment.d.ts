import mongoose, { Document } from 'mongoose';
import { PaymentType, PaymentStatus, PaymentGateway } from '@mahallu/shared-types';
export interface PaymentDocument extends Document {
    tenantId: mongoose.Types.ObjectId;
    paymentNo: string;
    type: PaymentType;
    amount: number;
    paidById: mongoose.Types.ObjectId;
    paidForId?: mongoose.Types.ObjectId;
    gateway: PaymentGateway;
    gatewayPaymentId?: string;
    gatewayOrderId?: string;
    gatewaySignature?: string;
    status: PaymentStatus;
    description?: string;
    receiptId?: mongoose.Types.ObjectId;
    metadata?: Record<string, unknown>;
    isDeleted: boolean;
    deletedAt?: Date;
}
export declare const Payment: mongoose.Model<PaymentDocument, {}, {}, {}, mongoose.Document<unknown, {}, PaymentDocument, {}, {}> & PaymentDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Payment.d.ts.map