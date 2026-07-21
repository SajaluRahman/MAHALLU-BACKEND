"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Member = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const shared_types_1 = require("@mahallu/shared-types");
const FileAttachmentSchema = new mongoose_1.Schema({
    url: { type: String, required: true },
    publicId: { type: String },
    fileName: { type: String },
    fileType: { type: String },
    size: { type: Number },
}, { _id: false });
const MemberSchema = new mongoose_1.Schema({
    tenantId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    memberId: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    nameAr: { type: String, trim: true },
    nameML: { type: String, trim: true },
    gender: { type: String, enum: Object.values(shared_types_1.Gender), required: true },
    dateOfBirth: { type: Date },
    bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
    photo: FileAttachmentSchema,
    aadhaarNumber: { type: String, trim: true },
    phone: { type: String, required: true, trim: true },
    alternatePhone: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true },
    occupation: { type: String, trim: true },
    qualification: { type: String, trim: true },
    familyId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Family' },
    relationship: { type: String },
    status: { type: String, enum: Object.values(shared_types_1.MemberStatus), default: shared_types_1.MemberStatus.ACTIVE },
    qrCode: { type: String },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
});
// Compound indexes
MemberSchema.index({ tenantId: 1, memberId: 1 }, { unique: true });
MemberSchema.index({ tenantId: 1, phone: 1 });
MemberSchema.index({ tenantId: 1, status: 1 });
MemberSchema.index({ tenantId: 1, familyId: 1 });
MemberSchema.index({ tenantId: 1, name: 'text', nameML: 'text' }); // Full-text search
// Virtual: age
MemberSchema.virtual('age').get(function () {
    if (!this.dateOfBirth)
        return null;
    const today = new Date();
    const dob = new Date(this.dateOfBirth);
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate()))
        age--;
    return age;
});
exports.Member = mongoose_1.default.model('Member', MemberSchema);
if (!mongoose_1.default.models.member) {
    mongoose_1.default.model('member', MemberSchema);
}
//# sourceMappingURL=Member.js.map