import SwiftUI
import CoreImage.CIFilterBuiltins

// MARK: - My Tickets View
struct MyTicketsView: View {
    @StateObject private var viewModel = MyTicketsViewModel()
    
    var body: some View {
        NavigationView {
            List {
                if viewModel.tickets.isEmpty {
                    VStack(spacing: 20) {
                        Image(systemName: "ticket")
                            .font(.system(size: 80))
                            .foregroundColor(.gray.opacity(0.3))
                        Text("Aún no tienes entradas")
                            .font(.headline)
                        Text("Tus entradas compradas aparecerán aquí.")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    .frame(maxWidth: .infinity, minHeight: 400)
                    .listRowBackground(Color.clear)
                } else {
                    ForEach(viewModel.tickets) { ticket in
                        NavigationLink(destination: TicketDetailView(ticket: ticket)) {
                            TicketRow(ticket: ticket)
                        }
                    }
                }
            }
            .navigationTitle("Mis Entradas")
            .onAppear {
                Task { await viewModel.loadTickets() }
            }
            .refreshable {
                await viewModel.loadTickets()
            }
        }
    }
}

// MARK: - Ticket Row
struct TicketRow: View {
    let ticket: Ticket
    
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text(ticket.event?.name ?? "Evento")
                    .font(.headline)
                Spacer()
                StatusBadge(status: ticket.status)
            }
            
            HStack {
                Image(systemName: "calendar")
                Text(ticket.event?.date.formatted(date: .abbreviated, time: .shortened) ?? "Fecha TBD")
                Spacer()
                Text(ticket.ticketType?.name ?? "General")
                    .font(.caption.bold())
                    .padding(5)
                    .background(Color.blue.opacity(0.1))
                    .cornerRadius(5)
            }
            .font(.subheadline)
            .foregroundColor(.secondary)
        }
        .padding(.vertical, 8)
    }
}

struct StatusBadge: View {
    let status: TicketStatus
    
    var body: some View {
        Text(status.rawValue.capitalized)
            .font(.caption2.bold())
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(colorForStatus(status).opacity(0.2))
            .foregroundColor(colorForStatus(status))
            .cornerRadius(10)
    }
    
    func colorForStatus(_ status: TicketStatus) -> Color {
        switch status {
        case .active: return .green
        case .used: return .gray
        case .cancelled: return .red
        case .reserved: return .orange
        case .transferred: return .blue
        }
    }
}

// MARK: - Ticket Detail / SafeTix View
struct TicketDetailView: View {
    let ticket: Ticket
    @State private var qrPayload: String = ""
    @State private var timeRemaining: Double = 15.0
    
    let timer = Timer.publish(every: 1.0, on: .main, in: .common).autoconnect()
    
    var body: some View {
        ScrollView {
            VStack(spacing: 25) {
                // Event Header
                VStack(spacing: 10) {
                    Text(ticket.event?.name ?? "Evento")
                        .font(.title2.bold())
                        .multilineTextAlignment(.center)
                    
                    Text(ticket.event?.venue?.name ?? "Venue")
                        .font(.headline)
                        .foregroundColor(.secondary)
                }
                .padding(.top)
                
                // SafeTix QR Section
                VStack(spacing: 15) {
                    Text("SafeTix™")
                        .font(.caption.bold())
                        .foregroundColor(.blue)
                    
                    if let secret = ticket.safetixSecret {
                        SafeTixQRView(token: qrPayload)
                            .frame(width: 250, height: 250)
                            .background(Color.white)
                            .cornerRadius(20)
                            .shadow(radius: 10)
                    } else {
                        VStack {
                            Image(systemName: "qrcode")
                                .font(.system(size: 100))
                                .foregroundColor(.gray.opacity(0.2))
                            Text("QR no disponible")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        .frame(width: 250, height: 250)
                    }
                    
                    Text("Este código se actualiza automáticamente")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    // Countdown bar
                    ProgressView(value: timeRemaining, total: 15.0)
                        .accentColor(timeRemaining < 3 ? .red : .blue)
                        .frame(width: 200)
                        .animation(.linear, value: timeRemaining)
                }
                .padding()
                .background(Color(UIColor.secondarySystemBackground))
                .cornerRadius(30)
                
                // Ticket Info
                VStack(alignment: .leading, spacing: 15) {
                    InfoRow(label: "Tipo", value: ticket.ticketType?.name ?? "General")
                    InfoRow(label: "Ubicación", value: "\(ticket.seatRow ?? "No") - \(ticket.seatNumber ?? "Asig")")
                    InfoRow(label: "ID de Entrada", value: String(ticket.id.suffix(8)).uppercased())
                }
                .padding()
                .background(Color(UIColor.secondarySystemBackground))
                .cornerRadius(15)
                
                // Security Note
                Text("Presenta este código en la entrada del evento. No se aceptan capturas de pantalla.")
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)
            }
            .padding()
        }
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            updateToken()
        }
        .onReceive(timer) { _ in
            let step: Double = 15.0
            let now = Date().timeIntervalSince1970
            timeRemaining = step - now.truncatingRemainder(dividingBy: step)
            
            // Generate new token if we just rotated or if payload is empty
            if timeRemaining > 14.0 || qrPayload.isEmpty {
                updateToken()
            }
        }
    }
    
    private func updateToken() {
        if let secret = ticket.safetixSecret {
            qrPayload = SafeTixService.shared.generateQRPayload(ticketId: ticket.id, secret: secret)
        }
    }
}

struct InfoRow: View {
    let label: String
    let value: String
    
    var body: some View {
        HStack {
            Text(label)
                .foregroundColor(.secondary)
            Spacer()
            Text(value)
                .bold()
        }
    }
}

// MARK: - QR Generator
struct SafeTixQRView: View {
    let token: String
    let context = CIContext()
    let filter = CIFilter.qrCodeGenerator()
    
    var body: some View {
        if let image = generateQRCode(from: token) {
            Image(uiImage: image)
                .interpolation(.none)
                .resizable()
                .scaledToFit()
                .padding(20)
        }
    }
    
    func generateQRCode(from string: String) -> UIImage? {
        filter.message = Data(string.utf8)
        
        if let outputImage = filter.outputImage {
            if let cgimg = context.createCGImage(outputImage, from: outputImage.extent) {
                return UIImage(cgImage: cgimg)
            }
        }
        return nil
    }
}

// MARK: - View Model
class MyTicketsViewModel: ObservableObject {
    @Published var tickets: [Ticket] = []
    
    func loadTickets() async {
        do {
            let fetched = try await SupabaseManager.shared.fetchMyTickets()
            await MainActor.run {
                self.tickets = fetched
            }
        } catch {
            print("Error loading tickets: \(error)")
        }
    }
}
