import mongoose, { Document } from 'mongoose';
export interface MadrasaDocument extends Document {
    tenantId: mongoose.Types.ObjectId;
    name: string;
    registrationNo?: string;
    principalId?: mongoose.Types.ObjectId;
    address: Record<string, unknown>;
    phone?: string;
    email?: string;
    classes: mongoose.Types.ObjectId[];
    subjects: string[];
    academicYear: string;
    affiliatedTo?: string;
}
export declare const Madrasa: mongoose.Model<MadrasaDocument, {}, {}, {}, Document<unknown, {}, MadrasaDocument, {}, {}> & MadrasaDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Madrasa.d.ts.map