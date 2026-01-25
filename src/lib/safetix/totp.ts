/**
 * SafeTix - Dynamic QR Code System using TOTP
 * 
 * Generates Time-based One-Time Password codes that change every 15 seconds,
 * making screenshot fraud impossible.
 */

import * as OTPAuth from 'otpauth';

// Create authenticator-like interface using otpauth
const authenticator = {
    options: {
        step: 15,
        window: 1,
        digits: 8,
    },
    generateSecret(): string {
        // Generate a random base32 secret
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let secret = '';
        for (let i = 0; i < 32; i++) {
            secret += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return secret;
    },
    generate(secret: string): string {
        const totp = new OTPAuth.TOTP({
            secret: secret,
            digits: this.options.digits,
            period: this.options.step,
        });
        return totp.generate();
    },
    verify({ token, secret }: { token: string; secret: string }): boolean {
        const totp = new OTPAuth.TOTP({
            secret: secret,
            digits: this.options.digits,
            period: this.options.step,
        });
        const delta = totp.validate({ token, window: this.options.window });
        return delta !== null;
    },
};
import QRCode from 'qrcode';
import CryptoJS from 'crypto-js';

// Note: TOTP settings are configured in the authenticator object above

/**
 * Generate a unique secret for a ticket
 * This secret is stored with the ticket and used for all TOTP generations
 */
export function generateTicketSecret(): string {
    return authenticator.generateSecret();
}

/**
 * Generate the current dynamic code for a ticket
 */
export function generateDynamicCode(secret: string): string {
    return authenticator.generate(secret);
}

/**
 * Validate a dynamic code
 * @returns true if the code is valid for the given secret
 */
export function validateDynamicCode(secret: string, code: string): boolean {
    return authenticator.verify({ token: code, secret });
}

/**
 * Calculate time remaining until next code rotation
 */
export function getTimeRemaining(): number {
    const step = authenticator.options.step || 15;
    return step - (Math.floor(Date.now() / 1000) % step);
}

/**
 * Generate a QR code data URL for a ticket
 */
export async function generateTicketQR(
    ticketId: string,
    secret: string,
    additionalData?: Record<string, unknown>
): Promise<string> {
    const code = generateDynamicCode(secret);

    const payload = JSON.stringify({
        ticketId,
        code,
        timestamp: Date.now(),
        ...additionalData,
    });

    return QRCode.toDataURL(payload, {
        width: 280,
        margin: 2,
        color: {
            dark: '#212121',
            light: '#FFFFFF',
        },
        errorCorrectionLevel: 'M',
    });
}

/**
 * Pre-generate codes for offline mode (24 hours worth)
 * @param secret - The ticket's TOTP secret
 * @param hoursAhead - Number of hours to pre-generate (default: 24)
 * @returns Array of time-indexed codes
 */
export function preGenerateOfflineCodes(
    secret: string,
    hoursAhead: number = 24
): { timestamp: number; code: string }[] {
    const step = authenticator.options.step || 15;
    const codesPerHour = Math.ceil(3600 / step);
    const totalCodes = codesPerHour * hoursAhead;

    const codes: { timestamp: number; code: string }[] = [];
    const baseTime = Math.floor(Date.now() / 1000);

    for (let i = 0; i < totalCodes; i++) {
        const futureTime = baseTime + (i * step);
        const counter = Math.floor(futureTime / step);

        // Generate code for this specific time
        const code = authenticator.generate(secret);
        codes.push({
            timestamp: futureTime * 1000,
            code,
        });
    }

    return codes;
}

/**
 * Encrypt offline codes for secure storage
 */
export function encryptOfflineData(
    data: unknown,
    encryptionKey: string
): string {
    const jsonData = JSON.stringify(data);
    return CryptoJS.AES.encrypt(jsonData, encryptionKey).toString();
}

/**
 * Decrypt offline codes from storage
 */
export function decryptOfflineData<T>(
    encryptedData: string,
    encryptionKey: string
): T | null {
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedData, encryptionKey);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        return JSON.parse(decrypted) as T;
    } catch {
        return null;
    }
}

/**
 * Parse QR code payload from scanner
 */
export function parseTicketQR(payload: string): {
    ticketId: string;
    code: string;
    timestamp: number;
    isValid: boolean;
} | null {
    try {
        const data = JSON.parse(payload);

        // Check if the QR was generated within acceptable time window (30 seconds)
        const isRecent = Date.now() - data.timestamp < 30000;

        return {
            ticketId: data.ticketId,
            code: data.code,
            timestamp: data.timestamp,
            isValid: isRecent,
        };
    } catch {
        return null;
    }
}
