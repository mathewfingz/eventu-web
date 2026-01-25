import Foundation

@MainActor
class DashboardViewModel: ObservableObject {
    @Published var stats: RealtimeStats?
    @Published var isLoading = false
    @Published var isConnected = false
    @Published var errorMessage: String?

    private let realtimeService = RealtimeService.shared
    private var eventId: String?

    // MARK: - Mock Mode Configuration
    private let useMockData = true
    private var mockUpdateTask: Task<Void, Never>?

    init() {
        // Observe realtime service
        setupObservers()
    }

    private func setupObservers() {
        // In a real implementation, we'd use Combine to observe RealtimeService
        // For simplicity, we'll manually sync
    }

    // MARK: - Connection

    func connect(eventId: String) {
        self.eventId = eventId
        isLoading = true

        if useMockData {
            connectMock(eventId: eventId)
            return
        }

        realtimeService.connect(eventId: eventId)

        // Start observing
        Task {
            while eventId == self.eventId {
                await syncWithService()
                try? await Task.sleep(nanoseconds: 1_000_000_000) // 1 second
            }
        }
    }

    func disconnect() {
        eventId = nil
        mockUpdateTask?.cancel()
        mockUpdateTask = nil
        realtimeService.disconnect()
        stats = nil
        isConnected = false
    }

    private func syncWithService() async {
        self.stats = realtimeService.stats
        self.isConnected = realtimeService.connectionState.isConnected
        self.errorMessage = realtimeService.lastError
        self.isLoading = false
    }

    // MARK: - Mock Data

    private func connectMock(eventId: String) {
        isConnected = true
        isLoading = false

        // Generate initial mock stats
        stats = generateMockStats(eventId: eventId)

        // Simulate real-time updates every 3 seconds
        mockUpdateTask = Task {
            while !Task.isCancelled && self.eventId == eventId {
                try? await Task.sleep(nanoseconds: 3_000_000_000) // 3 seconds
                if !Task.isCancelled {
                    await MainActor.run {
                        self.updateMockStats()
                    }
                }
            }
        }
    }

    private func generateMockStats(eventId: String) -> RealtimeStats {
        let ticketTypes: [TicketTypeStats]
        let totalSold: Int
        var totalProcessed: Int

        // Different stats based on event
        switch eventId {
        case "event-001": // Bad Bunny - Today's event
            totalSold = 41655
            totalProcessed = 28450
            ticketTypes = [
                TicketTypeStats(id: "tt-001", name: "VIP Platino", sold: 485, processed: 480, color: "#FFD700"),
                TicketTypeStats(id: "tt-002", name: "VIP Gold", sold: 1420, processed: 1350, color: "#FFA500"),
                TicketTypeStats(id: "tt-003", name: "Platea", sold: 7650, processed: 6200, color: "#4CAF50"),
                TicketTypeStats(id: "tt-004", name: "General", sold: 32100, processed: 20420, color: "#2196F3")
            ]
        case "event-002": // Karol G
            totalSold = 13030
            totalProcessed = 0
            ticketTypes = [
                TicketTypeStats(id: "tt-005", name: "Diamante", sold: 200, processed: 0, color: "#E91E63"),
                TicketTypeStats(id: "tt-006", name: "Oro", sold: 780, processed: 0, color: "#FF9800"),
                TicketTypeStats(id: "tt-007", name: "Plata", sold: 2850, processed: 0, color: "#9E9E9E"),
                TicketTypeStats(id: "tt-008", name: "General", sold: 9200, processed: 0, color: "#673AB7")
            ]
        default: // Coldplay
            totalSold = 47600
            totalProcessed = 0
            ticketTypes = [
                TicketTypeStats(id: "tt-009", name: "Infinity", sold: 300, processed: 0, color: "#00BCD4"),
                TicketTypeStats(id: "tt-010", name: "Cancha VIP", sold: 4800, processed: 0, color: "#8BC34A"),
                TicketTypeStats(id: "tt-011", name: "Cancha General", sold: 14500, processed: 0, color: "#CDDC39"),
                TicketTypeStats(id: "tt-012", name: "Tribuna", sold: 28000, processed: 0, color: "#03A9F4")
            ]
        }

        let validators = [
            ValidatorStatus(id: "v-001", name: "Carlos Rodriguez", email: "carlos@eventu.co", validationsCount: 342, lastValidationAt: Date().addingTimeInterval(-30), isActive: true, deviceInfo: "iPhone 15 Pro"),
            ValidatorStatus(id: "v-002", name: "Ana Martinez", email: "ana@eventu.co", validationsCount: 289, lastValidationAt: Date().addingTimeInterval(-45), isActive: true, deviceInfo: "iPhone 14"),
            ValidatorStatus(id: "v-003", name: "Pedro Gomez", email: "pedro@eventu.co", validationsCount: 256, lastValidationAt: Date().addingTimeInterval(-120), isActive: true, deviceInfo: "iPhone 13"),
            ValidatorStatus(id: "v-004", name: "Laura Sanchez", email: "laura@eventu.co", validationsCount: 198, lastValidationAt: Date().addingTimeInterval(-180), isActive: true, deviceInfo: "iPhone 15"),
            ValidatorStatus(id: "v-005", name: "Miguel Torres", email: "miguel@eventu.co", validationsCount: 87, lastValidationAt: Date().addingTimeInterval(-600), isActive: false, deviceInfo: "iPhone 12")
        ]

        let capacityAlerts = ticketTypes.compactMap { type -> CapacityAlert? in
            let percentage = Double(type.processed) / Double(type.sold) * 100
            if percentage >= 100 {
                return CapacityAlert(id: "alert-\(type.id)", ticketTypeId: type.id, ticketTypeName: type.name, currentCount: type.processed, maxCapacity: type.sold, alertLevel: .full, message: "\(type.name) al 100%")
            } else if percentage >= 95 {
                return CapacityAlert(id: "alert-\(type.id)", ticketTypeId: type.id, ticketTypeName: type.name, currentCount: type.processed, maxCapacity: type.sold, alertLevel: .critical, message: "\(type.name) al \(Int(percentage))%")
            } else if percentage >= 80 {
                return CapacityAlert(id: "alert-\(type.id)", ticketTypeId: type.id, ticketTypeName: type.name, currentCount: type.processed, maxCapacity: type.sold, alertLevel: .warning, message: "\(type.name) al \(Int(percentage))%")
            }
            return nil
        }

        let hourlyBreakdown = [
            HourlyEntry(hour: "18:00", count: 2500, rate: 41.7),
            HourlyEntry(hour: "19:00", count: 8200, rate: 136.7),
            HourlyEntry(hour: "20:00", count: 12400, rate: 206.7),
            HourlyEntry(hour: "21:00", count: 5350, rate: 89.2)
        ]

        return RealtimeStats(
            eventId: eventId,
            totalSold: totalSold,
            totalProcessed: totalProcessed,
            processingRate: 45.2,
            byTicketType: ticketTypes,
            hourlyBreakdown: hourlyBreakdown,
            activeValidators: validators,
            capacityAlerts: capacityAlerts,
            lastUpdated: Date()
        )
    }

    private func updateMockStats() {
        guard var currentStats = stats else { return }

        // Simulate entries coming in
        let newEntries = Int.random(in: 5...25)
        currentStats.totalProcessed += newEntries
        currentStats.processingRate = Double.random(in: 30...60)
        currentStats.lastUpdated = Date()

        // Update ticket type stats randomly
        if !currentStats.byTicketType.isEmpty {
            let randomIndex = Int.random(in: 0..<currentStats.byTicketType.count)
            let remaining = currentStats.byTicketType[randomIndex].sold - currentStats.byTicketType[randomIndex].processed
            if remaining > 0 {
                let increment = min(newEntries, remaining)
                currentStats.byTicketType[randomIndex].processed += increment
            }
        }

        // Update validator counts
        for i in 0..<currentStats.activeValidators.count {
            if currentStats.activeValidators[i].isActive {
                currentStats.activeValidators[i].validationsCount += Int.random(in: 0...3)
                currentStats.activeValidators[i].lastValidationAt = Date().addingTimeInterval(Double.random(in: -60...0))
            }
        }

        // Recalculate capacity alerts
        currentStats.capacityAlerts = currentStats.byTicketType.compactMap { type -> CapacityAlert? in
            let percentage = Double(type.processed) / Double(type.sold) * 100
            if percentage >= 100 {
                return CapacityAlert(id: "alert-\(type.id)", ticketTypeId: type.id, ticketTypeName: type.name, currentCount: type.processed, maxCapacity: type.sold, alertLevel: .full, message: "\(type.name) al 100%")
            } else if percentage >= 95 {
                return CapacityAlert(id: "alert-\(type.id)", ticketTypeId: type.id, ticketTypeName: type.name, currentCount: type.processed, maxCapacity: type.sold, alertLevel: .critical, message: "\(type.name) al \(Int(percentage))%")
            } else if percentage >= 80 {
                return CapacityAlert(id: "alert-\(type.id)", ticketTypeId: type.id, ticketTypeName: type.name, currentCount: type.processed, maxCapacity: type.sold, alertLevel: .warning, message: "\(type.name) al \(Int(percentage))%")
            }
            return nil
        }

        stats = currentStats
    }

    // MARK: - Refresh

    func refresh() async {
        isLoading = true
        await realtimeService.refresh()
        await syncWithService()
        isLoading = false
    }

    // MARK: - Computed Properties

    var processedPercentage: Double {
        stats?.processedPercentage ?? 0
    }

    var remainingEntries: Int {
        stats?.remainingEntries ?? 0
    }

    var processingRate: String {
        stats?.formattedProcessingRate ?? "0"
    }

    var activeValidatorCount: Int {
        stats?.activeValidators.filter { $0.isActive }.count ?? 0
    }

    var hasCapacityAlerts: Bool {
        !(stats?.capacityAlerts.isEmpty ?? true)
    }

    var criticalAlerts: [CapacityAlert] {
        stats?.capacityAlerts.filter { $0.alertLevel == .critical || $0.alertLevel == .full } ?? []
    }

    // MARK: - Formatted Stats

    var totalSoldFormatted: String {
        guard let total = stats?.totalSold else { return "0" }
        return formatNumber(total)
    }

    var totalProcessedFormatted: String {
        guard let total = stats?.totalProcessed else { return "0" }
        return formatNumber(total)
    }

    private func formatNumber(_ number: Int) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        formatter.locale = Locale(identifier: "es_CO")
        return formatter.string(from: NSNumber(value: number)) ?? "\(number)"
    }
}
