import SwiftUI

struct MyTicketsView: View {
    @StateObject private var viewModel = TicketsViewModel()
    @EnvironmentObject private var appState: ClientAppState
    @EnvironmentObject private var authService: ClientAuthService

    @State private var selectedFilter: TicketFilter = .upcoming
    @State private var selectedTicket: ClientTicket?

    enum TicketFilter: String, CaseIterable {
        case upcoming = "Próximos"
        case past = "Pasados"
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Filter Tabs
                filterTabs

                // Content
                if viewModel.isLoading {
                    loadingView
                } else if !viewModel.hasTickets {
                    emptyState
                } else {
                    ticketsList
                }
            }
            .background(EventuColors.background)
            .navigationBarHidden(true)
            .refreshable {
                if let userId = authService.currentUser?.id {
                    await viewModel.refreshTickets(userId: userId)
                }
            }
            .navigationDestination(for: ClientTicket.self) { ticket in
                TicketDetailView(ticket: ticket)
            }
            .task {
                if let userId = authService.currentUser?.id {
                    await viewModel.loadTickets(userId: userId)
                }
            }
        }
    }

    // MARK: - Filter Tabs

    private var filterTabs: some View {
        HStack(spacing: 0) {
            ForEach(TicketFilter.allCases, id: \.self) { filter in
                Button {
                    withAnimation(.easeInOut(duration: 0.2)) {
                        selectedFilter = filter
                    }
                } label: {
                    VStack(spacing: 8) {
                        Text(filter.rawValue)
                            .font(.subheadline)
                            .fontWeight(selectedFilter == filter ? .semibold : .regular)
                            .foregroundColor(selectedFilter == filter ? EventuColors.primary : EventuColors.textSecondary)

                        Rectangle()
                            .fill(selectedFilter == filter ? EventuColors.primary : Color.clear)
                            .frame(height: 2)
                    }
                }
                .frame(maxWidth: .infinity)
            }
        }
        .padding(.horizontal)
        .background(EventuColors.cardBackground)
    }

    // MARK: - Tickets List

    private var ticketsList: some View {
        ScrollView {
            LazyVStack(spacing: 16) {
                let tickets = selectedFilter == .upcoming ? viewModel.upcomingTickets : viewModel.pastTickets

                if tickets.isEmpty {
                    noTicketsForFilter
                } else {
                    ForEach(tickets) { ticket in
                        NavigationLink(value: ticket) {
                            TicketCardView(ticket: ticket)
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
            .padding(20)
        }
    }

    // MARK: - Loading View

    private var loadingView: some View {
        VStack(spacing: 16) {
            ForEach(0..<3, id: \.self) { _ in
                RoundedRectangle(cornerRadius: 16)
                    .fill(EventuColors.surface)
                    .frame(height: 160)
                    .shimmer()
            }
        }
        .padding(20)
    }

    // MARK: - Empty State

    private var emptyState: some View {
        VStack(spacing: 20) {
            Spacer()

            Image(systemName: "ticket")
                .font(.system(size: 64))
                .foregroundColor(EventuColors.textSecondary)

            Text("No tienes boletas")
                .font(.title2)
                .fontWeight(.semibold)
                .foregroundColor(EventuColors.text)

            Text("Cuando compres entradas a un evento,\naparecerán aquí")
                .font(.subheadline)
                .foregroundColor(EventuColors.textSecondary)
                .multilineTextAlignment(.center)

            NavigationLink {
                EventsListView()
            } label: {
                Text("Explorar eventos")
                    .font(.headline)
                    .fontWeight(.semibold)
                    .foregroundColor(.white)
                    .padding(.horizontal, 32)
                    .padding(.vertical, 14)
                    .background(EventuColors.gradientPrimary)
                    .cornerRadius(12)
            }
            .padding(.top, 8)

            Spacer()
        }
        .padding(20)
    }

    // MARK: - No Tickets for Filter

    private var noTicketsForFilter: some View {
        VStack(spacing: 16) {
            Spacer()
                .frame(height: 60)

            Image(systemName: selectedFilter == .upcoming ? "calendar.badge.clock" : "clock.arrow.circlepath")
                .font(.system(size: 48))
                .foregroundColor(EventuColors.textSecondary)

            Text(selectedFilter == .upcoming ? "No tienes eventos próximos" : "No tienes eventos pasados")
                .font(.headline)
                .foregroundColor(EventuColors.text)

            Text(selectedFilter == .upcoming ? "Tus próximas entradas aparecerán aquí" : "Tus eventos anteriores aparecerán aquí")
                .font(.subheadline)
                .foregroundColor(EventuColors.textSecondary)

            Spacer()
        }
        .frame(maxWidth: .infinity)
    }
}

// MARK: - Ticket Card View

struct TicketCardView: View {
    let ticket: ClientTicket

    var body: some View {
        HStack(spacing: 0) {
            // Left side - Event image
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
            .frame(width: 100)
            .clipped()

            // Dashed line
            DashedLine()
                .stroke(style: StrokeStyle(lineWidth: 1, dash: [5, 5]))
                .foregroundColor(EventuColors.border)
                .frame(width: 1)

            // Right side - Info
            VStack(alignment: .leading, spacing: 8) {
                // Status badge
                HStack {
                    Circle()
                        .fill(Color(hex: ticket.status.color))
                        .frame(width: 8, height: 8)
                    Text(ticket.status.displayName)
                        .font(.caption2)
                        .fontWeight(.medium)
                        .foregroundColor(Color(hex: ticket.status.color))
                }

                // Event name
                Text(ticket.eventName)
                    .font(.headline)
                    .fontWeight(.semibold)
                    .foregroundColor(EventuColors.text)
                    .lineLimit(2)

                // Ticket type
                Text(ticket.displayName)
                    .font(.caption)
                    .foregroundColor(EventuColors.textSecondary)

                Spacer()

                // Date
                if let event = ticket.event {
                    HStack(spacing: 4) {
                        Image(systemName: "calendar")
                            .font(.caption2)
                        Text(event.formattedDate)
                            .font(.caption)
                    }
                    .foregroundColor(EventuColors.textSecondary)
                }

                // Seat info
                if let seat = ticket.seatDescription {
                    HStack(spacing: 4) {
                        Image(systemName: "chair")
                            .font(.caption2)
                        Text(seat)
                            .font(.caption)
                    }
                    .foregroundColor(EventuColors.textSecondary)
                }
            }
            .padding(16)
            .frame(maxWidth: .infinity, alignment: .leading)

            // Arrow
            Image(systemName: "chevron.right")
                .font(.caption)
                .foregroundColor(EventuColors.textSecondary)
                .padding(.trailing, 16)
        }
        .frame(height: 140)
        .background(EventuColors.cardBackground)
        .cornerRadius(16)
        .shadow(color: Color.black.opacity(0.06), radius: 8, x: 0, y: 4)
    }
}

// MARK: - Dashed Line

struct DashedLine: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        path.move(to: CGPoint(x: rect.midX, y: rect.minY))
        path.addLine(to: CGPoint(x: rect.midX, y: rect.maxY))
        return path
    }
}

// MARK: - Preview

struct MyTicketsView_Previews: PreviewProvider {
    static var previews: some View {
        MyTicketsView()
            .environmentObject(ClientAppState.shared)
            .environmentObject(ClientAuthService.shared)
    }
}
