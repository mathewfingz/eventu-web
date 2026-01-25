import SwiftUI

struct ClientLoginView: View {
    @EnvironmentObject private var authService: ClientAuthService

    @State private var email = ""
    @State private var password = ""
    @State private var showRegister = false
    @State private var showForgotPassword = false
    @State private var showError = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 32) {
                    // Logo
                    logoSection

                    // Form
                    formSection

                    // Social login
                    socialLoginSection

                    // Register link
                    registerLink
                }
                .padding(24)
            }
            .background(EventuColors.background)
            .navigationDestination(isPresented: $showRegister) {
                ClientRegisterView()
            }
            .sheet(isPresented: $showForgotPassword) {
                ForgotPasswordSheet()
            }
            .alert("Error", isPresented: $showError) {
                Button("OK", role: .cancel) {}
            } message: {
                Text(authService.errorMessage ?? "Ha ocurrido un error")
            }
            .onChange(of: authService.errorMessage) { error in
                showError = error != nil
            }
        }
    }

    // MARK: - Logo Section

    private var logoSection: some View {
        VStack(spacing: 16) {
            // Logo
            ZStack {
                Circle()
                    .fill(EventuColors.gradientPrimary)
                    .frame(width: 80, height: 80)

                Text("E")
                    .font(.system(size: 40, weight: .bold, design: .rounded))
                    .foregroundColor(.white)
            }

            VStack(spacing: 4) {
                Text("Eventu")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                    .foregroundColor(EventuColors.text)

                Text("Tu entrada al entretenimiento")
                    .font(.subheadline)
                    .foregroundColor(EventuColors.textSecondary)
            }
        }
        .padding(.top, 40)
    }

    // MARK: - Form Section

    private var formSection: some View {
        VStack(spacing: 20) {
            // Email field
            VStack(alignment: .leading, spacing: 8) {
                Text("Email")
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(EventuColors.text)

                HStack {
                    Image(systemName: "envelope")
                        .foregroundColor(EventuColors.textSecondary)

                    TextField("tu@email.com", text: $email)
                        .textContentType(.emailAddress)
                        .keyboardType(.emailAddress)
                        .autocapitalization(.none)
                        .disableAutocorrection(true)
                }
                .padding(16)
                .background(EventuColors.surface)
                .cornerRadius(12)
            }

            // Password field
            VStack(alignment: .leading, spacing: 8) {
                Text("Contraseña")
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(EventuColors.text)

                HStack {
                    Image(systemName: "lock")
                        .foregroundColor(EventuColors.textSecondary)

                    SecureField("••••••••", text: $password)
                        .textContentType(.password)
                }
                .padding(16)
                .background(EventuColors.surface)
                .cornerRadius(12)
            }

            // Forgot password
            HStack {
                Spacer()
                Button("¿Olvidaste tu contraseña?") {
                    showForgotPassword = true
                }
                .font(.subheadline)
                .foregroundColor(EventuColors.primary)
            }

            // Login button
            Button {
                Task {
                    try? await authService.signIn(email: email, password: password)
                }
            } label: {
                HStack {
                    if authService.isLoading {
                        ProgressView()
                            .tint(.white)
                    } else {
                        Text("Iniciar sesión")
                    }
                }
                .font(.headline)
                .fontWeight(.semibold)
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
                .background(EventuColors.gradientPrimary)
                .cornerRadius(12)
            }
            .disabled(email.isEmpty || password.isEmpty || authService.isLoading)
            .opacity(email.isEmpty || password.isEmpty ? 0.6 : 1)

            // Demo credentials
            VStack(spacing: 8) {
                Text("Credenciales de demo:")
                    .font(.caption)
                    .foregroundColor(EventuColors.textSecondary)

                Button {
                    email = "demo@eventu.co"
                    password = "demo123"
                } label: {
                    Text("demo@eventu.co / demo123")
                        .font(.caption)
                        .fontWeight(.medium)
                        .foregroundColor(EventuColors.primary)
                }
            }
            .padding(.top, 8)
        }
    }

    // MARK: - Social Login Section

    private var socialLoginSection: some View {
        VStack(spacing: 20) {
            // Divider
            HStack {
                Rectangle()
                    .fill(EventuColors.border)
                    .frame(height: 1)

                Text("o continua con")
                    .font(.caption)
                    .foregroundColor(EventuColors.textSecondary)

                Rectangle()
                    .fill(EventuColors.border)
                    .frame(height: 1)
            }

            // Social buttons
            HStack(spacing: 16) {
                SocialLoginButton(icon: "apple.logo", label: "Apple") {
                    // Apple Sign In
                }

                SocialLoginButton(icon: "g.circle.fill", label: "Google") {
                    // Google Sign In
                }
            }
        }
    }

    // MARK: - Register Link

    private var registerLink: some View {
        HStack(spacing: 4) {
            Text("¿No tienes cuenta?")
                .font(.subheadline)
                .foregroundColor(EventuColors.textSecondary)

            Button("Regístrate") {
                showRegister = true
            }
            .font(.subheadline)
            .fontWeight(.semibold)
            .foregroundColor(EventuColors.primary)
        }
    }
}

// MARK: - Social Login Button

struct SocialLoginButton: View {
    let icon: String
    let label: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack {
                Image(systemName: icon)
                    .font(.title3)
                Text(label)
                    .font(.subheadline)
                    .fontWeight(.medium)
            }
            .foregroundColor(EventuColors.text)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(EventuColors.surface)
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(EventuColors.border, lineWidth: 1)
            )
        }
    }
}

// MARK: - Forgot Password Sheet

struct ForgotPasswordSheet: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject private var authService: ClientAuthService

    @State private var email = ""
    @State private var emailSent = false

    var body: some View {
        NavigationStack {
            VStack(spacing: 24) {
                if emailSent {
                    // Success state
                    VStack(spacing: 16) {
                        Image(systemName: "envelope.badge.fill")
                            .font(.system(size: 60))
                            .foregroundColor(EventuColors.success)

                        Text("Email enviado")
                            .font(.title2)
                            .fontWeight(.bold)
                            .foregroundColor(EventuColors.text)

                        Text("Revisa tu bandeja de entrada para restablecer tu contraseña")
                            .font(.subheadline)
                            .foregroundColor(EventuColors.textSecondary)
                            .multilineTextAlignment(.center)

                        Button("Cerrar") {
                            dismiss()
                        }
                        .font(.headline)
                        .foregroundColor(EventuColors.primary)
                        .padding(.top, 16)
                    }
                } else {
                    // Form state
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña")
                            .font(.subheadline)
                            .foregroundColor(EventuColors.textSecondary)

                        TextField("tu@email.com", text: $email)
                            .textContentType(.emailAddress)
                            .keyboardType(.emailAddress)
                            .autocapitalization(.none)
                            .padding(16)
                            .background(EventuColors.surface)
                            .cornerRadius(12)

                        Button {
                            Task {
                                try? await authService.resetPassword(email: email)
                                emailSent = true
                            }
                        } label: {
                            HStack {
                                if authService.isLoading {
                                    ProgressView()
                                        .tint(.white)
                                } else {
                                    Text("Enviar email")
                                }
                            }
                            .font(.headline)
                            .fontWeight(.semibold)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(EventuColors.gradientPrimary)
                            .cornerRadius(12)
                        }
                        .disabled(email.isEmpty || authService.isLoading)
                    }
                }

                Spacer()
            }
            .padding(24)
            .navigationTitle("Recuperar contraseña")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Cancelar") {
                        dismiss()
                    }
                    .foregroundColor(EventuColors.textSecondary)
                }
            }
        }
        .presentationDetents([.medium])
    }
}

// MARK: - Preview

struct ClientLoginView_Previews: PreviewProvider {
    static var previews: some View {
        ClientLoginView()
            .environmentObject(ClientAuthService.shared)
    }
}
