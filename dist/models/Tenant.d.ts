import mongoose, { Document } from 'mongoose';
import { ITenant } from '@mahallu/shared-types';
export interface TenantDocument extends Omit<ITenant, '_id'>, Document {
}
export declare const Tenant: mongoose.Model<TenantDocument, {}, {}, {}, Document<unknown, {}, TenantDocument, {}, {}> & TenantDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Tenant.d.ts.map