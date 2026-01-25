import SwiftUI

struct ClientRegisterView: View {
    @EnvironmentObject private var authService: ClientAuthService
    @Environment(\.dismiss) private var dismiss

    @State private var name = ""
    @State private var email = ""
    @State private var password = ""
    @State private var confirmPassword = ""
    @State private var acceptTerms = false
    @State private var showError = false

    private var passwordsMatch: Bool {
        !password.isEmpty && password == confirmPassword
    }

    private var isFormValid: Bool {
        !name.isEmpty && !email.isEmpty && password.count >= 6 && passwordsMatch && acceptTerms
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Header
                headerSection

                // Form
                formSection

                // Terms
                termsSection

                // Register button
                registerButton
            }
            .padding(24)
        }
        .background(EventuColors.background)
        .navigationTitle("Crear cuenta")
        .navigationBarTitleDisplayMode(.inline)
        .alert("Error", isPresented: $showError) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(authService.errorMessage ?? "Ha ocurrido un error")
        }
        .onChange(of: authService.errorMessage) { error in
            showError = error != nil
        }
    }

    // MARK: - Header Section

    private var headerSection: some View {
        VStack(spacing: 8) {
            Text("Únete a Eventu")
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(EventuColors.text)

            Text("Crea tu cuenta para comprar entradas")
                .font(.subheadline)
                .foregroundColor(EventuColors.textSecondary)
        }
    }

    // MARK: - Form Section

    private var formSection: some View {
        VStack(spacing: 20) {
            // Name field
            FormField(
                label: "Nombre completo",
                icon: "person",
                placeholder: "Tu nombre",
                text: $name
            )

            // Email field
            FormField(
                label: "Email",
                icon: "envelope",
                placeholder: "tu@email.com",
                text: $email,
                keyboardType: .emailAddress
            )

            // Password field
            VStack(alignment: .leading, spacing: 8) {
                Text("Contraseña")
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(EventuColors.text)

                HStack {
                    Image(systemName: "lock")
                        .foregroundColor(EventuColors.textSecondary)

                    SecureField("Mínimo 6 caracteres", text: $password)
                        .textContentType(.newPassword)
                }
                .padding(16)
                .background(EventuColors.surface)
                .cornerRadius(12)

                // Password strength indicator
                if !password.isEmpty {
                    HStack(spacing: 4) {
                        ForEach(0..<4, id: \.self) { index in
                            RoundedRectangle(cornerRadius: 2)
                                .fill(index < passwordStrength ? strengthColor : EventuColors.border)
                                .frame(height: 4)
                        }
                    }
                }
            }

            // Confirm password field
            VStack(alignment: .leading, spacing: 8) {
                Text("Confirmar contraseña")
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(EventuColors.text)

                HStack {
                    Image(systemName: "lock.fill")
                        .foregroundColor(EventuColors.textSecondary)

                    SecureField("Repite tu contraseña", text: $confirmPassword)
                        .textContentType(.newPassword)

                    if !confirmPassword.isEmpty {
                        Image(systemName: passwordsMatch ? "checkmark.circle.fill" : "xmark.circle.fill")
                            .foregroundColor(passwordsMatch ? EventuColors.success : EventuColors.error)
                    }
                }
                .padding(16)
                .background(EventuColors.surface)
                .cornerRadius(12)
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(
                            !confirmPassword.isEmpty && !passwordsMatch ? EventuColors.error : Color.clear,
                            lineWidth: 1
                        )
                )
            }
        }
    }

    // MARK: - Terms Section

    private var termsSection: some View {
        Button {
            acceptTerms.toggle()
        } label: {
            HStack(alignment: .top, spacing: 12) {
                Image(systemName: acceptTerms ? "checkmark.square.fill" : "square")
                    .font(.title3)
                    .foregroundColor(acceptTerms ? EventuColors.primary : EventuColors.textSecondary)

                VStack(alignment: .leading, spacing: 4) {
                    Text("Acepto los ")
                        .foregroundColor(EventuColors.textSecondary)
                    +
                    Text("Términos y Condiciones")
                        .foregroundColor(EventuColors.primary)
                    +
                    Text(" y la ")
                        .foregroundColor(EventuColors.textSecondary)
                    +
                    Text("Política de Privacidad")
                        .foregroundColor(EventuColors.primary)
                }
                .font(.subheadline)
                .multilineTextAlignment(.leading)

                Spacer()
            }
        }
        .buttonStyle(.plain)
    }

    // MARK: - Register Button

    private var registerButton: some View {
        Button {
            Task {
                try? await authService.signUp(email: email, password: password, name: name)
            }
        } label: {
            HStack {
                if authService.isLoading {
                    ProgressView()
                        .tint(.white)
                } else {
                    Text("Crear cuenta")
                }
            }
            .font(.headline)
            .fontWeight(.semibold)
            .foregroundColor(.white)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
            .background(
                isFormValid
                    ? AnyShapeStyle(EventuColors.gradientPrimary)
                    : AnyShapeStyle(EventuColors.textSecondary.opacity(0.3))
            )
            .cornerRadius(12)
        }
        .disabled(!isFormValid || authService.isLoading)
    }

    // MARK: - Password Strength

    private var passwordStrength: Int {
        var strength = 0
        if password.count >= 6 { strength += 1 }
        if password.count >= 8 { strength += 1 }
        if password.contains(where: { $0.isNumber }) { strength += 1 }
        if password.contains(where: { $0.isUppercase }) { strength += 1 }
        return strength
    }

    private var strengthColor: Color {
        switch passwordStrength {
        case 1: return EventuColors.error
        case 2: return EventuColors.warning
        case 3: return EventuColors.success.opacity(0.7)
        case 4: return EventuColors.success
        default: return EventuColors.border
        }
    }
}

// MARK: - Form Field

struct FormField: View {
    let label: String
    let icon: String
    let placeholder: String
    @Binding var text: String
    var keyboardType: UIKeyboardType = .default

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(label)
                .font(.subheadline)
                .fontWeight(.medium)
                .foregroundColor(EventuColors.text)

            HStack {
                Image(systemName: icon)
                    .foregroundColor(EventuColors.textSecondary)

                TextField(placeholder, text: $text)
                    .keyboardType(keyboardType)
                    .autocapitalization(keyboardType == .emailAddress ? .none : .words)
                    .disableAutocorrection(keyboardType == .emailAddress)
            }
            .padding(16)
            .background(EventuColors.surface)
            .cornerRadius(12)
        }
    }
}

// MARK: - Preview

struct ClientRegisterView_Previews: PreviewProvider {
    static var previews: some View {
        NavigationStack {
            ClientRegisterView()
                .environmentObject(ClientAuthService.shared)
        }
    }
}
