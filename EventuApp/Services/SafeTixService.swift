import Foundation
import CryptoKit

class SafeTixService {
    static let shared = SafeTixService()

    // Settings matching the web implementation (otpauth)
    private let step: TimeInterval = 15
    private let digits: Int = 8
    private let validationWindow: Int = 1 // +/- 1 step tolerance for clock drift

    /// Generates the payload for the Ticket QR code
    func generateQRPayload(ticketId: String, secret: String) -> String {
        let code = generateTOTP(secret: secret)
        let timestamp = Int64(Date().timeIntervalSince1970 * 1000)

        let payload: [String: Any] = [
            "ticketId": ticketId,
            "code": code,
            "timestamp": timestamp
        ]

        if let jsonData = try? JSONSerialization.data(withJSONObject: payload),
           let jsonString = String(data: jsonData, encoding: .utf8) {
            return jsonString
        }

        return ""
    }

    /// Generates a TOTP code (RFC 6238)
    func generateTOTP(secret: String) -> String {
        let counter = Int64(Date().timeIntervalSince1970 / step)
        return generateTOTPForCounter(secret: secret, counter: counter)
    }

    /// Generates TOTP for a specific counter value
    private func generateTOTPForCounter(secret: String, counter: Int64) -> String {
        guard let keyData = decodeBase32(secret) else { return "00000000" }

        var counterData = Data(count: 8)
        counterData.withUnsafeMutableBytes { bytes in
            bytes.storeBytes(of: counter.bigEndian, as: Int64.self)
        }

        let key = SymmetricKey(data: keyData)
        let hash = HMAC<Insecure.SHA1>.authenticationCode(for: counterData, using: key) // Standard TOTP uses SHA1

        var hashData = Data(hash)
        let offset = Int(hashData[hashData.count - 1] & 0x0f)

        let binaryCode = hashData.withUnsafeBytes { (ptr: UnsafeRawBufferPointer) -> UInt32 in
            let slice = ptr.baseAddress!.advanced(by: offset).assumingMemoryBound(to: UInt32.self)
            return UInt32(bigEndian: slice.pointee) & 0x7fffffff
        }

        let modulo = UInt32(pow(10, Double(digits)))
        let otp = binaryCode % modulo

        return String(format: "%0\(digits)d", otp)
    }

    /// Validates a TOTP code against a secret (for offline validation)
    /// Uses a window of +/- 1 step to account for clock drift
    func validateTOTP(secret: String, code: String) -> Bool {
        let currentCounter = Int64(Date().timeIntervalSince1970 / step)

        // Check current counter and +/- window for clock drift tolerance
        for offset in -validationWindow...validationWindow {
            let counter = currentCounter + Int64(offset)
            let expectedCode = generateTOTPForCounter(secret: secret, counter: counter)
            if expectedCode == code {
                return true
            }
        }

        return false
    }

    /// Validates a TOTP code with a specific timestamp (for verifying QR freshness)
    func validateTOTPWithTimestamp(secret: String, code: String, timestamp: Int64) -> Bool {
        // Calculate the counter from the QR timestamp
        let qrCounter = Int64(Double(timestamp) / 1000 / step)
        let currentCounter = Int64(Date().timeIntervalSince1970 / step)

        // The QR code should be from the same or adjacent time window
        let counterDiff = abs(currentCounter - qrCounter)
        if counterDiff > Int64(validationWindow + 1) {
            return false // QR is too old
        }

        // Verify the code matches what was expected at the QR generation time
        let expectedCode = generateTOTPForCounter(secret: secret, counter: qrCounter)
        return expectedCode == code
    }

    /// Pre-generates codes for offline use (24 hours worth)
    func preGenerateOfflineCodes(secret: String, hours: Int = 24) -> [Int64: String] {
        var codes: [Int64: String] = [:]
        let stepsPerHour = Int(3600 / step) // 240 steps per hour with 15 second step
        let totalSteps = stepsPerHour * hours

        let startCounter = Int64(Date().timeIntervalSince1970 / step)

        for i in 0..<totalSteps {
            let counter = startCounter + Int64(i)
            let code = generateTOTPForCounter(secret: secret, counter: counter)
            codes[counter] = code
        }

        return codes
    }

    /// Basic Base32 decoder for TOTP/SafeTix secrets
    private func decodeBase32(_ base32: String) -> Data? {
        let characterSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
        let base32 = base32.uppercased().replacingOccurrences(of: "=", with: "")
        var data = Data()
        var buffer: UInt32 = 0
        var count = 0

        for char in base32 {
            guard let value = characterSet.firstIndex(of: char)?.utf16Offset(in: characterSet) else { return nil }
            buffer = (buffer << 5) | UInt32(value)
            count += 5

            if count >= 8 {
                data.append(UInt8((buffer >> (count - 8)) & 0xff))
                count -= 8
            }
        }

        return data
    }
}
