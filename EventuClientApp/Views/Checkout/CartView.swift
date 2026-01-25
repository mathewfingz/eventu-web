import SwiftUI

struct CartView: View {
    @StateObject private var viewModel = CartViewModel()
    @EnvironmentObject private var appState: ClientAppState
    @Environment(\.dismiss) private var dismiss

    @State private var showCheckout = false

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                if viewModel.isEmpty {
                    emptyCart
                } else {
                    cartContent
                }
            }
            .background(EventuColors.background)
            .navigationTitle("Carrito")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cerrar") {
                        dismiss()
                    }
                    .foregroundColor(EventuColors.primary)
                }

                if !viewModel.isEmpty {
                    ToolbarItem(placement: .navigationBarTrailing) {
                        Button("Vaciar") {
                            viewModel.clearCart()
                        }
                        .foregroundColor(EventuColors.error)
                    }
                }
            }
            .navigationDestination(isPresented: $showCheckout) {
                CheckoutView()
            }
        }
    }

    // MARK: - Empty Cart

    private var emptyCart: some View {
        VStack(spacing: 20) {
            Spacer()

            Image(systemName: "cart")
                .font(.system(size: 64))
                .foregroundColor(EventuColors.textSecondary)

            Text("Tu carrito está vacío")
                .font(.title2)
                .fontWeight(.semibold)
                .foregroundColor(EventuColors.text)

            Text("Agrega entradas a tu carrito\npara continuar con la compra")
                .font(.subheadline)
                .foregroundColor(EventuColors.textSecondary)
                .multilineTextAlignment(.center)

            Button {
                dismiss()
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

    // MARK: - Cart Content

    private var cartContent: some View {
        VStack(spacing: 0) {
            ScrollView {
                VStack(spacing: 20) {
                    // Event Header
                    if let event = viewModel.event {
                        eventHeader(event)
                    }

                    // Items
                    itemsList

                    // Summary
                    orderSummary
                }
                .padding(20)
            }

            // Checkout Button
            checkoutButton
        }
    }

    // MARK: - Event Header

    private func eventHeader(_ event: Event) -> some View {
        HStack(spacing: 12) {
            AsyncImage(url: URL(string: event.displayImage)) { phase in
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
            .frame(width: 60, height: 60)
            .cornerRadius(8)
            .clipped()

            VStack(alignment: .leading, spacing: 4) {
                Text(event.name)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .foregroundColor(EventuColors.text)
                    .lineLimit(1)

                Text(event.formattedFullDate)
                    .font(.caption)
                    .foregroundColor(EventuColors.textSecondary)

                if let venue = event.venue {
                    Text(venue.name)
                        .font(.caption)
                        .foregroundColor(EventuColors.textSecondary)
                }
            }

            Spacer()
        }
        .padding(16)
        .background(EventuColors.cardBackground)
        .cornerRadius(12)
    }

    // MARK: - Items List

    private var itemsList: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Entradas")
                .font(.headline)
                .fontWeight(.semibold)
                .foregroundColor(EventuColors.text)

            ForEach(viewModel.items) { item in
                CartItemRow(
                    item: item,
                    onUpdate: { quantity in
                        viewModel.updateQuantity(for: item, quantity: quantity)
                    },
                    onRemove: {
                        viewModel.removeItem(item)
                    }
                )
            }
        }
    }

    // MARK: - Order Summary

    private var orderSummary: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Resumen")
                .font(.headline)
                .fontWeight(.semibold)
                .foregroundColor(EventuColors.text)

            VStack(spacing: 12) {
                SummaryRow(label: "Subtotal", value: viewModel.formattedSubtotal)
                SummaryRow(label: "Servicio (10%)", value: viewModel.formattedServiceFee)
                SummaryRow(label: "IVA (19%)", value: viewModel.formattedIVA)

                Divider()

                HStack {
                    Text("Total")
                        .font(.headline)
                        .fontWeight(.bold)
                        .foregroundColor(EventuColors.text)

                    Spacer()

                    Text(viewModel.formattedTotal)
                        .font(.title3)
                        .fontWeight(.bold)
                        .foregroundColor(EventuColors.primary)
                }
            }
            .padding(16)
            .background(EventuColors.cardBackground)
            .cornerRadius(12)
        }
    }

    // MARK: - Checkout Button

    private var checkoutButton: some View {
        VStack(spacing: 0) {
            Divider()

            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text("\(viewModel.itemCount) entrada\(viewModel.itemCount == 1 ? "" : "s")")
                        .font(.caption)
                        .foregroundColor(EventuColors.textSecondary)

                    Text(viewModel.formattedTotal)
                        .font(.title3)
                        .fontWeight(.bold)
                        .foregroundColor(EventuColors.text)
                }

                Spacer()

                Button {
                    showCheckout = true
                } label: {
                    Text("Continuar")
                        .font(.headline)
                        .fontWeight(.semibold)
                        .foregroundColor(.white)
                        .padding(.horizontal, 32)
                        .padding(.vertical, 14)
                        .background(EventuColors.gradientPrimary)
                        .cornerRadius(12)
                }
            }
            .padding(20)
            .background(EventuColors.cardBackground)
        }
    }
}

// MARK: - Cart Item Row

struct CartItemRow: View {
    let item: CartItem
    let onUpdate: (Int) -> Void
    let onRemove: () -> Void

    var body: some View {
        HStack(spacing: 16) {
            // Color indicator
            if let colorHex = item.ticketType.color {
                RoundedRectangle(cornerRadius: 4)
                    .fill(Color(hex: colorHex))
                    .frame(width: 4, height: 50)
            }

            // Info
            VStack(alignment: .leading, spacing: 4) {
                Text(item.ticketType.name)
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(EventuColors.text)

                Text(item.formattedUnitPrice)
                    .font(.caption)
                    .foregroundColor(EventuColors.textSecondary)
            }

            Spacer()

            // Quantity controls
            HStack(spacing: 12) {
                Button {
                    if item.quantity > 1 {
                        onUpdate(item.quantity - 1)
                    } else {
                        onRemove()
                    }
                } label: {
                    Image(systemName: item.quantity == 1 ? "trash" : "minus.circle.fill")
                        .font(.title3)
                        .foregroundColor(item.quantity == 1 ? EventuColors.error : EventuColors.primary)
                }

                Text("\(item.quantity)")
                    .font(.headline)
                    .fontWeight(.semibold)
                    .foregroundColor(EventuColors.text)
                    .frame(width: 24)

                Button {
                    let max = item.ticketType.maxPerOrder ?? 10
                    if item.quantity < max {
                        onUpdate(item.quantity + 1)
                    }
                } label: {
                    Image(systemName: "plus.circle.fill")
                        .font(.title3)
                        .foregroundColor(EventuColors.primary)
                }
            }

            // Total
            Text(item.formattedTotalPrice)
                .font(.subheadline)
                .fontWeight(.semibold)
                .foregroundColor(EventuColors.text)
                .frame(width: 80, alignment: .trailing)
        }
        .padding(16)
        .background(EventuColors.cardBackground)
        .cornerRadius(12)
    }
}

// MARK: - Summary Row

struct SummaryRow: View {
    let label: String
    let value: String

    var body: some View {
        HStack {
            Text(label)
                .font(.subheadline)
                .foregroundColor(EventuColors.textSecondary)

            Spacer()

            Text(value)
                .font(.subheadline)
                .foregroundColor(EventuColors.text)
        }
    }
}

// MARK: - Preview

struct CartView_Previews: PreviewProvider {
    static var previews: some View {
        CartView()
            .environmentObject(ClientAppState.shared)
    }
}
