import mongoose, { Document } from 'mongoose';
export interface NikahDocument extends Document {
    tenantId: mongoose.Types.ObjectId;
    nikahNo: string;
    brideId?: mongoose.Types.ObjectId;
    brideName: string;
    brideFatherName: string;
    groomId?: mongoose.Types.ObjectId;
    groomName: string;
    groomFatherName: string;
    imamId: mongoose.Types.ObjectId;
    witnesses: Array<{
        name: string;
        memberId?: mongoose.Types.ObjectId;
        phone?: string;
    }>;
    mehr: number;
    mehrCurrency: string;
    date: Date;
    venue?: string;
    documents: Array<{
        url: string;
        fileName?: string;
        fileType?: string;
    }>;
    certificateId?: mongoose.Types.ObjectId;
}
export declare const Nikah: mongoose.Model<NikahDocument, {}, {}, {}, Document<unknown, {}, NikahDocument, {}, {}> & NikahDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Nikah.d.ts.map