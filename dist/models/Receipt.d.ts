import mongoose, { Document } from 'mongoose';
export interface ReceiptDocument extends Document {
    tenantId: mongoose.Types.ObjectId;
    receiptNo: string;
    paymentId: mongoose.Types.ObjectId;
    pdfUrl?: string;
    publicId?: string;
    printedAt?: Date;
    sentVia?: string[];
}
export declare const Receipt: mongoose.Model<ReceiptDocument, {}, {}, {}, any, any>;
//# sourceMappingURL=Receipt.d.ts.map