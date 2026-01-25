import Foundation

// MARK: - Offline Ticket Cache
struct OfflineTicket: Codable, Identifiable {
    let id: String // ticketId
    let eventId: String
    let ticketTypeId: String
    let ticketTypeName: String
    let section: String?
    let seatRow: String?
    let seatNumber: String?
    let safetixSecret: String
    var status: TicketStatus
    let buyerName: String?
    let buyerEmail: String?
    let downloadedAt: Date
    let expiresAt: Date

    var isExpired: Bool {
        Date() > expiresAt
    }

    var seatDescription: String? {
        guard let row = seatRow, let seat = seatNumber else { return nil }
        return "Fila \(row) - Asiento \(seat)"
    }

    func toValidatedTicketInfo() -> ValidatedTicketInfo {
        ValidatedTicketInfo(
            ticketType: ticketTypeName,
            section: section,
            seatRow: seatRow,
            seatNumber: seatNumber,
            eventName: "",
            buyerName: buyerName,
            buyerEmail: buyerEmail
        )
    }
}

// MARK: - Pending Validation for Sync
struct PendingValidation: Codable, Identifiable {
    let id: String
    let ticketId: String
    let eventId: String
    let code: String
    let deviceId: String
    let validatedAt: Date
    let isValid: Bool
    var retryCount: Int

    init(id: String = UUID().uuidString,
         ticketId: String,
         eventId: String,
         code: String,
         deviceId: String,
         validatedAt: Date = Date(),
         isValid: Bool,
         retryCount: Int = 0) {
        self.id = id
        self.ticketId = ticketId
        self.eventId = eventId
        self.code = code
        self.deviceId = deviceId
        self.validatedAt = validatedAt
        self.isValid = isValid
        self.retryCount = retryCount
    }

    var canRetry: Bool {
        retryCount < 3
    }

    mutating func incrementRetry() {
        retryCount += 1
    }
}

// MARK: - Cache Metadata
struct OfflineCacheMetadata: Codable {
    let eventId: String
    let eventName: String
    let downloadedAt: Date
    let ticketCount: Int
    let expiresAt: Date
    var lastSyncAt: Date?
    var processedCount: Int

    init(eventId: String, eventName: String, downloadedAt: Date = Date(), ticketCount: Int, expiresAt: Date? = nil, lastSyncAt: Date? = nil, processedCount: Int = 0) {
        self.eventId = eventId
        self.eventName = eventName
        self.downloadedAt = downloadedAt
        self.ticketCount = ticketCount
        self.expiresAt = expiresAt ?? downloadedAt.addingTimeInterval(24 * 60 * 60) // 24 horas
        self.lastSyncAt = lastSyncAt
        self.processedCount = processedCount
    }

    var isStale: Bool {
        guard let lastSync = lastSyncAt else { return true }
        return Date().timeIntervalSince(lastSync) > 300 // 5 minutos
    }

    var isExpired: Bool {
        Date() > expiresAt
    }

    var remainingTickets: Int {
        ticketCount - processedCount
    }

    var formattedDownloadDate: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "d MMM, h:mm a"
        formatter.locale = Locale(identifier: "es_CO")
        return formatter.string(from: downloadedAt)
    }
}

// MARK: - Offline Download Progress
struct OfflineDownloadProgress {
    var totalTickets: Int
    var downloadedTickets: Int
    var status: DownloadStatus
    var errorMessage: String?

    enum DownloadStatus {
        case idle
        case downloading
        case completed
        case failed
    }

    var progress: Double {
        guard totalTickets > 0 else { return 0 }
        return Double(downloadedTickets) / Double(totalTickets)
    }

    var isCompleted: Bool {
        status == .completed
    }

    static var idle: OfflineDownloadProgress {
        OfflineDownloadProgress(totalTickets: 0, downloadedTickets: 0, status: .idle)
    }
}

// MARK: - Offline Sync Status
struct OfflineSyncStatus {
    var pendingCount: Int
    var lastSyncAt: Date?
    var isSyncing: Bool
    var lastError: String?

    var hasPendingItems: Bool {
        pendingCount > 0
    }

    var lastSyncDescription: String? {
        guard let lastSync = lastSyncAt else { return nil }
        let formatter = RelativeDateTimeFormatter()
        formatter.locale = Locale(identifier: "es_CO")
        return formatter.localizedString(for: lastSync, relativeTo: Date())
    }

    static var initial: OfflineSyncStatus {
        OfflineSyncStatus(pendingCount: 0, lastSyncAt: nil, isSyncing: false)
    }
}
