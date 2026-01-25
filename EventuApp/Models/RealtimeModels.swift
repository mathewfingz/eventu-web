import Foundation

// MARK: - Realtime Statistics
struct RealtimeStats: Codable {
    let eventId: String
    let totalSold: Int
    var totalProcessed: Int
    var processingRate: Double // entradas/minuto
    var byTicketType: [TicketTypeStats]
    var hourlyBreakdown: [HourlyEntry]
    var activeValidators: [ValidatorStatus]
    var capacityAlerts: [CapacityAlert]
    var lastUpdated: Date

    var processedPercentage: Double {
        guard totalSold > 0 else { return 0 }
        return Double(totalProcessed) / Double(totalSold) * 100
    }

    var remainingEntries: Int {
        totalSold - totalProcessed
    }

    var formattedProcessingRate: String {
        String(format: "%.1f", processingRate)
    }

    static var empty: RealtimeStats {
        RealtimeStats(
            eventId: "",
            totalSold: 0,
            totalProcessed: 0,
            processingRate: 0,
            byTicketType: [],
            hourlyBreakdown: [],
            activeValidators: [],
            capacityAlerts: [],
            lastUpdated: Date()
        )
    }
}

// MARK: - Ticket Type Statistics
struct TicketTypeStats: Codable, Identifiable {
    let id: String
    let name: String
    let sold: Int
    var processed: Int
    let color: String

    var processedPercentage: Double {
        guard sold > 0 else { return 0 }
        return Double(processed) / Double(sold) * 100
    }

    var remaining: Int {
        sold - processed
    }
}

// MARK: - Hourly Entry Data
struct HourlyEntry: Codable, Identifiable {
    var id: String { hour }
    let hour: String // "18:00"
    let count: Int
    let rate: Double // por minuto

    var formattedCount: String {
        "\(count)"
    }
}

// MARK: - Validator Status
struct ValidatorStatus: Codable, Identifiable {
    let id: String
    let name: String
    let email: String?
    var validationsCount: Int
    var lastValidationAt: Date?
    var isActive: Bool
    let deviceInfo: String?

    var timeSinceLastValidation: TimeInterval? {
        guard let last = lastValidationAt else { return nil }
        return Date().timeIntervalSince(last)
    }

    var lastValidationDescription: String? {
        guard let last = lastValidationAt else { return "Sin actividad" }
        let formatter = RelativeDateTimeFormatter()
        formatter.locale = Locale(identifier: "es_CO")
        formatter.unitsStyle = .short
        return formatter.localizedString(for: last, relativeTo: Date())
    }

    var statusColor: String {
        guard let timeSince = timeSinceLastValidation else { return "gray" }
        if timeSince < 60 { return "green" }      // Activo en el ultimo minuto
        if timeSince < 300 { return "yellow" }    // Activo en los ultimos 5 minutos
        return "red"                              // Inactivo
    }
}

// MARK: - Capacity Alert
struct CapacityAlert: Codable, Identifiable {
    let id: String
    let ticketTypeId: String
    let ticketTypeName: String
    let currentCount: Int
    let maxCapacity: Int
    let alertLevel: AlertLevel
    let message: String

    enum AlertLevel: String, Codable {
        case warning = "WARNING"   // 80%
        case critical = "CRITICAL" // 95%
        case full = "FULL"         // 100%

        var color: String {
            switch self {
            case .warning: return "yellow"
            case .critical: return "orange"
            case .full: return "red"
            }
        }

        var icon: String {
            switch self {
            case .warning: return "exclamationmark.triangle"
            case .critical: return "exclamationmark.triangle.fill"
            case .full: return "xmark.circle.fill"
            }
        }
    }

    var percentage: Double {
        guard maxCapacity > 0 else { return 0 }
        return Double(currentCount) / Double(maxCapacity) * 100
    }
}

// MARK: - Dashboard Summary
struct DashboardSummary {
    let stats: RealtimeStats
    let event: ValidationEvent
    let offlineStatus: OfflineSyncStatus?

    var isHealthy: Bool {
        stats.capacityAlerts.filter { $0.alertLevel == .full }.isEmpty
    }

    var hasWarnings: Bool {
        !stats.capacityAlerts.isEmpty
    }

    var activeValidatorCount: Int {
        stats.activeValidators.filter { $0.isActive }.count
    }

    var topPerformer: ValidatorStatus? {
        stats.activeValidators.max { $0.validationsCount < $1.validationsCount }
    }
}

// MARK: - API Response Models
struct StatsAPIResponse: Codable {
    let success: Bool
    let data: StatsData?
    let error: String?

    struct StatsData: Codable {
        let totalSold: Int
        let totalProcessed: Int
        let processingRate: Double?
        let byTicketType: [TicketTypeStats]?
        let hourlyBreakdown: [HourlyEntry]?
        let activeValidators: [ValidatorStatus]?
        let capacityAlerts: [CapacityAlert]?
    }
}

// MARK: - Connection State
enum ConnectionState {
    case connected
    case connecting
    case disconnected
    case error(String)

    var isConnected: Bool {
        if case .connected = self { return true }
        return false
    }

    var statusText: String {
        switch self {
        case .connected: return "Conectado"
        case .connecting: return "Conectando..."
        case .disconnected: return "Sin conexion"
        case .error(let msg): return "Error: \(msg)"
        }
    }

    var statusColor: String {
        switch self {
        case .connected: return "green"
        case .connecting: return "yellow"
        case .disconnected, .error: return "red"
        }
    }
}
