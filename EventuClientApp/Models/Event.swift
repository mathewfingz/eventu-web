import Foundation

// MARK: - Event

struct Event: Codable, Identifiable, Hashable {
    let id: String
    let name: String
    let slug: String
    let description: String?
    let category: EventCategory
    let date: Date
    let doorsOpenAt: Date?
    let endsAt: Date?
    let imageUrl: String?
    let coverUrl: String?
    let priceFrom: Int
    let priceTo: Int?
    let status: EventStatus
    let isFeatured: Bool
    let ageRestriction: Int?
    let tags: [String]?

    // Relations
    var venue: Venue?
    var ticketTypes: [TicketType]?
    var promoter: Promoter?

    // MARK: - Computed Properties

    var isAvailable: Bool {
        status == .published && date > Date()
    }

    var availability: StatusBadge.EventAvailability {
        switch status {
        case .soldOut:
            return .soldOut
        case .published:
            if let types = ticketTypes {
                let totalAvailable = types.reduce(0) { $0 + $1.available }
                if totalAvailable < 50 {
                    return .lastTickets
                }
            }
            return .available
        case .draft, .pendingApproval:
            return .comingSoon
        default:
            return .soldOut
        }
    }

    var formattedDate: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "EEE d MMM"
        formatter.locale = Locale(identifier: "es_CO")
        return formatter.string(from: date).capitalized
    }

    var formattedTime: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "h:mm a"
        return formatter.string(from: date)
    }

    var formattedFullDate: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "EEEE d 'de' MMMM, yyyy"
        formatter.locale = Locale(identifier: "es_CO")
        return formatter.string(from: date).capitalized
    }

    var displayImage: String {
        coverUrl ?? imageUrl ?? ""
    }

    // Hashable
    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }

    static func == (lhs: Event, rhs: Event) -> Bool {
        lhs.id == rhs.id
    }
}

// MARK: - Event Category

enum EventCategory: String, Codable, CaseIterable {
    case concert = "CONCERT"
    case festival = "FESTIVAL"
    case theater = "THEATER"
    case standup = "STANDUP"
    case sports = "SPORTS"
    case party = "PARTY"
    case other = "OTHER"

    var displayName: String {
        switch self {
        case .concert: return "Conciertos"
        case .festival: return "Festivales"
        case .theater: return "Teatro"
        case .standup: return "Stand Up"
        case .sports: return "Deportes"
        case .party: return "Fiestas"
        case .other: return "Otros"
        }
    }

    var icon: String {
        switch self {
        case .concert: return "music.mic"
        case .festival: return "sparkles"
        case .theater: return "theatermasks"
        case .standup: return "face.smiling"
        case .sports: return "sportscourt"
        case .party: return "party.popper"
        case .other: return "star"
        }
    }
}

// MARK: - Event Status

enum EventStatus: String, Codable {
    case draft = "DRAFT"
    case pendingApproval = "PENDING_APPROVAL"
    case approved = "APPROVED"
    case published = "PUBLISHED"
    case soldOut = "SOLD_OUT"
    case cancelled = "CANCELLED"
    case completed = "COMPLETED"
}

// MARK: - Venue

struct Venue: Codable, Identifiable, Hashable {
    let id: String
    let name: String
    let address: String
    let city: String
    let imageUrl: String?
    let latitude: Double?
    let longitude: Double?
    let capacity: Int?

    var fullAddress: String {
        "\(address), \(city)"
    }

    var hasCoordinates: Bool {
        latitude != nil && longitude != nil
    }
}

// MARK: - Promoter

struct Promoter: Codable, Identifiable {
    let id: String
    let name: String?
    let businessName: String?
    let image: String?

    var displayName: String {
        businessName ?? name ?? "Organizador"
    }
}

// MARK: - Ticket Type

struct TicketType: Codable, Identifiable, Hashable {
    let id: String
    let name: String
    let description: String?
    let price: Int
    let totalQuantity: Int
    let soldQuantity: Int
    let maxPerOrder: Int?
    let minPerOrder: Int?
    let section: String?
    let color: String?
    let sortOrder: Int?

    var available: Int {
        max(0, totalQuantity - soldQuantity)
    }

    var isAvailable: Bool {
        available > 0
    }

    var isSoldOut: Bool {
        available == 0
    }

    var isLowStock: Bool {
        available > 0 && available < 50
    }

    var formattedPrice: String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = "COP"
        formatter.maximumFractionDigits = 0
        return formatter.string(from: NSNumber(value: price)) ?? "$\(price)"
    }
}

// MARK: - Mock Data

extension Event {
    static let mockEvents: [Event] = {
        let calendar = Calendar.current
        let today = Date()

        return [
            Event(
                id: "event-001",
                name: "Bad Bunny - Most Wanted Tour",
                slug: "bad-bunny-most-wanted-tour",
                description: "El conejo malo regresa a Colombia con su tour mas esperado.",
                category: .concert,
                date: calendar.date(byAdding: .day, value: 7, to: today)!,
                doorsOpenAt: nil,
                endsAt: nil,
                imageUrl: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800",
                coverUrl: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1200",
                priceFrom: 250000,
                priceTo: 850000,
                status: .published,
                isFeatured: true,
                ageRestriction: 18,
                tags: ["reggaeton", "urbano"],
                venue: Venue(
                    id: "venue-001",
                    name: "Estadio El Campin",
                    address: "Calle 57 # 30-00",
                    city: "Bogota",
                    imageUrl: nil,
                    latitude: 4.6473,
                    longitude: -74.0776,
                    capacity: 45000
                ),
                ticketTypes: [
                    TicketType(id: "tt-001", name: "General", description: "Acceso zona general", price: 250000, totalQuantity: 20000, soldQuantity: 18500, maxPerOrder: 6, minPerOrder: 1, section: nil, color: "#4CAF50", sortOrder: 1),
                    TicketType(id: "tt-002", name: "Preferencial", description: "Mejor vista al escenario", price: 450000, totalQuantity: 10000, soldQuantity: 9800, maxPerOrder: 4, minPerOrder: 1, section: nil, color: "#2196F3", sortOrder: 2),
                    TicketType(id: "tt-003", name: "VIP", description: "Acceso VIP con barra libre", price: 850000, totalQuantity: 2000, soldQuantity: 1500, maxPerOrder: 2, minPerOrder: 1, section: nil, color: "#9C27B0", sortOrder: 3)
                ],
                promoter: Promoter(id: "p-001", name: nil, businessName: "Ocesa Colombia", image: nil)
            ),
            Event(
                id: "event-002",
                name: "Karol G - Manana Sera Bonito",
                slug: "karol-g-manana-sera-bonito",
                description: "La Bichota llega con su gira mundial.",
                category: .concert,
                date: calendar.date(byAdding: .day, value: 14, to: today)!,
                doorsOpenAt: nil,
                endsAt: nil,
                imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
                coverUrl: nil,
                priceFrom: 180000,
                priceTo: 650000,
                status: .published,
                isFeatured: true,
                ageRestriction: nil,
                tags: ["reggaeton", "pop"],
                venue: Venue(
                    id: "venue-002",
                    name: "Movistar Arena",
                    address: "Calle 63 # 59A-06",
                    city: "Bogota",
                    imageUrl: nil,
                    latitude: 4.6584,
                    longitude: -74.0933,
                    capacity: 14000
                ),
                ticketTypes: [
                    TicketType(id: "tt-004", name: "Platea", description: nil, price: 180000, totalQuantity: 8000, soldQuantity: 5000, maxPerOrder: 6, minPerOrder: 1, section: nil, color: "#4CAF50", sortOrder: 1),
                    TicketType(id: "tt-005", name: "Palco", description: nil, price: 350000, totalQuantity: 4000, soldQuantity: 3000, maxPerOrder: 4, minPerOrder: 1, section: nil, color: "#2196F3", sortOrder: 2)
                ],
                promoter: nil
            ),
            Event(
                id: "event-003",
                name: "Coldplay - Music of the Spheres",
                slug: "coldplay-music-spheres",
                description: "La banda britanica presenta su espectacular show lleno de luces y colores.",
                category: .concert,
                date: calendar.date(byAdding: .day, value: 30, to: today)!,
                doorsOpenAt: nil,
                endsAt: nil,
                imageUrl: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800",
                coverUrl: nil,
                priceFrom: 300000,
                priceTo: 1200000,
                status: .published,
                isFeatured: false,
                ageRestriction: nil,
                tags: ["rock", "pop", "internacional"],
                venue: Venue(
                    id: "venue-001",
                    name: "Estadio El Campin",
                    address: "Calle 57 # 30-00",
                    city: "Bogota",
                    imageUrl: nil,
                    latitude: 4.6473,
                    longitude: -74.0776,
                    capacity: 50000
                ),
                ticketTypes: [
                    TicketType(id: "tt-006", name: "General", description: nil, price: 300000, totalQuantity: 25000, soldQuantity: 10000, maxPerOrder: 6, minPerOrder: 1, section: nil, color: "#4CAF50", sortOrder: 1),
                    TicketType(id: "tt-007", name: "VIP", description: nil, price: 1200000, totalQuantity: 3000, soldQuantity: 2900, maxPerOrder: 2, minPerOrder: 1, section: nil, color: "#9C27B0", sortOrder: 2)
                ],
                promoter: nil
            )
        ]
    }()
}
