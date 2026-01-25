import SwiftUI

struct ValidationResultOverlay: View {
    let result: ValidationResult
    let onDismiss: () -> Void

    var body: some View {
        ZStack {
            // Background
            Color.black.opacity(0.85)
                .ignoresSafeArea()

            VStack(spacing: 25) {
                // Result Icon with Animation
                ZStack {
                    Circle()
                        .fill(result.isValid ? Color.green.opacity(0.2) : Color.red.opacity(0.2))
                        .frame(width: 140, height: 140)

                    Image(systemName: result.isValid ? "checkmark.circle.fill" : "xmark.circle.fill")
                        .font(.system(size: 100))
                        .foregroundColor(result.isValid ? .green : .red)
                }
                .scaleEffect(1.0)
                .animation(.spring(response: 0.3, dampingFraction: 0.6), value: result.isValid)

                // Status Text
                Text(result.isValid ? "Entrada Valida" : "Entrada Rechazada")
                    .font(.title.bold())
                    .foregroundColor(.white)

                // Ticket Info or Error
                if result.isValid, let info = result.ticketInfo {
                    validTicketInfo(info)
                } else if let errorCode = result.errorCode {
                    errorInfo(errorCode)
                }

                // Sync Status Badge
                if result.syncStatus == .pending {
                    HStack(spacing: 6) {
                        Image(systemName: "arrow.triangle.2.circlepath")
                        Text("Pendiente de sincronizar")
                    }
                    .font(.caption)
                    .foregroundColor(.yellow)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(Color.yellow.opacity(0.2))
                    .cornerRadius(20)
                }

                // Tap to Dismiss
                Text("Toca para continuar")
                    .font(.caption)
                    .foregroundColor(.white.opacity(0.5))
                    .padding(.top, 20)
            }
            .padding(40)
        }
        .onTapGesture {
            onDismiss()
        }
        .onAppear {
            // Haptic Feedback
            let generator = UINotificationFeedbackGenerator()
            generator.notificationOccurred(result.isValid ? .success : .error)

            // Auto-dismiss after delay
            DispatchQueue.main.asyncAfter(deadline: .now() + AppConstants.UI.validationResultDisplaySeconds) {
                onDismiss()
            }
        }
    }

    // MARK: - Valid Ticket Info

    @ViewBuilder
    private func validTicketInfo(_ info: ValidatedTicketInfo) -> some View {
        VStack(spacing: 15) {
            // Ticket Type
            Text(info.ticketType)
                .font(.title2.bold())
                .foregroundColor(.white)

            // Seat Info
            if let seat = info.seatDescription {
                HStack {
                    Image(systemName: "chair.fill")
                    Text(seat)
                }
                .font(.headline)
                .foregroundColor(.white.opacity(0.9))
            }

            // Section
            if let section = info.section {
                HStack {
                    Image(systemName: "square.grid.2x2")
                    Text("Seccion: \(section)")
                }
                .font(.subheadline)
                .foregroundColor(.white.opacity(0.8))
            }

            Divider()
                .background(Color.white.opacity(0.3))

            // Buyer Info
            VStack(spacing: 8) {
                if let name = info.buyerName {
                    HStack {
                        Image(systemName: "person.fill")
                            .foregroundColor(.blue)
                        Text(name)
                            .font(.headline)
                    }
                    .foregroundColor(.white)
                }

                if let email = info.buyerEmail {
                    HStack {
                        Image(systemName: "envelope.fill")
                            .foregroundColor(.blue)
                        Text(email)
                            .font(.subheadline)
                    }
                    .foregroundColor(.white.opacity(0.8))
                }
            }
        }
        .padding(20)
        .background(Color.white.opacity(0.1))
        .cornerRadius(15)
    }

    // MARK: - Error Info

    @ViewBuilder
    private func errorInfo(_ errorCode: ValidationErrorCode) -> some View {
        VStack(spacing: 12) {
            Image(systemName: errorCode.icon)
                .font(.title)
                .foregroundColor(.red.opacity(0.8))

            Text(errorCode.displayMessage)
                .font(.headline)
                .foregroundColor(.white)
                .multilineTextAlignment(.center)

            if let message = result.errorMessage, message != errorCode.displayMessage {
                Text(message)
                    .font(.caption)
                    .foregroundColor(.white.opacity(0.6))
                    .multilineTextAlignment(.center)
            }
        }
        .padding(20)
        .background(Color.red.opacity(0.1))
        .cornerRadius(15)
    }
}

// MARK: - Manual Entry View

struct ManualEntryView: View {
    @Environment(\.dismiss) var dismiss
    @State private var ticketId = ""
    @State private var code = ""

    let onSubmit: (String) -> Void

    var body: some View {
        NavigationView {
            VStack(spacing: 30) {
                // Instructions
                VStack(spacing: 10) {
                    Image(systemName: "keyboard")
                        .font(.system(size: 50))
                        .foregroundColor(.blue)

                    Text("Entrada Manual")
                        .font(.title2.bold())

                    Text("Ingresa los datos del codigo QR manualmente si no se puede escanear")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)
                }
                .padding(.top, 30)

                // Form
                VStack(spacing: 20) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("ID del Ticket")
                            .font(.caption.bold())
                            .foregroundColor(.secondary)

                        TextField("Ej: abc123-def456", text: $ticketId)
                            .textFieldStyle(RoundedBorderTextFieldStyle())
                            .autocapitalization(.none)
                            .disableAutocorrection(true)
                    }

                    VStack(alignment: .leading, spacing: 8) {
                        Text("Codigo de Validacion")
                            .font(.caption.bold())
                            .foregroundColor(.secondary)

                        TextField("8 digitos", text: $code)
                            .textFieldStyle(RoundedBorderTextFieldStyle())
                            .keyboardType(.numberPad)
                            .onChange(of: code) { newValue in
                                // Limit to 8 digits
                                if newValue.count > 8 {
                                    code = String(newValue.prefix(8))
                                }
                            }
                    }
                }
                .padding(.horizontal, 30)

                Spacer()

                // Submit Button
                Button(action: submit) {
                    Text("Validar Entrada")
                        .font(.headline)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(isFormValid ? Color.blue : Color.gray)
                        .cornerRadius(12)
                }
                .disabled(!isFormValid)
                .padding(.horizontal, 30)
                .padding(.bottom, 30)
            }
            .navigationTitle("Entrada Manual")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancelar") {
                        dismiss()
                    }
                }
            }
        }
    }

    private var isFormValid: Bool {
        !ticketId.isEmpty && code.count == 8
    }

    private func submit() {
        let timestamp = Int64(Date().timeIntervalSince1970 * 1000)
        let payload = """
        {"ticketId":"\(ticketId)","code":"\(code)","timestamp":\(timestamp)}
        """
        onSubmit(payload)
        dismiss()
    }
}

// MARK: - Previews

struct ValidationResultOverlay_Previews: PreviewProvider {
    static var previews: some View {
        Group {
            // Valid result
            ValidationResultOverlay(
                result: ValidationResult(
                    ticketId: "test-123",
                    isValid: true,
                    ticketInfo: ValidatedTicketInfo(
                        ticketType: "VIP",
                        section: "A",
                        seatRow: "5",
                        seatNumber: "12",
                        eventName: "Concierto Test",
                        buyerName: "Juan Perez",
                        buyerEmail: "juan@email.com"
                    )
                ),
                onDismiss: {}
            )
            .previewDisplayName("Valid")

            // Invalid result
            ValidationResultOverlay(
                result: ValidationResult.invalid(
                    ticketId: "test-456",
                    errorCode: .alreadyUsed
                ),
                onDismiss: {}
            )
            .previewDisplayName("Invalid")
        }
    }
}
