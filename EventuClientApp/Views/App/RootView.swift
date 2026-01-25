import SwiftUI

struct RootView: View {
    @EnvironmentObject private var authService: ClientAuthService
    @EnvironmentObject private var appState: ClientAppState

    var body: some View {
        Group {
            if authService.isAuthenticated {
                MainTabView()
            } else {
                ClientLoginView()
            }
        }
        .animation(.easeInOut(duration: 0.3), value: authService.isAuthenticated)
    }
}

// MARK: - Preview

struct RootView_Previews: PreviewProvider {
    static var previews: some View {
        RootView()
            .environmentObject(ClientAppState.shared)
            .environmentObject(ClientAuthService.shared)
            .environmentObject(NetworkMonitor.shared)
    }
}
