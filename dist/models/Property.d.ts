import mongoose, { Document } from 'mongoose';
import { PropertyType } from '@mahallu/shared-types';
export interface PropertyDocument extends Document {
    tenantId: mongoose.Types.ObjectId;
    propertyCode: string;
    type: PropertyType;
    name: string;
    address: Record<string, unknown>;
    area?: number;
    rentAmount?: number;
    status: 'vacant' | 'occupied' | 'maintenance';
    documents: Array<{
        url: string;
        fileName?: string;
        fileType?: string;
    }>;
    currentLeaseId?: mongoose.Types.ObjectId;
}
export declare const Property: mongoose.Model<PropertyDocument, {}, {}, {}, mongoose.Document<unknown, {}, PropertyDocument, {}, {}> & PropertyDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Property.d.ts.map