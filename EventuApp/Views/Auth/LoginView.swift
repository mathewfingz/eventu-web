import SwiftUI

struct StaffLoginView: View {
    @StateObject private var authService = AuthService.shared
    @State private var email = ""
    @State private var password = ""
    @State private var showPassword = false
    @State private var isAppearing = false

    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // Background
                EventuColors.surface
                    .ignoresSafeArea()

                // Subtle gradient overlay at top
                VStack {
                    LinearGradient(
                        colors: [
                            EventuColors.primary.opacity(0.08),
                            EventuColors.surface.opacity(0)
                        ],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                    .frame(height: geometry.size.height * 0.4)

                    Spacer()
                }
                .ignoresSafeArea()

                ScrollView(showsIndicators: false) {
                    VStack(spacing: 0) {
                        Spacer()
                            .frame(height: geometry.size.height * 0.08)

                        // Logo and Header
                        VStack(spacing: 16) {
                            EventuLogo(size: 90)
                                .scaleEffect(isAppearing ? 1 : 0.8)
                                .opacity(isAppearing ? 1 : 0)

                            VStack(spacing: 8) {
                                Text("Bienvenido")
                                    .font(EventuTypography.largeTitle)
                                    .foregroundColor(EventuColors.textPrimary)

                                Text("Inicia sesion para validar entradas")
                                    .font(EventuTypography.subheadline)
                                    .foregroundColor(EventuColors.textSecondary)
                            }
                            .opacity(isAppearing ? 1 : 0)
                            .offset(y: isAppearing ? 0 : 20)
                        }
                        .padding(.bottom, 40)

                        // Login Form Card
                        VStack(spacing: 24) {
                            // Email Field
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Correo electronico")
                                    .font(EventuTypography.caption1)
                                    .foregroundColor(EventuColors.textSecondary)

                                HStack(spacing: 12) {
                                    Image(systemName: "envelope.fill")
                                        .font(.system(size: 16))
                                        .foregroundColor(EventuColors.textTertiary)
                                        .frame(width: 20)

                                    TextField("tu@email.com", text: $email)
                                        .font(EventuTypography.body)
                                        .textContentType(.emailAddress)
                                        .keyboardType(.emailAddress)
                                        .autocapitalization(.none)
                                        .disableAutocorrection(true)
                                }
                                .padding(16)
                                .background(EventuColors.surface)
                                .cornerRadius(12)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 12)
                                        .stroke(
                                            email.isEmpty ? Color.clear : EventuColors.primary.opacity(0.3),
                                            lineWidth: 1.5
                                        )
                                )
                            }

                            // Password Field
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Contrasena")
                                    .font(EventuTypography.caption1)
                                    .foregroundColor(EventuColors.textSecondary)

                                HStack(spacing: 12) {
                                    Image(systemName: "lock.fill")
                                        .font(.system(size: 16))
                                        .foregroundColor(EventuColors.textTertiary)
                                        .frame(width: 20)

                                    if showPassword {
                                        TextField("Contrasena", text: $password)
                                            .font(EventuTypography.body)
                                    } else {
                                        SecureField("Contrasena", text: $password)
                                            .font(EventuTypography.body)
                                    }

                                    Button(action: { showPassword.toggle() }) {
                                        Image(systemName: showPassword ? "eye.slash.fill" : "eye.fill")
                                            .font(.system(size: 16))
                                            .foregroundColor(EventuColors.textTertiary)
                                    }
                                }
                                .padding(16)
                                .background(EventuColors.surface)
                                .cornerRadius(12)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 12)
                                        .stroke(
                                            password.isEmpty ? Color.clear : EventuColors.primary.opacity(0.3),
                                            lineWidth: 1.5
                                        )
                                )
                            }

                            // Error Message
                            if let error = authService.errorMessage {
                                HStack(spacing: 8) {
                                    Image(systemName: "exclamationmark.triangle.fill")
                                        .font(.system(size: 14))
                                    Text(error)
                                        .font(EventuTypography.caption1)
                                }
                                .foregroundColor(EventuColors.error)
                                .padding(12)
                                .frame(maxWidth: .infinity)
                                .background(EventuColors.error.opacity(0.1))
                                .cornerRadius(10)
                                .transition(.opacity.combined(with: .scale))
                            }

                            // Login Button
                            Button(action: login) {
                                HStack(spacing: 8) {
                                    if authService.isLoading {
                                        ProgressView()
                                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                            .scaleEffect(0.9)
                                    } else {
                                        Text("Iniciar Sesion")
                                    }
                                }
                            }
                            .buttonStyle(EventuPrimaryButtonStyle(isEnabled: isFormValid && !authService.isLoading))
                            .disabled(!isFormValid || authService.isLoading)
                            .padding(.top, 8)
                        }
                        .padding(24)
                        .background(Color.white)
                        .cornerRadius(24)
                        .shadow(color: Color.black.opacity(0.06), radius: 20, x: 0, y: 8)
                        .padding(.horizontal, 24)
                        .opacity(isAppearing ? 1 : 0)
                        .offset(y: isAppearing ? 0 : 30)

                        // Help Text
                        VStack(spacing: 16) {
                            Text("Solo para personal autorizado")
                                .font(EventuTypography.caption1)
                                .foregroundColor(EventuColors.textTertiary)

                            // Mock credentials hint (remove in production)
                            VStack(spacing: 4) {
                                Text("Credenciales de prueba:")
                                    .font(EventuTypography.caption2)
                                    .foregroundColor(EventuColors.textTertiary)
                                Text("coordinador@eventu.co / 123456")
                                    .font(EventuTypography.caption2)
                                    .foregroundColor(EventuColors.primary)
                            }
                            .padding(12)
                            .background(EventuColors.primary.opacity(0.05))
                            .cornerRadius(8)
                        }
                        .padding(.top, 32)
                        .opacity(isAppearing ? 1 : 0)

                        Spacer()
                            .frame(height: 40)
                    }
                }
            }
        }
        .onAppear {
            withAnimation(.easeOut(duration: 0.6).delay(0.1)) {
                isAppearing = true
            }
        }
    }

    private var isFormValid: Bool {
        !email.isEmpty && !password.isEmpty && email.contains("@")
    }

    private func login() {
        Task {
            await authService.signIn(email: email, password: password)
        }
    }
}

// MARK: - Preview

struct StaffLoginView_Previews: PreviewProvider {
    static var previews: some View {
        StaffLoginView()
    }
}
