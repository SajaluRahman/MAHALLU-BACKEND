import mongoose, { Document } from 'mongoose';
export interface CemeteryDocument extends Document {
    tenantId: mongoose.Types.ObjectId;
    name: string;
    address: Record<string, unknown>;
    capacity: number;
    plots: Array<{
        plotNo: string;
        row: string;
        section: string;
        isOccupied: boolean;
        deceasedId?: mongoose.Types.ObjectId;
        occupiedAt?: Date;
        gps?: {
            type: string;
            coordinates: [number, number];
        };
        photos: string[];
    }>;
}
export declare const Cemetery: mongoose.Model<CemeteryDocument, {}, {}, {}, mongoose.Document<unknown, {}, CemeteryDocument, {}, {}> & CemeteryDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Cemetery.d.ts.map