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
exports.Payment = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const shared_types_1 = require("@mahallu/shared-types");
const PaymentSchema = new mongoose_1.Schema({
    tenantId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    paymentNo: { type: String, required: true },
    type: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    paidById: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Member', required: true },
    paidForId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Member' },
    gateway: { type: String, enum: Object.values(shared_types_1.PaymentGateway), required: true },
    gatewayPaymentId: String,
    gatewayOrderId: String,
    gatewaySignature: String,
    status: { type: String, enum: Object.values(shared_types_1.PaymentStatus), default: shared_types_1.PaymentStatus.PENDING },
    description: String,
    receiptId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Receipt' },
    metadata: { type: mongoose_1.Schema.Types.Mixed },
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
}, { timestamps: true, toJSON: { virtuals: true } });
PaymentSchema.index({ tenantId: 1, paymentNo: 1 }, { unique: true });
PaymentSchema.index({ tenantId: 1, status: 1 });
PaymentSchema.index({ tenantId: 1, type: 1 });
PaymentSchema.index({ tenantId: 1, paidById: 1 });
PaymentSchema.index({ tenantId: 1, createdAt: -1 });
PaymentSchema.index({ tenantId: 1, status: 1, type: 1 });
PaymentSchema.index({ tenantId: 1, type: 1, createdAt: -1 });
PaymentSchema.index({ gatewayPaymentId: 1 }, { sparse: true });
exports.Payment = mongoose_1.default.model('Payment', PaymentSchema);
//# sourceMappingURL=Payment.js.map