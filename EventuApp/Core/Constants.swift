import Foundation

enum AppConstants {
    // API Configuration
    static let baseURL = "https://eventu-web.vercel.app"
    static let apiVersion = "v1"

    // API Endpoints
    enum Endpoints {
        static let validateTicket = "/api/tickets/validate"
        static let coordinatorEvents = "/api/coordinator/events"
        static let coordinatorStats = "/api/coordinator/events/{eventId}/stats"
        static let coordinatorTicketsOffline = "/api/coordinator/events/{eventId}/tickets-offline"
        static let coordinatorSyncValidation = "/api/coordinator/sync-validation"
    }

    // SafeTix Configuration
    enum SafeTix {
        static let totpStep: TimeInterval = 15 // seconds
        static let totpDigits = 8
        static let qrExpirationSeconds: Double = 30
        static let codeValidationWindow: Int = 1 // +/- 1 step tolerance
    }

    // Offline Configuration
    enum Offline {
        static let cacheExpirationHours: Int = 24
        static let maxRetryAttempts = 3
        static let syncIntervalSeconds: TimeInterval = 30
    }

    // Realtime Configuration
    enum Realtime {
        static let pollingIntervalSeconds: TimeInterval = 5
        static let reconnectDelaySeconds: TimeInterval = 3
    }

    // UI Configuration
    enum UI {
        static let validationResultDisplaySeconds: Double = 3
        static let animationDuration: Double = 0.3
    }

    // Storage Keys
    enum StorageKeys {
        static let pendingValidationsQueue = "pending_validations_queue"
        static let offlineCacheMetadata = "offline_cache_metadata"
        static let lastSelectedEventId = "last_selected_event_id"
        static let userPreferences = "user_preferences"
    }

    // Database
    enum Database {
        static let fileName = "eventu_offline.sqlite"
    }
}
