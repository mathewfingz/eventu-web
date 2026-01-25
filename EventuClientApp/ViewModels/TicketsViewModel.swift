import Foundation

@MainActor
class TicketsViewModel: ObservableObject {
    @Published var tickets: [ClientTicket] = []
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?

    private let ticketService = TicketService.shared

    // MARK: - Load Tickets

    func loadTickets(userId: String) async {
        isLoading = true
        errorMessage = nil

        await ticketService.fetchMyTickets(userId: userId)

        self.tickets = ticketService.tickets
        self.errorMessage = ticketService.errorMessage
        self.isLoading = false
    }

    func refreshTickets(userId: String) async {
        await ticketService.fetchMyTickets(userId: userId)
        self.tickets = ticketService.tickets
    }

    // MARK: - Filtered Tickets

    var activeTickets: [ClientTicket] {
        tickets.filter { $0.status == .active }
    }

    var upcomingTickets: [ClientTicket] {
        tickets.filter { ticket in
            ticket.status == .active &&
            (ticket.event?.date ?? Date()) > Date()
        }.sorted { ($0.event?.date ?? Date()) < ($1.event?.date ?? Date()) }
    }

    var pastTickets: [ClientTicket] {
        tickets.filter { ticket in
            ticket.status == .used ||
            (ticket.event?.date ?? Date()) < Date()
        }
    }

    // MARK: - Helpers

    var hasTickets: Bool {
        !tickets.isEmpty
    }

    var hasUpcomingTickets: Bool {
        !upcomingTickets.isEmpty
    }
}
