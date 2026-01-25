import SwiftUI
import AVFoundation

// MARK: - Coordinator Scanner View
struct CoordinatorScannerView: View {
    @State private var isScanning = false
    @State private var showResultOverlay = false
    @State private var validationResult: SupabaseManager.ValidationResponse?
    
    var body: some View {
        ZStack {
            // Camera Placeholder (In real app, we'd use a UIViewControllerRepresentable for AVFoundation)
            Color.black.edgesIgnoringSafeArea(.all)
            
            VStack {
                Text("Escáner de Coordinador")
                    .font(.headline)
                    .foregroundColor(.white)
                    .padding()
                
                Spacer()
                
                // Scanner Frame
                ZStack {
                    RoundedRectangle(cornerRadius: 20)
                        .stroke(isScanning ? Color.green : Color.white, lineWidth: 2)
                        .frame(width: 250, height: 250)
                    
                    if isScanning {
                        ScannerAnimation()
                    }
                }
                
                Spacer()
                
                // Simulated scan for demo purposes
                if isScanning {
                    Button("Simular Escaneo (Ticket Válido)") {
                        handleScan(payload: "{\"ticketId\": \"test-id\", \"code\": \"12345678\"}")
                    }
                    .foregroundColor(.green)
                    .padding()
                }
                
                Button(action: { isScanning.toggle() }) {
                    Text(isScanning ? "Detener Escaneo" : "Empezar Escaneo")
                        .font(.headline)
                        .foregroundColor(.white)
                        .padding()
                        .frame(maxWidth: .infinity)
                        .background(isScanning ? Color.red : Color.blue)
                        .cornerRadius(15)
                }
                .padding(30)
            }
            
            if let result = validationResult, showResultOverlay {
                ResultOverlay(result: result)
                    .onAppear {
                        // Haptic feedback
                        let generator = UINotificationFeedbackGenerator()
                        generator.notificationOccurred(result.valid ? .success : .error)
                        
                        DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
                            showResultOverlay = false
                            validationResult = nil
                        }
                    }
            }
        }
    }
    
    private func handleScan(payload: String) {
        isScanning = false
        Task {
            let result = await SupabaseManager.shared.validateTicket(payload: payload)
            await MainActor.run {
                self.validationResult = result
                self.showResultOverlay = true
            }
        }
    }
}

struct ScannerAnimation: View {
    @State private var top = false
    
    var body: some View {
        Rectangle()
            .fill(Color.green)
            .frame(width: 230, height: 2)
            .offset(y: top ? 110 : -110)
            .onAppear {
                withAnimation(Animation.linear(duration: 2).repeatForever(autoreverses: true)) {
                    top.toggle()
                }
            }
    }
}

struct ResultOverlay: View {
    let result: SupabaseManager.ValidationResponse
    
    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: result.valid ? "checkmark.circle.fill" : "xmark.circle.fill")
                .font(.system(size: 80))
                .foregroundColor(result.valid ? .green : .red)
            
            Text(result.valid ? "Entrada Válida" : "Entrada Inválida")
                .font(.title2.bold())
                .foregroundColor(.white)
            
            if let ticket = result.ticket {
                VStack(spacing: 5) {
                    Text(ticket.event ?? "Evento")
                        .font(.headline)
                    Text(ticket.type ?? "General")
                        .font(.subheadline)
                    if let row = ticket.seatRow, let seat = ticket.seatNumber {
                        Text("Fila \(row) - Silla \(seat)")
                            .font(.caption)
                    }
                }
                .foregroundColor(.white.opacity(0.8))
            } else if let error = result.error {
                Text(error)
                    .font(.subheadline)
                    .foregroundColor(.red)
            }
        }
        .padding(40)
        .frame(width: 300)
        .background(Color.black.opacity(0.9))
        .cornerRadius(20)
        .shadow(radius: 20)
    }
}

// MARK: - Client Main Tab View (for ticket holders)
struct ClientMainTabView: View {
    @StateObject private var supabase = SupabaseManager.shared

    var body: some View {
        TabView {
            HomeView()
                .tabItem {
                    Label("Explorar", systemImage: "magnifyingglass")
                }

            MyTicketsView()
                .tabItem {
                    Label("Tickets", systemImage: "ticket.fill")
                }

            if supabase.currentUser?.role == .coordinator || supabase.currentUser?.role == .promoter {
                CoordinatorScannerView()
                    .tabItem {
                        Label("Escanear", systemImage: "qrcode.viewfinder")
                    }
            }

            Text("Perfil")
                .tabItem {
                    Label("Perfil", systemImage: "person.crop.circle")
                }
        }
        .accentColor(.blue)
    }
}

// MARK: - App Entry Point Simulation (Legacy - use RootView instead)
struct EventuAppMock: View {
    @StateObject private var supabase = SupabaseManager.shared

    var body: some View {
        Group {
            if supabase.isAuthenticated {
                ClientMainTabView()
            } else {
                StaffLoginView()
            }
        }
        .onAppear {
            Task { await supabase.checkSession() }
        }
    }
}
