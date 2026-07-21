import mongoose, { Document } from 'mongoose';
export interface DeathRecordDocument extends Document {
    tenantId: mongoose.Types.ObjectId;
    memberId: mongoose.Types.ObjectId;
    dateOfDeath: Date;
    timeOfDeath?: string;
    causeOfDeath?: string;
    janazahDate?: Date;
    janazahVenue?: string;
    imamId?: mongoose.Types.ObjectId;
    burialDate?: Date;
    burialPlace?: string;
    cemeteryId?: mongoose.Types.ObjectId;
    plotId?: string;
    expenses: Array<{
        description: string;
        amount: number;
        paidById?: mongoose.Types.ObjectId;
    }>;
    certificateId?: mongoose.Types.ObjectId;
}
export declare const DeathRecord: mongoose.Model<DeathRecordDocument, {}, {}, {}, any, any>;
//# sourceMappingURL=DeathRecord.d.ts.map