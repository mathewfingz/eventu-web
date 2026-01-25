import SwiftUI

struct ProfileView: View {
    @EnvironmentObject private var authService: ClientAuthService
    @State private var showLogoutConfirmation = false
    @State private var showOrderHistory = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // Profile header
                    profileHeader

                    // Menu sections
                    accountSection

                    supportSection

                    legalSection

                    // Logout button
                    logoutButton

                    // App version
                    appVersion
                }
                .padding(20)
            }
            .background(EventuColors.background)
            .navigationTitle("Perfil")
            .navigationBarTitleDisplayMode(.large)
            .navigationDestination(isPresented: $showOrderHistory) {
                OrderHistoryView()
            }
            .confirmationDialog(
                "¿Cerrar sesión?",
                isPresented: $showLogoutConfirmation,
                titleVisibility: .visible
            ) {
                Button("Cerrar sesión", role: .destructive) {
                    authService.signOut()
                }
                Button("Cancelar", role: .cancel) {}
            }
        }
    }

    // MARK: - Profile Header

    private var profileHeader: some View {
        VStack(spacing: 16) {
            // Avatar
            ZStack {
                Circle()
                    .fill(EventuColors.gradientPrimary)
                    .frame(width: 80, height: 80)

                Text(authService.currentUser?.initials ?? "U")
                    .font(.title)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
            }

            // Name & Email
            VStack(spacing: 4) {
                Text(authService.currentUser?.displayName ?? "Usuario")
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(EventuColors.text)

                Text(authService.currentUser?.email ?? "")
                    .font(.subheadline)
                    .foregroundColor(EventuColors.textSecondary)
            }

            // Edit profile button
            Button {
                // Edit profile
            } label: {
                HStack(spacing: 6) {
                    Image(systemName: "pencil")
                    Text("Editar perfil")
                }
                .font(.subheadline)
                .fontWeight(.medium)
                .foregroundColor(EventuColors.primary)
                .padding(.horizontal, 20)
                .padding(.vertical, 10)
                .background(EventuColors.primary.opacity(0.1))
                .cornerRadius(20)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(24)
        .background(EventuColors.cardBackground)
        .cornerRadius(20)
    }

    // MARK: - Account Section

    private var accountSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Cuenta")
                .font(.subheadline)
                .fontWeight(.medium)
                .foregroundColor(EventuColors.textSecondary)
                .padding(.horizontal, 4)

            VStack(spacing: 0) {
                ProfileMenuRow(
                    icon: "ticket",
                    iconColor: EventuColors.primary,
                    title: "Mis boletas",
                    subtitle: "Ver todas tus entradas"
                ) {
                    // Navigate to tickets
                }

                Divider().padding(.leading, 56)

                ProfileMenuRow(
                    icon: "clock.arrow.circlepath",
                    iconColor: EventuColors.warning,
                    title: "Historial de órdenes",
                    subtitle: "Ver compras anteriores"
                ) {
                    showOrderHistory = true
                }

                Divider().padding(.leading, 56)

                ProfileMenuRow(
                    icon: "creditcard",
                    iconColor: EventuColors.success,
                    title: "Métodos de pago",
                    subtitle: "Administrar tarjetas"
                ) {
                    // Payment methods
                }
            }
            .background(EventuColors.cardBackground)
            .cornerRadius(16)
        }
    }

    // MARK: - Support Section

    private var supportSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Soporte")
                .font(.subheadline)
                .fontWeight(.medium)
                .foregroundColor(EventuColors.textSecondary)
                .padding(.horizontal, 4)

            VStack(spacing: 0) {
                ProfileMenuRow(
                    icon: "questionmark.circle",
                    iconColor: Color.blue,
                    title: "Centro de ayuda",
                    subtitle: "Preguntas frecuentes"
                ) {
                    // Help center
                }

                Divider().padding(.leading, 56)

                ProfileMenuRow(
                    icon: "bubble.left.and.bubble.right",
                    iconColor: Color.purple,
                    title: "Contactar soporte",
                    subtitle: "Chat en vivo"
                ) {
                    // Contact support
                }
            }
            .background(EventuColors.cardBackground)
            .cornerRadius(16)
        }
    }

    // MARK: - Legal Section

    private var legalSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Legal")
                .font(.subheadline)
                .fontWeight(.medium)
                .foregroundColor(EventuColors.textSecondary)
                .padding(.horizontal, 4)

            VStack(spacing: 0) {
                ProfileMenuRow(
                    icon: "doc.text",
                    iconColor: Color.gray,
                    title: "Términos y condiciones"
                ) {
                    // Terms
                }

                Divider().padding(.leading, 56)

                ProfileMenuRow(
                    icon: "hand.raised",
                    iconColor: Color.gray,
                    title: "Política de privacidad"
                ) {
                    // Privacy
                }
            }
            .background(EventuColors.cardBackground)
            .cornerRadius(16)
        }
    }

    // MARK: - Logout Button

    private var logoutButton: some View {
        Button {
            showLogoutConfirmation = true
        } label: {
            HStack {
                Image(systemName: "rectangle.portrait.and.arrow.right")
                Text("Cerrar sesión")
            }
            .font(.subheadline)
            .fontWeight(.medium)
            .foregroundColor(EventuColors.error)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
            .background(EventuColors.error.opacity(0.1))
            .cornerRadius(12)
        }
    }

    // MARK: - App Version

    private var appVersion: some View {
        VStack(spacing: 4) {
            Text("Eventu Cliente")
                .font(.caption)
                .foregroundColor(EventuColors.textSecondary)

            Text("Versión 1.0.0")
                .font(.caption2)
                .foregroundColor(EventuColors.textSecondary.opacity(0.7))
        }
        .padding(.bottom, 20)
    }
}

// MARK: - Profile Menu Row

struct ProfileMenuRow: View {
    let icon: String
    var iconColor: Color = EventuColors.textSecondary
    let title: String
    var subtitle: String? = nil
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 16) {
                ZStack {
                    RoundedRectangle(cornerRadius: 10)
                        .fill(iconColor.opacity(0.1))
                        .frame(width: 40, height: 40)

                    Image(systemName: icon)
                        .font(.system(size: 16))
                        .foregroundColor(iconColor)
                }

                VStack(alignment: .leading, spacing: 2) {
                    Text(title)
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundColor(EventuColors.text)

                    if let subtitle = subtitle {
                        Text(subtitle)
                            .font(.caption)
                            .foregroundColor(EventuColors.textSecondary)
                    }
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundColor(EventuColors.textSecondary)
            }
            .padding(16)
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Order History View

struct OrderHistoryView: View {
    @StateObject private var orderService = OrderService.shared
    @EnvironmentObject private var authService: ClientAuthService

    var body: some View {
        ScrollView {
            if orderService.orders.isEmpty {
                emptyState
            } else {
                LazyVStack(spacing: 16) {
                    ForEach(orderService.orders) { order in
                        OrderHistoryCard(order: order)
                    }
                }
                .padding(20)
            }
        }
        .background(EventuColors.background)
        .navigationTitle("Historial")
        .navigationBarTitleDisplayMode(.inline)
        .task {
            if let userId = authService.currentUser?.id {
                await orderService.fetchMyOrders(userId: userId)
            }
        }
    }

    private var emptyState: some View {
        VStack(spacing: 16) {
            Spacer()
                .frame(height: 60)

            Image(systemName: "bag")
                .font(.system(size: 48))
                .foregroundColor(EventuColors.textSecondary)

            Text("Sin órdenes")
                .font(.headline)
                .foregroundColor(EventuColors.text)

            Text("Tus compras aparecerán aquí")
                .font(.subheadline)
                .foregroundColor(EventuColors.textSecondary)

            Spacer()
        }
    }
}

// MARK: - Order History Card

struct OrderHistoryCard: View {
    let order: Order

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(order.orderNumber)
                        .font(.subheadline)
                        .fontWeight(.semibold)
                        .foregroundColor(EventuColors.text)

                    Text(order.formattedDate)
                        .font(.caption)
                        .foregroundColor(EventuColors.textSecondary)
                }

                Spacer()

                // Status badge
                HStack(spacing: 4) {
                    Circle()
                        .fill(Color(hex: order.status.color))
                        .frame(width: 6, height: 6)
                    Text(order.status.displayName)
                        .font(.caption)
                        .fontWeight(.medium)
                        .foregroundColor(Color(hex: order.status.color))
                }
                .padding(.horizontal, 10)
                .padding(.vertical, 6)
                .background(Color(hex: order.status.color).opacity(0.1))
                .cornerRadius(12)
            }

            Divider()

            // Items
            if let items = order.items {
                ForEach(items) { item in
                    HStack {
                        Text("\(item.quantity)x")
                            .font(.caption)
                            .foregroundColor(EventuColors.textSecondary)

                        Text(item.ticketType?.name ?? "Entrada")
                            .font(.caption)
                            .foregroundColor(EventuColors.text)

                        Spacer()

                        Text(item.formattedUnitPrice)
                            .font(.caption)
                            .foregroundColor(EventuColors.textSecondary)
                    }
                }
            }

            Divider()

            // Total
            HStack {
                Text("Total")
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(EventuColors.text)

                Spacer()

                Text(order.formattedTotal)
                    .font(.subheadline)
                    .fontWeight(.bold)
                    .foregroundColor(EventuColors.primary)
            }
        }
        .padding(16)
        .background(EventuColors.cardBackground)
        .cornerRadius(16)
    }
}

// MARK: - Preview

struct ProfileView_Previews: PreviewProvider {
    static var previews: some View {
        ProfileView()
            .environmentObject(ClientAuthService.shared)
    }
}
