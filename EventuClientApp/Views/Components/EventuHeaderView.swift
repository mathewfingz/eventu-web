import SwiftUI

struct EventuHeaderView: View {
    var showCartButton: Bool = true
    var onCartTap: (() -> Void)? = nil

    @EnvironmentObject private var appState: ClientAppState

    var body: some View {
        HStack {
            // Logo
            HStack(spacing: 8) {
                ZStack {
                    Circle()
                        .fill(Color.white)
                        .frame(width: 32, height: 32)

                    Image(systemName: "ticket.fill")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(EventuColors.primary)
                        .rotationEffect(.degrees(-15))
                }

                Text("eventu")
                    .font(.system(size: 22, weight: .bold, design: .rounded))
                    .foregroundColor(.white)
            }

            Spacer()

            // Cart button (optional)
            if showCartButton {
                Button(action: {
                    onCartTap?()
                }) {
                    ZStack(alignment: .topTrailing) {
                        Image(systemName: "cart")
                            .font(.system(size: 20, weight: .medium))
                            .foregroundColor(.white)
                            .frame(width: 44, height: 44)

                        if appState.cart.itemCount > 0 {
                            Text("\(appState.cart.itemCount)")
                                .font(.system(size: 10, weight: .bold))
                                .foregroundColor(EventuColors.primary)
                                .frame(width: 18, height: 18)
                                .background(Color.white)
                                .clipShape(Circle())
                                .offset(x: 4, y: 4)
                        }
                    }
                }
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .background(EventuColors.gradientPrimary)
    }
}

// Simple version without cart
struct EventuSimpleHeaderView: View {
    var title: String? = nil

    var body: some View {
        HStack {
            // Logo
            HStack(spacing: 8) {
                ZStack {
                    Circle()
                        .fill(Color.white)
                        .frame(width: 32, height: 32)

                    Image(systemName: "ticket.fill")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(EventuColors.primary)
                        .rotationEffect(.degrees(-15))
                }

                Text(title ?? "eventu")
                    .font(.system(size: 22, weight: .bold, design: .rounded))
                    .foregroundColor(.white)
            }

            Spacer()
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .background(EventuColors.gradientPrimary)
    }
}

// MARK: - Preview

struct EventuHeaderView_Previews: PreviewProvider {
    static var previews: some View {
        VStack(spacing: 0) {
            EventuHeaderView()
                .environmentObject(ClientAppState.shared)

            EventuSimpleHeaderView(title: "Mis Boletas")

            Spacer()
        }
    }
}
