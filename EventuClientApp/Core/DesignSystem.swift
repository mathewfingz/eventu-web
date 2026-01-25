import SwiftUI

// MARK: - Eventu Design System
// Apple-Inspired Premium Theme for Client App

enum EventuColors {
    // Primary Colors - Refined Coral System
    static let primary = Color(hex: "#FF3B30")
    static let primaryDark = Color(hex: "#D70015")
    static let primaryLight = Color(hex: "#FF6961")

    // Neutral Palette
    static let background = Color(hex: "#FFFFFF")
    static let surface = Color(hex: "#F5F5F7")
    static let surfaceElevated = Color.white.opacity(0.72)
    static let cardBackground = Color.white
    static let border = Color(hex: "#E5E5EA")

    // Text Colors - Apple-style contrast
    static let text = Color(hex: "#1D1D1F")
    static let textPrimary = Color(hex: "#1D1D1F")
    static let textSecondary = Color(hex: "#86868B")
    static let textTertiary = Color(hex: "#AEAEB2")

    // Semantic Colors
    static let success = Color(hex: "#34C759")
    static let warning = Color(hex: "#FF9500")
    static let error = Color(hex: "#FF3B30")
    static let info = Color(hex: "#007AFF")

    // Gradients
    static let gradientPrimary = LinearGradient(
        colors: [Color(hex: "#FF6B6B"), Color(hex: "#FF3B30")],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )

    static let gradientDark = LinearGradient(
        colors: [Color(hex: "#1D1D1F"), Color(hex: "#2C2C2E")],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )

    static let gradientSubtle = LinearGradient(
        colors: [Color.white, Color(hex: "#F5F5F7")],
        startPoint: .top,
        endPoint: .bottom
    )
}

// MARK: - Color Extension for Hex

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }

    init?(hex: String?) {
        guard let hex = hex else { return nil }
        self.init(hex: hex)
    }
}

// MARK: - Typography

enum EventuTypography {
    static let largeTitle = Font.system(size: 34, weight: .bold, design: .rounded)
    static let title1 = Font.system(size: 28, weight: .bold, design: .rounded)
    static let title2 = Font.system(size: 22, weight: .bold, design: .rounded)
    static let title3 = Font.system(size: 20, weight: .semibold, design: .rounded)
    static let headline = Font.system(size: 17, weight: .semibold, design: .rounded)
    static let body = Font.system(size: 17, weight: .regular, design: .rounded)
    static let callout = Font.system(size: 16, weight: .regular, design: .rounded)
    static let subheadline = Font.system(size: 15, weight: .regular, design: .rounded)
    static let footnote = Font.system(size: 13, weight: .regular, design: .rounded)
    static let caption1 = Font.system(size: 12, weight: .regular, design: .rounded)
    static let caption2 = Font.system(size: 11, weight: .regular, design: .rounded)

    // Special
    static let price = Font.system(size: 24, weight: .bold, design: .rounded)
    static let statNumber = Font.system(size: 48, weight: .bold, design: .rounded)
}

// MARK: - Button Styles

struct EventuPrimaryButtonStyle: ButtonStyle {
    var isEnabled: Bool = true

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(EventuTypography.headline)
            .foregroundColor(.white)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
            .background(
                Group {
                    if isEnabled {
                        EventuColors.gradientPrimary
                    } else {
                        Color.gray.opacity(0.3)
                    }
                }
            )
            .cornerRadius(14)
            .shadow(
                color: isEnabled ? EventuColors.primary.opacity(0.3) : .clear,
                radius: configuration.isPressed ? 4 : 8,
                x: 0,
                y: configuration.isPressed ? 2 : 4
            )
            .scaleEffect(configuration.isPressed ? 0.98 : 1.0)
            .animation(.easeInOut(duration: 0.15), value: configuration.isPressed)
    }
}

struct EventuSecondaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(EventuTypography.headline)
            .foregroundColor(EventuColors.textPrimary)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
            .background(Color.white)
            .cornerRadius(14)
            .overlay(
                RoundedRectangle(cornerRadius: 14)
                    .stroke(EventuColors.textTertiary.opacity(0.3), lineWidth: 1.5)
            )
            .scaleEffect(configuration.isPressed ? 0.98 : 1.0)
            .animation(.easeInOut(duration: 0.15), value: configuration.isPressed)
    }
}

// MARK: - View Modifiers

struct EventuCardStyle: ViewModifier {
    var elevated: Bool = false

    func body(content: Content) -> some View {
        content
            .background(Color.white)
            .cornerRadius(20)
            .shadow(
                color: Color.black.opacity(elevated ? 0.12 : 0.06),
                radius: elevated ? 20 : 10,
                x: 0,
                y: elevated ? 10 : 4
            )
    }
}

extension View {
    func eventuCard(elevated: Bool = false) -> some View {
        modifier(EventuCardStyle(elevated: elevated))
    }
}

// MARK: - Reusable Components

struct EventuLogo: View {
    var size: CGFloat = 80
    var showText: Bool = true

    var body: some View {
        VStack(spacing: 12) {
            ZStack {
                Circle()
                    .fill(EventuColors.gradientPrimary)
                    .frame(width: size, height: size)

                Image(systemName: "ticket.fill")
                    .font(.system(size: size * 0.4, weight: .semibold))
                    .foregroundColor(.white)
                    .rotationEffect(.degrees(-15))
            }

            if showText {
                Text("eventu")
                    .font(.system(size: size * 0.35, weight: .bold, design: .rounded))
                    .foregroundColor(EventuColors.textPrimary)
            }
        }
    }
}

struct EventuLoadingView: View {
    @State private var isAnimating = false

    var body: some View {
        VStack(spacing: 20) {
            ZStack {
                Circle()
                    .stroke(EventuColors.primary.opacity(0.2), lineWidth: 4)
                    .frame(width: 50, height: 50)

                Circle()
                    .trim(from: 0, to: 0.3)
                    .stroke(EventuColors.primary, style: StrokeStyle(lineWidth: 4, lineCap: .round))
                    .frame(width: 50, height: 50)
                    .rotationEffect(.degrees(isAnimating ? 360 : 0))
                    .animation(
                        .linear(duration: 1).repeatForever(autoreverses: false),
                        value: isAnimating
                    )
            }

            Text("Cargando...")
                .font(EventuTypography.subheadline)
                .foregroundColor(EventuColors.textSecondary)
        }
        .onAppear {
            isAnimating = true
        }
    }
}

struct EventuEmptyState: View {
    let icon: String
    let title: String
    let message: String
    var actionTitle: String? = nil
    var action: (() -> Void)? = nil

    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: icon)
                .font(.system(size: 56, weight: .light))
                .foregroundColor(EventuColors.textTertiary)

            VStack(spacing: 8) {
                Text(title)
                    .font(EventuTypography.title3)
                    .foregroundColor(EventuColors.textPrimary)

                Text(message)
                    .font(EventuTypography.subheadline)
                    .foregroundColor(EventuColors.textSecondary)
                    .multilineTextAlignment(.center)
            }

            if let actionTitle = actionTitle, let action = action {
                Button(action: action) {
                    Text(actionTitle)
                }
                .buttonStyle(EventuPrimaryButtonStyle())
                .frame(width: 200)
            }
        }
        .padding(40)
    }
}

// MARK: - Countdown Ring

struct CountdownRing: View {
    let timeRemaining: Double
    let totalTime: Double
    var size: CGFloat = 60
    var lineWidth: CGFloat = 4

    var progress: Double {
        timeRemaining / totalTime
    }

    var ringColor: Color {
        timeRemaining <= 3 ? EventuColors.error : EventuColors.primary
    }

    var body: some View {
        ZStack {
            Circle()
                .stroke(ringColor.opacity(0.2), lineWidth: lineWidth)

            Circle()
                .trim(from: 0, to: progress)
                .stroke(
                    ringColor,
                    style: StrokeStyle(lineWidth: lineWidth, lineCap: .round)
                )
                .rotationEffect(.degrees(-90))
                .animation(.linear(duration: 0.1), value: timeRemaining)

            Text("\(Int(timeRemaining))s")
                .font(EventuTypography.headline)
                .foregroundColor(ringColor)
        }
        .frame(width: size, height: size)
    }
}

// MARK: - Price Tag

struct PriceTag: View {
    let price: Int
    var prefix: String = "Desde"
    var size: PriceTagSize = .medium

    enum PriceTagSize {
        case small, medium, large

        var priceFont: Font {
            switch self {
            case .small: return EventuTypography.headline
            case .medium: return EventuTypography.title3
            case .large: return EventuTypography.price
            }
        }

        var prefixFont: Font {
            switch self {
            case .small: return EventuTypography.caption2
            case .medium: return EventuTypography.caption1
            case .large: return EventuTypography.subheadline
            }
        }
    }

    var body: some View {
        VStack(alignment: .trailing, spacing: 2) {
            Text(prefix)
                .font(size.prefixFont)
                .foregroundColor(EventuColors.textSecondary)

            Text(formatPrice(price))
                .font(size.priceFont)
                .foregroundColor(EventuColors.textPrimary)
        }
    }

    private func formatPrice(_ price: Int) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = "COP"
        formatter.maximumFractionDigits = 0
        return formatter.string(from: NSNumber(value: price)) ?? "$\(price)"
    }
}

// MARK: - Status Badge

struct StatusBadge: View {
    let availability: EventAvailability

    init(availability: EventAvailability) {
        self.availability = availability
    }

    init(status: EventAvailability) {
        self.availability = status
    }

    enum EventAvailability {
        case available
        case lastTickets
        case soldOut
        case comingSoon

        var text: String {
            switch self {
            case .available: return "Disponible"
            case .lastTickets: return "Ultimas"
            case .soldOut: return "Agotado"
            case .comingSoon: return "Proximamente"
            }
        }

        var color: Color {
            switch self {
            case .available: return EventuColors.success
            case .lastTickets: return EventuColors.warning
            case .soldOut: return EventuColors.error
            case .comingSoon: return EventuColors.info
            }
        }
    }

    var body: some View {
        Text(availability.text.uppercased())
            .font(EventuTypography.caption2)
            .fontWeight(.bold)
            .foregroundColor(.white)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(availability.color)
            .cornerRadius(6)
    }
}

// MARK: - Shimmer Effect

struct ShimmerModifier: ViewModifier {
    @State private var phase: CGFloat = 0

    func body(content: Content) -> some View {
        content
            .overlay(
                GeometryReader { geometry in
                    LinearGradient(
                        gradient: Gradient(colors: [
                            Color.clear,
                            Color.white.opacity(0.4),
                            Color.clear
                        ]),
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                    .frame(width: geometry.size.width * 2)
                    .offset(x: -geometry.size.width + phase * geometry.size.width * 2)
                }
            )
            .clipped()
            .onAppear {
                withAnimation(.linear(duration: 1.5).repeatForever(autoreverses: false)) {
                    phase = 1
                }
            }
    }
}

extension View {
    func shimmer() -> some View {
        modifier(ShimmerModifier())
    }
}
