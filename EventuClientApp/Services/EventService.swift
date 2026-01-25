import Foundation

@MainActor
class EventService: ObservableObject {
    static let shared = EventService()

    @Published var events: [Event] = []
    @Published var featuredEvents: [Event] = []
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?

    private init() {}

    // MARK: - Public Methods

    func fetchEvents(category: EventCategory? = nil, city: String? = nil) async {
        isLoading = true
        errorMessage = nil

        defer { isLoading = false }

        do {
            // Simulate network delay
            try await Task.sleep(nanoseconds: 800_000_000)

            // In production, this would fetch from Supabase
            var filteredEvents = Event.mockEvents

            // Filter by category
            if let category = category {
                filteredEvents = filteredEvents.filter { $0.category == category }
            }

            // Filter by city
            if let city = city, !city.isEmpty {
                filteredEvents = filteredEvents.filter {
                    $0.venue?.city.lowercased().contains(city.lowercased()) ?? false
                }
            }

            // Only show published events
            filteredEvents = filteredEvents.filter { $0.status == .published }

            self.events = filteredEvents
            self.featuredEvents = filteredEvents.filter { $0.isFeatured }
        } catch {
            errorMessage = "Error al cargar eventos"
        }
    }

    func fetchEventDetail(id: String) async -> Event? {
        isLoading = true
        errorMessage = nil

        defer { isLoading = false }

        do {
            // Simulate network delay
            try await Task.sleep(nanoseconds: 500_000_000)

            // In production, this would fetch from Supabase with relations
            return Event.mockEvents.first { $0.id == id }
        } catch {
            errorMessage = "Error al cargar el evento"
            return nil
        }
    }

    func searchEvents(query: String) async -> [Event] {
        guard !query.isEmpty else {
            return Event.mockEvents.filter { $0.status == .published }
        }

        do {
            // Simulate network delay
            try await Task.sleep(nanoseconds: 300_000_000)

            let lowercasedQuery = query.lowercased()
            return Event.mockEvents.filter { event in
                event.status == .published && (
                    event.name.lowercased().contains(lowercasedQuery) ||
                    event.venue?.name.lowercased().contains(lowercasedQuery) ?? false ||
                    event.venue?.city.lowercased().contains(lowercasedQuery) ?? false ||
                    event.tags?.contains { $0.lowercased().contains(lowercasedQuery) } ?? false
                )
            }
        } catch {
            return []
        }
    }

    // MARK: - Categories

    func getCategories() -> [EventCategory] {
        return EventCategory.allCases
    }

    // MARK: - Cities

    func getCities() -> [String] {
        // In production, this would come from a distinct query
        return ["Bogota", "Medellin", "Cali", "Barranquilla", "Cartagena"]
    }
}
