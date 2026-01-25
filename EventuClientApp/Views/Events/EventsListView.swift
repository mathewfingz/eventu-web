import SwiftUI

struct EventsListView: View {
    @StateObject private var viewModel = EventsViewModel()
    @State private var showFilters = false
    @State private var selectedEvent: Event?

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // Search Bar
                    searchBar

                    if viewModel.searchQuery.isEmpty {
                        // Featured Events
                        if !viewModel.featuredEvents.isEmpty {
                            featuredSection
                        }

                        // Category Pills
                        categoryPills

                        // All Events
                        allEventsSection
                    } else {
                        // Search Results
                        searchResultsSection
                    }
                }
                .padding(.bottom, 100)
            }
            .background(EventuColors.background)
            .navigationBarHidden(true)
            .sheet(isPresented: $showFilters) {
                FiltersSheet(viewModel: viewModel)
            }
            .navigationDestination(for: Event.self) { event in
                EventDetailView(eventId: event.id)
            }
            .refreshable {
                await viewModel.loadEvents()
            }
            .task {
                await viewModel.loadEvents()
            }
        }
    }

    // MARK: - Search Bar

    private var searchBar: some View {
        HStack(spacing: 12) {
            HStack(spacing: 8) {
                Image(systemName: "magnifyingglass")
                    .foregroundColor(EventuColors.textSecondary)

                TextField("Buscar eventos, artistas...", text: $viewModel.searchQuery)
                    .autocapitalization(.none)
                    .disableAutocorrection(true)

                if !viewModel.searchQuery.isEmpty {
                    Button {
                        viewModel.clearSearch()
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundColor(EventuColors.textSecondary)
                    }
                }
            }
            .padding(12)
            .background(EventuColors.surface)
            .cornerRadius(12)

            // Filters button
            Button {
                showFilters = true
            } label: {
                Image(systemName: viewModel.hasActiveFilters ? "line.3.horizontal.decrease.circle.fill" : "line.3.horizontal.decrease.circle")
                    .font(.system(size: 22))
                    .foregroundColor(EventuColors.primary)
            }
        }
        .padding(.horizontal)
        .padding(.top, 8)
        .onChange(of: viewModel.searchQuery) { _ in
            Task {
                await viewModel.search()
            }
        }
    }

    // MARK: - Featured Section

    private var featuredSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Destacados")
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(EventuColors.text)
                .padding(.horizontal)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 16) {
                    ForEach(viewModel.featuredEvents) { event in
                        NavigationLink(value: event) {
                            FeaturedEventCard(event: event)
                                .frame(width: 320)
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(.horizontal)
            }
        }
    }

    // MARK: - Category Pills

    private var categoryPills: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 12) {
                // All category
                CategoryPill(
                    name: "Todos",
                    icon: "square.grid.2x2",
                    isSelected: viewModel.selectedCategory == nil
                ) {
                    viewModel.selectedCategory = nil
                    Task { await viewModel.applyFilters() }
                }

                ForEach(viewModel.categories, id: \.self) { category in
                    CategoryPill(
                        name: category.displayName,
                        icon: category.icon,
                        isSelected: viewModel.selectedCategory == category
                    ) {
                        viewModel.selectedCategory = category
                        Task { await viewModel.applyFilters() }
                    }
                }
            }
            .padding(.horizontal)
        }
    }

    // MARK: - All Events Section

    private var allEventsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("Todos los eventos")
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(EventuColors.text)

                Spacer()

                Text("\(viewModel.events.count) eventos")
                    .font(.caption)
                    .foregroundColor(EventuColors.textSecondary)
            }
            .padding(.horizontal)

            if viewModel.isLoading {
                loadingPlaceholder
            } else if viewModel.events.isEmpty {
                emptyState
            } else {
                LazyVStack(spacing: 16) {
                    ForEach(viewModel.events) { event in
                        NavigationLink(value: event) {
                            EventCardView(event: event)
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(.horizontal)
            }
        }
    }

    // MARK: - Search Results

    private var searchResultsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("Resultados")
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(EventuColors.text)

                Spacer()

                if viewModel.isSearching {
                    ProgressView()
                        .tint(EventuColors.primary)
                } else {
                    Text("\(viewModel.searchResults.count) encontrados")
                        .font(.caption)
                        .foregroundColor(EventuColors.textSecondary)
                }
            }
            .padding(.horizontal)

            if viewModel.searchResults.isEmpty && !viewModel.isSearching {
                VStack(spacing: 16) {
                    Image(systemName: "magnifyingglass")
                        .font(.system(size: 48))
                        .foregroundColor(EventuColors.textSecondary)

                    Text("No encontramos eventos")
                        .font(.headline)
                        .foregroundColor(EventuColors.text)

                    Text("Intenta con otros términos de búsqueda")
                        .font(.subheadline)
                        .foregroundColor(EventuColors.textSecondary)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 60)
            } else {
                LazyVStack(spacing: 16) {
                    ForEach(viewModel.searchResults) { event in
                        NavigationLink(value: event) {
                            EventCardView(event: event, isCompact: true)
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(.horizontal)
            }
        }
    }

    // MARK: - Loading Placeholder

    private var loadingPlaceholder: some View {
        VStack(spacing: 16) {
            ForEach(0..<3, id: \.self) { _ in
                RoundedRectangle(cornerRadius: 16)
                    .fill(EventuColors.surface)
                    .frame(height: 260)
                    .shimmer()
            }
        }
        .padding(.horizontal)
    }

    // MARK: - Empty State

    private var emptyState: some View {
        VStack(spacing: 16) {
            Image(systemName: "calendar.badge.exclamationmark")
                .font(.system(size: 48))
                .foregroundColor(EventuColors.textSecondary)

            Text("No hay eventos disponibles")
                .font(.headline)
                .foregroundColor(EventuColors.text)

            Text("Intenta cambiando los filtros")
                .font(.subheadline)
                .foregroundColor(EventuColors.textSecondary)

            if viewModel.hasActiveFilters {
                Button("Limpiar filtros") {
                    Task { await viewModel.clearFilters() }
                }
                .foregroundColor(EventuColors.primary)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 60)
    }
}

// MARK: - Category Pill

struct CategoryPill: View {
    let name: String
    let icon: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 6) {
                Image(systemName: icon)
                    .font(.caption)
                Text(name)
                    .font(.subheadline)
                    .fontWeight(.medium)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
            .background(isSelected ? EventuColors.primary : EventuColors.surface)
            .foregroundColor(isSelected ? .white : EventuColors.text)
            .cornerRadius(20)
        }
    }
}

// MARK: - Filters Sheet

struct FiltersSheet: View {
    @ObservedObject var viewModel: EventsViewModel
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            List {
                Section("Categoría") {
                    ForEach(viewModel.categories, id: \.self) { category in
                        Button {
                            if viewModel.selectedCategory == category {
                                viewModel.selectedCategory = nil
                            } else {
                                viewModel.selectedCategory = category
                            }
                        } label: {
                            HStack {
                                Image(systemName: category.icon)
                                    .foregroundColor(EventuColors.primary)
                                    .frame(width: 24)

                                Text(category.displayName)
                                    .foregroundColor(EventuColors.text)

                                Spacer()

                                if viewModel.selectedCategory == category {
                                    Image(systemName: "checkmark")
                                        .foregroundColor(EventuColors.primary)
                                }
                            }
                        }
                    }
                }

                Section("Ciudad") {
                    ForEach(viewModel.cities, id: \.self) { city in
                        Button {
                            if viewModel.selectedCity == city {
                                viewModel.selectedCity = nil
                            } else {
                                viewModel.selectedCity = city
                            }
                        } label: {
                            HStack {
                                Text(city)
                                    .foregroundColor(EventuColors.text)

                                Spacer()

                                if viewModel.selectedCity == city {
                                    Image(systemName: "checkmark")
                                        .foregroundColor(EventuColors.primary)
                                }
                            }
                        }
                    }
                }
            }
            .navigationTitle("Filtros")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Limpiar") {
                        viewModel.selectedCategory = nil
                        viewModel.selectedCity = nil
                    }
                    .foregroundColor(EventuColors.textSecondary)
                }

                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Aplicar") {
                        Task {
                            await viewModel.applyFilters()
                            dismiss()
                        }
                    }
                    .fontWeight(.semibold)
                    .foregroundColor(EventuColors.primary)
                }
            }
        }
        .presentationDetents([.medium])
    }
}

// MARK: - Preview

struct EventsListView_Previews: PreviewProvider {
    static var previews: some View {
        EventsListView()
    }
}
