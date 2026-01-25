import SwiftUI

struct TicketDetailView: View {
    let ticket: ClientTicket

    @StateObject private var viewModel = TicketDetailViewModel()
    @EnvironmentObject private var appState: ClientAppState
    @Environment(\.dismiss) private var dismiss

    @State private var showOfflineAlert = false

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // QR Section
                qrSection

                // Ticket Info
                ticketInfoSection

                // Event Info
                eventInfoSection

                // Offline Section
                offlineSection
            }
            .padding(20)
        }
        .background(EventuColors.background)
        .navigationTitle("Mi Entrada")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Menu {
                    Button {
                        // Share ticket
                    } label: {
                        Label("Compartir", systemImage: "square.and.arrow.up")
                    }

                    Button {
                        Task { await viewModel.downloadForOffline() }
                    } label: {
                        Label("Descargar offline", systemImage: "arrow.down.circle")
                    }
                } label: {
                    Image(systemName: "ellipsis.circle")
                        .foregroundColor(EventuColors.primary)
                }
            }
        }
        .alert("Modo Offline", isPresented: $showOfflineAlert) {
            Button("Entendido", role: .cancel) {}
        } message: {
            Text("Esta entrada estará disponible sin conexión hasta \(viewModel.offlineExpirationFormatted ?? "24 horas")")
        }
        .onAppear {
            viewModel.loadTicket(ticket)
        }
        .onDisappear {
            viewModel.stopUpdates()
        }
    }

    // MARK: - QR Section

    private var qrSection: some View {
        VStack(spacing: 20) {
            // SafeTix QR
            SafeTixQRView(viewModel: viewModel)

            // Instructions
            HStack(spacing: 8) {
                Image(systemName: "info.circle")
                    .foregroundColor(EventuColors.primary)
                Text("El código QR cambia cada 15 segundos por seguridad")
                    .font(.caption)
                    .foregroundColor(EventuColors.textSecondary)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
            .background(EventuColors.primary.opacity(0.1))
            .cornerRadius(12)
        }
    }

    // MARK: - Ticket Info Section

    private var ticketInfoSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Información de la entrada")
                .font(.headline)
                .fontWeight(.semibold)
                .foregroundColor(EventuColors.text)

            VStack(spacing: 12) {
                InfoRow(icon: "ticket", label: "Tipo", value: ticket.displayName)

                if let seat = ticket.seatDescription {
                    InfoRow(icon: "chair", label: "Ubicación", value: seat)
                }

                if let section = ticket.section {
                    InfoRow(icon: "rectangle.split.3x3", label: "Sección", value: section)
                }

                InfoRow(
                    icon: "circle.fill",
                    label: "Estado",
                    value: ticket.status.displayName,
                    valueColor: Color(hex: ticket.status.color)
                )
            }
            .padding(16)
            .background(EventuColors.cardBackground)
            .cornerRadius(16)
        }
    }

    // MARK: - Event Info Section

    private var eventInfoSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Evento")
                .font(.headline)
                .fontWeight(.semibold)
                .foregroundColor(EventuColors.text)

            HStack(spacing: 16) {
                // Event image
                AsyncImage(url: URL(string: ticket.event?.displayImage ?? "")) { phase in
                    switch phase {
                    case .empty:
                        Rectangle()
                            .fill(EventuColors.surface)
                    case .success(let image):
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                    case .failure:
                        Rectangle()
                            .fill(EventuColors.surface)
                            .overlay(
                                Image(systemName: "music.mic")
                                    .foregroundColor(EventuColors.textSecondary)
                            )
                    @unknown default:
                        EmptyView()
                    }
                }
                .frame(width: 80, height: 80)
                .cornerRadius(12)
                .clipped()

                VStack(alignment: .leading, spacing: 8) {
                    Text(ticket.eventName)
                        .font(.subheadline)
                        .fontWeight(.semibold)
                        .foregroundColor(EventuColors.text)
                        .lineLimit(2)

                    if let event = ticket.event {
                        HStack(spacing: 4) {
                            Image(systemName: "calendar")
                                .font(.caption2)
                            Text(event.formattedFullDate)
                                .font(.caption)
                        }
                        .foregroundColor(EventuColors.textSecondary)

                        HStack(spacing: 4) {
                            Image(systemName: "clock")
                                .font(.caption2)
                            Text(event.formattedTime)
                                .font(.caption)
                        }
                        .foregroundColor(EventuColors.textSecondary)

                        if let venue = event.venue {
                            HStack(spacing: 4) {
                                Image(systemName: "mappin")
                                    .font(.caption2)
                                Text(venue.name)
                                    .font(.caption)
                            }
                            .foregroundColor(EventuColors.textSecondary)
                        }
                    }
                }

                Spacer()
            }
            .padding(16)
            .background(EventuColors.cardBackground)
            .cornerRadius(16)
        }
    }

    // MARK: - Offline Section

    private var offlineSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Modo Offline")
                .font(.headline)
                .fontWeight(.semibold)
                .foregroundColor(EventuColors.text)

            VStack(spacing: 16) {
                HStack(spacing: 12) {
                    Image(systemName: viewModel.isOfflineAvailable ? "checkmark.circle.fill" : "wifi.slash")
                        .font(.title2)
                        .foregroundColor(viewModel.isOfflineAvailable ? EventuColors.success : EventuColors.textSecondary)

                    VStack(alignment: .leading, spacing: 4) {
                        Text(viewModel.isOfflineAvailable ? "Disponible offline" : "No descargada")
                            .font(.subheadline)
                            .fontWeight(.medium)
                            .foregroundColor(EventuColors.text)

                        if viewModel.isOfflineAvailable, let expiration = viewModel.offlineExpirationFormatted {
                            Text("Válida hasta: \(expiration)")
                                .font(.caption)
                                .foregroundColor(EventuColors.textSecondary)
                        } else {
                            Text("Descarga tu entrada para usarla sin conexión")
                                .font(.caption)
                                .foregroundColor(EventuColors.textSecondary)
                        }
                    }

                    Spacer()
                }

                if viewModel.isOfflineAvailable {
                    Button {
                        viewModel.removeOfflineData()
                    } label: {
                        HStack {
                            Image(systemName: "trash")
                            Text("Eliminar datos offline")
                        }
                        .font(.subheadline)
                        .foregroundColor(EventuColors.error)
                    }
                } else {
                    Button {
                        Task {
                            await viewModel.downloadForOffline()
                            if viewModel.isOfflineAvailable {
                                showOfflineAlert = true
                            }
                        }
                    } label: {
                        HStack {
                            if viewModel.isDownloading {
                                ProgressView()
                                    .tint(.white)
                            } else {
                                Image(systemName: "arrow.down.circle")
                            }
                            Text(viewModel.isDownloading ? "Descargando..." : "Descargar para offline")
                        }
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                        .background(EventuColors.primary)
                        .cornerRadius(10)
                    }
                    .disabled(viewModel.isDownloading)
                }

                // Info
                HStack(spacing: 8) {
                    Image(systemName: "shield.checkered")
                        .font(.caption)
                    Text("Los códigos se pre-generan para 24 horas sin guardar tu clave secreta")
                        .font(.caption2)
                }
                .foregroundColor(EventuColors.textSecondary)
            }
            .padding(16)
            .background(EventuColors.cardBackground)
            .cornerRadius(16)
        }
    }
}

// MARK: - Info Row

struct InfoRow: View {
    let icon: String
    let label: String
    let value: String
    var valueColor: Color? = nil

    var body: some View {
        HStack {
            HStack(spacing: 8) {
                Image(systemName: icon)
                    .font(.caption)
                    .foregroundColor(EventuColors.textSecondary)
                    .frame(width: 20)

                Text(label)
                    .font(.subheadline)
                    .foregroundColor(EventuColors.textSecondary)
            }

            Spacer()

            Text(value)
                .font(.subheadline)
                .fontWeight(.medium)
                .foregroundColor(valueColor ?? EventuColors.text)
        }
    }
}

// MARK: - Preview

struct TicketDetailView_Previews: PreviewProvider {
    static var previews: some View {
        NavigationStack {
            TicketDetailView(ticket: ClientTicket.mockTickets[0])
                .environmentObject(ClientAppState.shared)
        }
    }
}
