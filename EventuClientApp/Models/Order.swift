import Foundation

// MARK: - Order

struct Order: Codable, Identifiable {
    let id: String
    let orderNumber: String
    let userId: String
    let eventId: String
    let subtotal: Int
    let feesTotal: Int
    let taxesTotal: Int
    let discountTotal: Int
    let total: Int
    let status: OrderStatus
    let paymentMethod: PaymentMethod?
    let paymentId: String?
    let paidAt: Date?
    let presaleId: String?
    let discountCode: String?
    let lockExpiresAt: Date?
    let createdAt: Date

    // Relations
    var items: [OrderItem]?
    var tickets: [ClientTicket]?
    var event: Event?

    // MARK: - Computed Properties

    var isLocked: Bool {
        guard let lockExpires = lockExpiresAt else { return false }
        return lockExpires > Date()
    }

    var isPaid: Bool {
        status == .completed
    }

    var formattedTotal: String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = "COP"
        formatter.maximumFractionDigits = 0
        return formatter.string(from: NSNumber(value: total)) ?? "$\(total)"
    }

    var formattedDate: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "d MMM yyyy, h:mm a"
        formatter.locale = Locale(identifier: "es_CO")
        return formatter.string(from: createdAt)
    }
}

// MARK: - Order Status

enum OrderStatus: String, Codable {
    case pending = "PENDING"
    case processing = "PROCESSING"
    case completed = "COMPLETED"
    case cancelled = "CANCELLED"
    case refunded = "REFUNDED"
    case expired = "EXPIRED"

    var displayName: String {
        switch self {
        case .pending: return "Pendiente"
        case .processing: return "Procesando"
        case .completed: return "Completada"
        case .cancelled: return "Cancelada"
        case .refunded: return "Reembolsada"
        case .expired: return "Expirada"
        }
    }

    var color: String {
        switch self {
        case .pending: return "#FF9500"
        case .processing: return "#007AFF"
        case .completed: return "#34C759"
        case .cancelled, .expired: return "#FF3B30"
        case .refunded: return "#86868B"
        }
    }
}

// MARK: - Order Item

struct OrderItem: Codable, Identifiable {
    let id: String
    let orderId: String
    let ticketTypeId: String
    let quantity: Int
    let unitPrice: Int
    let totalPrice: Int

    var ticketType: TicketType?

    var formattedUnitPrice: String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = "COP"
        formatter.maximumFractionDigits = 0
        return formatter.string(from: NSNumber(value: unitPrice)) ?? "$\(unitPrice)"
    }
}

// MARK: - Payment Method

enum PaymentMethod: String, Codable, CaseIterable {
    case nequi = "NEQUI"
    case mercadopago = "MERCADOPAGO"
    case pse = "PSE"
    case creditCard = "CREDIT_CARD"
    case efecty = "EFECTY"
    case daviplata = "DAVIPLATA"

    var displayName: String {
        switch self {
        case .nequi: return "Nequi"
        case .mercadopago: return "MercadoPago"
        case .pse: return "PSE"
        case .creditCard: return "Tarjeta de Credito"
        case .efecty: return "Efecty"
        case .daviplata: return "Daviplata"
        }
    }

    var icon: String {
        switch self {
        case .nequi: return "n.circle.fill"
        case .mercadopago: return "creditcard.fill"
        case .pse: return "building.columns.fill"
        case .creditCard: return "creditcard"
        case .efecty: return "banknote.fill"
        case .daviplata: return "d.circle.fill"
        }
    }

    var color: String {
        switch self {
        case .nequi: return "#E91E63"
        case .mercadopago: return "#009EE3"
        case .pse: return "#002D72"
        case .creditCard: return "#1D1D1F"
        case .efecty: return "#FFDD00"
        case .daviplata: return "#ED1C24"
        }
    }
}
