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
exports.Family = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const FamilySchema = new mongoose_1.Schema({
    tenantId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    familyCode: { type: String, required: true, trim: true },
    headMemberId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Member', required: true },
    members: [{
            memberId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Member', required: true },
            relationship: { type: String, required: true },
            isHead: { type: Boolean, default: false },
        }],
    address: {
        line1: { type: String, required: true },
        line2: String,
        city: { type: String, required: true },
        district: { type: String, required: true },
        state: { type: String, default: 'Kerala' },
        pincode: { type: String, required: true },
        country: { type: String, default: 'India' },
        gps: {
            type: { type: String, enum: ['Point'], default: 'Point' },
            coordinates: { type: [Number], default: [0, 0] },
        },
    },
    wardNo: String,
    outstandingBalance: { type: Number, default: 0 },
    qrCode: String,
    photo: { url: String, publicId: String },
    recurringDonationType: { type: String, enum: ['monthly', 'yearly', 'none'], default: 'none' },
    recurringDonationAmount: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
}, { timestamps: true, toJSON: { virtuals: true } });
FamilySchema.index({ tenantId: 1, familyCode: 1 }, { unique: true });
FamilySchema.index({ tenantId: 1, headMemberId: 1 });
FamilySchema.index({ 'address.gps': '2dsphere' });
exports.Family = mongoose_1.default.model('Family', FamilySchema);
//# sourceMappingURL=Family.js.map