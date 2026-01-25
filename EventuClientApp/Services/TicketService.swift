import Foundation
import CoreGraphics

@MainActor
class TicketService: ObservableObject {
    static let shared = TicketService()

    @Published var tickets: [ClientTicket] = []
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?

    private let safeTixService = SafeTixService.shared

    // Offline codes storage
    private var offlineCodes: [String: [Int64: String]] = [:] // ticketId: codes

    private init() {}

    // MARK: - Fetch Tickets

    func fetchMyTickets(userId: String) async {
        isLoading = true
        errorMessage = nil

        defer { isLoading = false }

        do {
            // Simulate network delay
            try await Task.sleep(nanoseconds: 800_000_000)

            // In production, this would fetch from Supabase
            // SELECT * FROM tickets WHERE userId = ? AND status IN ('ACTIVE', 'RESERVED')
            self.tickets = ClientTicket.mockTickets.filter { $0.userId == userId }
        } catch {
            errorMessage = "Error al cargar tus boletas"
        }
    }

    func getTicket(id: String) -> ClientTicket? {
        return tickets.first { $0.id == id }
    }

    // MARK: - QR Generation

    func generateQRPayload(for ticket: ClientTicket) -> String? {
        guard let secret = ticket.safetixSecret else { return nil }

        // Check if we have offline codes
        if let codes = offlineCodes[ticket.id] {
            return safeTixService.generateOfflineQRPayload(ticketId: ticket.id, codes: codes)
        }

        // Generate online
        return safeTixService.generateQRPayload(ticketId: ticket.id, secret: secret)
    }

    func generateQRImage(for ticket: ClientTicket, size: CGFloat = 200) -> CGImage? {
        guard let secret = ticket.safetixSecret else { return nil }
        return safeTixService.generateQRImage(ticketId: ticket.id, secret: secret, size: size)
    }

    // MARK: - Offline Mode

    func downloadTicketForOffline(ticket: ClientTicket) async throws {
        guard let secret = ticket.safetixSecret else {
            throw TicketError.noSecret
        }

        isLoading = true
        defer { isLoading = false }

        // Simulate processing time
        try await Task.sleep(nanoseconds: 500_000_000)

        // Pre-generate 24 hours of codes
        let codes = safeTixService.preGenerateOfflineCodes(secret: secret, hours: 24)
        offlineCodes[ticket.id] = codes

        // Save to UserDefaults (in production, use Keychain for security)
        saveOfflineCodes()
    }

    func isTicketAvailableOffline(_ ticketId: String) -> Bool {
        return offlineCodes[ticketId] != nil
    }

    func removeOfflineTicket(_ ticketId: String) {
        offlineCodes.removeValue(forKey: ticketId)
        saveOfflineCodes()
    }

    func getOfflineCodesExpiration(_ ticketId: String) -> Date? {
        guard let codes = offlineCodes[ticketId],
              let maxCounter = codes.keys.max() else { return nil }

        // Each counter represents 15 seconds
        let expirationTimestamp = TimeInterval(maxCounter) * 15
        return Date(timeIntervalSince1970: expirationTimestamp)
    }

    // MARK: - Time Remaining

    func secondsUntilNextCode() -> Double {
        return safeTixService.secondsRemaining()
    }

    func codeProgress() -> Double {
        return safeTixService.progressInCurrentPeriod()
    }

    // MARK: - Persistence

    private func saveOfflineCodes() {
        // Convert Int64 keys to String for JSON serialization
        var serializable: [String: [String: String]] = [:]
        for (ticketId, codes) in offlineCodes {
            var stringCodes: [String: String] = [:]
            for (counter, code) in codes {
                stringCodes[String(counter)] = code
            }
            serializable[ticketId] = stringCodes
        }

        if let data = try? JSONEncoder().encode(serializable) {
            UserDefaults.standard.set(data, forKey: "offline_ticket_codes")
        }
    }

    func loadOfflineCodes() {
        guard let data = UserDefaults.standard.data(forKey: "offline_ticket_codes"),
              let serializable = try? JSONDecoder().decode([String: [String: String]].self, from: data) else {
            return
        }

        // Convert back to Int64 keys
        for (ticketId, stringCodes) in serializable {
            var codes: [Int64: String] = [:]
            for (counterStr, code) in stringCodes {
                if let counter = Int64(counterStr) {
                    codes[counter] = code
                }
            }
            offlineCodes[ticketId] = codes
        }
    }
}

// MARK: - Ticket Errors

enum TicketError: LocalizedError {
    case noSecret
    case ticketNotFound
    case offlineNotAvailable

    var errorDescription: String? {
        switch self {
        case .noSecret:
            return "Esta boleta no tiene código de seguridad"
        case .ticketNotFound:
            return "Boleta no encontrada"
        case .offlineNotAvailable:
            return "Modo offline no disponible"
        }
    }
}
