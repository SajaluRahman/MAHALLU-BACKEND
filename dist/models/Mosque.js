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
exports.Mosque = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const MosqueSchema = new mongoose_1.Schema({
    tenantId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Tenant', required: true, unique: true },
    name: { type: String, required: true },
    nameAr: String,
    registrationNo: String,
    yearEstablished: Number,
    address: { type: mongoose_1.Schema.Types.Mixed },
    phone: String, email: String,
    imamId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Member' },
    muazzinId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Member' },
    capacity: Number,
    facilities: [String],
    committee: [{
            memberId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Member' },
            position: String, startDate: Date, endDate: Date,
        }],
    assets: [{ name: String, description: String, value: Number, purchasedAt: Date, condition: { type: String, enum: ['good', 'fair', 'poor'], default: 'good' } }],
    bankAccounts: [{ bankName: String, accountNo: String, ifscCode: String, accountType: String, balance: Number }],
}, { timestamps: true });
exports.Mosque = mongoose_1.default.model('Mosque', MosqueSchema);
//# sourceMappingURL=Mosque.js.map