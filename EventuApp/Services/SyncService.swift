import Foundation

actor SyncService {
    static let shared = SyncService()

    private var pendingQueue: [PendingValidation] = []
    private var isSyncing = false

    private init() {
        Task { await loadPersistedQueue() }
    }

    // MARK: - Queue Management

    func enqueue(_ validation: PendingValidation) {
        pendingQueue.append(validation)
        persistQueue()
    }

    func getPendingCount() -> Int {
        pendingQueue.count
    }

    func getPendingItems() -> [PendingValidation] {
        pendingQueue
    }

    // MARK: - Sync Operations

    func syncWhenOnline() async {
        guard !isSyncing else { return }
        guard !pendingQueue.isEmpty else { return }

        isSyncing = true
        defer { isSyncing = false }

        var failedItems: [PendingValidation] = []

        for var validation in pendingQueue {
            do {
                try await syncValidation(validation)
            } catch {
                validation.incrementRetry()
                if validation.canRetry {
                    failedItems.append(validation)
                }
                // If exceeds 3 attempts, discard
            }
        }

        pendingQueue = failedItems
        persistQueue()
    }

    private func syncValidation(_ validation: PendingValidation) async throws {
        let url = URL(string: "\(AppConstants.baseURL)\(AppConstants.Endpoints.coordinatorSyncValidation)")!

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        // Add auth header
        let session = try await SupabaseManager.shared.client.auth.session
        request.setValue("Bearer \(session.accessToken)", forHTTPHeaderField: "Authorization")

        let body: [String: Any] = [
            "ticketId": validation.ticketId,
            "eventId": validation.eventId,
            "code": validation.code,
            "deviceId": validation.deviceId,
            "validatedAt": ISO8601DateFormatter().string(from: validation.validatedAt),
            "offlineValidation": true
        ]

        request.httpBody = try JSONSerialization.data(withJSONObject: body)

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw SyncError.serverError
        }

        // Check response for success
        if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
           let success = json["success"] as? Bool,
           !success {
            throw SyncError.validationRejected
        }
    }

    // MARK: - Force Sync

    func forceSync() async {
        await syncWhenOnline()
    }

    // MARK: - Persistence

    private func persistQueue() {
        let encoder = JSONEncoder()
        if let data = try? encoder.encode(pendingQueue) {
            UserDefaults.standard.set(data, forKey: AppConstants.StorageKeys.pendingValidationsQueue)
        }
    }

    func loadPersistedQueue() {
        guard let data = UserDefaults.standard.data(forKey: AppConstants.StorageKeys.pendingValidationsQueue),
              let queue = try? JSONDecoder().decode([PendingValidation].self, from: data) else {
            return
        }
        pendingQueue = queue
    }

    // MARK: - Clear

    func clearQueue() {
        pendingQueue.removeAll()
        persistQueue()
    }
}

// MARK: - Sync Errors

enum SyncError: Error, LocalizedError {
    case serverError
    case networkError
    case validationRejected
    case unauthorized

    var errorDescription: String? {
        switch self {
        case .serverError: return "Error del servidor"
        case .networkError: return "Error de red"
        case .validationRejected: return "Validacion rechazada por el servidor"
        case .unauthorized: return "Sesion expirada"
        }
    }
}
