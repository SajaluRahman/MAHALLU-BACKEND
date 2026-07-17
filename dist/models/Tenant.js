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
exports.Tenant = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const TenantSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    mahalluCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
    domain: { type: String, lowercase: true, trim: true },
    logo: { type: String },
    phone: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    plan: { type: String, enum: ['free', 'basic', 'premium'], default: 'free' },
    address: {
        line1: { type: String, required: true },
        line2: { type: String },
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
    settings: {
        theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
        language: { type: String, enum: ['en', 'ml', 'ar'], default: 'ml' },
        currency: { type: String, default: 'INR' },
        timezone: { type: String, default: 'Asia/Kolkata' },
        dateFormat: { type: String, default: 'DD/MM/YYYY' },
        prayerTimeMethod: { type: String, default: '1' },
        iqamahTimes: { type: Map, of: String },
    },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
TenantSchema.index({ email: 1 });
exports.Tenant = mongoose_1.default.model('Tenant', TenantSchema);
//# sourceMappingURL=Tenant.js.map