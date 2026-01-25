import SwiftUI

@main
struct EventuApp: App {
    @StateObject private var appState = AppState.shared
    @StateObject private var authService = AuthService.shared
    @StateObject private var networkMonitor = NetworkMonitor.shared

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(appState)
                .environmentObject(authService)
                .environmentObject(networkMonitor)
                .onAppear {
                    // Check existing session on app launch
                    Task {
                        await authService.checkSession()
                    }
                }
        }
    }
}

// MARK: - Root View

struct RootView: View {
    @EnvironmentObject var appState: AppState
    @EnvironmentObject var authService: AuthService

    var body: some View {
        Group {
            if authService.isLoading {
                SplashView()
            } else if !authService.isAuthenticated {
                StaffLoginView()
            } else if appState.selectedEvent == nil {
                EventListView()
            } else {
                MainTabView()
            }
        }
        .animation(.easeInOut, value: authService.isAuthenticated)
        .animation(.easeInOut, value: appState.selectedEvent?.id)
    }
}

// MARK: - Splash View

struct SplashView: View {
    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color.blue.opacity(0.8), Color.purple.opacity(0.6)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            VStack(spacing: 20) {
                Image(systemName: "qrcode.viewfinder")
                    .font(.system(size: 80))
                    .foregroundColor(.white)

                Text("Eventu")
                    .font(.largeTitle.bold())
                    .foregroundColor(.white)

                ProgressView()
                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                    .scaleEffect(1.2)
            }
        }
    }
}

// MARK: - Main Tab View

struct MainTabView: View {
    @EnvironmentObject var appState: AppState

    var body: some View {
        TabView(selection: $appState.activeTab) {
            // Scanner Tab (always visible)
            ScannerView()
                .tabItem {
                    Label("Escanear", systemImage: "qrcode.viewfinder")
                }
                .tag(AppState.AppTab.scanner)

            // Dashboard Tab (only for coordinators)
            if appState.canAccessDashboard {
                CoordinatorDashboardView()
                    .tabItem {
                        Label("Dashboard", systemImage: "chart.bar.fill")
                    }
                    .tag(AppState.AppTab.dashboard)
            }

            // History Tab
            ValidationHistoryView()
                .tabItem {
                    Label("Historial", systemImage: "clock.fill")
                }
                .tag(AppState.AppTab.history)

            // Settings Tab
            SettingsView()
                .tabItem {
                    Label("Ajustes", systemImage: "gearshape.fill")
                }
                .tag(AppState.AppTab.settings)
        }
        .accentColor(.blue)
        .sheet(isPresented: $appState.showEventSelection) {
            EventListView()
        }
    }
}

// MARK: - Validation History View

struct ValidationHistoryView: View {
    @StateObject private var validationService = ValidationService.shared

    var body: some View {
        NavigationView {
            Group {
                if validationService.validationHistory.isEmpty {
                    emptyState
                } else {
                    historyList
                }
            }
            .navigationTitle("Historial")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    if !validationService.validationHistory.isEmpty {
                        Button("Limpiar") {
                            validationService.clearHistory()
                        }
                    }
                }
            }
        }
    }

    private var emptyState: some View {
        VStack(spacing: 20) {
            Image(systemName: "clock.badge.questionmark")
                .font(.system(size: 60))
                .foregroundColor(.gray)

            Text("Sin validaciones")
                .font(.title2.bold())

            Text("Las validaciones que realices apareceran aqui")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding()
    }

    private var historyList: some View {
        List {
            // Today's Stats
            Section {
                HStack {
                    VStack(alignment: .leading) {
                        Text("Hoy")
                            .font(.headline)
                        Text("\(validationService.todayValidCount) validas, \(validationService.todayInvalidCount) rechazadas")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }

                    Spacer()

                    if validationService.pendingSyncCount > 0 {
                        HStack {
                            Image(systemName: "arrow.triangle.2.circlepath")
                            Text("\(validationService.pendingSyncCount)")
                        }
                        .font(.caption)
                        .foregroundColor(.orange)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(Color.orange.opacity(0.2))
                        .cornerRadius(10)
                    }
                }
            }

            // History Items
            Section("Validaciones Recientes") {
                ForEach(validationService.validationHistory) { result in
                    HistoryRow(result: result)
                }
            }
        }
    }
}

// MARK: - History Row

struct HistoryRow: View {
    let result: ValidationResult

    var body: some View {
        HStack(spacing: 12) {
            // Status Icon
            Image(systemName: result.isValid ? "checkmark.circle.fill" : "xmark.circle.fill")
                .font(.title2)
                .foregroundColor(result.isValid ? .green : .red)

            // Details
            VStack(alignment: .leading, spacing: 4) {
                if let info = result.ticketInfo {
                    Text(info.ticketType)
                        .font(.subheadline.bold())

                    if let buyerName = info.buyerName {
                        Text(buyerName)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                } else if let errorCode = result.errorCode {
                    Text(errorCode.displayMessage)
                        .font(.subheadline)
                        .foregroundColor(.red)
                } else {
                    Text("Ticket: \(result.ticketId.prefix(8))...")
                        .font(.subheadline)
                }

                Text(result.validatedAt.formatted(date: .omitted, time: .shortened))
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }

            Spacer()

            // Sync Status
            if result.syncStatus == .pending {
                Image(systemName: "arrow.triangle.2.circlepath")
                    .font(.caption)
                    .foregroundColor(.orange)
            }
        }
        .padding(.vertical, 4)
    }
}
