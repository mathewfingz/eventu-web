import SwiftUI
import AVFoundation

struct ScannerView: View {
    @StateObject private var viewModel = ScannerViewModel()
    @StateObject private var validationService = ValidationService.shared
    @StateObject private var networkMonitor = NetworkMonitor.shared
    @EnvironmentObject var appState: AppState

    var body: some View {
        ZStack {
            // Camera Preview
            CameraPreviewView(viewModel: viewModel)
                .ignoresSafeArea()

            // Scanner Overlay
            EventuScannerOverlay(
                isScanning: viewModel.isScanning,
                isConnected: networkMonitor.isConnected
            )

            // Top Bar
            VStack {
                EventuScannerTopBar(
                    eventName: appState.selectedEvent?.name ?? "Evento",
                    isConnected: networkMonitor.isConnected
                )
                Spacer()
            }

            // Bottom Controls
            VStack {
                Spacer()

                // Stats Pills
                HStack(spacing: 24) {
                    EventuStatPill(
                        icon: "checkmark.circle.fill",
                        value: "\(viewModel.validCount)",
                        label: "Validos",
                        color: EventuColors.success
                    )
                    EventuStatPill(
                        icon: "xmark.circle.fill",
                        value: "\(viewModel.invalidCount)",
                        label: "Rechazados",
                        color: EventuColors.error
                    )
                }
                .padding(.horizontal, 24)
                .padding(.vertical, 16)
                .background(
                    RoundedRectangle(cornerRadius: 20)
                        .fill(.ultraThinMaterial)
                        .shadow(color: .black.opacity(0.2), radius: 10, x: 0, y: 5)
                )
                .padding(.bottom, 24)

                // Control Buttons
                HStack(spacing: 24) {
                    // Flashlight Toggle
                    EventuControlButton(
                        icon: viewModel.isFlashlightOn ? "flashlight.on.fill" : "flashlight.off.fill",
                        isActive: viewModel.isFlashlightOn,
                        activeColor: EventuColors.warning,
                        action: viewModel.toggleFlashlight
                    )

                    // Main Scan Button
                    Button(action: viewModel.toggleScanning) {
                        ZStack {
                            // Outer ring
                            Circle()
                                .stroke(
                                    viewModel.isScanning ? EventuColors.error : EventuColors.primary,
                                    lineWidth: 4
                                )
                                .frame(width: 90, height: 90)

                            // Inner circle
                            Circle()
                                .fill(
                                    viewModel.isScanning
                                        ? AnyShapeStyle(EventuColors.error)
                                        : AnyShapeStyle(EventuColors.gradientPrimary)
                                )
                                .frame(width: 76, height: 76)
                                .shadow(color: EventuColors.primary.opacity(0.4), radius: 10, x: 0, y: 5)

                            Image(systemName: viewModel.isScanning ? "stop.fill" : "qrcode.viewfinder")
                                .font(.system(size: 28, weight: .semibold))
                                .foregroundColor(.white)
                        }
                    }
                    .scaleEffect(viewModel.isScanning ? 1.05 : 1.0)
                    .animation(.easeInOut(duration: 0.3), value: viewModel.isScanning)

                    // Manual Entry
                    EventuControlButton(
                        icon: "keyboard",
                        isActive: false,
                        activeColor: EventuColors.textSecondary,
                        action: { viewModel.showManualEntry = true }
                    )
                }
                .padding(.bottom, 40)
            }

            // Validation Result Overlay
            if let result = validationService.lastResult, viewModel.showResult {
                EventuValidationResultOverlay(
                    result: result,
                    onDismiss: viewModel.dismissResult
                )
                .transition(.asymmetric(
                    insertion: .scale.combined(with: .opacity),
                    removal: .opacity
                ))
            }

            // Loading Overlay
            if validationService.isValidating {
                Color.black.opacity(0.6)
                    .ignoresSafeArea()
                VStack(spacing: 16) {
                    ProgressView()
                        .scaleEffect(1.5)
                        .tint(.white)
                    Text("Validando...")
                        .font(EventuTypography.subheadline)
                        .foregroundColor(.white)
                }
                .padding(32)
                .background(.ultraThinMaterial)
                .cornerRadius(20)
            }
        }
        .sheet(isPresented: $viewModel.showManualEntry) {
            ManualEntryView { code in
                viewModel.processManualCode(code)
            }
        }
        .onAppear {
            if let eventId = appState.selectedEvent?.id {
                validationService.setCurrentEvent(eventId)
            }
        }
        .alert("Permiso de Camara", isPresented: .constant(!viewModel.cameraPermissionGranted && !viewModel.isScanning)) {
            Button("Abrir Configuracion") {
                if let url = URL(string: UIApplication.openSettingsURLString) {
                    UIApplication.shared.open(url)
                }
            }
            Button("Cancelar", role: .cancel) {}
        } message: {
            Text("Se requiere acceso a la camara para escanear codigos QR")
        }
    }
}

// MARK: - Eventu Scanner Top Bar

struct EventuScannerTopBar: View {
    let eventName: String
    let isConnected: Bool

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(eventName)
                    .font(EventuTypography.headline)
                    .foregroundColor(.white)
                    .lineLimit(1)
                Text("Escaneando entradas")
                    .font(EventuTypography.caption1)
                    .foregroundColor(.white.opacity(0.7))
            }

            Spacer()

            // Connection Status Badge
            HStack(spacing: 6) {
                Circle()
                    .fill(isConnected ? EventuColors.success : EventuColors.error)
                    .frame(width: 8, height: 8)
                Text(isConnected ? "Online" : "Offline")
                    .font(EventuTypography.caption2)
                    .foregroundColor(.white)
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(
                Capsule()
                    .fill(.ultraThinMaterial)
            )
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 16)
        .background(
            LinearGradient(
                colors: [.black.opacity(0.8), .black.opacity(0.4), .clear],
                startPoint: .top,
                endPoint: .bottom
            )
        )
    }
}

// MARK: - Eventu Stat Pill

struct EventuStatPill: View {
    let icon: String
    let value: String
    let label: String
    let color: Color

    var body: some View {
        HStack(spacing: 10) {
            Image(systemName: icon)
                .font(.system(size: 20, weight: .semibold))
                .foregroundColor(color)

            VStack(alignment: .leading, spacing: 2) {
                Text(value)
                    .font(EventuTypography.title3)
                    .foregroundColor(EventuColors.textPrimary)
                Text(label)
                    .font(EventuTypography.caption2)
                    .foregroundColor(EventuColors.textSecondary)
            }
        }
    }
}

// MARK: - Eventu Control Button

struct EventuControlButton: View {
    let icon: String
    let isActive: Bool
    let activeColor: Color
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Image(systemName: icon)
                .font(.system(size: 22, weight: .semibold))
                .foregroundColor(.white)
                .frame(width: 56, height: 56)
                .background(
                    Circle()
                        .fill(isActive ? activeColor : Color.white.opacity(0.2))
                        .shadow(color: isActive ? activeColor.opacity(0.4) : .clear, radius: 8, x: 0, y: 4)
                )
        }
    }
}

// MARK: - Eventu Scanner Overlay

struct EventuScannerOverlay: View {
    let isScanning: Bool
    let isConnected: Bool

    var body: some View {
        GeometryReader { geometry in
            let scannerSize: CGFloat = min(geometry.size.width * 0.72, 300)

            ZStack {
                // Dimmed Background
                Color.black.opacity(0.65)

                // Scanner Window (transparent)
                RoundedRectangle(cornerRadius: 24)
                    .frame(width: scannerSize, height: scannerSize)
                    .blendMode(.destinationOut)

                // Scanner Frame with gradient border
                RoundedRectangle(cornerRadius: 24)
                    .stroke(
                        isScanning ? EventuColors.primary : Color.white.opacity(0.8),
                        lineWidth: 3
                    )
                    .frame(width: scannerSize, height: scannerSize)

                // Corner Accents
                EventuScannerCorners(
                    size: scannerSize,
                    color: isScanning ? EventuColors.primary : .white
                )

                // Scanning Line Animation
                if isScanning {
                    EventuScannerLine(scannerSize: scannerSize)
                }

                // Instructions Badge
                VStack {
                    Spacer()
                        .frame(height: geometry.size.height / 2 + scannerSize / 2 + 40)

                    HStack(spacing: 8) {
                        Image(systemName: isScanning ? "viewfinder" : "hand.tap")
                            .font(.system(size: 14, weight: .semibold))
                        Text(isScanning ? "Apunta al codigo QR" : "Presiona para escanear")
                            .font(EventuTypography.subheadline)
                    }
                    .foregroundColor(.white)
                    .padding(.horizontal, 20)
                    .padding(.vertical, 12)
                    .background(
                        Capsule()
                            .fill(.ultraThinMaterial)
                    )
                }
            }
            .compositingGroup()
        }
    }
}

// MARK: - Eventu Scanner Corners

struct EventuScannerCorners: View {
    let size: CGFloat
    let color: Color

    var body: some View {
        ZStack {
            ForEach(0..<4, id: \.self) { index in
                EventuCornerShape()
                    .stroke(color, lineWidth: 5)
                    .frame(width: 36, height: 36)
                    .rotationEffect(.degrees(Double(index) * 90))
                    .offset(
                        x: cornerOffset(for: index).x,
                        y: cornerOffset(for: index).y
                    )
            }
        }
    }

    private func cornerOffset(for index: Int) -> CGPoint {
        let offset = size / 2 - 18
        switch index {
        case 0: return CGPoint(x: -offset, y: -offset)
        case 1: return CGPoint(x: offset, y: -offset)
        case 2: return CGPoint(x: offset, y: offset)
        case 3: return CGPoint(x: -offset, y: offset)
        default: return .zero
        }
    }
}

struct EventuCornerShape: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        path.move(to: CGPoint(x: 0, y: rect.height))
        path.addLine(to: CGPoint(x: 0, y: 6))
        path.addQuadCurve(to: CGPoint(x: 6, y: 0), control: CGPoint(x: 0, y: 0))
        path.addLine(to: CGPoint(x: rect.width, y: 0))
        return path
    }
}

// MARK: - Eventu Scanner Line Animation

struct EventuScannerLine: View {
    let scannerSize: CGFloat
    @State private var offset: CGFloat = -1

    var body: some View {
        Rectangle()
            .fill(
                LinearGradient(
                    colors: [.clear, EventuColors.primary.opacity(0.8), .clear],
                    startPoint: .leading,
                    endPoint: .trailing
                )
            )
            .frame(width: scannerSize - 48, height: 3)
            .offset(y: offset * (scannerSize / 2 - 24))
            .onAppear {
                withAnimation(
                    .linear(duration: 2.0)
                    .repeatForever(autoreverses: true)
                ) {
                    offset = 1
                }
            }
    }
}

// MARK: - Eventu Validation Result Overlay

struct EventuValidationResultOverlay: View {
    let result: ValidationResult
    let onDismiss: () -> Void

    @State private var isAppearing = false

    var body: some View {
        ZStack {
            // Background blur
            Color.black.opacity(0.7)
                .ignoresSafeArea()
                .onTapGesture(perform: onDismiss)

            // Result Card
            VStack(spacing: 0) {
                // Status Icon
                ZStack {
                    Circle()
                        .fill(statusColor.opacity(0.15))
                        .frame(width: 120, height: 120)

                    Circle()
                        .fill(statusColor.opacity(0.3))
                        .frame(width: 90, height: 90)

                    Image(systemName: statusIcon)
                        .font(.system(size: 44, weight: .bold))
                        .foregroundColor(statusColor)
                }
                .scaleEffect(isAppearing ? 1 : 0.5)
                .padding(.top, 32)

                // Status Text
                Text(statusTitle)
                    .font(EventuTypography.title2)
                    .foregroundColor(statusColor)
                    .padding(.top, 20)

                Text(statusMessage)
                    .font(EventuTypography.subheadline)
                    .foregroundColor(EventuColors.textSecondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 24)
                    .padding(.top, 8)

                // Buyer Info (if valid)
                if result.isValid, let ticket = result.ticketInfo {
                    VStack(spacing: 12) {
                        Divider()
                            .padding(.vertical, 16)

                        // Buyer Name
                        if let buyerName = ticket.buyerName {
                            HStack(spacing: 12) {
                                Image(systemName: "person.fill")
                                    .font(.system(size: 18))
                                    .foregroundColor(EventuColors.primary)
                                    .frame(width: 24)

                                VStack(alignment: .leading, spacing: 2) {
                                    Text("Comprador")
                                        .font(EventuTypography.caption2)
                                        .foregroundColor(EventuColors.textTertiary)
                                    Text(buyerName)
                                        .font(EventuTypography.body)
                                        .foregroundColor(EventuColors.textPrimary)
                                }

                                Spacer()
                            }
                        }

                        // Buyer Email
                        if let buyerEmail = ticket.buyerEmail {
                            HStack(spacing: 12) {
                                Image(systemName: "envelope.fill")
                                    .font(.system(size: 18))
                                    .foregroundColor(EventuColors.primary)
                                    .frame(width: 24)

                                VStack(alignment: .leading, spacing: 2) {
                                    Text("Email")
                                        .font(EventuTypography.caption2)
                                        .foregroundColor(EventuColors.textTertiary)
                                    Text(buyerEmail)
                                        .font(EventuTypography.body)
                                        .foregroundColor(EventuColors.textPrimary)
                                }

                                Spacer()
                            }
                        }

                        // Ticket Type
                        HStack(spacing: 12) {
                            Image(systemName: "ticket.fill")
                                .font(.system(size: 18))
                                .foregroundColor(EventuColors.primary)
                                .frame(width: 24)

                            VStack(alignment: .leading, spacing: 2) {
                                Text("Tipo de Entrada")
                                    .font(EventuTypography.caption2)
                                    .foregroundColor(EventuColors.textTertiary)
                                Text(ticket.ticketType)
                                    .font(EventuTypography.body)
                                    .foregroundColor(EventuColors.textPrimary)
                            }

                            Spacer()
                        }
                    }
                    .padding(.horizontal, 24)
                }

                Spacer()

                // Dismiss Button
                Button(action: onDismiss) {
                    Text("Continuar")
                        .font(EventuTypography.headline)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 16)
                        .background(statusColor)
                        .cornerRadius(14)
                }
                .padding(.horizontal, 24)
                .padding(.bottom, 24)
            }
            .frame(width: UIScreen.main.bounds.width - 48)
            .frame(maxHeight: 520)
            .background(Color.white)
            .cornerRadius(28)
            .shadow(color: .black.opacity(0.3), radius: 30, x: 0, y: 15)
            .scaleEffect(isAppearing ? 1 : 0.9)
            .opacity(isAppearing ? 1 : 0)
        }
        .onAppear {
            withAnimation(.spring(response: 0.4, dampingFraction: 0.7)) {
                isAppearing = true
            }

            // Auto-dismiss after delay
            DispatchQueue.main.asyncAfter(deadline: .now() + 4) {
                onDismiss()
            }
        }
    }

    private var statusColor: Color {
        if result.isValid {
            return EventuColors.success
        } else if result.errorCode == .alreadyUsed {
            return EventuColors.warning
        } else {
            return EventuColors.error
        }
    }

    private var statusIcon: String {
        if result.isValid {
            return "checkmark.circle.fill"
        } else if result.errorCode == .alreadyUsed {
            return "exclamationmark.triangle.fill"
        } else {
            return "xmark.circle.fill"
        }
    }

    private var statusTitle: String {
        if result.isValid {
            return "Entrada Valida"
        } else if result.errorCode == .alreadyUsed {
            return "Ya Utilizada"
        } else {
            return "Entrada Invalida"
        }
    }

    private var statusMessage: String {
        if result.isValid {
            return "Entrada verificada correctamente"
        } else {
            return result.errorMessage ?? result.errorCode?.displayMessage ?? "Error desconocido"
        }
    }
}

// MARK: - Preview

struct ScannerView_Previews: PreviewProvider {
    static var previews: some View {
        ScannerView()
            .environmentObject(AppState.shared)
    }
}
