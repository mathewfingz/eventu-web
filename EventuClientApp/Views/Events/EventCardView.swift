import SwiftUI

struct EventCardView: View {
    let event: Event
    var isCompact: Bool = false

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Image
            ZStack(alignment: .topTrailing) {
                AsyncImage(url: URL(string: event.displayImage)) { phase in
                    switch phase {
                    case .empty:
                        Rectangle()
                            .fill(EventuColors.surface)
                            .overlay(
                                ProgressView()
                                    .tint(EventuColors.primary)
                            )
                    case .success(let image):
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                    case .failure:
                        Rectangle()
                            .fill(EventuColors.surface)
                            .overlay(
                                Image(systemName: "music.mic")
                                    .font(.largeTitle)
                                    .foregroundColor(EventuColors.textSecondary)
                            )
                    @unknown default:
                        EmptyView()
                    }
                }
                .frame(height: isCompact ? 120 : 180)
                .clipped()

                // Status badge
                StatusBadge(availability: event.availability)
                    .padding(12)
            }

            // Content
            VStack(alignment: .leading, spacing: 8) {
                // Category
                HStack(spacing: 4) {
                    Image(systemName: event.category.icon)
                        .font(.caption2)
                    Text(event.category.displayName)
                        .font(.caption2)
                }
                .foregroundColor(EventuColors.primary)

                // Name
                Text(event.name)
                    .font(.headline)
                    .fontWeight(.semibold)
                    .foregroundColor(EventuColors.text)
                    .lineLimit(2)

                // Date & Venue
                VStack(alignment: .leading, spacing: 4) {
                    HStack(spacing: 4) {
                        Image(systemName: "calendar")
                            .font(.caption)
                        Text(event.formattedDate)
                            .font(.caption)
                        Text("•")
                            .font(.caption)
                        Text(event.formattedTime)
                            .font(.caption)
                    }
                    .foregroundColor(EventuColors.textSecondary)

                    if let venue = event.venue {
                        HStack(spacing: 4) {
                            Image(systemName: "mappin")
                                .font(.caption)
                            Text(venue.name)
                                .font(.caption)
                                .lineLimit(1)
                        }
                        .foregroundColor(EventuColors.textSecondary)
                    }
                }

                // Price
                HStack {
                    PriceTag(price: event.priceFrom, size: .small)

                    if let priceTo = event.priceTo, priceTo != event.priceFrom {
                        Text("-")
                            .foregroundColor(EventuColors.textSecondary)
                        PriceTag(price: priceTo, size: .small)
                    }

                    Spacer()
                }
            }
            .padding(isCompact ? 12 : 16)
        }
        .background(EventuColors.cardBackground)
        .cornerRadius(16)
        .shadow(color: Color.black.opacity(0.08), radius: 8, x: 0, y: 4)
    }
}

// MARK: - Featured Event Card

struct FeaturedEventCard: View {
    let event: Event

    var body: some View {
        ZStack(alignment: .bottomLeading) {
            // Image
            AsyncImage(url: URL(string: event.displayImage)) { phase in
                switch phase {
                case .empty:
                    Rectangle()
                        .fill(EventuColors.surface)
                        .overlay(
                            ProgressView()
                                .tint(EventuColors.primary)
                        )
                case .success(let image):
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                case .failure:
                    Rectangle()
                        .fill(EventuColors.surface)
                        .overlay(
                            Image(systemName: "music.mic")
                                .font(.system(size: 50))
                                .foregroundColor(EventuColors.textSecondary)
                        )
                @unknown default:
                    EmptyView()
                }
            }
            .frame(height: 280)
            .clipped()

            // Gradient overlay
            LinearGradient(
                colors: [.clear, .black.opacity(0.8)],
                startPoint: .top,
                endPoint: .bottom
            )

            // Content
            VStack(alignment: .leading, spacing: 8) {
                StatusBadge(availability: event.availability)

                Text(event.name)
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                    .lineLimit(2)

                HStack(spacing: 12) {
                    HStack(spacing: 4) {
                        Image(systemName: "calendar")
                            .font(.caption)
                        Text(event.formattedDate)
                            .font(.caption)
                    }

                    if let venue = event.venue {
                        HStack(spacing: 4) {
                            Image(systemName: "mappin")
                                .font(.caption)
                            Text(venue.city)
                                .font(.caption)
                        }
                    }
                }
                .foregroundColor(.white.opacity(0.9))

                HStack {
                    Text("Desde")
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.7))

                    Text(formatPrice(event.priceFrom))
                        .font(.headline)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                }
            }
            .padding(20)
        }
        .cornerRadius(20)
        .shadow(color: Color.black.opacity(0.15), radius: 12, x: 0, y: 6)
    }

    private func formatPrice(_ price: Int) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = "COP"
        formatter.maximumFractionDigits = 0
        return formatter.string(from: NSNumber(value: price)) ?? "$\(price)"
    }
}

// MARK: - Preview

struct EventCardView_Previews: PreviewProvider {
    static var previews: some View {
        ScrollView {
            VStack(spacing: 20) {
                FeaturedEventCard(event: Event.mockEvents[0])
                    .padding(.horizontal)

                EventCardView(event: Event.mockEvents[0])
                    .padding(.horizontal)

                EventCardView(event: Event.mockEvents[1], isCompact: true)
                    .padding(.horizontal)
            }
        }
        .background(EventuColors.background)
    }
}
