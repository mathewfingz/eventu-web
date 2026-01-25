import Foundation

// MARK: - User Model

struct ClientUser: Codable, Identifiable {
    let id: String
    let email: String
    let name: String?
    let phone: String?
    let avatarUrl: String?
    let createdAt: Date?

    var displayName: String {
        name ?? email.components(separatedBy: "@").first ?? "Usuario"
    }

    var initials: String {
        if let name = name {
            let parts = name.components(separatedBy: " ")
            if parts.count >= 2 {
                return String(parts[0].prefix(1) + parts[1].prefix(1)).uppercased()
            }
            return String(name.prefix(2)).uppercased()
        }
        return String(email.prefix(2)).uppercased()
    }
}

// MARK: - Auth Service

@MainActor
class ClientAuthService: ObservableObject {
    static let shared = ClientAuthService()

    @Published var currentUser: ClientUser?
    @Published var isAuthenticated: Bool = false
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?

    private init() {
        // Check for saved session
        checkSavedSession()
    }

    // MARK: - Public Methods

    func signIn(email: String, password: String) async throws {
        isLoading = true
        errorMessage = nil

        defer { isLoading = false }

        // Simulate network delay
        try await Task.sleep(nanoseconds: 1_000_000_000)

        // Mock authentication - in production, this would call Supabase
        if email.lowercased() == "demo@eventu.co" && password == "demo123" {
            let user = ClientUser(
                id: "user-001",
                email: email,
                name: "Usuario Demo",
                phone: "+57 300 123 4567",
                avatarUrl: nil,
                createdAt: Date()
            )
            self.currentUser = user
            self.isAuthenticated = true
            saveSession(user: user)
        } else if email.contains("@") && password.count >= 6 {
            // Accept any valid-looking credentials for demo
            let user = ClientUser(
                id: UUID().uuidString,
                email: email,
                name: email.components(separatedBy: "@").first?.capitalized,
                phone: nil,
                avatarUrl: nil,
                createdAt: Date()
            )
            self.currentUser = user
            self.isAuthenticated = true
            saveSession(user: user)
        } else {
            throw AuthError.invalidCredentials
        }
    }

    func signUp(email: String, password: String, name: String) async throws {
        isLoading = true
        errorMessage = nil

        defer { isLoading = false }

        // Simulate network delay
        try await Task.sleep(nanoseconds: 1_500_000_000)

        // Validate
        guard email.contains("@") else {
            throw AuthError.invalidEmail
        }

        guard password.count >= 6 else {
            throw AuthError.weakPassword
        }

        // Mock registration
        let user = ClientUser(
            id: UUID().uuidString,
            email: email,
            name: name,
            phone: nil,
            avatarUrl: nil,
            createdAt: Date()
        )

        self.currentUser = user
        self.isAuthenticated = true
        saveSession(user: user)
    }

    func signOut() {
        currentUser = nil
        isAuthenticated = false
        clearSession()
    }

    func resetPassword(email: String) async throws {
        isLoading = true
        errorMessage = nil

        defer { isLoading = false }

        // Simulate network delay
        try await Task.sleep(nanoseconds: 1_000_000_000)

        guard email.contains("@") else {
            throw AuthError.invalidEmail
        }

        // In production, this would send a password reset email
    }

    // MARK: - Session Management

    private func checkSavedSession() {
        if let userData = UserDefaults.standard.data(forKey: "client_user"),
           let user = try? JSONDecoder().decode(ClientUser.self, from: userData) {
            self.currentUser = user
            self.isAuthenticated = true
        }
    }

    private func saveSession(user: ClientUser) {
        if let userData = try? JSONEncoder().encode(user) {
            UserDefaults.standard.set(userData, forKey: "client_user")
        }
    }

    private func clearSession() {
        UserDefaults.standard.removeObject(forKey: "client_user")
    }
}

// MARK: - Auth Errors

enum AuthError: LocalizedError {
    case invalidCredentials
    case invalidEmail
    case weakPassword
    case networkError
    case unknown

    var errorDescription: String? {
        switch self {
        case .invalidCredentials:
            return "Email o contraseña incorrectos"
        case .invalidEmail:
            return "Por favor ingresa un email válido"
        case .weakPassword:
            return "La contraseña debe tener al menos 6 caracteres"
        case .networkError:
            return "Error de conexión. Intenta de nuevo."
        case .unknown:
            return "Ha ocurrido un error inesperado"
        }
    }
}

// MARK: - Mock User

extension ClientUser {
    static let mockUser = ClientUser(
        id: "user-001",
        email: "demo@eventu.co",
        name: "Usuario Demo",
        phone: "+57 300 123 4567",
        avatarUrl: nil,
        createdAt: Date()
    )
}
