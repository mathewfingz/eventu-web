import SwiftUI

struct EventListView: View {
    @StateObject private var viewModel = EventSelectionViewModel()
    @EnvironmentObject var appState: AppState
    @State private var isAppearing = false

    var body: some View {
        NavigationView {
            ZStack {
                // Background
                EventuColors.surface
                    .ignoresSafeArea()

                if viewModel.isLoading && viewModel.events.isEmpty {
                    EventuLoadingView()
                } else if viewModel.events.isEmpty {
                    EmptyEventsView(onRetry: viewModel.loadEvents)
                } else {
                    eventsList
                }
            }
            .navigationTitle("")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .principal) {
                    HStack(spacing: 8) {
                        Image(systemName: "ticket.fill")
                            .foregroundColor(EventuColors.primary)
                        Text("Eventos")
                            .font(EventuTypography.headline)
                            .foregroundColor(EventuColors.textPrimary)
                    }
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: viewModel.loadEvents) {
                        Image(systemName: "arrow.clockwise")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundColor(EventuColors.primary)
                    }
                }
            }
            .refreshable {
                viewModel.loadEvents()
            }
        }
        .onAppear {
            withAnimation(.easeOut(duration: 0.5)) {
                isAppearing = true
            }
        }
    }

    private var eventsList: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 24) {
                // Header
                VStack(alignment: .leading, spacing: 8) {
                    Text("Selecciona un evento")
                        .font(EventuTypography.title2)
                        .foregroundColor(EventuColors.textPrimary)

                    Text("Elige el evento que deseas validar")
                        .font(EventuTypography.subheadline)
                        .foregroundColor(EventuColors.textSecondary)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.horizontal, 20)
                .padding(.top, 8)
                .opacity(isAppearing ? 1 : 0)
                .offset(y: isAppearing ? 0 : 20)

                // Today's Events
                if !viewModel.todayEvents.isEmpty {
                    EventSection(
                        title: "Hoy",
                        icon: "sun.max.fill",
                        iconColor: EventuColors.warning,
                        events: viewModel.todayEvents,
                        viewModel: viewModel
                    )
                    .opacity(isAppearing ? 1 : 0)
                    .offset(y: isAppearing ? 0 : 30)
                }

                // Upcoming Events
                if !viewModel.upcomingEvents.isEmpty {
                    EventSection(
                        title: "Proximos",
                        icon: "calendar",
                        iconColor: EventuColors.info,
                        events: viewModel.upcomingEvents,
                        viewModel: viewModel
                    )
                    .opacity(isAppearing ? 1 : 0)
                    .offset(y: isAppearing ? 0 : 30)
                }

                Spacer().frame(height: 20)
            }
            .padding(.top, 8)
        }
    }
}

// MARK: - Event Section

struct EventSection: View {
    let title: String
    let icon: String
    let iconColor: Color
    let events: [ValidationEvent]
    @ObservedObject var viewModel: EventSelectionViewModel

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            // Section Header
            HStack(spacing: 10) {
                Image(systemName: icon)
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(iconColor)
                    .frame(width: 28, height: 28)
                    .background(iconColor.opacity(0.12))
                    .cornerRadius(8)

                Text(title)
                    .font(EventuTypography.title3)
                    .foregroundColor(EventuColors.textPrimary)

                Spacer()

                Text("\(events.count)")
                    .font(EventuTypography.caption1)
                    .foregroundColor(EventuColors.textTertiary)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 4)
                    .background(EventuColors.surface)
                    .cornerRadius(10)
            }
            .padding(.horizontal, 20)

            // Events
            ForEach(events) { event in
                EventCard(
                    event: event,
                    hasOfflineCache: viewModel.hasOfflineCache(for: event.id),
                    offlineCount: viewModel.offlineTicketCount(for: event.id),
                    onSelect: {
                        viewModel.selectEvent(event)
                    },
                    onDownload: {
                        Task {
                            await viewModel.downloadOfflineData(for: event)
                        }
                    }
                )
                .padding(.horizontal, 20)
            }
        }
    }
}

// MARK: - Event Card

struct EventCard: View {
    let event: ValidationEvent
    let hasOfflineCache: Bool
    let offlineCount: Int
    let onSelect: () -> Void
    let onDownload: () -> Void

    @State private var isDownloading = false
    @State private var isPressed = false

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Event Image/Header
            ZStack(alignment: .bottomLeading) {
                if let imageUrl = event.imageUrl, let url = URL(string: imageUrl) {
                    AsyncImage(url: url) { image in
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                    } placeholder: {
                        eventPlaceholder
                    }
                    .frame(height: 140)
                    .clipped()
                } else {
                    eventPlaceholder
                        .frame(height: 140)
                }

                // Overlay gradient
                LinearGradient(
                    colors: [.clear, .black.opacity(0.8)],
                    startPoint: .center,
                    endPoint: .bottom
                )

                // Event info overlay
                VStack(alignment: .leading, spacing: 6) {
                    // Live badge for today's events
                    if event.isToday {
                        HStack(spacing: 4) {
                            Circle()
                                .fill(EventuColors.success)
                                .frame(width: 6, height: 6)
                            Text("EN VIVO")
                                .font(.system(size: 10, weight: .bold))
                        }
                        .foregroundColor(.white)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(EventuColors.success.opacity(0.3))
                        .cornerRadius(6)
                    }

                    Text(event.name)
                        .font(EventuTypography.title3)
                        .foregroundColor(.white)
                        .lineLimit(2)

                    HStack(spacing: 4) {
                        Image(systemName: "mappin.circle.fill")
                            .font(.system(size: 12))
                        Text(event.venueName)
                            .font(EventuTypography.caption1)
                    }
                    .foregroundColor(.white.opacity(0.85))
                }
                .padding(16)
            }

            // Event Details
            VStack(alignment: .leading, spacing: 16) {
                // Date, Time and Capacity Row
                HStack(spacing: 16) {
                    // Date
                    HStack(spacing: 6) {
                        Image(systemName: "calendar")
                            .font(.system(size: 14))
                            .foregroundColor(EventuColors.primary)
                        Text(event.formattedDate)
                            .font(EventuTypography.caption1)
                            .foregroundColor(EventuColors.textPrimary)
                    }

                    // Time
                    HStack(spacing: 6) {
                        Image(systemName: "clock.fill")
                            .font(.system(size: 14))
                            .foregroundColor(EventuColors.primary)
                        Text(event.formattedTime)
                            .font(EventuTypography.caption1)
                            .foregroundColor(EventuColors.textPrimary)
                    }

                    Spacer()

                    // Offline Status
                    if hasOfflineCache {
                        HStack(spacing: 4) {
                            Image(systemName: "arrow.down.circle.fill")
                                .foregroundColor(EventuColors.success)
                            Text("\(offlineCount)")
                                .font(EventuTypography.caption2)
                                .foregroundColor(EventuColors.textSecondary)
                        }
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(EventuColors.success.opacity(0.1))
                        .cornerRadius(6)
                    }
                }

                // Ticket Types
                if !event.ticketTypes.isEmpty {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 8) {
                            ForEach(event.ticketTypes) { type in
                                TicketTypeBadge(type: type)
                            }
                        }
                    }
                }

                // Capacity Bar
                VStack(alignment: .leading, spacing: 6) {
                    HStack {
                        Text("Capacidad")
                            .font(EventuTypography.caption2)
                            .foregroundColor(EventuColors.textSecondary)
                        Spacer()
                        Text("\(totalSold)/\(event.totalCapacity)")
                            .font(EventuTypography.caption1)
                            .foregroundColor(EventuColors.textPrimary)
                    }

                    GeometryReader { geometry in
                        ZStack(alignment: .leading) {
                            RoundedRectangle(cornerRadius: 4)
                                .fill(EventuColors.surface)
                                .frame(height: 6)

                            RoundedRectangle(cornerRadius: 4)
                                .fill(EventuColors.gradientPrimary)
                                .frame(width: geometry.size.width * min(soldPercentage, 1.0), height: 6)
                        }
                    }
                    .frame(height: 6)
                }

                // Actions
                HStack(spacing: 12) {
                    // Download Offline Button
                    Button(action: {
                        isDownloading = true
                        onDownload()
                        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                            isDownloading = false
                        }
                    }) {
                        HStack(spacing: 6) {
                            if isDownloading {
                                ProgressView()
                                    .progressViewStyle(CircularProgressViewStyle(tint: EventuColors.textSecondary))
                                    .scaleEffect(0.7)
                            } else {
                                Image(systemName: hasOfflineCache ? "arrow.clockwise" : "arrow.down.to.line")
                                    .font(.system(size: 14, weight: .semibold))
                            }
                            Text(hasOfflineCache ? "Actualizar" : "Descargar")
                                .font(EventuTypography.caption1)
                        }
                        .foregroundColor(EventuColors.textSecondary)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 10)
                        .background(EventuColors.surface)
                        .cornerRadius(10)
                    }
                    .disabled(isDownloading)

                    Spacer()

                    // Select Event Button
                    Button(action: onSelect) {
                        HStack(spacing: 6) {
                            Image(systemName: "qrcode.viewfinder")
                                .font(.system(size: 14, weight: .semibold))
                            Text("Seleccionar")
                                .font(EventuTypography.headline)
                        }
                        .foregroundColor(.white)
                        .padding(.horizontal, 20)
                        .padding(.vertical, 12)
                        .background(EventuColors.gradientPrimary)
                        .cornerRadius(12)
                        .shadow(color: EventuColors.primary.opacity(0.3), radius: 8, x: 0, y: 4)
                    }
                }
            }
            .padding(16)
            .background(Color.white)
        }
        .background(Color.white)
        .cornerRadius(20)
        .shadow(color: Color.black.opacity(0.08), radius: 16, x: 0, y: 6)
        .scaleEffect(isPressed ? 0.98 : 1.0)
        .animation(.easeInOut(duration: 0.15), value: isPressed)
    }

    private var totalSold: Int {
        event.ticketTypes.reduce(0) { $0 + $1.soldQuantity }
    }

    private var soldPercentage: Double {
        guard event.totalCapacity > 0 else { return 0 }
        return Double(totalSold) / Double(event.totalCapacity)
    }

    private var eventPlaceholder: some View {
        ZStack {
            EventuColors.gradientPrimary
            Image(systemName: "music.mic")
                .font(.system(size: 40, weight: .light))
                .foregroundColor(.white.opacity(0.5))
        }
    }
}

// MARK: - Ticket Type Badge

struct TicketTypeBadge: View {
    let type: ValidationTicketType

    var body: some View {
        VStack(spacing: 2) {
            Text(type.name)
                .font(EventuTypography.caption2)
                .fontWeight(.semibold)
            Text("\(type.soldQuantity)/\(type.totalQuantity)")
                .font(.system(size: 10))
                .foregroundColor(EventuColors.textTertiary)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(badgeColor.opacity(0.1))
        .foregroundColor(badgeColor)
        .cornerRadius(10)
    }

    private var badgeColor: Color {
        if let colorHex = type.color {
            return Color(hex: colorHex)
        }
        return EventuColors.primary
    }
}

// MARK: - Empty Events View

struct EmptyEventsView: View {
    let onRetry: () -> Void

    var body: some View {
        EventuEmptyState(
            icon: "calendar.badge.exclamationmark",
            title: "No hay eventos asignados",
            message: "Contacta al administrador para que te asigne eventos para validar",
            actionTitle: "Reintentar",
            action: onRetry
        )
    }
}

// MARK: - Preview

struct EventListView_Previews: PreviewProvider {
    static var previews: some View {
        EventListView()
            .environmentObject(AppState.shared)
    }
}
