import Foundation

@MainActor
class CartViewModel: ObservableObject {
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?

    private let orderService = OrderService.shared

    // Reference to shared cart
    var cart: Cart {
        ClientAppState.shared.cart
    }

    // MARK: - Cart Operations

    func addToCart(event: Event, items: [CartItem]) {
        cart.event = event
        for item in items {
            cart.addItem(item)
        }
    }

    func updateQuantity(for item: CartItem, quantity: Int) {
        if quantity <= 0 {
            cart.removeItem(item)
        } else {
            cart.updateQuantity(for: item.ticketType.id, quantity: quantity)
        }
    }

    func removeItem(_ item: CartItem) {
        cart.removeItem(item)
    }

    func clearCart() {
        cart.clear()
    }

    // MARK: - Computed Properties

    var items: [CartItem] {
        cart.items
    }

    var event: Event? {
        cart.event
    }

    var isEmpty: Bool {
        cart.items.isEmpty
    }

    var itemCount: Int {
        cart.itemCount
    }

    var subtotal: Int {
        cart.subtotal
    }

    var serviceFee: Int {
        cart.serviceFee
    }

    var iva: Int {
        cart.iva
    }

    var total: Int {
        cart.total
    }

    var formattedSubtotal: String {
        formatPrice(subtotal)
    }

    var formattedServiceFee: String {
        formatPrice(serviceFee)
    }

    var formattedIVA: String {
        formatPrice(iva)
    }

    var formattedTotal: String {
        formatPrice(total)
    }

    // MARK: - Helpers

    private func formatPrice(_ price: Int) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = "COP"
        formatter.maximumFractionDigits = 0
        return formatter.string(from: NSNumber(value: price)) ?? "$\(price)"
    }
}
