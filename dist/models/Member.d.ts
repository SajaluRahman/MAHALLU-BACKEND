import mongoose, { Document } from 'mongoose';
import { IMember } from '@mahallu/shared-types';
export interface MemberDocument extends Omit<IMember, '_id' | 'tenantId' | 'familyId' | 'userId' | 'dateOfBirth'>, Document {
    tenantId: mongoose.Types.ObjectId;
    familyId?: mongoose.Types.ObjectId;
    userId?: mongoose.Types.ObjectId;
    dateOfBirth?: Date;
}
export declare const Member: mongoose.Model<MemberDocument, {}, {}, {}, any, any>;
//# sourceMappingURL=Member.d.ts.map