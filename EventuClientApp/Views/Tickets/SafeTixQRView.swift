import SwiftUI

struct SafeTixQRView: View {
    @ObservedObject var viewModel: TicketDetailViewModel
    @EnvironmentObject private var networkMonitor: NetworkMonitor

    var body: some View {
        VStack(spacing: 20) {
            // Connection indicator
            connectionIndicator

            // QR Code
            qrCodeView

            // Code display
            codeDisplay

            // Countdown
            countdownView
        }
        .padding(24)
        .background(EventuColors.cardBackground)
        .cornerRadius(20)
        .shadow(color: Color.black.opacity(0.08), radius: 12, x: 0, y: 6)
    }

    // MARK: - Connection Indicator

    private var connectionIndicator: some View {
        HStack(spacing: 8) {
            Circle()
                .fill(networkMonitor.isConnected ? EventuColors.success : EventuColors.warning)
                .frame(width: 8, height: 8)

            Text(networkMonitor.isConnected ? "Conectado" : "Sin conexión")
                .font(.caption)
                .foregroundColor(EventuColors.textSecondary)

            if !networkMonitor.isConnected && viewModel.isOfflineAvailable {
                Text("• Modo offline")
                    .font(.caption)
                    .foregroundColor(EventuColors.primary)
            }

            Spacer()

            // SafeTix badge
            HStack(spacing: 4) {
                Image(systemName: "shield.checkered")
                    .font(.caption2)
                Text("SafeTix")
                    .font(.caption2)
                    .fontWeight(.medium)
            }
            .foregroundColor(EventuColors.primary)
        }
    }

    // MARK: - QR Code View

    private var qrCodeView: some View {
        ZStack {
            // QR Background
            RoundedRectangle(cornerRadius: 16)
                .fill(Color.white)
                .frame(width: 240, height: 240)

            // QR Code
            if let qrImage = viewModel.qrImage {
                Image(decorative: qrImage, scale: 1.0)
                    .interpolation(.none)
                    .resizable()
                    .scaledToFit()
                    .frame(width: 200, height: 200)
            } else {
                // Placeholder
                VStack(spacing: 12) {
                    Image(systemName: "qrcode")
                        .font(.system(size: 60))
                        .foregroundColor(EventuColors.textSecondary)

                    Text("Generando QR...")
                        .font(.caption)
                        .foregroundColor(EventuColors.textSecondary)
                }
            }

            // Animated border
            RoundedRectangle(cornerRadius: 16)
                .stroke(
                    AngularGradient(
                        gradient: Gradient(colors: [
                            EventuColors.primary,
                            EventuColors.primary.opacity(0.3),
                            EventuColors.primary
                        ]),
                        center: .center,
                        startAngle: .degrees(0 - viewModel.progress * 360),
                        endAngle: .degrees(360 - viewModel.progress * 360)
                    ),
                    lineWidth: 3
                )
                .frame(width: 240, height: 240)
                .animation(.linear(duration: 0.1), value: viewModel.progress)
        }
    }

    // MARK: - Code Display

    private var codeDisplay: some View {
        VStack(spacing: 8) {
            Text("Código actual")
                .font(.caption)
                .foregroundColor(EventuColors.textSecondary)

            Text(viewModel.formattedCode)
                .font(.system(size: 28, weight: .bold, design: .monospaced))
                .foregroundColor(EventuColors.text)
                .tracking(4)
        }
    }

    // MARK: - Countdown View

    private var countdownView: some View {
        HStack(spacing: 16) {
            // Countdown ring
            ZStack {
                // Background ring
                Circle()
                    .stroke(EventuColors.surface, lineWidth: 4)
                    .frame(width: 50, height: 50)

                // Progress ring
                Circle()
                    .trim(from: 0, to: 1 - viewModel.progress)
                    .stroke(
                        viewModel.secondsRemaining < 5 ? EventuColors.warning : EventuColors.primary,
                        style: StrokeStyle(lineWidth: 4, lineCap: .round)
                    )
                    .frame(width: 50, height: 50)
                    .rotationEffect(.degrees(-90))
                    .animation(.linear(duration: 0.1), value: viewModel.progress)

                // Seconds
                Text(viewModel.formattedSecondsRemaining)
                    .font(.system(size: 16, weight: .bold, design: .rounded))
                    .foregroundColor(viewModel.secondsRemaining < 5 ? EventuColors.warning : EventuColors.text)
            }

            VStack(alignment: .leading, spacing: 2) {
                Text("Nuevo código en")
                    .font(.caption)
                    .foregroundColor(EventuColors.textSecondary)

                Text("\(viewModel.formattedSecondsRemaining) segundos")
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(EventuColors.text)
            }

            Spacer()

            // Refresh indicator
            Image(systemName: "arrow.triangle.2.circlepath")
                .font(.title2)
                .foregroundColor(EventuColors.primary)
                .rotationEffect(.degrees(viewModel.progress * 360))
                .animation(.linear(duration: 0.1), value: viewModel.progress)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .background(EventuColors.surface)
        .cornerRadius(12)
    }
}

// MARK: - Standalone SafeTix QR

struct StandaloneSafeTixQR: View {
    let ticket: ClientTicket

    @StateObject private var viewModel = TicketDetailViewModel()

    var body: some View {
        SafeTixQRView(viewModel: viewModel)
            .environmentObject(NetworkMonitor.shared)
            .onAppear {
                viewModel.loadTicket(ticket)
            }
            .onDisappear {
                viewModel.stopUpdates()
            }
    }
}

// MARK: - Preview

struct SafeTixQRView_Previews: PreviewProvider {
    static var previews: some View {
        VStack {
            StandaloneSafeTixQR(ticket: ClientTicket.mockTickets[0])
                .padding()
        }
        .background(EventuColors.background)
        .environmentObject(NetworkMonitor.shared)
    }
}
