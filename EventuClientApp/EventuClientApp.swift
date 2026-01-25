import SwiftUI

@main
struct EventuClientApp: App {
    @StateObject private var appState = ClientAppState.shared
    @StateObject private var authService = ClientAuthService.shared
    @StateObject private var networkMonitor = NetworkMonitor.shared

    init() {
        // Configure appearance
        configureAppearance()

        // Load offline codes if available
        TicketService.shared.loadOfflineCodes()
    }

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(appState)
                .environmentObject(authService)
                .environmentObject(networkMonitor)
                .preferredColorScheme(.light)
        }
    }

    private func configureAppearance() {
        // Navigation bar appearance
        let navAppearance = UINavigationBarAppearance()
        navAppearance.configureWithOpaqueBackground()
        navAppearance.backgroundColor = UIColor(EventuColors.cardBackground)
        navAppearance.titleTextAttributes = [.foregroundColor: UIColor(EventuColors.text)]
        navAppearance.largeTitleTextAttributes = [.foregroundColor: UIColor(EventuColors.text)]

        UINavigationBar.appearance().standardAppearance = navAppearance
        UINavigationBar.appearance().scrollEdgeAppearance = navAppearance
        UINavigationBar.appearance().compactAppearance = navAppearance

        // Tab bar appearance
        let tabAppearance = UITabBarAppearance()
        tabAppearance.configureWithOpaqueBackground()
        tabAppearance.backgroundColor = UIColor(EventuColors.cardBackground)

        UITabBar.appearance().standardAppearance = tabAppearance
        UITabBar.appearance().scrollEdgeAppearance = tabAppearance

        // Tint color
        UIView.appearance(whenContainedInInstancesOf: [UIAlertController.self]).tintColor = UIColor(EventuColors.primary)
    }
}
