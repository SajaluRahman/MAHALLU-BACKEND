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
exports.Nikah = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const NikahSchema = new mongoose_1.Schema({
    tenantId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    nikahNo: { type: String, required: true },
    brideId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Member' },
    brideName: { type: String, required: true }, brideFatherName: { type: String, required: true },
    groomId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Member' },
    groomName: { type: String, required: true }, groomFatherName: { type: String, required: true },
    imamId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Member' },
    witnesses: [{ name: String, memberId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Member' }, phone: String }],
    mehr: { type: Number, required: true }, mehrCurrency: { type: String, default: 'INR' },
    date: { type: Date, required: true }, venue: String,
    documents: [{ url: String, fileName: String, fileType: String }],
    certificateId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Certificate' },
}, { timestamps: true });
NikahSchema.index({ tenantId: 1, nikahNo: 1 }, { unique: true });
exports.Nikah = mongoose_1.default.model('Nikah', NikahSchema);
//# sourceMappingURL=Nikah.js.map