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
    quantity?: number;
    availableQuantity?: number;
    status: 'vacant' | 'occupied' | 'maintenance';
    documents: Array<{
        url: string;
        fileName?: string;
        fileType?: string;
    }>;
    currentLeaseId?: mongoose.Types.ObjectId;
}
export declare const Property: mongoose.Model<PropertyDocument, {}, {}, {}, any, any>;
//# sourceMappingURL=Property.d.ts.map