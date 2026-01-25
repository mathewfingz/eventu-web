import Foundation
import Supabase
import UIKit

@MainActor
class AuthService: ObservableObject {
    static let shared = AuthService()

    @Published var currentUser: StaffUser?
    @Published var isAuthenticated = false
    @Published var isLoading = false
    @Published var errorMessage: String?

    private let supabase = SupabaseManager.shared.client

    // MARK: - Mock Mode Configuration
    // Set to true to bypass Supabase authentication for testing
    private let useMockAuth = true

    // Mock users for testing - use these credentials in the login screen
    private let mockUsers: [String: (password: String, user: StaffUser)] = [
        "coordinador@eventu.co": (
            password: "123456",
            user: StaffUser(
                id: "mock-coordinator-001",
                email: "coordinador@eventu.co",
                name: "Juan Coordinador",
                role: .coordinator,
                assignedEvents: [],
                deviceId: "mock-device"
            )
        ),
        "validador@eventu.co": (
            password: "123456",
            user: StaffUser(
                id: "mock-validator-001",
                email: "validador@eventu.co",
                name: "Maria Validadora",
                role: .validator,
                assignedEvents: [],
                deviceId: "mock-device"
            )
        ),
        "admin@eventu.co": (
            password: "admin123",
            user: StaffUser(
                id: "mock-admin-001",
                email: "admin@eventu.co",
                name: "Super Admin",
                role: .superadmin,
                assignedEvents: [],
                deviceId: "mock-device"
            )
        )
    ]

    private init() {}

    // MARK: - Sign In

    func signIn(email: String, password: String) async {
        isLoading = true
        errorMessage = nil

        // Mock authentication for testing
        if useMockAuth {
            await signInMock(email: email, password: password)
            isLoading = false
            return
        }

        do {
            // 1. Authenticate with Supabase
            let session = try await supabase.auth.signIn(
                email: email,
                password: password
            )

            // 2. Fetch staff profile
            let profile = try await fetchStaffProfile(userId: session.user.id.uuidString)

            // 3. Verify role permissions
            guard canAccessApp(role: profile.role) else {
                throw AuthError.insufficientPermissions
            }

            self.currentUser = profile
            self.isAuthenticated = true

            // Update AppState
            AppState.shared.setUser(profile)

        } catch let error as AuthError {
            self.errorMessage = error.localizedDescription
        } catch {
            self.errorMessage = "Error de autenticacion: \(error.localizedDescription)"
        }

        isLoading = false
    }

    // MARK: - Mock Sign In

    private func signInMock(email: String, password: String) async {
        // Simulate network delay
        try? await Task.sleep(nanoseconds: 500_000_000) // 0.5 seconds

        let emailLower = email.lowercased().trimmingCharacters(in: .whitespaces)

        guard let mockData = mockUsers[emailLower] else {
            self.errorMessage = "Usuario no encontrado. Usa: coordinador@eventu.co, validador@eventu.co, o admin@eventu.co"
            return
        }

        guard mockData.password == password else {
            self.errorMessage = "Contrasena incorrecta. Usa: 123456 (o admin123 para admin)"
            return
        }

        self.currentUser = mockData.user
        self.isAuthenticated = true
        AppState.shared.setUser(mockData.user)
    }

    // MARK: - Session Check

    func checkSession() async {
        isLoading = true

        // In mock mode, just check if we have a stored user
        if useMockAuth {
            // No persistent session in mock mode - user needs to login
            isLoading = false
            return
        }

        do {
            let session = try await supabase.auth.session
            let profile = try await fetchStaffProfile(userId: session.user.id.uuidString)

            guard canAccessApp(role: profile.role) else {
                try await signOut()
                return
            }

            self.currentUser = profile
            self.isAuthenticated = true
            AppState.shared.setUser(profile)

        } catch {
            self.isAuthenticated = false
            self.currentUser = nil
        }

        isLoading = false
    }

    // MARK: - Sign Out

    func signOut() async throws {
        if !useMockAuth {
            try await supabase.auth.signOut()
        }
        currentUser = nil
        isAuthenticated = false
        AppState.shared.signOut()
    }

    // MARK: - Private Helpers

    private func fetchStaffProfile(userId: String) async throws -> StaffUser {
        struct UserResponse: Codable {
            let id: String
            let email: String
            let name: String?
            let role: String
        }

        let response: UserResponse = try await supabase
            .from("User")
            .select("id, email, name, role")
            .eq("id", value: userId)
            .single()
            .execute()
            .value

        guard let role = ValidatorRole(rawValue: response.role.uppercased()) ??
              mapLegacyRole(response.role) else {
            throw AuthError.invalidRole
        }

        // Fetch assigned events for coordinators
        let assignedEvents = try await fetchAssignedEvents(userId: userId, role: role)

        return StaffUser(
            id: response.id,
            email: response.email,
            name: response.name,
            role: role,
            assignedEvents: assignedEvents,
            deviceId: UIDevice.current.identifierForVendor?.uuidString
        )
    }

    private func fetchAssignedEvents(userId: String, role: ValidatorRole) async throws -> [String] {
        // For SUPERADMIN, return empty (has access to all events)
        if role == .superadmin {
            return []
        }

        // For COORDINATOR, fetch events where they are assigned
        // This would need a coordinator_events junction table or similar
        // For now, return empty and rely on API filtering
        return []
    }

    private func mapLegacyRole(_ roleString: String) -> ValidatorRole? {
        switch roleString.uppercased() {
        case "COORDINATOR": return .coordinator
        case "SUPERADMIN": return .superadmin
        case "PROMOTER": return .promoter
        default: return .validator
        }
    }

    private func canAccessApp(role: ValidatorRole) -> Bool {
        // Only these roles can use the validation app
        return [.validator, .coordinator, .superadmin, .promoter].contains(role)
    }
}

// MARK: - Auth Errors

enum AuthError: LocalizedError {
    case insufficientPermissions
    case invalidRole
    case sessionExpired
    case invalidCredentials
    case networkError

    var errorDescription: String? {
        switch self {
        case .insufficientPermissions:
            return "No tienes permisos para usar esta aplicacion"
        case .invalidRole:
            return "Rol de usuario no valido para esta aplicacion"
        case .sessionExpired:
            return "Tu sesion ha expirado. Por favor inicia sesion nuevamente"
        case .invalidCredentials:
            return "Credenciales invalidas"
        case .networkError:
            return "Error de conexion. Verifica tu internet"
        }
    }
}
