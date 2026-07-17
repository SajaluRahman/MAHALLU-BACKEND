import mongoose, { Document } from 'mongoose';
import { IUser } from '@mahallu/shared-types';
export interface UserDocument extends Omit<IUser, '_id' | 'tenantId' | 'memberId'>, Document {
    tenantId: mongoose.Types.ObjectId;
    memberId?: mongoose.Types.ObjectId;
    comparePassword(candidatePassword: string): Promise<boolean>;
}
export declare const User: mongoose.Model<UserDocument, {}, {}, {}, mongoose.Document<unknown, {}, UserDocument, {}, {}> & UserDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=User.d.ts.map