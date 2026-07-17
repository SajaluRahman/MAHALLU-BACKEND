import { UserDocument } from '../models/User';
import { AuthTokens } from '@mahallu/shared-types';
export declare class AuthService {
    private static generateAccessToken;
    private static generateRefreshToken;
    static login(identifier: string, password: string, tenantCode?: string): Promise<{
        tokens: AuthTokens;
        user: Partial<UserDocument>;
    }>;
    static refreshToken(refreshToken: string): Promise<AuthTokens>;
    static logout(userId: string, refreshToken: string, accessToken: string): Promise<void>;
    static setup2FA(userId: string): Promise<{
        secret: string;
        qrCode: string;
    }>;
    static verify2FA(userId: string, token: string): Promise<void>;
    static changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
    static updateFCMToken(userId: string, fcmToken: string): Promise<void>;
}
//# sourceMappingURL=auth.service.d.ts.map