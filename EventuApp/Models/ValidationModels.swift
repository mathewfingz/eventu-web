import Foundation

// MARK: - Staff Roles for Validation
enum ValidatorRole: String, Codable {
    case validator = "VALIDATOR"
    case coordinator = "COORDINATOR"
    case superadmin = "SUPERADMIN"
    case promoter = "PROMOTER"

    var canAccessDashboard: Bool {
        switch self {
        case .coordinator, .superadmin, .promoter:
            return true
        case .validator:
            return false
        }
    }

    var displayName: String {
        switch self {
        case .validator: return "Validador"
        case .coordinator: return "Coordinador"
        case .superadmin: return "Super Admin"
        case .promoter: return "Promotor"
        }
    }
}

// MARK: - Staff User
struct StaffUser: Codable, Identifiable {
    let id: String
    let email: String
    let name: String?
    let role: ValidatorRole
    let assignedEvents: [String]
    let deviceId: String?

    var displayName: String {
        name ?? email.components(separatedBy: "@").first ?? "Usuario"
    }

    init(id: String, email: String, name: String?, role: ValidatorRole, assignedEvents: [String] = [], deviceId: String? = nil) {
        self.id = id
        self.email = email
        self.name = name
        self.role = role
        self.assignedEvents = assignedEvents
        self.deviceId = deviceId
    }

    init(from user: User) {
        self.id = user.id
        self.email = user.email
        self.name = user.name
        self.role = ValidatorRole(rawValue: user.role.rawValue.uppercased()) ?? .validator
        self.assignedEvents = []
        self.deviceId = nil
    }
}

// MARK: - Event for Validation
struct ValidationEvent: Codable, Identifiable {
    let id: String
    let name: String
    let date: Date
    let venueName: String
    let venueAddress: String
    let imageUrl: String?
    let doorsOpenAt: Date?
    let totalCapacity: Int
    let ticketTypes: [ValidationTicketType]

    var isToday: Bool {
        Calendar.current.isDateInToday(date)
    }

    var hasStarted: Bool {
        guard let doors = doorsOpenAt else { return false }
        return Date() >= doors
    }

    var formattedDate: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "d MMM yyyy"
        formatter.locale = Locale(identifier: "es_CO")
        return formatter.string(from: date)
    }

    var formattedTime: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "h:mm a"
        return formatter.string(from: date)
    }
}

struct ValidationTicketType: Codable, Identifiable {
    let id: String
    let name: String
    let totalQuantity: Int
    let soldQuantity: Int
    let section: String?
    let color: String?

    var availableQuantity: Int {
        totalQuantity - soldQuantity
    }
}

// MARK: - Validation Result
struct ValidationResult: Codable, Identifiable {
    let id: String
    let ticketId: String
    let isValid: Bool
    let errorCode: ValidationErrorCode?
    let errorMessage: String?
    let validatedAt: Date
    let ticketInfo: ValidatedTicketInfo?
    var syncStatus: SyncStatus

    init(id: String = UUID().uuidString,
         ticketId: String,
         isValid: Bool,
         errorCode: ValidationErrorCode? = nil,
         errorMessage: String? = nil,
         validatedAt: Date = Date(),
         ticketInfo: ValidatedTicketInfo? = nil,
         syncStatus: SyncStatus = .synced) {
        self.id = id
        self.ticketId = ticketId
        self.isValid = isValid
        self.errorCode = errorCode
        self.errorMessage = errorMessage
        self.validatedAt = validatedAt
        self.ticketInfo = ticketInfo
        self.syncStatus = syncStatus
    }

    init(from response: SupabaseManager.ValidationResponse, ticketId: String) {
        self.id = UUID().uuidString
        self.ticketId = ticketId
        self.isValid = response.valid
        self.errorCode = response.errorCode.flatMap { ValidationErrorCode(rawValue: $0) }
        self.errorMessage = response.error
        self.validatedAt = Date()
        self.ticketInfo = response.ticket.map { ValidatedTicketInfo(from: $0) }
        self.syncStatus = .synced
    }

    static func invalid(ticketId: String, errorCode: ValidationErrorCode, message: String? = nil) -> ValidationResult {
        ValidationResult(
            ticketId: ticketId,
            isValid: false,
            errorCode: errorCode,
            errorMessage: message ?? errorCode.displayMessage,
            syncStatus: .synced
        )
    }
}

// MARK: - Validation Error Codes
enum ValidationErrorCode: String, Codable {
    case alreadyUsed = "ALREADY_USED"
    case cancelled = "CANCELLED"
    case invalidCode = "INVALID_CODE"
    case invalidStatus = "INVALID_STATUS"
    case ticketNotFound = "TICKET_NOT_FOUND"
    case noSecret = "NO_SECRET"
    case networkError = "NETWORK_ERROR"
    case unauthorized = "UNAUTHORIZED"
    case expiredQR = "EXPIRED_QR"
    case invalidQR = "INVALID_QR"
    case unknown = "UNKNOWN"

    var displayMessage: String {
        switch self {
        case .alreadyUsed: return "Esta entrada ya fue utilizada"
        case .cancelled: return "Entrada cancelada"
        case .invalidCode: return "Codigo QR invalido o expirado"
        case .invalidStatus: return "Estado de entrada invalido"
        case .ticketNotFound: return "Entrada no encontrada"
        case .noSecret: return "Error de seguridad del ticket"
        case .networkError: return "Error de conexion"
        case .unauthorized: return "Sesion expirada"
        case .expiredQR: return "Codigo QR expirado"
        case .invalidQR: return "QR invalido"
        case .unknown: return "Error desconocido"
        }
    }

    var icon: String {
        switch self {
        case .alreadyUsed: return "arrow.uturn.backward.circle.fill"
        case .cancelled: return "xmark.circle.fill"
        case .invalidCode, .expiredQR, .invalidQR: return "qrcode"
        case .networkError: return "wifi.slash"
        case .unauthorized: return "lock.fill"
        default: return "exclamationmark.triangle.fill"
        }
    }
}

// MARK: - Validated Ticket Info
struct ValidatedTicketInfo: Codable {
    let ticketType: String
    let section: String?
    let seatRow: String?
    let seatNumber: String?
    let eventName: String
    let buyerName: String?
    let buyerEmail: String?

    init(ticketType: String, section: String? = nil, seatRow: String? = nil, seatNumber: String? = nil, eventName: String, buyerName: String? = nil, buyerEmail: String? = nil) {
        self.ticketType = ticketType
        self.section = section
        self.seatRow = seatRow
        self.seatNumber = seatNumber
        self.eventName = eventName
        self.buyerName = buyerName
        self.buyerEmail = buyerEmail
    }

    init(from ticket: SupabaseManager.ValidTicket) {
        self.ticketType = ticket.type ?? "General"
        self.section = nil
        self.seatRow = ticket.seatRow
        self.seatNumber = ticket.seatNumber
        self.eventName = ticket.event ?? ""
        self.buyerName = nil
        self.buyerEmail = nil
    }

    var seatDescription: String? {
        guard let row = seatRow, let seat = seatNumber else { return nil }
        return "Fila \(row) - Asiento \(seat)"
    }
}

// MARK: - Sync Status
enum SyncStatus: String, Codable {
    case synced = "SYNCED"
    case pending = "PENDING"
    case failed = "FAILED"
}

// MARK: - QR Payload
struct QRPayload: Codable {
    let ticketId: String
    let code: String
    let timestamp: Int64

    static func parse(_ string: String) -> QRPayload? {
        guard let data = string.data(using: .utf8) else { return nil }
        return try? JSONDecoder().decode(QRPayload.self, from: data)
    }

    var isExpired: Bool {
        let qrAge = Date().timeIntervalSince1970 * 1000 - Double(timestamp)
        return qrAge > 30000 // 30 segundos
    }

    func toJSONString() -> String? {
        let dict: [String: Any] = [
            "ticketId": ticketId,
            "code": code,
            "timestamp": timestamp
        ]
        guard let data = try? JSONSerialization.data(withJSONObject: dict),
              let string = String(data: data, encoding: .utf8) else {
            return nil
        }
        return string
    }
}
