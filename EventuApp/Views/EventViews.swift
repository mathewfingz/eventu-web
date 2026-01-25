import SwiftUI

// MARK: - Event List View (Home)
struct HomeView: View {
    @StateObject private var viewModel = HomeViewModel()
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    // Featured Section
                    Text("Destacados")
                        .font(.title2.bold())
                        .padding(.horizontal)
                    
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 15) {
                            ForEach(viewModel.featuredEvents) { event in
                                FeatureEventCard(event: event)
                            }
                        }
                        .padding(.horizontal)
                    }
                    
                    // Categories
                    Text("Categorías")
                        .font(.title2.bold())
                        .padding(.horizontal)
                    
                    CategoryList()
                    
                    // All Events
                    Text("Próximos Eventos")
                        .font(.title2.bold())
                        .padding(.horizontal)
                    
                    LazyVStack(spacing: 15) {
                        ForEach(viewModel.events) { event in
                            NavigationLink(destination: EventDetailView(event: event)) {
                                EventRow(event: event)
                            }
                            .buttonStyle(PlainButtonStyle())
                        }
                    }
                    .padding(.horizontal)
                }
                .padding(.vertical)
            }
            .navigationTitle("Eventu")
            .onAppear {
                Task { await viewModel.loadEvents() }
            }
            .refreshable {
                await viewModel.loadEvents()
            }
        }
    }
}

// MARK: - Event Card Component
struct FeatureEventCard: View {
    let event: Event
    
    var body: some View {
        VStack(alignment: .leading) {
            AsyncImage(url: URL(string: event.imageUrl ?? "")) { image in
                image.resizable().aspectRatio(contentMode: .fill)
            } placeholder: {
                Color.gray.opacity(0.3)
            }
            .frame(width: 280, height: 160)
            .clipped()
            .cornerRadius(15)
            .overlay(
                VStack {
                    Spacer()
                    HStack {
                        Text(event.category.rawValue)
                            .font(.caption2.bold())
                            .padding(5)
                            .background(Color.blue)
                            .foregroundColor(.white)
                            .cornerRadius(5)
                        Spacer()
                    }
                    .padding(10)
                }
            )
            
            Text(event.name)
                .font(.headline)
                .lineLimit(1)
            
            Text(event.venue?.name ?? "Venue TBD")
                .font(.subheadline)
                .foregroundColor(.secondary)
            
            Text("$\(event.priceFrom) COP")
                .font(.callout.bold())
                .foregroundColor(.primary)
        }
        .frame(width: 280)
    }
}

// MARK: - Event Row Component
struct EventRow: View {
    let event: Event
    
    var body: some View {
        HStack(spacing: 15) {
            AsyncImage(url: URL(string: event.imageUrl ?? "")) { image in
                image.resizable().aspectRatio(contentMode: .fill)
            } placeholder: {
                Color.gray.opacity(0.3)
            }
            .frame(width: 80, height: 80)
            .cornerRadius(10)
            
            VStack(alignment: .leading, spacing: 5) {
                Text(event.name)
                    .font(.headline)
                
                Text(event.venue?.name ?? "Venue TBD")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                
                HStack {
                    Image(systemName: "calendar")
                    Text(event.date.formatted(date: .abbreviated, time: .shortened))
                }
                .font(.caption)
                .foregroundColor(.blue)
            }
            
            Spacer()
            
            Image(systemName: "chevron.right")
                .foregroundColor(.secondary)
        }
        .padding()
        .background(Color(UIColor.secondarySystemBackground))
        .cornerRadius(15)
    }
}

// MARK: - Category List
struct CategoryList: View {
    let categories: [EventCategory] = [.concert, .festival, .theater, .sports, .party]
    
    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 10) {
                ForEach(categories, id: \.self) { cat in
                    Text(cat.rawValue.capitalized)
                        .padding(.horizontal, 15)
                        .padding(.vertical, 8)
                        .background(Color.blue.opacity(0.1))
                        .foregroundColor(.blue)
                        .cornerRadius(20)
                }
            }
            .padding(.horizontal)
        }
    }
}

// MARK: - Home ViewModel
class HomeViewModel: ObservableObject {
    @Published var events: [Event] = []
    @Published var featuredEvents: [Event] = []
    
    func loadEvents() async {
        do {
            let fetched = try await SupabaseManager.shared.fetchEvents()
            await MainActor.run {
                self.events = fetched
                self.featuredEvents = Array(fetched.prefix(3))
            }
        } catch {
            print("Error loading events: \(error)")
        }
    }
}

// MARK: - Event Detail View
struct EventDetailView: View {
    let event: Event
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading) {
                AsyncImage(url: URL(string: event.imageUrl ?? "")) { image in
                    image.resizable().aspectRatio(contentMode: .fill)
                } placeholder: {
                    Rectangle().fill(Color.gray.opacity(0.3))
                }
                .frame(height: 300)
                .clipped()
                
                VStack(alignment: .leading, spacing: 15) {
                    Text(event.name)
                        .font(.largeTitle.bold())
                    
                    HStack {
                        Image(systemName: "mappin.and.ellipse")
                        Text("\(event.venue?.name ?? "Venue TBD"), \(event.venue?.city ?? "")")
                    }
                    .font(.headline)
                    .foregroundColor(.blue)
                    
                    HStack {
                        Image(systemName: "calendar")
                        Text(event.date.formatted(date: .long, time: .shortened))
                    }
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    
                    Divider()
                    
                    Text("Acerca del evento")
                        .font(.headline)
                    
                    Text("Este es un evento increíble en \(event.venue?.name ?? "nuestro venue"). ¡No te lo pierdas!")
                        .font(.body)
                        .foregroundColor(.primary)
                }
                .padding()
            }
        }
        .edgesIgnoringSafeArea(.top)
        .overlay(
            VStack {
                Spacer()
                Button(action: { /* Purchase Logic */ }) {
                    Text("Comprar desde $\(event.priceFrom) COP")
                        .font(.headline)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.blue)
                        .cornerRadius(15)
                }
                .padding()
                .background(.ultraThinMaterial)
            }
        )
    }
}
