import Foundation
import UIKit

@MainActor
class ValidationService: ObservableObject {
    static let shared = ValidationService()

    @Published var lastResult: ValidationResult?
    @Published var isValidating = false
    @Published var validationHistory: [ValidationResult] = []

    private let networkMonitor = NetworkMonitor.shared
    private var currentEventId: String?

    private init() {}

    // MARK: - Configuration

    func setCurrentEvent(_ eventId: String) {
        self.currentEventId = eventId
    }

    // MARK: - Main Validation

    func validateTicket(payload: String) async -> ValidationResult {
        isValidating = true
        defer { isValidating = false }

        // 1. Parse QR payload
        guard let qrData = QRPayload.parse(payload) else {
            let result = ValidationResult.invalid(
                ticketId: "unknown",
                errorCode: .invalidQR,
                message: "Codigo QR invalido"
            )
            recordResult(result)
            return result
        }

        // 2. Check QR expiration (30 seconds)
        if qrData.isExpired {
            let result = ValidationResult.invalid(
                ticketId: qrData.ticketId,
                errorCode: .expiredQR,
                message: "Codigo QR expirado. El usuario debe refrescar su entrada"
            )
            recordResult(result)
            return result
        }

        // 3. Decide: online or offline validation
        if networkMonitor.isConnected {
            return await validateOnline(qrData: qrData)
        } else {
            return await validateOffline(qrData: qrData)
        }
    }

    // MARK: - Online Validation

    private func validateOnline(qrData: QRPayload) async -> ValidationResult {
        guard let payloadString = qrData.toJSONString() else {
            let result = ValidationResult.invalid(
                ticketId: qrData.ticketId,
                errorCode: .invalidQR
            )
            recordResult(result)
            return result
        }

        let response = await SupabaseManager.shared.validateTicket(payload: payloadString)
        var result = ValidationResult(from: response, ticketId: qrData.ticketId)

        // Enrich with buyer info if available from extended response
        // The API should return buyer name and email in the response

        recordResult(result)
        return result
    }

    // MARK: - Offline Validation

    private func validateOffline(qrData: QRPayload) async -> ValidationResult {
        // 1. Search ticket in local cache
        guard let cachedTicket = await OfflineCacheService.shared.getTicket(id: qrData.ticketId) else {
            let result = ValidationResult.invalid(
                ticketId: qrData.ticketId,
                errorCode: .ticketNotFound,
                message: "Ticket no encontrado en cache offline. Necesitas conexion a internet."
            )
            recordResult(result)
            return result
        }

        // 2. Check ticket status
        guard cachedTicket.status == .active else {
            let errorCode: ValidationErrorCode = cachedTicket.status == .used ? .alreadyUsed : .invalidStatus
            let result = ValidationResult.invalid(
                ticketId: qrData.ticketId,
                errorCode: errorCode
            )
            recordResult(result)
            return result
        }

        // 3. Validate TOTP code locally
        let isValidCode = SafeTixService.shared.validateTOTP(
            secret: cachedTicket.safetixSecret,
            code: qrData.code
        )

        guard isValidCode else {
            let result = ValidationResult.invalid(
                ticketId: qrData.ticketId,
                errorCode: .invalidCode,
                message: "Codigo TOTP invalido. El QR puede estar expirado."
            )
            recordResult(result)
            return result
        }

        // 4. Mark as used locally
        await OfflineCacheService.shared.markAsUsed(ticketId: qrData.ticketId)

        // 5. Queue for synchronization
        let pending = PendingValidation(
            ticketId: qrData.ticketId,
            eventId: currentEventId ?? "",
            code: qrData.code,
            deviceId: UIDevice.current.identifierForVendor?.uuidString ?? "ios-device",
            isValid: true
        )
        await SyncService.shared.enqueue(pending)

        // 6. Create result with ticket info
        let ticketInfo = cachedTicket.toValidatedTicketInfo()

        let result = ValidationResult(
            ticketId: qrData.ticketId,
            isValid: true,
            ticketInfo: ticketInfo,
            syncStatus: .pending
        )

        recordResult(result)
        return result
    }

    // MARK: - History Management

    private func recordResult(_ result: ValidationResult) {
        lastResult = result
        validationHistory.insert(result, at: 0)

        // Limit history to 100 items
        if validationHistory.count > 100 {
            validationHistory = Array(validationHistory.prefix(100))
        }

        // Provide haptic feedback
        provideHapticFeedback(isValid: result.isValid)
    }

    private func provideHapticFeedback(isValid: Bool) {
        let generator = UINotificationFeedbackGenerator()
        generator.notificationOccurred(isValid ? .success : .error)
    }

    func clearHistory() {
        validationHistory.removeAll()
        lastResult = nil
    }

    // MARK: - Stats

    var todayValidCount: Int {
        validationHistory.filter { $0.isValid && Calendar.current.isDateInToday($0.validatedAt) }.count
    }

    var todayInvalidCount: Int {
        validationHistory.filter { !$0.isValid && Calendar.current.isDateInToday($0.validatedAt) }.count
    }

    var pendingSyncCount: Int {
        validationHistory.filter { $0.syncStatus == .pending }.count
    }
}
