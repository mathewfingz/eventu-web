import SwiftUI

struct CoordinatorDashboardView: View {
    @StateObject private var viewModel = DashboardViewModel()
    @StateObject private var networkMonitor = NetworkMonitor.shared
    @EnvironmentObject var appState: AppState
    @State private var isAppearing = false

    var body: some View {
        NavigationView {
            ZStack {
                // Background
                EventuColors.surface
                    .ignoresSafeArea()

                if viewModel.isLoading && viewModel.stats == nil {
                    EventuLoadingView()
                } else {
                    dashboardContent
                }
            }
            .navigationTitle("")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .principal) {
                    HStack(spacing: 8) {
                        Image(systemName: "chart.bar.fill")
                            .foregroundColor(EventuColors.primary)
                        Text("Dashboard")
                            .font(EventuTypography.headline)
                            .foregroundColor(EventuColors.textPrimary)
                    }
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: {
                        Task { await viewModel.refresh() }
                    }) {
                        Image(systemName: "arrow.clockwise")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundColor(EventuColors.primary)
                    }
                }
            }
            .refreshable {
                await viewModel.refresh()
            }
        }
        .onAppear {
            if let eventId = appState.selectedEvent?.id {
                viewModel.connect(eventId: eventId)
            }
            withAnimation(.easeOut(duration: 0.5)) {
                isAppearing = true
            }
        }
        .onDisappear {
            viewModel.disconnect()
        }
    }

    private var dashboardContent: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 20) {
                // Connection Status Banner
                if !networkMonitor.isConnected {
                    EventuOfflineBanner()
                        .padding(.horizontal, 20)
                }

                // Header
                VStack(alignment: .leading, spacing: 8) {
                    Text(appState.selectedEvent?.name ?? "Evento")
                        .font(EventuTypography.title2)
                        .foregroundColor(EventuColors.textPrimary)

                    HStack(spacing: 16) {
                        HStack(spacing: 6) {
                            Image(systemName: "mappin.circle.fill")
                                .foregroundColor(EventuColors.primary)
                            Text(appState.selectedEvent?.venueName ?? "")
                                .font(EventuTypography.caption1)
                                .foregroundColor(EventuColors.textSecondary)
                        }

                        if viewModel.isConnected {
                            HStack(spacing: 4) {
                                Circle()
                                    .fill(EventuColors.success)
                                    .frame(width: 6, height: 6)
                                Text("En vivo")
                                    .font(EventuTypography.caption2)
                                    .foregroundColor(EventuColors.success)
                            }
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(EventuColors.success.opacity(0.1))
                            .cornerRadius(8)
                        }
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.horizontal, 20)
                .padding(.top, 8)
                .opacity(isAppearing ? 1 : 0)
                .offset(y: isAppearing ? 0 : 20)

                // Main Stats Cards
                if let stats = viewModel.stats {
                    EventuMainStatsGrid(stats: stats)
                        .padding(.horizontal, 20)
                        .opacity(isAppearing ? 1 : 0)
                        .offset(y: isAppearing ? 0 : 30)

                    // Progress Ring Card
                    EventuProgressCard(stats: stats)
                        .padding(.horizontal, 20)

                    // Entry Rate Chart
                    if !stats.hourlyBreakdown.isEmpty {
                        EventuEntryRateChart(hourlyData: stats.hourlyBreakdown)
                            .padding(.horizontal, 20)
                    }

                    // Ticket Types Breakdown
                    if !stats.byTicketType.isEmpty {
                        EventuTicketTypesCard(types: stats.byTicketType)
                            .padding(.horizontal, 20)
                    }

                    // Capacity Alerts
                    if !stats.capacityAlerts.isEmpty {
                        EventuCapacityAlertsCard(alerts: stats.capacityAlerts)
                            .padding(.horizontal, 20)
                    }

                    // Active Validators
                    if !stats.activeValidators.isEmpty {
                        EventuValidatorsCard(validators: stats.activeValidators)
                            .padding(.horizontal, 20)
                    }

                    // Last Updated
                    HStack(spacing: 6) {
                        Image(systemName: "clock")
                            .font(.system(size: 12))
                        Text("Actualizado: \(stats.lastUpdated.formatted(date: .omitted, time: .shortened))")
                            .font(EventuTypography.caption2)
                    }
                    .foregroundColor(EventuColors.textTertiary)
                    .padding(.top, 10)
                    .padding(.bottom, 20)
                }
            }
            .padding(.top, 8)
        }
    }
}

// MARK: - Eventu Offline Banner

struct EventuOfflineBanner: View {
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: "wifi.slash")
                .font(.system(size: 18, weight: .semibold))

            VStack(alignment: .leading, spacing: 2) {
                Text("Sin conexion")
                    .font(EventuTypography.subheadline)
                Text("Estadisticas no disponibles")
                    .font(EventuTypography.caption2)
                    .opacity(0.8)
            }

            Spacer()
        }
        .foregroundColor(.white)
        .padding(16)
        .frame(maxWidth: .infinity)
        .background(
            RoundedRectangle(cornerRadius: 14)
                .fill(EventuColors.warning)
        )
    }
}

// MARK: - Eventu Main Stats Grid

struct EventuMainStatsGrid: View {
    let stats: RealtimeStats

    var body: some View {
        LazyVGrid(columns: [
            GridItem(.flexible(), spacing: 12),
            GridItem(.flexible(), spacing: 12)
        ], spacing: 12) {
            EventuDashboardStatCard(
                title: "Procesadas",
                value: "\(stats.totalProcessed)",
                subtitle: "de \(stats.totalSold) vendidas",
                icon: "checkmark.circle.fill",
                color: EventuColors.success,
                progress: stats.processedPercentage / 100
            )

            EventuDashboardStatCard(
                title: "Pendientes",
                value: "\(stats.remainingEntries)",
                subtitle: "por ingresar",
                icon: "person.badge.clock.fill",
                color: EventuColors.warning
            )

            EventuDashboardStatCard(
                title: "Velocidad",
                value: stats.formattedProcessingRate,
                subtitle: "entradas/min",
                icon: "speedometer",
                color: EventuColors.info
            )

            EventuDashboardStatCard(
                title: "Validadores",
                value: "\(stats.activeValidators.filter { $0.isActive }.count)",
                subtitle: "activos",
                icon: "person.2.fill",
                color: EventuColors.primary
            )
        }
    }
}

// MARK: - Eventu Dashboard Stat Card

struct EventuDashboardStatCard: View {
    let title: String
    let value: String
    var subtitle: String? = nil
    let icon: String
    let color: Color
    var progress: Double? = nil

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: icon)
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(color)
                    .frame(width: 32, height: 32)
                    .background(color.opacity(0.12))
                    .cornerRadius(8)

                Spacer()

                if let progress = progress {
                    Text(String(format: "%.0f%%", progress * 100))
                        .font(EventuTypography.caption1)
                        .foregroundColor(color)
                }
            }

            Text(value)
                .font(.system(size: 28, weight: .bold, design: .rounded))
                .foregroundColor(EventuColors.textPrimary)

            VStack(alignment: .leading, spacing: 6) {
                Text(title)
                    .font(EventuTypography.caption1)
                    .foregroundColor(EventuColors.textSecondary)

                if let subtitle = subtitle {
                    Text(subtitle)
                        .font(EventuTypography.caption2)
                        .foregroundColor(EventuColors.textTertiary)
                }

                if let progress = progress {
                    GeometryReader { geometry in
                        ZStack(alignment: .leading) {
                            RoundedRectangle(cornerRadius: 3)
                                .fill(EventuColors.surface)
                                .frame(height: 6)

                            RoundedRectangle(cornerRadius: 3)
                                .fill(color)
                                .frame(width: geometry.size.width * min(progress, 1.0), height: 6)
                        }
                    }
                    .frame(height: 6)
                }
            }
        }
        .padding(16)
        .background(Color.white)
        .cornerRadius(16)
        .shadow(color: Color.black.opacity(0.04), radius: 8, x: 0, y: 4)
    }
}

// MARK: - Eventu Progress Card

struct EventuProgressCard: View {
    let stats: RealtimeStats

    var body: some View {
        HStack(spacing: 24) {
            // Progress Ring
            ZStack {
                Circle()
                    .stroke(EventuColors.surface, lineWidth: 12)
                    .frame(width: 100, height: 100)

                Circle()
                    .trim(from: 0, to: min(stats.processedPercentage / 100, 1.0))
                    .stroke(
                        EventuColors.gradientPrimary,
                        style: StrokeStyle(lineWidth: 12, lineCap: .round)
                    )
                    .frame(width: 100, height: 100)
                    .rotationEffect(.degrees(-90))

                VStack(spacing: 2) {
                    Text(String(format: "%.1f", stats.processedPercentage))
                        .font(.system(size: 24, weight: .bold, design: .rounded))
                        .foregroundColor(EventuColors.textPrimary)
                    Text("%")
                        .font(EventuTypography.caption2)
                        .foregroundColor(EventuColors.textSecondary)
                }
            }

            VStack(alignment: .leading, spacing: 16) {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Progreso Total")
                        .font(EventuTypography.headline)
                        .foregroundColor(EventuColors.textPrimary)
                    Text("Entradas procesadas del total vendido")
                        .font(EventuTypography.caption2)
                        .foregroundColor(EventuColors.textSecondary)
                }

                HStack(spacing: 20) {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("\(stats.totalProcessed)")
                            .font(EventuTypography.title3)
                            .foregroundColor(EventuColors.success)
                        Text("Procesadas")
                            .font(EventuTypography.caption2)
                            .foregroundColor(EventuColors.textTertiary)
                    }

                    VStack(alignment: .leading, spacing: 2) {
                        Text("\(stats.totalSold)")
                            .font(EventuTypography.title3)
                            .foregroundColor(EventuColors.textPrimary)
                        Text("Vendidas")
                            .font(EventuTypography.caption2)
                            .foregroundColor(EventuColors.textTertiary)
                    }
                }
            }

            Spacer()
        }
        .padding(20)
        .background(Color.white)
        .cornerRadius(20)
        .shadow(color: Color.black.opacity(0.06), radius: 12, x: 0, y: 6)
    }
}

// MARK: - Eventu Entry Rate Chart

struct EventuEntryRateChart: View {
    let hourlyData: [HourlyEntry]

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                HStack(spacing: 8) {
                    Image(systemName: "chart.bar.fill")
                        .foregroundColor(EventuColors.primary)
                    Text("Velocidad de Ingreso")
                        .font(EventuTypography.headline)
                        .foregroundColor(EventuColors.textPrimary)
                }

                Spacer()

                Text("Por hora")
                    .font(EventuTypography.caption1)
                    .foregroundColor(EventuColors.textTertiary)
            }

            EventuBarChart(data: hourlyData)
                .frame(height: 160)
        }
        .padding(20)
        .background(Color.white)
        .cornerRadius(20)
        .shadow(color: Color.black.opacity(0.06), radius: 12, x: 0, y: 6)
    }
}

struct EventuBarChart: View {
    let data: [HourlyEntry]

    var body: some View {
        GeometryReader { geometry in
            let maxCount = data.map { $0.count }.max() ?? 1
            let barWidth = (geometry.size.width - CGFloat(data.count - 1) * 12) / CGFloat(data.count)

            HStack(alignment: .bottom, spacing: 12) {
                ForEach(data) { entry in
                    VStack(spacing: 8) {
                        // Value label
                        Text("\(entry.count)")
                            .font(EventuTypography.caption2)
                            .foregroundColor(EventuColors.textSecondary)

                        // Bar
                        RoundedRectangle(cornerRadius: 6)
                            .fill(EventuColors.gradientPrimary)
                            .frame(
                                width: barWidth,
                                height: max(8, CGFloat(entry.count) / CGFloat(maxCount) * (geometry.size.height - 50))
                            )

                        // Time label
                        Text(entry.hour)
                            .font(EventuTypography.caption2)
                            .foregroundColor(EventuColors.textTertiary)
                    }
                }
            }
        }
    }
}

// MARK: - Eventu Ticket Types Card

struct EventuTicketTypesCard: View {
    let types: [TicketTypeStats]

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack(spacing: 8) {
                Image(systemName: "ticket.fill")
                    .foregroundColor(EventuColors.primary)
                Text("Por Tipo de Entrada")
                    .font(EventuTypography.headline)
                    .foregroundColor(EventuColors.textPrimary)
            }

            ForEach(types) { type in
                VStack(spacing: 8) {
                    HStack {
                        Circle()
                            .fill(Color(hex: type.color) ?? EventuColors.primary)
                            .frame(width: 10, height: 10)

                        Text(type.name)
                            .font(EventuTypography.body)
                            .foregroundColor(EventuColors.textPrimary)

                        Spacer()

                        Text("\(type.processed)/\(type.sold)")
                            .font(EventuTypography.subheadline)
                            .foregroundColor(EventuColors.textPrimary)

                        Text(String(format: "%.0f%%", type.processedPercentage))
                            .font(EventuTypography.caption1)
                            .foregroundColor(EventuColors.textSecondary)
                            .frame(width: 44, alignment: .trailing)
                    }

                    GeometryReader { geometry in
                        ZStack(alignment: .leading) {
                            RoundedRectangle(cornerRadius: 4)
                                .fill(EventuColors.surface)
                                .frame(height: 8)

                            RoundedRectangle(cornerRadius: 4)
                                .fill(Color(hex: type.color) ?? EventuColors.primary)
                                .frame(width: geometry.size.width * min(type.processedPercentage / 100, 1.0), height: 8)
                        }
                    }
                    .frame(height: 8)
                }
                .padding(.vertical, 4)
            }
        }
        .padding(20)
        .background(Color.white)
        .cornerRadius(20)
        .shadow(color: Color.black.opacity(0.06), radius: 12, x: 0, y: 6)
    }
}

// MARK: - Eventu Capacity Alerts Card

struct EventuCapacityAlertsCard: View {
    let alerts: [CapacityAlert]

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack(spacing: 8) {
                Image(systemName: "exclamationmark.triangle.fill")
                    .foregroundColor(EventuColors.warning)
                Text("Alertas de Capacidad")
                    .font(EventuTypography.headline)
                    .foregroundColor(EventuColors.textPrimary)

                Spacer()

                Text("\(alerts.count)")
                    .font(EventuTypography.caption1)
                    .foregroundColor(EventuColors.warning)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(EventuColors.warning.opacity(0.15))
                    .cornerRadius(8)
            }

            ForEach(alerts) { alert in
                HStack(spacing: 12) {
                    Image(systemName: alert.alertLevel.icon)
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundColor(alertColor(for: alert.alertLevel))
                        .frame(width: 36, height: 36)
                        .background(alertColor(for: alert.alertLevel).opacity(0.12))
                        .cornerRadius(10)

                    VStack(alignment: .leading, spacing: 2) {
                        Text(alert.ticketTypeName)
                            .font(EventuTypography.subheadline)
                            .foregroundColor(EventuColors.textPrimary)
                        Text(alert.message)
                            .font(EventuTypography.caption2)
                            .foregroundColor(EventuColors.textSecondary)
                    }

                    Spacer()

                    Text("\(alert.currentCount)/\(alert.maxCapacity)")
                        .font(EventuTypography.caption1)
                        .foregroundColor(alertColor(for: alert.alertLevel))
                }
                .padding(12)
                .background(alertColor(for: alert.alertLevel).opacity(0.08))
                .cornerRadius(12)
            }
        }
        .padding(20)
        .background(Color.white)
        .cornerRadius(20)
        .shadow(color: Color.black.opacity(0.06), radius: 12, x: 0, y: 6)
    }

    private func alertColor(for level: CapacityAlert.AlertLevel) -> Color {
        switch level {
        case .warning: return EventuColors.warning
        case .critical: return Color.orange
        case .full: return EventuColors.error
        }
    }
}

// MARK: - Eventu Validators Card

struct EventuValidatorsCard: View {
    let validators: [ValidatorStatus]

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack(spacing: 8) {
                Image(systemName: "person.2.fill")
                    .foregroundColor(EventuColors.primary)
                Text("Validadores")
                    .font(EventuTypography.headline)
                    .foregroundColor(EventuColors.textPrimary)

                Spacer()

                let activeCount = validators.filter { $0.isActive }.count
                Text("\(activeCount) activos")
                    .font(EventuTypography.caption1)
                    .foregroundColor(EventuColors.success)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(EventuColors.success.opacity(0.12))
                    .cornerRadius(8)
            }

            ForEach(validators) { validator in
                HStack(spacing: 12) {
                    // Avatar
                    ZStack {
                        Circle()
                            .fill(EventuColors.primary.opacity(0.12))
                            .frame(width: 44, height: 44)

                        Text(validator.name.prefix(1).uppercased())
                            .font(EventuTypography.headline)
                            .foregroundColor(EventuColors.primary)
                    }

                    VStack(alignment: .leading, spacing: 2) {
                        HStack(spacing: 6) {
                            Text(validator.name)
                                .font(EventuTypography.subheadline)
                                .foregroundColor(EventuColors.textPrimary)

                            Circle()
                                .fill(validatorStatusColor(validator))
                                .frame(width: 8, height: 8)
                        }

                        if let lastTime = validator.lastValidationDescription {
                            Text("Ultima: \(lastTime)")
                                .font(EventuTypography.caption2)
                                .foregroundColor(EventuColors.textTertiary)
                        }
                    }

                    Spacer()

                    VStack(alignment: .trailing, spacing: 2) {
                        Text("\(validator.validationsCount)")
                            .font(.system(size: 20, weight: .bold, design: .rounded))
                            .foregroundColor(EventuColors.primary)
                        Text("validaciones")
                            .font(EventuTypography.caption2)
                            .foregroundColor(EventuColors.textTertiary)
                    }
                }
                .padding(.vertical, 8)

                if validator.id != validators.last?.id {
                    Divider()
                }
            }
        }
        .padding(20)
        .background(Color.white)
        .cornerRadius(20)
        .shadow(color: Color.black.opacity(0.06), radius: 12, x: 0, y: 6)
    }

    private func validatorStatusColor(_ validator: ValidatorStatus) -> Color {
        switch validator.statusColor {
        case "green": return EventuColors.success
        case "yellow": return EventuColors.warning
        case "red": return EventuColors.error
        default: return EventuColors.textTertiary
        }
    }
}

// MARK: - Previews

struct CoordinatorDashboardView_Previews: PreviewProvider {
    static var previews: some View {
        CoordinatorDashboardView()
            .environmentObject(AppState.shared)
    }
}
