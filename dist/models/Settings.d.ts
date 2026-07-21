import mongoose, { Document } from 'mongoose';
export interface SettingsDocument extends Document {
    tenantId: mongoose.Types.ObjectId;
    general: {
        mahalluName: string;
        logo?: string;
        phone: string;
        email: string;
        address: string;
    };
    notifications: {
        whatsappEnabled: boolean;
        smsEnabled: boolean;
        emailEnabled: boolean;
        pushEnabled: boolean;
    };
    finance: {
        currency: string;
        financialYearStart: string;
        autoReceiptEnabled: boolean;
    };
    madrasa: {
        feeReminderDays: number;
        attendanceNotification: boolean;
        autoReportCard: boolean;
    };
    integrations: {
        razorpayEnabled: boolean;
        whatsappApiKey?: string;
        googleMapsKey?: string;
    };
    theme: {
        primaryColor: string;
        mode: 'light' | 'dark' | 'system';
        language: string;
    };
    iqamahTimes?: {
        Fajr: string;
        Dhuhr: string;
        Asr: string;
        Maghrib: string;
        Isha: string;
        Jumuah: string;
    };
}
export declare const Settings: mongoose.Model<SettingsDocument, {}, {}, {}, any, any>;
//# sourceMappingURL=Settings.d.ts.map