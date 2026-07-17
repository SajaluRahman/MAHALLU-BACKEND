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
exports.Student = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const StudentSchema = new mongoose_1.Schema({
    tenantId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    admissionNo: { type: String, required: true, trim: true },
    memberId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Member', required: true },
    madrasaId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Madrasa', required: true },
    classId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Class', required: true },
    batchId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Batch' },
    guardianId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Member', required: true },
    familyId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Family' },
    admissionDate: { type: Date, required: true, default: Date.now },
    status: {
        type: String,
        enum: ['active', 'promoted', 'transferred', 'withdrawn'],
        default: 'active',
    },
    qrCode: String,
    idCardUrl: String,
    hifzProgress: {
        completedJuz: [{ type: Number }],
        currentJuz: { type: Number, default: 1 },
        currentSurah: String,
        lastAssessedAt: Date,
    },
    tajweedLevel: String,
    feePaid: { type: Number, default: 0 },
    feeBalance: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
}, { timestamps: true, toJSON: { virtuals: true } });
StudentSchema.index({ tenantId: 1, admissionNo: 1 }, { unique: true });
StudentSchema.index({ tenantId: 1, madrasaId: 1, classId: 1 });
StudentSchema.index({ tenantId: 1, memberId: 1 });
StudentSchema.index({ tenantId: 1, guardianId: 1 });
StudentSchema.index({ tenantId: 1, status: 1 });
exports.Student = mongoose_1.default.model('Student', StudentSchema);
//# sourceMappingURL=Student.js.map