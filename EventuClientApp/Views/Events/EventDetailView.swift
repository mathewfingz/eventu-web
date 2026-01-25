import SwiftUI
import MapKit

struct EventDetailView: View {
    let eventId: String

    @StateObject private var viewModel = EventDetailViewModel()
    @EnvironmentObject private var appState: ClientAppState
    @Environment(\.dismiss) private var dismiss

    @State private var showCart = false

    var body: some View {
        ZStack(alignment: .bottom) {
            ScrollView {
                VStack(spacing: 0) {
                    // Hero Image
                    heroImage

                    // Content
                    VStack(spacing: 24) {
                        // Event Info
                        eventInfo

                        Divider()

                        // Venue & Map
                        venueSection

                        Divider()

                        // Ticket Types
                        ticketTypesSection

                        // Spacer for bottom bar
                        Spacer()
                            .frame(height: 120)
                    }
                    .padding(20)
                }
            }
            .background(EventuColors.background)

            // Bottom Bar
            if viewModel.canAddToCart {
                bottomBar
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button {
                    // Share event
                } label: {
                    Image(systemName: "square.and.arrow.up")
                        .foregroundColor(EventuColors.primary)
                }
            }
        }
        .sheet(isPresented: $showCart) {
            CartView()
        }
        .task {
            await viewModel.loadEvent(id: eventId)
        }
    }

    // MARK: - Hero Image

    private var heroImage: some View {
        ZStack(alignment: .bottomLeading) {
            AsyncImage(url: URL(string: viewModel.event?.displayImage ?? "")) { phase in
                switch phase {
                case .empty:
                    Rectangle()
                        .fill(EventuColors.surface)
                        .overlay(ProgressView().tint(EventuColors.primary))
                case .success(let image):
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                case .failure:
                    Rectangle()
                        .fill(EventuColors.surface)
                        .overlay(
                            Image(systemName: "music.mic")
                                .font(.system(size: 60))
                                .foregroundColor(EventuColors.textSecondary)
                        )
                @unknown default:
                    EmptyView()
                }
            }
            .frame(height: 300)
            .clipped()

            // Gradient
            LinearGradient(
                colors: [.clear, .black.opacity(0.7)],
                startPoint: .center,
                endPoint: .bottom
            )

            // Badge
            if let event = viewModel.event {
                StatusBadge(availability: event.availability)
                    .padding(20)
            }
        }
    }

    // MARK: - Event Info

    private var eventInfo: some View {
        VStack(alignment: .leading, spacing: 16) {
            // Category
            if let event = viewModel.event {
                HStack(spacing: 6) {
                    Image(systemName: event.category.icon)
                        .font(.caption)
                    Text(event.category.displayName)
                        .font(.caption)
                        .fontWeight(.medium)
                }
                .foregroundColor(EventuColors.primary)
            }

            // Name
            Text(viewModel.event?.name ?? "")
                .font(.title)
                .fontWeight(.bold)
                .foregroundColor(EventuColors.text)

            // Date & Time
            if let event = viewModel.event {
                HStack(spacing: 16) {
                    HStack(spacing: 6) {
                        Image(systemName: "calendar")
                            .foregroundColor(EventuColors.primary)
                        VStack(alignment: .leading) {
                            Text(event.formattedFullDate)
                                .font(.subheadline)
                                .fontWeight(.medium)
                            Text(event.formattedTime)
                                .font(.caption)
                                .foregroundColor(EventuColors.textSecondary)
                        }
                    }

                    Spacer()

                    if let age = event.ageRestriction {
                        HStack(spacing: 4) {
                            Image(systemName: "person.fill")
                            Text("+\(age)")
                        }
                        .font(.caption)
                        .fontWeight(.medium)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 6)
                        .background(EventuColors.surface)
                        .cornerRadius(8)
                    }
                }
                .foregroundColor(EventuColors.text)
            }

            // Description
            if let description = viewModel.event?.description {
                Text(description)
                    .font(.body)
                    .foregroundColor(EventuColors.textSecondary)
                    .lineSpacing(4)
            }

            // Tags
            if let tags = viewModel.event?.tags, !tags.isEmpty {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(tags, id: \.self) { tag in
                            Text("#\(tag)")
                                .font(.caption)
                                .foregroundColor(EventuColors.primary)
                                .padding(.horizontal, 10)
                                .padding(.vertical, 6)
                                .background(EventuColors.primary.opacity(0.1))
                                .cornerRadius(12)
                        }
                    }
                }
            }
        }
    }

    // MARK: - Venue Section

    private var venueSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Ubicación")
                .font(.headline)
                .fontWeight(.semibold)
                .foregroundColor(EventuColors.text)

            if let venue = viewModel.event?.venue {
                HStack(alignment: .top, spacing: 12) {
                    Image(systemName: "mappin.circle.fill")
                        .font(.title2)
                        .foregroundColor(EventuColors.primary)

                    VStack(alignment: .leading, spacing: 4) {
                        Text(venue.name)
                            .font(.subheadline)
                            .fontWeight(.medium)
                            .foregroundColor(EventuColors.text)

                        Text(venue.fullAddress)
                            .font(.caption)
                            .foregroundColor(EventuColors.textSecondary)
                    }

                    Spacer()

                    if venue.hasCoordinates {
                        Button {
                            openInMaps(venue: venue)
                        } label: {
                            Text("Ver mapa")
                                .font(.caption)
                                .fontWeight(.medium)
                                .foregroundColor(EventuColors.primary)
                        }
                    }
                }

                // Map Preview
                if let region = viewModel.venueRegion {
                    Map(coordinateRegion: .constant(region), annotationItems: [viewModel.venueAnnotation].compactMap { $0 }) { annotation in
                        MapMarker(coordinate: annotation.coordinate, tint: Color(hex: "#FF3B30"))
                    }
                    .frame(height: 150)
                    .cornerRadius(12)
                    .disabled(true)
                }
            }
        }
    }

    // MARK: - Ticket Types Section

    private var ticketTypesSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Entradas")
                .font(.headline)
                .fontWeight(.semibold)
                .foregroundColor(EventuColors.text)

            if let types = viewModel.event?.ticketTypes {
                VStack(spacing: 12) {
                    ForEach(types) { type in
                        TicketTypeRow(
                            ticketType: type,
                            quantity: viewModel.getSelectedQuantity(for: type.id),
                            onIncrement: { viewModel.incrementTicket(typeId: type.id) },
                            onDecrement: { viewModel.decrementTicket(typeId: type.id) }
                        )
                    }
                }
            }
        }
    }

    // MARK: - Bottom Bar

    private var bottomBar: some View {
        VStack(spacing: 0) {
            Divider()

            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text("\(viewModel.totalTickets) entrada\(viewModel.totalTickets == 1 ? "" : "s")")
                        .font(.caption)
                        .foregroundColor(EventuColors.textSecondary)

                    Text(formatPrice(viewModel.subtotal))
                        .font(.title3)
                        .fontWeight(.bold)
                        .foregroundColor(EventuColors.text)
                }

                Spacer()

                Button {
                    addToCart()
                } label: {
                    Text("Agregar al carrito")
                        .font(.headline)
                        .fontWeight(.semibold)
                        .foregroundColor(.white)
                        .padding(.horizontal, 24)
                        .padding(.vertical, 14)
                        .background(EventuColors.gradientPrimary)
                        .cornerRadius(12)
                }
            }
            .padding(20)
            .background(EventuColors.cardBackground)
        }
    }

    // MARK: - Actions

    private func addToCart() {
        guard let event = viewModel.event else { return }

        let cartVM = CartViewModel()
        cartVM.addToCart(event: event, items: viewModel.cartItems)

        viewModel.clearSelection()
        showCart = true
    }

    private func openInMaps(venue: Venue) {
        guard let lat = venue.latitude, let lon = venue.longitude else { return }

        let coordinate = CLLocationCoordinate2D(latitude: lat, longitude: lon)
        let placemark = MKPlacemark(coordinate: coordinate)
        let mapItem = MKMapItem(placemark: placemark)
        mapItem.name = venue.name
        mapItem.openInMaps()
    }

    private func formatPrice(_ price: Int) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = "COP"
        formatter.maximumFractionDigits = 0
        return formatter.string(from: NSNumber(value: price)) ?? "$\(price)"
    }
}

// MARK: - Ticket Type Row

struct TicketTypeRow: View {
    let ticketType: TicketType
    let quantity: Int
    let onIncrement: () -> Void
    let onDecrement: () -> Void

    var body: some View {
        HStack(spacing: 16) {
            // Color indicator
            if let colorHex = ticketType.color {
                RoundedRectangle(cornerRadius: 4)
                    .fill(Color(hex: colorHex))
                    .frame(width: 4, height: 60)
            }

            // Info
            VStack(alignment: .leading, spacing: 4) {
                Text(ticketType.name)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .foregroundColor(EventuColors.text)

                if let description = ticketType.description {
                    Text(description)
                        .font(.caption)
                        .foregroundColor(EventuColors.textSecondary)
                        .lineLimit(1)
                }

                HStack(spacing: 8) {
                    Text(ticketType.formattedPrice)
                        .font(.subheadline)
                        .fontWeight(.bold)
                        .foregroundColor(EventuColors.primary)

                    if ticketType.isSoldOut {
                        Text("Agotado")
                            .font(.caption2)
                            .fontWeight(.medium)
                            .foregroundColor(.white)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(EventuColors.error)
                            .cornerRadius(4)
                    } else if ticketType.isLowStock {
                        Text("Últimas!")
                            .font(.caption2)
                            .fontWeight(.medium)
                            .foregroundColor(EventuColors.warning)
                    }
                }
            }

            Spacer()

            // Quantity Selector
            if !ticketType.isSoldOut {
                HStack(spacing: 12) {
                    Button(action: onDecrement) {
                        Image(systemName: "minus.circle.fill")
                            .font(.title2)
                            .foregroundColor(quantity > 0 ? EventuColors.primary : EventuColors.textSecondary.opacity(0.3))
                    }
                    .disabled(quantity == 0)

                    Text("\(quantity)")
                        .font(.headline)
                        .fontWeight(.semibold)
                        .foregroundColor(EventuColors.text)
                        .frame(width: 24)

                    Button(action: onIncrement) {
                        Image(systemName: "plus.circle.fill")
                            .font(.title2)
                            .foregroundColor(EventuColors.primary)
                    }
                }
            }
        }
        .padding(16)
        .background(EventuColors.cardBackground)
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(EventuColors.border, lineWidth: 1)
        )
        .opacity(ticketType.isSoldOut ? 0.6 : 1)
    }
}

// MARK: - Preview

struct EventDetailView_Previews: PreviewProvider {
    static var previews: some View {
        NavigationStack {
            EventDetailView(eventId: "event-001")
                .environmentObject(ClientAppState.shared)
        }
    }
}
