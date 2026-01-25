import Foundation

@MainActor
class RealtimeService: ObservableObject {
    static let shared = RealtimeService()

    @Published var stats: RealtimeStats?
    @Published var connectionState: ConnectionState = .disconnected
    @Published var lastError: String?

    private var pollingTimer: Timer?
    private var currentEventId: String?

    private init() {}

    // MARK: - Connection Management

    func connect(eventId: String) {
        currentEventId = eventId
        connectionState = .connecting
        startPolling()
    }

    func disconnect() {
        stopPolling()
        currentEventId = nil
        stats = nil
        connectionState = .disconnected
    }

    func reconnect() {
        guard let eventId = currentEventId else { return }
        disconnect()
        connect(eventId: eventId)
    }

    // MARK: - Polling

    private func startPolling() {
        // Immediate fetch
        Task { await fetchStats() }

        // Poll every 5 seconds
        pollingTimer = Timer.scheduledTimer(withTimeInterval: AppConstants.Realtime.pollingIntervalSeconds, repeats: true) { [weak self] _ in
            Task { @MainActor in
                await self?.fetchStats()
            }
        }
    }

    private func stopPolling() {
        pollingTimer?.invalidate()
        pollingTimer = nil
    }

    // MARK: - Fetch Stats

    private func fetchStats() async {
        guard let eventId = currentEventId else { return }

        let urlString = AppConstants.baseURL + AppConstants.Endpoints.coordinatorStats.replacingOccurrences(of: "{eventId}", with: eventId)
        guard let url = URL(string: urlString) else { return }

        do {
            let session = try await SupabaseManager.shared.client.auth.session
            var request = URLRequest(url: url)
            request.setValue("Bearer \(session.accessToken)", forHTTPHeaderField: "Authorization")

            let (data, response) = try await URLSession.shared.data(for: request)

            guard let httpResponse = response as? HTTPURLResponse else {
                throw RealtimeError.invalidResponse
            }

            guard httpResponse.statusCode == 200 else {
                throw RealtimeError.serverError(httpResponse.statusCode)
            }

            let decoder = JSONDecoder()
            decoder.dateDecodingStrategy = .millisecondsSince1970

            let apiResponse = try decoder.decode(StatsAPIResponse.self, from: data)

            if apiResponse.success, let statsData = apiResponse.data {
                self.stats = RealtimeStats(
                    eventId: eventId,
                    totalSold: statsData.totalSold,
                    totalProcessed: statsData.totalProcessed,
                    processingRate: statsData.processingRate ?? 0,
                    byTicketType: statsData.byTicketType ?? [],
                    hourlyBreakdown: statsData.hourlyBreakdown ?? [],
                    activeValidators: statsData.activeValidators ?? [],
                    capacityAlerts: statsData.capacityAlerts ?? [],
                    lastUpdated: Date()
                )
            }

            self.connectionState = .connected
            self.lastError = nil

        } catch {
            self.lastError = error.localizedDescription
            self.connectionState = .error(error.localizedDescription)

            // Attempt reconnect after delay
            Task {
                try? await Task.sleep(nanoseconds: UInt64(AppConstants.Realtime.reconnectDelaySeconds * 1_000_000_000))
                if self.currentEventId != nil {
                    await self.fetchStats()
                }
            }
        }
    }

    // MARK: - Manual Refresh

    func refresh() async {
        await fetchStats()
    }
}

// MARK: - Realtime Errors

enum RealtimeError: Error, LocalizedError {
    case invalidResponse
    case serverError(Int)
    case decodingError
    case disconnected

    var errorDescription: String? {
        switch self {
        case .invalidResponse: return "Respuesta invalida del servidor"
        case .serverError(let code): return "Error del servidor: \(code)"
        case .decodingError: return "Error procesando datos"
        case .disconnected: return "Desconectado del servidor"
        }
    }
}
