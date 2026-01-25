import Foundation
import MapKit

@MainActor
class EventDetailViewModel: ObservableObject {
    @Published var event: Event?
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?

    // Ticket selection
    @Published var selectedTickets: [String: Int] = [:] // ticketTypeId: quantity

    private let eventService = EventService.shared

    // MARK: - Load Event

    func loadEvent(id: String) async {
        isLoading = true
        errorMessage = nil

        event = await eventService.fetchEventDetail(id: id)
        errorMessage = eventService.errorMessage
        isLoading = false

        // Initialize ticket selections
        if let types = event?.ticketTypes {
            for type in types {
                selectedTickets[type.id] = 0
            }
        }
    }

    // MARK: - Ticket Selection

    func incrementTicket(typeId: String) {
        guard let type = event?.ticketTypes?.first(where: { $0.id == typeId }) else { return }
        let current = selectedTickets[typeId] ?? 0
        let max = type.maxPerOrder ?? 10
        let available = type.available

        if current < min(max, available) {
            selectedTickets[typeId] = current + 1
        }
    }

    func decrementTicket(typeId: String) {
        let current = selectedTickets[typeId] ?? 0
        if current > 0 {
            selectedTickets[typeId] = current - 1
        }
    }

    func getSelectedQuantity(for typeId: String) -> Int {
        return selectedTickets[typeId] ?? 0
    }

    // MARK: - Cart

    var cartItems: [CartItem] {
        guard let types = event?.ticketTypes else { return [] }

        return types.compactMap { type in
            let quantity = selectedTickets[type.id] ?? 0
            guard quantity > 0 else { return nil }
            return CartItem(ticketType: type, quantity: quantity)
        }
    }

    var totalTickets: Int {
        selectedTickets.values.reduce(0, +)
    }

    var subtotal: Int {
        guard let types = event?.ticketTypes else { return 0 }

        return types.reduce(0) { sum, type in
            let quantity = selectedTickets[type.id] ?? 0
            return sum + (type.price * quantity)
        }
    }

    var canAddToCart: Bool {
        totalTickets > 0
    }

    func clearSelection() {
        for key in selectedTickets.keys {
            selectedTickets[key] = 0
        }
    }

    // MARK: - Map

    var venueRegion: MKCoordinateRegion? {
        guard let venue = event?.venue,
              let lat = venue.latitude,
              let lon = venue.longitude else { return nil }

        return MKCoordinateRegion(
            center: CLLocationCoordinate2D(latitude: lat, longitude: lon),
            span: MKCoordinateSpan(latitudeDelta: 0.01, longitudeDelta: 0.01)
        )
    }

    var venueAnnotation: VenueAnnotation? {
        guard let venue = event?.venue,
              let lat = venue.latitude,
              let lon = venue.longitude else { return nil }

        return VenueAnnotation(
            name: venue.name,
            coordinate: CLLocationCoordinate2D(latitude: lat, longitude: lon)
        )
    }
}

// MARK: - Venue Annotation

struct VenueAnnotation: Identifiable {
    let id = UUID()
    let name: String
    let coordinate: CLLocationCoordinate2D
}
