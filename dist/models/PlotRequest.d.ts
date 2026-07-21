import mongoose, { Document } from 'mongoose';
export interface PlotRequestDocument extends Document {
    tenantId: mongoose.Types.ObjectId;
    cemeteryId: mongoose.Types.ObjectId;
    plotNo: string;
    requestedBy: mongoose.Types.ObjectId;
    status: 'pending' | 'approved' | 'rejected';
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const PlotRequest: mongoose.Model<PlotRequestDocument, {}, {}, {}, Document<unknown, {}, PlotRequestDocument, {}, {}> & PlotRequestDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=PlotRequest.d.ts.map