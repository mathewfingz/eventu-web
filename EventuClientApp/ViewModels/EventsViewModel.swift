import Foundation

@MainActor
class EventsViewModel: ObservableObject {
    @Published var events: [Event] = []
    @Published var featuredEvents: [Event] = []
    @Published var searchResults: [Event] = []
    @Published var isLoading: Bool = false
    @Published var isSearching: Bool = false
    @Published var errorMessage: String?

    @Published var searchQuery: String = ""
    @Published var selectedCategory: EventCategory?
    @Published var selectedCity: String?

    private let eventService = EventService.shared

    // MARK: - Load Events

    func loadEvents() async {
        isLoading = true
        errorMessage = nil

        await eventService.fetchEvents(category: selectedCategory, city: selectedCity)

        self.events = eventService.events
        self.featuredEvents = eventService.featuredEvents
        self.errorMessage = eventService.errorMessage
        self.isLoading = false
    }

    // MARK: - Search

    func search() async {
        guard !searchQuery.isEmpty else {
            searchResults = []
            return
        }

        isSearching = true
        searchResults = await eventService.searchEvents(query: searchQuery)
        isSearching = false
    }

    func clearSearch() {
        searchQuery = ""
        searchResults = []
    }

    // MARK: - Filters

    func applyFilters() async {
        await loadEvents()
    }

    func clearFilters() async {
        selectedCategory = nil
        selectedCity = nil
        await loadEvents()
    }

    // MARK: - Categories & Cities

    var categories: [EventCategory] {
        EventCategory.allCases
    }

    var cities: [String] {
        eventService.getCities()
    }

    // MARK: - Helpers

    var hasActiveFilters: Bool {
        selectedCategory != nil || selectedCity != nil
    }

    var displayEvents: [Event] {
        if !searchQuery.isEmpty {
            return searchResults
        }
        return events
    }
}
