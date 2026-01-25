import Foundation

@MainActor
class CheckoutViewModel: ObservableObject {
    @Published var currentOrder: Order?
    @Published var selectedPaymentMethod: PaymentMethod?
    @Published var isLoading: Bool = false
    @Published var isProcessingPayment: Bool = false
    @Published var errorMessage: String?
    @Published var paymentCompleted: Bool = false

    // Timer for order expiration
    @Published var timeRemaining: TimeInterval = 0
    private var timer: Timer?

    private let orderService = OrderService.shared
    private let paymentService = PaymentService.shared

    // Lock timeout (10 minutes)
    private let lockTimeout: TimeInterval = 10 * 60

    // MARK: - Create Order

    func createOrder(cart: Cart, userId: String) async {
        guard let event = cart.event else {
            errorMessage = "No hay evento seleccionado"
            return
        }

        isLoading = true
        errorMessage = nil

        do {
            let order = try await orderService.createOrder(
                userId: userId,
                eventId: event.id,
                items: cart.items,
                subtotal: cart.subtotal,
                serviceFee: cart.serviceFee,
                iva: cart.iva,
                total: cart.total
            )

            self.currentOrder = order
            startTimer()
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }

    // MARK: - Payment

    func selectPaymentMethod(_ method: PaymentMethod) {
        selectedPaymentMethod = method
    }

    func processPayment() async {
        guard let order = currentOrder,
              let method = selectedPaymentMethod else {
            errorMessage = "Selecciona un método de pago"
            return
        }

        isProcessingPayment = true
        errorMessage = nil

        do {
            // Update order with payment method
            try await orderService.updateOrderPaymentMethod(orderId: order.id, method: method)

            // Create payment intent
            let intent = try await paymentService.createPaymentIntent(
                orderId: order.id,
                amount: order.total,
                method: method
            )

            // Process payment (in production, this might open a webview or native flow)
            let completedIntent = try await paymentService.processPayment(intent: intent)

            if completedIntent.status == .completed {
                // Complete the order
                let completedOrder = try await orderService.completeOrder(
                    orderId: order.id,
                    paymentId: completedIntent.id
                )

                self.currentOrder = completedOrder
                self.paymentCompleted = true
                stopTimer()

                // Clear cart
                ClientAppState.shared.cart.clear()
            } else {
                errorMessage = "El pago no pudo ser completado"
            }
        } catch {
            errorMessage = error.localizedDescription
        }

        isProcessingPayment = false
    }

    // MARK: - Cancel

    func cancelOrder() async {
        guard let order = currentOrder else { return }

        isLoading = true
        try? await orderService.cancelOrder(orderId: order.id)
        stopTimer()
        currentOrder = nil
        isLoading = false
    }

    // MARK: - Timer

    private func startTimer() {
        timeRemaining = lockTimeout

        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { [weak self] _ in
            Task { @MainActor in
                guard let self = self else { return }

                if self.timeRemaining > 0 {
                    self.timeRemaining -= 1
                } else {
                    self.stopTimer()
                    self.errorMessage = "El tiempo para completar la orden ha expirado"
                    await self.cancelOrder()
                }
            }
        }
    }

    private func stopTimer() {
        timer?.invalidate()
        timer = nil
    }

    // MARK: - Computed Properties

    var formattedTimeRemaining: String {
        let minutes = Int(timeRemaining) / 60
        let seconds = Int(timeRemaining) % 60
        return String(format: "%02d:%02d", minutes, seconds)
    }

    var isTimeLow: Bool {
        timeRemaining < 120 // Less than 2 minutes
    }

    var canProceed: Bool {
        selectedPaymentMethod != nil && !isProcessingPayment && timeRemaining > 0
    }

    var paymentMethods: [PaymentMethod] {
        PaymentMethod.allCases
    }

    func getPaymentMethodInfo(_ method: PaymentMethod) -> PaymentMethodInfo {
        paymentService.getPaymentMethodInfo(method)
    }

    deinit {
        timer?.invalidate()
    }
}
