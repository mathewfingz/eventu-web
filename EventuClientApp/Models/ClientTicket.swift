import Foundation

// MARK: - Client Ticket

struct ClientTicket: Codable, Identifiable, Hashable {
    let id: String
    let ticketTypeId: String
    let orderId: String
    let userId: String
    let safetixSecret: String?
    let seatRow: String?
    let seatNumber: String?
    let section: String?
    let status: TicketStatus
    let usedAt: Date?
    let createdAt: Date

    // Relations
    var ticketType: TicketType?
    var order: Order?
    var event: Event?

    // MARK: - Hashable

    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }

    static func == (lhs: ClientTicket, rhs: ClientTicket) -> Bool {
        lhs.id == rhs.id
    }

    // MARK: - Computed Properties

    var canShowQR: Bool {
        status == .active && safetixSecret != nil
    }

    var isUsed: Bool {
        status == .used
    }

    var seatDescription: String? {
        guard let row = seatRow, let number = seatNumber else { return nil }
        return "Fila \(row) - Asiento \(number)"
    }

    var displayName: String {
        ticketType?.name ?? "Entrada"
    }

    var eventName: String {
        event?.name ?? ticketType?.name ?? "Evento"
    }
}

// MARK: - Ticket Status

enum TicketStatus: String, Codable {
    case reserved = "RESERVED"
    case active = "ACTIVE"
    case used = "USED"
    case cancelled = "CANCELLED"
    case transferred = "TRANSFERRED"

    var displayName: String {
        switch self {
        case .reserved: return "Reservada"
        case .active: return "Activa"
        case .used: return "Usada"
        case .cancelled: return "Cancelada"
        case .transferred: return "Transferida"
        }
    }

    var color: String {
        switch self {
        case .reserved: return "#FF9500"
        case .active: return "#34C759"
        case .used: return "#86868B"
        case .cancelled: return "#FF3B30"
        case .transferred: return "#007AFF"
        }
    }
}

// MARK: - Mock Data

extension ClientTicket {
    static let mockTickets: [ClientTicket] = {
        let calendar = Calendar.current
        let today = Date()

        return [
            ClientTicket(
                id: "ticket-001",
                ticketTypeId: "tt-001",
                orderId: "order-001",
                userId: "user-001",
                safetixSecret: "JBSWY3DPEHPK3PXP",
                seatRow: nil,
                seatNumber: nil,
                section: nil,
                status: .active,
                usedAt: nil,
                createdAt: calendar.date(byAdding: .day, value: -5, to: today)!,
                ticketType: TicketType(
                    id: "tt-001",
                    name: "General",
                    description: "Acceso zona general",
                    price: 250000,
                    totalQuantity: 20000,
                    soldQuantity: 18500,
                    maxPerOrder: 6,
                    minPerOrder: 1,
                    section: nil,
                    color: "#4CAF50",
                    sortOrder: 1
                ),
                order: nil,
                event: Event.mockEvents[0]
            ),
            ClientTicket(
                id: "ticket-002",
                ticketTypeId: "tt-002",
                orderId: "order-001",
                userId: "user-001",
                safetixSecret: "HXDMVJECJJWSRB3H",
                seatRow: "A",
                seatNumber: "15",
                section: "VIP",
                status: .active,
                usedAt: nil,
                createdAt: calendar.date(byAdding: .day, value: -3, to: today)!,
                ticketType: TicketType(
                    id: "tt-005",
                    name: "Palco",
                    description: nil,
                    price: 350000,
                    totalQuantity: 4000,
                    soldQuantity: 3000,
                    maxPerOrder: 4,
                    minPerOrder: 1,
                    section: nil,
                    color: "#2196F3",
                    sortOrder: 2
                ),
                order: nil,
                event: Event.mockEvents[1]
            )
        ]
    }()
}
