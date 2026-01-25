import SwiftUI

struct MainTabView: View {
    @EnvironmentObject private var appState: ClientAppState
    @State private var selectedTab: Tab = .events
    @State private var showCart = false

    enum Tab: String, CaseIterable {
        case events = "Eventos"
        case tickets = "Mis Boletas"
        case profile = "Perfil"

        var icon: String {
            switch self {
            case .events: return "music.mic"
            case .tickets: return "ticket"
            case .profile: return "person"
            }
        }

        var selectedIcon: String {
            switch self {
            case .events: return "music.mic.circle.fill"
            case .tickets: return "ticket.fill"
            case .profile: return "person.fill"
            }
        }
    }

    var body: some View {
        VStack(spacing: 0) {
            // Red header with white logo
            EventuHeaderView(
                showCartButton: selectedTab == .events,
                onCartTap: {
                    showCart = true
                }
            )

            // Content
            ZStack(alignment: .bottom) {
                TabView(selection: $selectedTab) {
                    EventsListView()
                        .tag(Tab.events)

                    MyTicketsView()
                        .tag(Tab.tickets)

                    ProfileView()
                        .tag(Tab.profile)
                }

                // Custom Tab Bar
                customTabBar
            }
        }
        .ignoresSafeArea(.keyboard)
        .sheet(isPresented: $showCart) {
            CartView()
                .environmentObject(appState)
        }
    }

    // MARK: - Custom Tab Bar

    private var customTabBar: some View {
        HStack(spacing: 0) {
            ForEach(Tab.allCases, id: \.self) { tab in
                TabBarButton(
                    tab: tab,
                    isSelected: selectedTab == tab,
                    cartItemCount: tab == .events ? appState.cart.itemCount : 0
                ) {
                    withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                        selectedTab = tab
                    }
                }
            }
        }
        .padding(.horizontal, 8)
        .padding(.top, 12)
        .padding(.bottom, 28)
        .background(
            EventuColors.cardBackground
                .shadow(color: Color.black.opacity(0.1), radius: 20, x: 0, y: -5)
        )
    }
}

// MARK: - Tab Bar Button

struct TabBarButton: View {
    let tab: MainTabView.Tab
    let isSelected: Bool
    let cartItemCount: Int
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 4) {
                ZStack {
                    Image(systemName: isSelected ? tab.selectedIcon : tab.icon)
                        .font(.system(size: 22))
                        .foregroundColor(isSelected ? EventuColors.primary : EventuColors.textSecondary)
                        .scaleEffect(isSelected ? 1.1 : 1.0)

                    // Cart badge
                    if tab == .events && cartItemCount > 0 {
                        Text("\(cartItemCount)")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(.white)
                            .frame(width: 18, height: 18)
                            .background(EventuColors.primary)
                            .clipShape(Circle())
                            .offset(x: 12, y: -10)
                    }
                }

                Text(tab.rawValue)
                    .font(.system(size: 10, weight: isSelected ? .semibold : .regular))
                    .foregroundColor(isSelected ? EventuColors.primary : EventuColors.textSecondary)
            }
            .frame(maxWidth: .infinity)
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Preview

struct MainTabView_Previews: PreviewProvider {
    static var previews: some View {
        MainTabView()
            .environmentObject(ClientAppState.shared)
            .environmentObject(ClientAuthService.shared)
            .environmentObject(NetworkMonitor.shared)
    }
}
