import Foundation

enum UserRole: String, Codable {
    case superadmin = "SUPERADMIN"
    case coordinator = "COORDINATOR"
    case promoter = "PROMOTER"
    case venue = "VENUE"
    case client = "CLIENT"
}

struct User: Codable, Identifiable {
    let id: String
    let email: String
    let name: String?
    let role: UserRole
    let image: String?
    let businessName: String?
    
    enum CodingKeys: String, CodingKey {
        case id, email, name, role, image
        case businessName
    }
}

enum EventCategory: String, Codable {
    case concert = "CONCERT"
    case festival = "FESTIVAL"
    case theater = "THEATER"
    case standup = "STANDUP"
    case sports = "SPORTS"
    case party = "PARTY"
    case other = "OTHER"
}

enum EventStatus: String, Codable {
    case draft = "DRAFT"
    case pendingApproval = "PENDING_APPROVAL"
    case approved = "APPROVED"
    case published = "PUBLISHED"
    case soldOut = "SOLD_OUT"
    case cancelled = "CANCELLED"
    case completed = "COMPLETED"
}

struct Venue: Codable, Identifiable {
    let id: String
    let name: String
    let address: String
    let city: String
    let imageUrl: String?
}

struct Event: Codable, Identifiable {
    let id: String
    let name: String
    let slug: String
    let venueId: String
    let category: EventCategory
    let date: Date
    let imageUrl: String?
    let priceFrom: Int
    let status: EventStatus
    
    // Relationship (if fetched via select)
    var venue: Venue?
}

struct TicketType: Codable, Identifiable {
    let id: String
    let name: String
    let price: Int
    let eventId: String
}

struct Ticket: Codable, Identifiable {
    let id: String
    let userId: String
    let ticketTypeId: String
    let safetixSecret: String?
    let status: TicketStatus
    let seatRow: String?
    let seatNumber: String?
    
    var ticketType: TicketType?
    var event: Event?
}

enum TicketStatus: String, Codable {
    case reserved = "RESERVED"
    case active = "ACTIVE"
    case used = "USED"
    case cancelled = "CANCELLED"
    case transferred = "TRANSFERRED"
}
