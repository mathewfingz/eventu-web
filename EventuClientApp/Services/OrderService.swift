import Foundation

@MainActor
class OrderService: ObservableObject {
    static let shared = OrderService()

    @Published var orders: [Order] = []
    @Published var currentOrder: Order?
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?

    // Lock timeout for checkout (10 minutes)
    private let lockTimeoutMinutes: Int = 10

    private init() {}

    // MARK: - Fetch Orders

    func fetchMyOrders(userId: String) async {
        isLoading = true
        errorMessage = nil

        defer { isLoading = false }

        do {
            // Simulate network delay
            try await Task.sleep(nanoseconds: 800_000_000)

            // In production, fetch from Supabase
            self.orders = Order.mockOrders.filter { $0.userId == userId }
        } catch {
            errorMessage = "Error al cargar tus órdenes"
        }
    }

    func getOrder(id: String) async -> Order? {
        isLoading = true
        defer { isLoading = false }

        do {
            try await Task.sleep(nanoseconds: 500_000_000)
            return orders.first { $0.id == id } ?? Order.mockOrders.first { $0.id == id }
        } catch {
            return nil
        }
    }

    // MARK: - Create Order

    func createOrder(
        userId: String,
        eventId: String,
        items: [CartItem],
        subtotal: Int,
        serviceFee: Int,
        iva: Int,
        total: Int
    ) async throws -> Order {
        isLoading = true
        errorMessage = nil

        defer { isLoading = false }

        // Simulate network delay
        try await Task.sleep(nanoseconds: 1_000_000_000)

        // Create order items
        let orderItems = items.map { item in
            OrderItem(
                id: UUID().uuidString,
                orderId: "", // Will be set after order creation
                ticketTypeId: item.ticketType.id,
                quantity: item.quantity,
                unitPrice: item.ticketType.price,
                totalPrice: item.ticketType.price * item.quantity,
                ticketType: item.ticketType
            )
        }

        // Calculate lock expiration
        let lockExpires = Calendar.current.date(
            byAdding: .minute,
            value: lockTimeoutMinutes,
            to: Date()
        )

        // Create order
        let order = Order(
            id: UUID().uuidString,
            orderNumber: generateOrderNumber(),
            userId: userId,
            eventId: eventId,
            subtotal: subtotal,
            feesTotal: serviceFee,
            taxesTotal: iva,
            discountTotal: 0,
            total: total,
            status: .pending,
            paymentMethod: nil,
            paymentId: nil,
            paidAt: nil,
            presaleId: nil,
            discountCode: nil,
            lockExpiresAt: lockExpires,
            createdAt: Date(),
            items: orderItems,
            tickets: nil,
            event: nil
        )

        self.currentOrder = order
        return order
    }

    // MARK: - Update Order

    func updateOrderPaymentMethod(orderId: String, method: PaymentMethod) async throws {
        isLoading = true
        defer { isLoading = false }

        try await Task.sleep(nanoseconds: 300_000_000)

        // In production, this would update Supabase
        if var order = currentOrder, order.id == orderId {
            // Create new order with updated payment method
            let updatedOrder = Order(
                id: order.id,
                orderNumber: order.orderNumber,
                userId: order.userId,
                eventId: order.eventId,
                subtotal: order.subtotal,
                feesTotal: order.feesTotal,
                taxesTotal: order.taxesTotal,
                discountTotal: order.discountTotal,
                total: order.total,
                status: .processing,
                paymentMethod: method,
                paymentId: nil,
                paidAt: nil,
                presaleId: order.presaleId,
                discountCode: order.discountCode,
                lockExpiresAt: order.lockExpiresAt,
                createdAt: order.createdAt,
                items: order.items,
                tickets: order.tickets,
                event: order.event
            )
            self.currentOrder = updatedOrder
        }
    }

    func completeOrder(orderId: String, paymentId: String) async throws -> Order {
        isLoading = true
        defer { isLoading = false }

        try await Task.sleep(nanoseconds: 1_500_000_000)

        guard var order = currentOrder, order.id == orderId else {
            throw OrderError.orderNotFound
        }

        // Create completed order
        let completedOrder = Order(
            id: order.id,
            orderNumber: order.orderNumber,
            userId: order.userId,
            eventId: order.eventId,
            subtotal: order.subtotal,
            feesTotal: order.feesTotal,
            taxesTotal: order.taxesTotal,
            discountTotal: order.discountTotal,
            total: order.total,
            status: .completed,
            paymentMethod: order.paymentMethod,
            paymentId: paymentId,
            paidAt: Date(),
            presaleId: order.presaleId,
            discountCode: order.discountCode,
            lockExpiresAt: nil,
            createdAt: order.createdAt,
            items: order.items,
            tickets: generateTicketsForOrder(order),
            event: order.event
        )

        self.currentOrder = completedOrder
        self.orders.insert(completedOrder, at: 0)

        return completedOrder
    }

    func cancelOrder(orderId: String) async throws {
        isLoading = true
        defer { isLoading = false }

        try await Task.sleep(nanoseconds: 500_000_000)

        if currentOrder?.id == orderId {
            currentOrder = nil
        }

        orders.removeAll { $0.id == orderId }
    }

    // MARK: - Helpers

    private func generateOrderNumber() -> String {
        let timestamp = Int(Date().timeIntervalSince1970)
        let random = Int.random(in: 1000...9999)
        return "EVT-\(timestamp % 100000)-\(random)"
    }

    private func generateTicketsForOrder(_ order: Order) -> [ClientTicket] {
        var tickets: [ClientTicket] = []

        for item in order.items ?? [] {
            for _ in 0..<item.quantity {
                let ticket = ClientTicket(
                    id: UUID().uuidString,
                    ticketTypeId: item.ticketTypeId,
                    orderId: order.id,
                    userId: order.userId,
                    safetixSecret: generateSafeTixSecret(),
                    seatRow: nil,
                    seatNumber: nil,
                    section: nil,
                    status: .active,
                    usedAt: nil,
                    createdAt: Date(),
                    ticketType: item.ticketType,
                    order: nil,
                    event: nil
                )
                tickets.append(ticket)
            }
        }

        return tickets
    }

    private func generateSafeTixSecret() -> String {
        // Generate a random Base32 secret
        let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
        return String((0..<16).map { _ in characters.randomElement()! })
    }
}

// MARK: - Order Errors

enum OrderError: LocalizedError {
    case orderNotFound
    case orderExpired
    case paymentFailed
    case stockUnavailable

    var errorDescription: String? {
        switch self {
        case .orderNotFound:
            return "Orden no encontrada"
        case .orderExpired:
            return "El tiempo de la orden ha expirado"
        case .paymentFailed:
            return "El pago no pudo ser procesado"
        case .stockUnavailable:
            return "Las entradas ya no están disponibles"
        }
    }
}

// MARK: - Mock Orders

extension Order {
    static let mockOrders: [Order] = {
        let calendar = Calendar.current
        let today = Date()

        return [
            Order(
                id: "order-001",
                orderNumber: "EVT-12345-6789",
                userId: "user-001",
                eventId: "event-001",
                subtotal: 500000,
                feesTotal: 50000,
                taxesTotal: 9500,
                discountTotal: 0,
                total: 559500,
                status: .completed,
                paymentMethod: .nequi,
                paymentId: "nequi-payment-001",
                paidAt: calendar.date(byAdding: .day, value: -5, to: today),
                presaleId: nil,
                discountCode: nil,
                lockExpiresAt: nil,
                createdAt: calendar.date(byAdding: .day, value: -5, to: today)!,
                items: [
                    OrderItem(
                        id: "item-001",
                        orderId: "order-001",
                        ticketTypeId: "tt-001",
                        quantity: 2,
                        unitPrice: 250000,
                        totalPrice: 500000,
                        ticketType: nil
                    )
                ],
                tickets: nil,
                event: Event.mockEvents[0]
            )
        ]
    }()
}
