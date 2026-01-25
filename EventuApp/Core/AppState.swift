import Foundation
import SwiftUI

@MainActor
class AppState: ObservableObject {
    static let shared = AppState()

    @Published var currentUser: StaffUser?
    @Published var selectedEvent: ValidationEvent?
    @Published var isAuthenticated = false
    @Published var isLoading = false

    // Navigation state
    @Published var showEventSelection = false
    @Published var activeTab: AppTab = .scanner

    enum AppTab {
        case scanner
        case dashboard
        case history
        case settings
    }

    private init() {}

    func setUser(_ user: StaffUser) {
        self.currentUser = user
        self.isAuthenticated = true
    }

    func selectEvent(_ event: ValidationEvent) {
        self.selectedEvent = event
        self.showEventSelection = false
    }

    func signOut() {
        currentUser = nil
        selectedEvent = nil
        isAuthenticated = false
        showEventSelection = false
        activeTab = .scanner
    }

    var canAccessDashboard: Bool {
        currentUser?.role.canAccessDashboard ?? false
    }

    var userRoleDisplayName: String {
        currentUser?.role.displayName ?? "Usuario"
    }
}
