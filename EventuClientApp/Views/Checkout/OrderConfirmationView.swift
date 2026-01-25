import SwiftUI

struct OrderConfirmationView: View {
    let order: Order
    let onDismiss: () -> Void

    @State private var showConfetti = false

    var body: some View {
        VStack(spacing: 0) {
            // Close button
            HStack {
                Spacer()
                Button {
                    onDismiss()
                } label: {
                    Image(systemName: "xmark.circle.fill")
                        .font(.title2)
                        .foregroundColor(EventuColors.textSecondary)
                }
            }
            .padding(20)

            ScrollView {
                VStack(spacing: 32) {
                    // Success animation
                    successAnimation

                    // Order info
                    orderInfo

                    // Tickets summary
                    ticketsSummary

                    // Next steps
                    nextSteps

                    // Actions
                    actions
                }
                .padding(20)
            }
        }
        .background(EventuColors.background)
        .onAppear {
            showConfetti = true
        }
    }

    // MARK: - Success Animation

    private var successAnimation: some View {
        VStack(spacing: 20) {
            ZStack {
                // Animated circles
                Circle()
                    .fill(EventuColors.success.opacity(0.1))
                    .frame(width: 140, height: 140)
                    .scaleEffect(showConfetti ? 1 : 0.5)
                    .animation(.spring(response: 0.6, dampingFraction: 0.6), value: showConfetti)

                Circle()
                    .fill(EventuColors.success.opacity(0.2))
                    .frame(width: 100, height: 100)
                    .scaleEffect(showConfetti ? 1 : 0.5)
                    .animation(.spring(response: 0.5, dampingFraction: 0.6).delay(0.1), value: showConfetti)

                // Checkmark
                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 60))
                    .foregroundColor(EventuColors.success)
                    .scaleEffect(showConfetti ? 1 : 0)
                    .animation(.spring(response: 0.4, dampingFraction: 0.6).delay(0.2), value: showConfetti)
            }

            VStack(spacing: 8) {
                Text("¡Compra exitosa!")
                    .font(.title)
                    .fontWeight(.bold)
                    .foregroundColor(EventuColors.text)

                Text("Tu pago ha sido procesado correctamente")
                    .font(.subheadline)
                    .foregroundColor(EventuColors.textSecondary)
            }
        }
    }

    // MARK: - Order Info

    private var orderInfo: some View {
        VStack(spacing: 16) {
            HStack {
                Text("Orden")
                    .font(.subheadline)
                    .foregroundColor(EventuColors.textSecondary)

                Spacer()

                Text(order.orderNumber)
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(EventuColors.text)
            }

            HStack {
                Text("Fecha")
                    .font(.subheadline)
                    .foregroundColor(EventuColors.textSecondary)

                Spacer()

                Text(order.formattedDate)
                    .font(.subheadline)
                    .foregroundColor(EventuColors.text)
            }

            HStack {
                Text("Método de pago")
                    .font(.subheadline)
                    .foregroundColor(EventuColors.textSecondary)

                Spacer()

                Text(order.paymentMethod?.displayName ?? "")
                    .font(.subheadline)
                    .foregroundColor(EventuColors.text)
            }

            Divider()

            HStack {
                Text("Total pagado")
                    .font(.headline)
                    .fontWeight(.semibold)
                    .foregroundColor(EventuColors.text)

                Spacer()

                Text(order.formattedTotal)
                    .font(.title3)
                    .fontWeight(.bold)
                    .foregroundColor(EventuColors.primary)
            }
        }
        .padding(20)
        .background(EventuColors.cardBackground)
        .cornerRadius(16)
    }

    // MARK: - Tickets Summary

    private var ticketsSummary: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Image(systemName: "ticket.fill")
                    .foregroundColor(EventuColors.primary)
                Text("Tus entradas")
                    .font(.headline)
                    .fontWeight(.semibold)
                    .foregroundColor(EventuColors.text)
            }

            if let tickets = order.tickets, !tickets.isEmpty {
                VStack(spacing: 12) {
                    ForEach(tickets) { ticket in
                        HStack(spacing: 12) {
                            // Ticket icon
                            ZStack {
                                RoundedRectangle(cornerRadius: 8)
                                    .fill(EventuColors.primary.opacity(0.1))
                                    .frame(width: 44, height: 44)

                                Image(systemName: "qrcode")
                                    .font(.title3)
                                    .foregroundColor(EventuColors.primary)
                            }

                            VStack(alignment: .leading, spacing: 4) {
                                Text(ticket.displayName)
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                                    .foregroundColor(EventuColors.text)

                                if let seat = ticket.seatDescription {
                                    Text(seat)
                                        .font(.caption)
                                        .foregroundColor(EventuColors.textSecondary)
                                }
                            }

                            Spacer()

                            // Status
                            HStack(spacing: 4) {
                                Circle()
                                    .fill(EventuColors.success)
                                    .frame(width: 6, height: 6)
                                Text("Lista")
                                    .font(.caption)
                                    .foregroundColor(EventuColors.success)
                            }
                        }
                        .padding(12)
                        .background(EventuColors.surface)
                        .cornerRadius(12)
                    }
                }
            }
        }
        .padding(20)
        .background(EventuColors.cardBackground)
        .cornerRadius(16)
    }

    // MARK: - Next Steps

    private var nextSteps: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Próximos pasos")
                .font(.headline)
                .fontWeight(.semibold)
                .foregroundColor(EventuColors.text)

            VStack(spacing: 12) {
                StepRow(
                    number: 1,
                    title: "Revisa tu email",
                    description: "Te enviamos la confirmación de tu compra"
                )

                StepRow(
                    number: 2,
                    title: "Accede a tus boletas",
                    description: "Ve a 'Mis Boletas' para ver tus entradas"
                )

                StepRow(
                    number: 3,
                    title: "Presenta tu QR",
                    description: "El día del evento, muestra tu QR dinámico para ingresar"
                )
            }
        }
        .padding(20)
        .background(EventuColors.cardBackground)
        .cornerRadius(16)
    }

    // MARK: - Actions

    private var actions: some View {
        VStack(spacing: 12) {
            Button {
                // Navigate to tickets
                onDismiss()
            } label: {
                HStack {
                    Image(systemName: "ticket.fill")
                    Text("Ver mis boletas")
                }
                .font(.headline)
                .fontWeight(.semibold)
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
                .background(EventuColors.gradientPrimary)
                .cornerRadius(12)
            }

            Button {
                onDismiss()
            } label: {
                Text("Volver al inicio")
                    .font(.subheadline)
                    .foregroundColor(EventuColors.primary)
            }
        }
    }
}

// MARK: - Step Row

struct StepRow: View {
    let number: Int
    let title: String
    let description: String

    var body: some View {
        HStack(alignment: .top, spacing: 16) {
            // Number badge
            ZStack {
                Circle()
                    .fill(EventuColors.primary)
                    .frame(width: 28, height: 28)

                Text("\(number)")
                    .font(.caption)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(EventuColors.text)

                Text(description)
                    .font(.caption)
                    .foregroundColor(EventuColors.textSecondary)
            }

            Spacer()
        }
    }
}

// MARK: - Preview

struct OrderConfirmationView_Previews: PreviewProvider {
    static var previews: some View {
        OrderConfirmationView(order: Order.mockOrders[0]) {}
    }
}
