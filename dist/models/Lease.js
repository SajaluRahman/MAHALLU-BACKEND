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
exports.Lease = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const shared_types_1 = require("@mahallu/shared-types");
const LeaseSchema = new mongoose_1.Schema({
    tenantId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    propertyId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Property', required: true },
    tenantMemberId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Member', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    rentAmount: { type: Number, required: true },
    status: { type: String, enum: Object.values(shared_types_1.LeaseStatus), default: shared_types_1.LeaseStatus.PENDING },
    rentHistory: [{ month: String, amount: Number, paidAt: Date, paymentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Payment' } }],
    documents: [{ url: String, fileName: String }],
}, { timestamps: true });
LeaseSchema.index({ tenantId: 1, propertyId: 1 });
exports.Lease = mongoose_1.default.model('Lease', LeaseSchema);
//# sourceMappingURL=Lease.js.map