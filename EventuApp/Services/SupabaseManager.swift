import Foundation
import Supabase
import UIKit

class SupabaseManager: ObservableObject {
    static let shared = SupabaseManager()
    
    let client: SupabaseClient
    
    @Published var currentUser: User?
    @Published var isAuthenticated = false
    
    private init() {
        // These values are based on the web project's .env.local
        let supabaseURL = URL(string: "https://lkjsrbizwpqaockawxsh.supabase.co")!
        let supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxranNyYml6d3BxYW9ja2F3eHNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNTQyMDAsImV4cCI6MjA4MTYzMDIwMH0.hbopb1OwHxX2LdipQLMVbBcp4zgLi9FEnBEPktmJNNM"
        
        self.client = SupabaseClient(supabaseURL: supabaseURL, supabaseKey: supabaseKey)
    }
    
    // MARK: - Authentication
    
    func checkSession() async {
        do {
            let session = try await client.auth.session
            await MainActor.run {
                self.isAuthenticated = true
                // Fetch user profile from public.User table
                Task { await fetchUserProfile(userId: session.user.id.uuidString) }
            }
        } catch {
            await MainActor.run { self.isAuthenticated = false }
        }
    }
    
    func fetchUserProfile(userId: String) async {
        do {
            let user: User = try await client
                .from("User")
                .select()
                .eq("id", value: userId)
                .single()
                .execute()
                .value
            
            await MainActor.run { self.currentUser = user }
        } catch {
            print("Error fetching user profile: \(error)")
        }
    }
    
    // MARK: - Events
    
    func fetchEvents() async throws -> [Event] {
        let events: [Event] = try await client
            .from("Event")
            .select("*, venue:Venue(*)")
            .eq("status", value: "PUBLISHED")
            .order("date", ascending: true)
            .execute()
            .value
        return events
    }
    
    // MARK: - Tickets
    
    func fetchMyTickets() async throws -> [Ticket] {
        guard let userId = currentUser?.id else { return [] }
        
        let tickets: [Ticket] = try await client
            .from("Ticket")
            .select("*, ticketType:TicketType(*, event:Event(*, venue:Venue(*)))")
            .eq("userId", value: userId)
            .execute()
            .value
        return tickets
    }
    
    // MARK: - Coordinator Actions
    
    struct ValidationResponse: Codable {
        let valid: Bool
        let error: String?
        let errorCode: String?
        let ticket: ValidTicket?
    }
    
    struct ValidTicket: Codable {
        let id: String
        let type: String?
        let event: String?
        let seatRow: String?
        let seatNumber: String?
    }
    
    func validateTicket(payload: String) async -> ValidationResponse {
        guard let data = payload.data(using: .utf8),
              let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let ticketId = json["ticketId"] as? String,
              let code = json["code"] as? String else {
            return ValidationResponse(valid: false, error: "QR Inválido", errorCode: "INVALID_QR", ticket: nil)
        }
        
        let apiURL = URL(string: "https://eventu-web.vercel.app/api/tickets/validate")! // Replace with your production URL
        var request = URLRequest(url: apiURL)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        // Add Authorization header if needed (matching the web's use of Supabase Auth)
        do {
            let session = try await client.auth.session
            request.setValue("Bearer \(session.accessToken)", forHTTPHeaderField: "Authorization")
        } catch {
            return ValidationResponse(valid: false, error: "Sesión expirada", errorCode: "UNAUTHORIZED", ticket: nil)
        }
        
        let body: [String: Any] = [
            "ticketId": ticketId,
            "code": code,
            "deviceId": UIDevice.current.identifierForVendor?.uuidString ?? "ios-device"
        ]
        
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        
        do {
            let (responseData, _) = try await URLSession.shared.data(for: request)
            let result = try JSONDecoder().decode(ValidationResponse.self, from: responseData)
            return result
        } catch {
            return ValidationResponse(valid: false, error: "Error de conexión", errorCode: "NETWORK_ERROR", ticket: nil)
        }
    }
}
