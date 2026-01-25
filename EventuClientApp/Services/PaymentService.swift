import Foundation

// MARK: - Payment Intent

struct PaymentIntent: Codable {
    let id: String
    let orderId: String
    let amount: Int
    let currency: String
    let method: PaymentMethod
    let status: PaymentStatus
    let redirectUrl: String?
    let createdAt: Date

    enum PaymentStatus: String, Codable {
        case pending = "PENDING"
        case processing = "PROCESSING"
        case completed = "COMPLETED"
        case failed = "FAILED"
        case cancelled = "CANCELLED"
    }
}

// MARK: - Payment Service

@MainActor
class PaymentService: ObservableObject {
    static let shared = PaymentService()

    @Published var isProcessing: Bool = false
    @Published var currentPaymentIntent: PaymentIntent?
    @Published var errorMessage: String?

    private let baseURL = AppConstants.baseURL

    private init() {}

    // MARK: - Create Payment Intent

    func createPaymentIntent(
        orderId: String,
        amount: Int,
        method: PaymentMethod
    ) async throws -> PaymentIntent {
        isProcessing = true
        errorMessage = nil

        defer { isProcessing = false }

        // Simulate API call
        try await Task.sleep(nanoseconds: 1_000_000_000)

        // In production, this would call /api/payments/create
        let intent = PaymentIntent(
            id: UUID().uuidString,
            orderId: orderId,
            amount: amount,
            currency: "COP",
            method: method,
            status: .pending,
            redirectUrl: getRedirectUrl(for: method),
            createdAt: Date()
        )

        self.currentPaymentIntent = intent
        return intent
    }

    // MARK: - Process Payment

    func processPayment(intent: PaymentIntent) async throws -> PaymentIntent {
        isProcessing = true
        errorMessage = nil

        defer { isProcessing = false }

        // Simulate payment processing
        try await Task.sleep(nanoseconds: 2_000_000_000)

        // In production, this would poll the payment status or handle webhooks
        // For demo, we'll simulate success
        let completedIntent = PaymentIntent(
            id: intent.id,
            orderId: intent.orderId,
            amount: intent.amount,
            currency: intent.currency,
            method: intent.method,
            status: .completed,
            redirectUrl: nil,
            createdAt: intent.createdAt
        )

        self.currentPaymentIntent = completedIntent
        return completedIntent
    }

    // MARK: - Verify Payment

    func verifyPayment(paymentId: String) async throws -> Bool {
        isProcessing = true
        defer { isProcessing = false }

        // Simulate verification
        try await Task.sleep(nanoseconds: 500_000_000)

        // In demo mode, always return true
        return true
    }

    // MARK: - Cancel Payment

    func cancelPayment(intentId: String) async {
        // In production, this would cancel the payment intent
        currentPaymentIntent = nil
    }

    // MARK: - Helpers

    private func getRedirectUrl(for method: PaymentMethod) -> String? {
        switch method {
        case .nequi:
            return "https://nequi.com/pay" // Mock URL
        case .mercadopago:
            return "https://mercadopago.com.co/checkout" // Mock URL
        case .pse:
            return "https://pse.com.co/payment" // Mock URL
        case .creditCard:
            return nil // Handled in-app
        case .efecty:
            return "https://efecty.com.co/pago" // Mock URL
        case .daviplata:
            return "https://daviplata.com/pago" // Mock URL
        }
    }

    // MARK: - Payment Method Info

    func getPaymentMethodInfo(_ method: PaymentMethod) -> PaymentMethodInfo {
        switch method {
        case .nequi:
            return PaymentMethodInfo(
                name: "Nequi",
                description: "Paga desde tu app Nequi",
                icon: "n.circle.fill",
                color: "#E91E63",
                estimatedTime: "Inmediato"
            )
        case .mercadopago:
            return PaymentMethodInfo(
                name: "MercadoPago",
                description: "Tarjeta, PSE o efectivo",
                icon: "creditcard.fill",
                color: "#009EE3",
                estimatedTime: "Inmediato"
            )
        case .pse:
            return PaymentMethodInfo(
                name: "PSE",
                description: "Débito desde tu banco",
                icon: "building.columns.fill",
                color: "#002D72",
                estimatedTime: "5-10 minutos"
            )
        case .creditCard:
            return PaymentMethodInfo(
                name: "Tarjeta de Crédito",
                description: "Visa, Mastercard, Amex",
                icon: "creditcard",
                color: "#1D1D1F",
                estimatedTime: "Inmediato"
            )
        case .efecty:
            return PaymentMethodInfo(
                name: "Efecty",
                description: "Paga en puntos Efecty",
                icon: "banknote.fill",
                color: "#FFDD00",
                estimatedTime: "Hasta 24 horas"
            )
        case .daviplata:
            return PaymentMethodInfo(
                name: "Daviplata",
                description: "Paga desde tu Daviplata",
                icon: "d.circle.fill",
                color: "#ED1C24",
                estimatedTime: "Inmediato"
            )
        }
    }
}

// MARK: - Payment Method Info

struct PaymentMethodInfo {
    let name: String
    let description: String
    let icon: String
    let color: String
    let estimatedTime: String
}
