import SwiftUI

@MainActor
class ClientAppState: ObservableObject {
    static let shared = ClientAppState()

    // MARK: - Navigation
    @Published var selectedTab: AppTab = .events
    @Published var showLogin = false
    @Published var showCart = false

    // MARK: - User
    @Published var currentUser: ClientUser?

    // MARK: - Cart
    @Published var cart = Cart()

    // MARK: - App Tab
    enum AppTab: Hashable {
        case events
        case tickets
        case profile
    }

    // MARK: - Computed Properties
    var isLoggedIn: Bool {
        currentUser != nil
    }

    var cartItemCount: Int {
        cart.itemCount
    }

    // MARK: - Methods
    func requireLogin(then action: @escaping () -> Void) {
        if isLoggedIn {
            action()
        } else {
            showLogin = true
        }
    }

    func logout() {
        currentUser = nil
        cart.clear()
        selectedTab = .events
    }
}

// MARK: - Cart

@MainActor
class Cart: ObservableObject {
    @Published var items: [CartItem] = []
    @Published var event: Event?
    @Published var presaleCode: String?

    var isEmpty: Bool {
        items.isEmpty
    }

    var itemCount: Int {
        items.reduce(0) { $0 + $1.quantity }
    }

    var subtotal: Int {
        items.reduce(0) { $0 + $1.subtotal }
    }

    var serviceFee: Int {
        Int(Double(subtotal) * 0.10) // 10%
    }

    var iva: Int {
        Int(Double(serviceFee) * 0.19) // 19% del servicio
    }

    var total: Int {
        subtotal + serviceFee + iva
    }

    // MARK: - Methods

    func add(ticketType: TicketType, quantity: Int = 1) {
        if let index = items.firstIndex(where: { $0.ticketType.id == ticketType.id }) {
            let maxAllowed = ticketType.maxPerOrder ?? 10
            items[index].quantity = min(items[index].quantity + quantity, maxAllowed)
        } else {
            items.append(CartItem(ticketType: ticketType, quantity: quantity))
        }
    }

    func remove(ticketTypeId: String) {
        items.removeAll { $0.ticketType.id == ticketTypeId }
    }

    func updateQuantity(ticketTypeId: String, quantity: Int) {
        if let index = items.firstIndex(where: { $0.ticketType.id == ticketTypeId }) {
            if quantity <= 0 {
                items.remove(at: index)
            } else {
                let maxAllowed = items[index].ticketType.maxPerOrder ?? 10
                items[index].quantity = min(quantity, maxAllowed)
            }
        }
    }

    func updateQuantity(for ticketTypeId: String, quantity: Int) {
        updateQuantity(ticketTypeId: ticketTypeId, quantity: quantity)
    }

    func addItem(_ item: CartItem) {
        if let index = items.firstIndex(where: { $0.ticketType.id == item.ticketType.id }) {
            let maxAllowed = item.ticketType.maxPerOrder ?? 10
            items[index].quantity = min(items[index].quantity + item.quantity, maxAllowed)
        } else {
            items.append(item)
        }
    }

    func removeItem(_ item: CartItem) {
        items.removeAll { $0.ticketType.id == item.ticketType.id }
    }

    func clear() {
        items.removeAll()
        event = nil
        presaleCode = nil
    }

    func setEvent(_ event: Event) {
        if self.event?.id != event.id {
            clear()
        }
        self.event = event
    }
}

// MARK: - Cart Item

struct CartItem: Identifiable {
    let id = UUID()
    let ticketType: TicketType
    var quantity: Int

    var subtotal: Int {
        ticketType.price * quantity
    }

    var formattedUnitPrice: String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = "COP"
        formatter.maximumFractionDigits = 0
        return formatter.string(from: NSNumber(value: ticketType.price)) ?? "$\(ticketType.price)"
    }

    var formattedTotalPrice: String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = "COP"
        formatter.maximumFractionDigits = 0
        return formatter.string(from: NSNumber(value: subtotal)) ?? "$\(subtotal)"
    }
}
