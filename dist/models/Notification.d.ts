import mongoose, { Document } from 'mongoose';
import { NotificationChannel } from '@mahallu/shared-types';
export interface NotificationDocument extends Document {
    tenantId: mongoose.Types.ObjectId;
    channel: NotificationChannel;
    recipientId?: mongoose.Types.ObjectId;
    recipientPhone?: string;
    recipientEmail?: string;
    title: string;
    body: string;
    data?: Record<string, unknown>;
    status: 'pending' | 'sent' | 'failed' | 'delivered';
    scheduledAt?: Date;
    sentAt?: Date;
    error?: string;
}
export declare const Notification: mongoose.Model<NotificationDocument, {}, {}, {}, mongoose.Document<unknown, {}, NotificationDocument, {}, {}> & NotificationDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Notification.d.ts.map