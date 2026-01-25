import Foundation

enum AppConstants {
    // API Configuration
    static let baseURL = "https://eventu-web.vercel.app"
    static let apiVersion = "v1"

    // Supabase
    static let supabaseURL = "https://your-project.supabase.co"
    static let supabaseAnonKey = "your-anon-key"

    // SafeTix Configuration
    enum SafeTix {
        static let totpStep: TimeInterval = 15 // seconds
        static let totpDigits = 8
        static let qrExpirationSeconds: Double = 30
        static let codeValidationWindow: Int = 1 // +/- 1 step tolerance
        static let offlineHours: Int = 24
    }

    // Checkout
    enum Checkout {
        static let lockDurationMinutes: Int = 10
        static let serviceFeePercentage: Double = 0.10 // 10%
        static let ivaPercentage: Double = 0.19 // 19%
    }

    // UI Configuration
    enum UI {
        static let animationDuration: Double = 0.3
        static let cardCornerRadius: CGFloat = 20
        static let buttonCornerRadius: CGFloat = 14
    }

    // Storage Keys
    enum StorageKeys {
        static let offlineTicketsPrefix = "offline_ticket_"
        static let userPreferences = "user_preferences"
        static let lastViewedEvents = "last_viewed_events"
        static let searchHistory = "search_history"
    }

    // Keychain
    enum Keychain {
        static let serviceName = "com.eventu.client"
        static let offlineCodesPrefix = "offline_codes_"
    }
}
