import SwiftUI

struct SettingsView: View {
    @StateObject private var authService = AuthService.shared
    @StateObject private var networkMonitor = NetworkMonitor.shared
    @EnvironmentObject var appState: AppState

    @State private var showLogoutConfirmation = false
    @State private var showClearCacheConfirmation = false
    @State private var isClearing = false
    @State private var isAppearing = false

    var body: some View {
        NavigationView {
            ZStack {
                // Background
                EventuColors.surface
                    .ignoresSafeArea()

                ScrollView(showsIndicators: false) {
                    VStack(spacing: 24) {
                        // User Profile Card
                        userProfileCard
                            .opacity(isAppearing ? 1 : 0)
                            .offset(y: isAppearing ? 0 : 20)

                        // Event Info Card
                        if let event = appState.selectedEvent {
                            eventInfoCard(event)
                                .opacity(isAppearing ? 1 : 0)
                                .offset(y: isAppearing ? 0 : 30)
                        }

                        // Connection & Sync Card
                        connectionCard
                            .opacity(isAppearing ? 1 : 0)
                            .offset(y: isAppearing ? 0 : 30)

                        // Offline Mode Card
                        offlineModeCard
                            .opacity(isAppearing ? 1 : 0)
                            .offset(y: isAppearing ? 0 : 30)

                        // App Info Card
                        appInfoCard
                            .opacity(isAppearing ? 1 : 0)
                            .offset(y: isAppearing ? 0 : 30)

                        // Logout Button
                        logoutButton
                            .opacity(isAppearing ? 1 : 0)
                            .offset(y: isAppearing ? 0 : 30)

                        Spacer().frame(height: 20)
                    }
                    .padding(.horizontal, 20)
                    .padding(.top, 16)
                }
            }
            .navigationTitle("")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .principal) {
                    HStack(spacing: 8) {
                        Image(systemName: "gearshape.fill")
                            .foregroundColor(EventuColors.primary)
                        Text("Configuracion")
                            .font(EventuTypography.headline)
                            .foregroundColor(EventuColors.textPrimary)
                    }
                }
            }
            .alert("Cerrar Sesion", isPresented: $showLogoutConfirmation) {
                Button("Cancelar", role: .cancel) {}
                Button("Cerrar Sesion", role: .destructive) {
                    logout()
                }
            } message: {
                Text("Se cerrara tu sesion y deberas iniciar sesion nuevamente")
            }
            .alert("Limpiar Cache", isPresented: $showClearCacheConfirmation) {
                Button("Cancelar", role: .cancel) {}
                Button("Limpiar", role: .destructive) {
                    clearCache()
                }
            } message: {
                Text("Se eliminaran todos los datos offline descargados")
            }
        }
        .onAppear {
            withAnimation(.easeOut(duration: 0.5)) {
                isAppearing = true
            }
        }
    }

    // MARK: - User Profile Card

    private var userProfileCard: some View {
        VStack(spacing: 0) {
            HStack(spacing: 16) {
                // Avatar
                ZStack {
                    Circle()
                        .fill(EventuColors.gradientPrimary)
                        .frame(width: 70, height: 70)

                    Text(appState.currentUser?.displayName.prefix(1).uppercased() ?? "U")
                        .font(.system(size: 28, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                }

                VStack(alignment: .leading, spacing: 6) {
                    Text(appState.currentUser?.displayName ?? "Usuario")
                        .font(EventuTypography.title3)
                        .foregroundColor(EventuColors.textPrimary)

                    Text(appState.currentUser?.email ?? "")
                        .font(EventuTypography.subheadline)
                        .foregroundColor(EventuColors.textSecondary)

                    // Role Badge
                    HStack(spacing: 6) {
                        Image(systemName: roleIcon)
                            .font(.system(size: 10, weight: .bold))
                        Text(appState.userRoleDisplayName)
                            .font(EventuTypography.caption2)
                    }
                    .padding(.horizontal, 10)
                    .padding(.vertical, 4)
                    .background(roleColor.opacity(0.12))
                    .foregroundColor(roleColor)
                    .cornerRadius(8)
                }

                Spacer()
            }
            .padding(20)
        }
        .background(Color.white)
        .cornerRadius(20)
        .shadow(color: Color.black.opacity(0.06), radius: 12, x: 0, y: 6)
    }

    private var roleColor: Color {
        switch appState.currentUser?.role {
        case .coordinator, .superadmin: return EventuColors.primary
        case .promoter: return EventuColors.info
        default: return EventuColors.success
        }
    }

    private var roleIcon: String {
        switch appState.currentUser?.role {
        case .coordinator: return "chart.bar.fill"
        case .superadmin: return "star.fill"
        case .promoter: return "megaphone.fill"
        default: return "qrcode.viewfinder"
        }
    }

    // MARK: - Event Info Card

    private func eventInfoCard(_ event: ValidationEvent) -> some View {
        VStack(alignment: .leading, spacing: 16) {
            // Section Header
            HStack(spacing: 8) {
                Image(systemName: "calendar.badge.clock")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(EventuColors.primary)
                Text("Evento Actual")
                    .font(EventuTypography.headline)
                    .foregroundColor(EventuColors.textPrimary)
            }

            VStack(alignment: .leading, spacing: 12) {
                // Event Name
                Text(event.name)
                    .font(EventuTypography.subheadline)
                    .foregroundColor(EventuColors.textPrimary)

                // Venue
                HStack(spacing: 8) {
                    Image(systemName: "mappin.circle.fill")
                        .foregroundColor(EventuColors.textTertiary)
                    Text(event.venueName)
                        .font(EventuTypography.caption1)
                        .foregroundColor(EventuColors.textSecondary)
                }

                // Date & Time
                HStack(spacing: 8) {
                    Image(systemName: "clock.fill")
                        .foregroundColor(EventuColors.textTertiary)
                    Text("\(event.formattedDate) - \(event.formattedTime)")
                        .font(EventuTypography.caption1)
                        .foregroundColor(EventuColors.textSecondary)
                }

                Divider()
                    .padding(.vertical, 4)

                // Change Event Button
                Button(action: {
                    appState.showEventSelection = true
                }) {
                    HStack {
                        Image(systemName: "arrow.triangle.2.circlepath")
                            .font(.system(size: 14, weight: .semibold))
                        Text("Cambiar evento")
                            .font(EventuTypography.subheadline)
                    }
                    .foregroundColor(EventuColors.primary)
                }
            }
        }
        .padding(20)
        .background(Color.white)
        .cornerRadius(20)
        .shadow(color: Color.black.opacity(0.06), radius: 12, x: 0, y: 6)
    }

    // MARK: - Connection Card

    private var connectionCard: some View {
        VStack(alignment: .leading, spacing: 16) {
            // Section Header
            HStack(spacing: 8) {
                Image(systemName: "antenna.radiowaves.left.and.right")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(EventuColors.primary)
                Text("Estado de Conexion")
                    .font(EventuTypography.headline)
                    .foregroundColor(EventuColors.textPrimary)
            }

            // Connection Status Row
            HStack(spacing: 14) {
                ZStack {
                    Circle()
                        .fill(networkMonitor.isConnected ? EventuColors.success.opacity(0.12) : EventuColors.error.opacity(0.12))
                        .frame(width: 44, height: 44)

                    Image(systemName: networkMonitor.isConnected ? "wifi" : "wifi.slash")
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundColor(networkMonitor.isConnected ? EventuColors.success : EventuColors.error)
                }

                VStack(alignment: .leading, spacing: 2) {
                    Text(networkMonitor.isConnected ? "Conectado" : "Sin conexion")
                        .font(EventuTypography.subheadline)
                        .foregroundColor(EventuColors.textPrimary)
                    Text(networkMonitor.connectionType.description)
                        .font(EventuTypography.caption2)
                        .foregroundColor(EventuColors.textSecondary)
                }

                Spacer()

                Circle()
                    .fill(networkMonitor.isConnected ? EventuColors.success : EventuColors.error)
                    .frame(width: 10, height: 10)
            }

            Divider()

            // Sync Status Row
            HStack(spacing: 14) {
                ZStack {
                    Circle()
                        .fill(EventuColors.warning.opacity(0.12))
                        .frame(width: 44, height: 44)

                    Image(systemName: "arrow.triangle.2.circlepath")
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundColor(EventuColors.warning)
                }

                VStack(alignment: .leading, spacing: 2) {
                    Text("Sincronizacion")
                        .font(EventuTypography.subheadline)
                        .foregroundColor(EventuColors.textPrimary)

                    let pendingCount = ValidationService.shared.pendingSyncCount
                    Text(pendingCount > 0 ? "\(pendingCount) pendientes" : "Todo sincronizado")
                        .font(EventuTypography.caption2)
                        .foregroundColor(pendingCount > 0 ? EventuColors.warning : EventuColors.success)
                }

                Spacer()

                if ValidationService.shared.pendingSyncCount > 0 {
                    Button(action: {
                        Task {
                            await SyncService.shared.forceSync()
                        }
                    }) {
                        Text("Sincronizar")
                            .font(EventuTypography.caption1)
                            .foregroundColor(.white)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 6)
                            .background(EventuColors.primary)
                            .cornerRadius(8)
                    }
                }
            }
        }
        .padding(20)
        .background(Color.white)
        .cornerRadius(20)
        .shadow(color: Color.black.opacity(0.06), radius: 12, x: 0, y: 6)
    }

    // MARK: - Offline Mode Card

    private var offlineModeCard: some View {
        VStack(alignment: .leading, spacing: 16) {
            // Section Header
            HStack(spacing: 8) {
                Image(systemName: "arrow.down.circle.fill")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(EventuColors.primary)
                Text("Modo Offline")
                    .font(EventuTypography.headline)
                    .foregroundColor(EventuColors.textPrimary)
            }

            // Cache Status Row
            HStack(spacing: 14) {
                ZStack {
                    Circle()
                        .fill(EventuColors.info.opacity(0.12))
                        .frame(width: 44, height: 44)

                    Image(systemName: "internaldrive.fill")
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundColor(EventuColors.info)
                }

                VStack(alignment: .leading, spacing: 2) {
                    Text("Cache Offline")
                        .font(EventuTypography.subheadline)
                        .foregroundColor(EventuColors.textPrimary)

                    if appState.selectedEvent != nil {
                        Text("Datos descargados disponibles")
                            .font(EventuTypography.caption2)
                            .foregroundColor(EventuColors.success)
                    } else {
                        Text("Selecciona un evento primero")
                            .font(EventuTypography.caption2)
                            .foregroundColor(EventuColors.textSecondary)
                    }
                }

                Spacer()
            }

            Divider()

            // Clear Cache Button
            Button(action: {
                showClearCacheConfirmation = true
            }) {
                HStack(spacing: 12) {
                    if isClearing {
                        ProgressView()
                            .scaleEffect(0.8)
                            .tint(EventuColors.error)
                    } else {
                        Image(systemName: "trash.fill")
                            .font(.system(size: 16, weight: .semibold))
                    }
                    Text("Limpiar cache offline")
                        .font(EventuTypography.subheadline)
                }
                .foregroundColor(EventuColors.error)
            }
            .disabled(isClearing)
        }
        .padding(20)
        .background(Color.white)
        .cornerRadius(20)
        .shadow(color: Color.black.opacity(0.06), radius: 12, x: 0, y: 6)
    }

    // MARK: - App Info Card

    private var appInfoCard: some View {
        VStack(alignment: .leading, spacing: 16) {
            // Section Header
            HStack(spacing: 8) {
                Image(systemName: "info.circle.fill")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(EventuColors.primary)
                Text("Acerca de")
                    .font(EventuTypography.headline)
                    .foregroundColor(EventuColors.textPrimary)
            }

            // Version Row
            HStack {
                HStack(spacing: 8) {
                    Image(systemName: "app.badge.fill")
                        .foregroundColor(EventuColors.textTertiary)
                    Text("Version")
                        .font(EventuTypography.subheadline)
                        .foregroundColor(EventuColors.textPrimary)
                }
                Spacer()
                Text("1.0.0")
                    .font(EventuTypography.subheadline)
                    .foregroundColor(EventuColors.textSecondary)
            }

            Divider()

            // Support Row
            HStack {
                HStack(spacing: 8) {
                    Image(systemName: "questionmark.circle.fill")
                        .foregroundColor(EventuColors.textTertiary)
                    Text("Soporte")
                        .font(EventuTypography.subheadline)
                        .foregroundColor(EventuColors.textPrimary)
                }
                Spacer()
                Text("soporte@eventu.co")
                    .font(EventuTypography.caption1)
                    .foregroundColor(EventuColors.primary)
            }
        }
        .padding(20)
        .background(Color.white)
        .cornerRadius(20)
        .shadow(color: Color.black.opacity(0.06), radius: 12, x: 0, y: 6)
    }

    // MARK: - Logout Button

    private var logoutButton: some View {
        Button(action: {
            showLogoutConfirmation = true
        }) {
            HStack(spacing: 10) {
                Image(systemName: "rectangle.portrait.and.arrow.right")
                    .font(.system(size: 18, weight: .semibold))
                Text("Cerrar Sesion")
                    .font(EventuTypography.headline)
            }
            .foregroundColor(EventuColors.error)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
            .background(
                RoundedRectangle(cornerRadius: 16)
                    .fill(EventuColors.error.opacity(0.1))
            )
        }
    }

    // MARK: - Actions

    private func logout() {
        Task {
            try? await authService.signOut()
        }
    }

    private func clearCache() {
        isClearing = true
        Task {
            await OfflineCacheService.shared.clearAllCache()
            isClearing = false
        }
    }
}

// MARK: - Preview

struct SettingsView_Previews: PreviewProvider {
    static var previews: some View {
        SettingsView()
            .environmentObject(AppState.shared)
    }
}
