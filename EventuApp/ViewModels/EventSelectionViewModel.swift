import Foundation

@MainActor
class EventSelectionViewModel: ObservableObject {
    @Published var events: [ValidationEvent] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var selectedEvent: ValidationEvent?

    // Offline status per event
    @Published var offlineStatus: [String: OfflineCacheMetadata] = [:]

    // MARK: - Mock Mode Configuration
    private let useMockData = true

    init() {
        loadEvents()
    }

    // MARK: - Load Events

    func loadEvents() {
        isLoading = true
        errorMessage = nil

        Task {
            // Use mock data for testing
            if useMockData {
                try? await Task.sleep(nanoseconds: 300_000_000) // 0.3 seconds
                self.events = Self.mockEvents
                isLoading = false
                return
            }

            do {
                let fetchedEvents = try await fetchEventsFromAPI()
                self.events = fetchedEvents

                // Load offline status for each event
                await loadOfflineStatus()

            } catch {
                self.errorMessage = "Error cargando eventos: \(error.localizedDescription)"
            }

            isLoading = false
        }
    }

    // MARK: - Mock Events Data

    static let mockEvents: [ValidationEvent] = [
        ValidationEvent(
            id: "event-001",
            name: "Bad Bunny - Most Wanted Tour",
            date: Date(), // Today
            venueName: "Estadio El Campin",
            venueAddress: "Calle 57 #30-00, Bogota",
            imageUrl: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400",
            doorsOpenAt: Calendar.current.date(bySettingHour: 18, minute: 0, second: 0, of: Date()),
            totalCapacity: 45000,
            ticketTypes: [
                ValidationTicketType(id: "tt-001", name: "VIP Platino", totalQuantity: 500, soldQuantity: 485, section: "VIP", color: "#FFD700"),
                ValidationTicketType(id: "tt-002", name: "VIP Gold", totalQuantity: 1500, soldQuantity: 1420, section: "VIP", color: "#FFA500"),
                ValidationTicketType(id: "tt-003", name: "Platea", totalQuantity: 8000, soldQuantity: 7650, section: "Platea", color: "#4CAF50"),
                ValidationTicketType(id: "tt-004", name: "General", totalQuantity: 35000, soldQuantity: 32100, section: "General", color: "#2196F3")
            ]
        ),
        ValidationEvent(
            id: "event-002",
            name: "Karol G - Manana Sera Bonito",
            date: Calendar.current.date(byAdding: .day, value: 1, to: Date()) ?? Date(), // Tomorrow
            venueName: "Movistar Arena",
            venueAddress: "Calle 63 #59A-06, Bogota",
            imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
            doorsOpenAt: Calendar.current.date(bySettingHour: 19, minute: 0, second: 0, of: Date()),
            totalCapacity: 14000,
            ticketTypes: [
                ValidationTicketType(id: "tt-005", name: "Diamante", totalQuantity: 200, soldQuantity: 200, section: "VIP", color: "#E91E63"),
                ValidationTicketType(id: "tt-006", name: "Oro", totalQuantity: 800, soldQuantity: 780, section: "Preferencial", color: "#FF9800"),
                ValidationTicketType(id: "tt-007", name: "Plata", totalQuantity: 3000, soldQuantity: 2850, section: "Platea", color: "#9E9E9E"),
                ValidationTicketType(id: "tt-008", name: "General", totalQuantity: 10000, soldQuantity: 9200, section: "General", color: "#673AB7")
            ]
        ),
        ValidationEvent(
            id: "event-003",
            name: "Coldplay - Music of the Spheres",
            date: Calendar.current.date(byAdding: .day, value: 3, to: Date()) ?? Date(),
            venueName: "Estadio El Campin",
            venueAddress: "Calle 57 #30-00, Bogota",
            imageUrl: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400",
            doorsOpenAt: Calendar.current.date(bySettingHour: 17, minute: 30, second: 0, of: Date()),
            totalCapacity: 50000,
            ticketTypes: [
                ValidationTicketType(id: "tt-009", name: "Infinity", totalQuantity: 300, soldQuantity: 300, section: "VIP", color: "#00BCD4"),
                ValidationTicketType(id: "tt-010", name: "Cancha VIP", totalQuantity: 5000, soldQuantity: 4800, section: "Cancha", color: "#8BC34A"),
                ValidationTicketType(id: "tt-011", name: "Cancha General", totalQuantity: 15000, soldQuantity: 14500, section: "Cancha", color: "#CDDC39"),
                ValidationTicketType(id: "tt-012", name: "Tribuna", totalQuantity: 29700, soldQuantity: 28000, section: "Tribuna", color: "#03A9F4")
            ]
        )
    ]

    private func fetchEventsFromAPI() async throws -> [ValidationEvent] {
        let url = URL(string: "\(AppConstants.baseURL)\(AppConstants.Endpoints.coordinatorEvents)")!

        let session = try await SupabaseManager.shared.client.auth.session
        var request = URLRequest(url: url)
        request.setValue("Bearer \(session.accessToken)", forHTTPHeaderField: "Authorization")

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw EventSelectionError.serverError
        }

        struct APIResponse: Codable {
            let events: [APIEvent]

            struct APIEvent: Codable {
                let id: String
                let name: String
                let date: String
                let venueName: String
                let venueAddress: String
                let imageUrl: String?
                let doorsOpenAt: String?
                let totalCapacity: Int
                let ticketTypes: [APITicketType]

                struct APITicketType: Codable {
                    let id: String
                    let name: String
                    let totalQuantity: Int
                    let soldQuantity: Int
                    let section: String?
                    let color: String?
                }
            }
        }

        let decoder = JSONDecoder()
        let apiResponse = try decoder.decode(APIResponse.self, from: data)

        let dateFormatter = ISO8601DateFormatter()
        dateFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]

        return apiResponse.events.map { event in
            ValidationEvent(
                id: event.id,
                name: event.name,
                date: dateFormatter.date(from: event.date) ?? Date(),
                venueName: event.venueName,
                venueAddress: event.venueAddress,
                imageUrl: event.imageUrl,
                doorsOpenAt: event.doorsOpenAt.flatMap { dateFormatter.date(from: $0) },
                totalCapacity: event.totalCapacity,
                ticketTypes: event.ticketTypes.map { type in
                    ValidationTicketType(
                        id: type.id,
                        name: type.name,
                        totalQuantity: type.totalQuantity,
                        soldQuantity: type.soldQuantity,
                        section: type.section,
                        color: type.color
                    )
                }
            )
        }
    }

    // MARK: - Offline Status

    private func loadOfflineStatus() async {
        for event in events {
            if let metadata = await OfflineCacheService.shared.getMetadata(forEvent: event.id) {
                offlineStatus[event.id] = metadata
            }
        }
    }

    func hasOfflineCache(for eventId: String) -> Bool {
        guard let metadata = offlineStatus[eventId] else { return false }
        return !metadata.isExpired
    }

    func offlineTicketCount(for eventId: String) -> Int {
        offlineStatus[eventId]?.ticketCount ?? 0
    }

    // MARK: - Download Offline

    func downloadOfflineData(for event: ValidationEvent) async {
        do {
            let count = try await OfflineCacheService.shared.downloadTicketsForEvent(event.id, eventName: event.name)

            // Update offline status
            if let metadata = await OfflineCacheService.shared.getMetadata(forEvent: event.id) {
                offlineStatus[event.id] = metadata
            }

            print("Downloaded \(count) tickets for offline use")

        } catch {
            errorMessage = "Error descargando datos offline: \(error.localizedDescription)"
        }
    }

    // MARK: - Select Event

    func selectEvent(_ event: ValidationEvent) {
        selectedEvent = event
        AppState.shared.selectEvent(event)

        // Save last selected event
        UserDefaults.standard.set(event.id, forKey: AppConstants.StorageKeys.lastSelectedEventId)
    }

    // MARK: - Filtered Events

    var todayEvents: [ValidationEvent] {
        events.filter { $0.isToday }
    }

    var upcomingEvents: [ValidationEvent] {
        events.filter { !$0.isToday && $0.date > Date() }
    }
}

// MARK: - Errors

enum EventSelectionError: Error, LocalizedError {
    case serverError
    case noEvents
    case unauthorized

    var errorDescription: String? {
        switch self {
        case .serverError: return "Error del servidor"
        case .noEvents: return "No hay eventos asignados"
        case .unauthorized: return "Sesion expirada"
        }
    }
}
