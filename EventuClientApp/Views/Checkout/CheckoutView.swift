import SwiftUI

struct CheckoutView: View {
    @StateObject private var viewModel = CheckoutViewModel()
    @EnvironmentObject private var appState: ClientAppState
    @EnvironmentObject private var authService: ClientAuthService
    @Environment(\.dismiss) private var dismiss

    @State private var showConfirmation = false

    var body: some View {
        VStack(spacing: 0) {
            // Timer bar
            timerBar

            ScrollView {
                VStack(spacing: 24) {
                    // Order summary
                    orderSummary

                    // Payment methods
                    paymentMethodsSection

                    // Terms
                    termsSection
                }
                .padding(20)
            }

            // Pay button
            payButton
        }
        .background(EventuColors.background)
        .navigationTitle("Pago")
        .navigationBarTitleDisplayMode(.inline)
        .navigationBarBackButtonHidden(viewModel.isProcessingPayment)
        .fullScreenCover(isPresented: $showConfirmation) {
            if let order = viewModel.currentOrder {
                OrderConfirmationView(order: order) {
                    dismiss()
                }
            }
        }
        .alert("Error", isPresented: .constant(viewModel.errorMessage != nil)) {
            Button("OK") {
                viewModel.errorMessage = nil
            }
        } message: {
            Text(viewModel.errorMessage ?? "")
        }
        .task {
            if let userId = authService.currentUser?.id {
                await viewModel.createOrder(cart: appState.cart, userId: userId)
            }
        }
        .onChange(of: viewModel.paymentCompleted) { completed in
            if completed {
                showConfirmation = true
            }
        }
    }

    // MARK: - Timer Bar

    private var timerBar: some View {
        HStack {
            Image(systemName: "clock")
                .foregroundColor(viewModel.isTimeLow ? EventuColors.error : EventuColors.warning)

            Text("Tiempo restante:")
                .font(.subheadline)
                .foregroundColor(EventuColors.text)

            Text(viewModel.formattedTimeRemaining)
                .font(.headline)
                .fontWeight(.bold)
                .foregroundColor(viewModel.isTimeLow ? EventuColors.error : EventuColors.warning)
                .monospacedDigit()

            Spacer()

            if viewModel.isTimeLow {
                Text("¡Date prisa!")
                    .font(.caption)
                    .fontWeight(.medium)
                    .foregroundColor(EventuColors.error)
            }
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 12)
        .background(viewModel.isTimeLow ? EventuColors.error.opacity(0.1) : EventuColors.warning.opacity(0.1))
    }

    // MARK: - Order Summary

    private var orderSummary: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Resumen del pedido")
                .font(.headline)
                .fontWeight(.semibold)
                .foregroundColor(EventuColors.text)

            VStack(spacing: 12) {
                if let order = viewModel.currentOrder {
                    SummaryRow(label: "Subtotal", value: formatPrice(order.subtotal))
                    SummaryRow(label: "Servicio", value: formatPrice(order.feesTotal))
                    SummaryRow(label: "IVA", value: formatPrice(order.taxesTotal))

                    if order.discountTotal > 0 {
                        SummaryRow(label: "Descuento", value: "-\(formatPrice(order.discountTotal))")
                    }

                    Divider()

                    HStack {
                        Text("Total a pagar")
                            .font(.headline)
                            .fontWeight(.bold)
                            .foregroundColor(EventuColors.text)

                        Spacer()

                        Text(formatPrice(order.total))
                            .font(.title2)
                            .fontWeight(.bold)
                            .foregroundColor(EventuColors.primary)
                    }
                } else {
                    HStack {
                        Spacer()
                        ProgressView()
                            .tint(EventuColors.primary)
                        Spacer()
                    }
                    .padding(.vertical, 20)
                }
            }
            .padding(16)
            .background(EventuColors.cardBackground)
            .cornerRadius(12)
        }
    }

    // MARK: - Payment Methods Section

    private var paymentMethodsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Método de pago")
                .font(.headline)
                .fontWeight(.semibold)
                .foregroundColor(EventuColors.text)

            VStack(spacing: 12) {
                ForEach(viewModel.paymentMethods, id: \.self) { method in
                    PaymentMethodRow(
                        method: method,
                        info: viewModel.getPaymentMethodInfo(method),
                        isSelected: viewModel.selectedPaymentMethod == method
                    ) {
                        viewModel.selectPaymentMethod(method)
                    }
                }
            }
        }
    }

    // MARK: - Terms Section

    private var termsSection: some View {
        VStack(spacing: 8) {
            Text("Al continuar, aceptas los")
                .font(.caption)
                .foregroundColor(EventuColors.textSecondary)

            HStack(spacing: 4) {
                Button("Términos y Condiciones") {
                    // Show terms
                }
                .font(.caption)
                .foregroundColor(EventuColors.primary)

                Text("y la")
                    .font(.caption)
                    .foregroundColor(EventuColors.textSecondary)

                Button("Política de Privacidad") {
                    // Show privacy
                }
                .font(.caption)
                .foregroundColor(EventuColors.primary)
            }
        }
        .frame(maxWidth: .infinity)
    }

    // MARK: - Pay Button

    private var payButton: some View {
        VStack(spacing: 0) {
            Divider()

            Button {
                Task {
                    await viewModel.processPayment()
                }
            } label: {
                HStack {
                    if viewModel.isProcessingPayment {
                        ProgressView()
                            .tint(.white)
                    } else {
                        Image(systemName: "lock.fill")
                        Text("Pagar \(formatPrice(viewModel.currentOrder?.total ?? 0))")
                    }
                }
                .font(.headline)
                .fontWeight(.semibold)
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
                .background(
                    viewModel.canProceed
                        ? AnyShapeStyle(EventuColors.gradientPrimary)
                        : AnyShapeStyle(EventuColors.textSecondary.opacity(0.3))
                )
                .cornerRadius(12)
            }
            .disabled(!viewModel.canProceed)
            .padding(20)
            .background(EventuColors.cardBackground)
        }
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

// MARK: - Payment Method Row

struct PaymentMethodRow: View {
    let method: PaymentMethod
    let info: PaymentMethodInfo
    let isSelected: Bool
    let onSelect: () -> Void

    var body: some View {
        Button(action: onSelect) {
            HStack(spacing: 16) {
                // Icon
                ZStack {
                    Circle()
                        .fill(Color(hex: info.color).opacity(0.1))
                        .frame(width: 44, height: 44)

                    Image(systemName: info.icon)
                        .font(.system(size: 18))
                        .foregroundColor(Color(hex: info.color))
                }

                // Info
                VStack(alignment: .leading, spacing: 4) {
                    Text(info.name)
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundColor(EventuColors.text)

                    Text(info.description)
                        .font(.caption)
                        .foregroundColor(EventuColors.textSecondary)
                }

                Spacer()

                // Estimated time
                Text(info.estimatedTime)
                    .font(.caption2)
                    .foregroundColor(EventuColors.textSecondary)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(EventuColors.surface)
                    .cornerRadius(6)

                // Selection indicator
                Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
                    .font(.title2)
                    .foregroundColor(isSelected ? EventuColors.primary : EventuColors.border)
            }
            .padding(16)
            .background(EventuColors.cardBackground)
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(isSelected ? EventuColors.primary : EventuColors.border, lineWidth: isSelected ? 2 : 1)
            )
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Preview

struct CheckoutView_Previews: PreviewProvider {
    static var previews: some View {
        NavigationStack {
            CheckoutView()
                .environmentObject(ClientAppState.shared)
                .environmentObject(ClientAuthService.shared)
        }
    }
}
