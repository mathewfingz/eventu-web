import Foundation
import Combine
import CoreGraphics

@MainActor
class TicketDetailViewModel: ObservableObject {
    @Published var ticket: ClientTicket?
    @Published var qrImage: CGImage?
    @Published var currentCode: String = ""
    @Published var secondsRemaining: Double = 15
    @Published var progress: Double = 0
    @Published var isOfflineAvailable: Bool = false
    @Published var offlineExpiration: Date?
    @Published var isDownloading: Bool = false
    @Published var errorMessage: String?

    private let ticketService = TicketService.shared
    private let safeTixService = SafeTixService.shared
    private var timer: Timer?
    private var updateTimer: Timer?

    // MARK: - Initialize

    func loadTicket(_ ticket: ClientTicket) {
        self.ticket = ticket
        self.isOfflineAvailable = ticketService.isTicketAvailableOffline(ticket.id)
        self.offlineExpiration = ticketService.getOfflineCodesExpiration(ticket.id)

        startQRUpdates()
    }

    // MARK: - QR Updates

    private func startQRUpdates() {
        updateQR()

        // Update every 100ms for smooth countdown
        updateTimer = Timer.scheduledTimer(withTimeInterval: 0.1, repeats: true) { [weak self] _ in
            Task { @MainActor in
                self?.updateProgress()
            }
        }

        // Check for code change every second
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { [weak self] _ in
            Task { @MainActor in
                self?.checkCodeChange()
            }
        }
    }

    private func updateProgress() {
        secondsRemaining = ticketService.secondsUntilNextCode()
        progress = ticketService.codeProgress()
    }

    private func checkCodeChange() {
        guard let ticket = ticket, let secret = ticket.safetixSecret else { return }

        let newCode = safeTixService.generateTOTP(secret: secret)
        if newCode != currentCode {
            currentCode = newCode
            updateQR()
        }
    }

    private func updateQR() {
        guard let ticket = ticket else { return }

        // Generate new QR
        qrImage = ticketService.generateQRImage(for: ticket, size: 280)

        // Update current code
        if let secret = ticket.safetixSecret {
            currentCode = safeTixService.generateTOTP(secret: secret)
        }
    }

    // MARK: - Offline Mode

    func downloadForOffline() async {
        guard let ticket = ticket else { return }

        isDownloading = true
        errorMessage = nil

        do {
            try await ticketService.downloadTicketForOffline(ticket: ticket)
            isOfflineAvailable = true
            offlineExpiration = ticketService.getOfflineCodesExpiration(ticket.id)
        } catch {
            errorMessage = error.localizedDescription
        }

        isDownloading = false
    }

    func removeOfflineData() {
        guard let ticket = ticket else { return }

        ticketService.removeOfflineTicket(ticket.id)
        isOfflineAvailable = false
        offlineExpiration = nil
    }

    // MARK: - Computed Properties

    var formattedSecondsRemaining: String {
        String(format: "%.0f", secondsRemaining)
    }

    var formattedCode: String {
        // Format as XXXX-XXXX
        guard currentCode.count == 8 else { return currentCode }
        let index = currentCode.index(currentCode.startIndex, offsetBy: 4)
        return "\(currentCode[..<index])-\(currentCode[index...])"
    }

    var offlineExpirationFormatted: String? {
        guard let expiration = offlineExpiration else { return nil }

        let formatter = DateFormatter()
        formatter.dateFormat = "d MMM, h:mm a"
        formatter.locale = Locale(identifier: "es_CO")
        return formatter.string(from: expiration)
    }

    // MARK: - Cleanup

    func stopUpdates() {
        timer?.invalidate()
        timer = nil
        updateTimer?.invalidate()
        updateTimer = nil
    }

    deinit {
        timer?.invalidate()
        updateTimer?.invalidate()
    }
}
