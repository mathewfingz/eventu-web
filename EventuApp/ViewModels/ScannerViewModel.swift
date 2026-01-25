import Foundation
import AVFoundation
import SwiftUI

@MainActor
class ScannerViewModel: NSObject, ObservableObject {
    // MARK: - Published Properties
    @Published var isScanning = false
    @Published var isFlashlightOn = false
    @Published var showResult = false
    @Published var showManualEntry = false
    @Published var cameraPermissionGranted = false
    @Published var errorMessage: String?

    // Stats
    @Published var validCount = 0
    @Published var invalidCount = 0

    // Camera
    var captureSession: AVCaptureSession?
    private var previewLayer: AVCaptureVideoPreviewLayer?

    private let validationService = ValidationService.shared

    override init() {
        super.init()
        checkCameraPermission()
    }

    // MARK: - Camera Permission

    func checkCameraPermission() {
        switch AVCaptureDevice.authorizationStatus(for: .video) {
        case .authorized:
            cameraPermissionGranted = true
        case .notDetermined:
            AVCaptureDevice.requestAccess(for: .video) { [weak self] granted in
                Task { @MainActor in
                    self?.cameraPermissionGranted = granted
                }
            }
        case .denied, .restricted:
            cameraPermissionGranted = false
        @unknown default:
            cameraPermissionGranted = false
        }
    }

    // MARK: - Scanning Control

    func toggleScanning() {
        if isScanning {
            stopScanning()
        } else {
            startScanning()
        }
    }

    func startScanning() {
        guard cameraPermissionGranted else {
            errorMessage = "Se requiere permiso de camara"
            return
        }
        isScanning = true
        captureSession?.startRunning()
    }

    func stopScanning() {
        isScanning = false
        captureSession?.stopRunning()
    }

    // MARK: - Flashlight

    func toggleFlashlight() {
        guard let device = AVCaptureDevice.default(for: .video),
              device.hasTorch else { return }

        do {
            try device.lockForConfiguration()
            device.torchMode = isFlashlightOn ? .off : .on
            isFlashlightOn.toggle()
            device.unlockForConfiguration()
        } catch {
            print("Flashlight error: \(error)")
        }
    }

    // MARK: - QR Processing

    func processScannedCode(_ code: String) {
        guard isScanning else { return }

        // Stop scanning while processing
        stopScanning()

        Task {
            let result = await validationService.validateTicket(payload: code)
            handleValidationResult(result)
        }
    }

    func processManualCode(_ code: String) {
        // For manual entry, we need to construct a valid payload
        // This assumes the manual code is the full JSON payload
        Task {
            let result = await validationService.validateTicket(payload: code)
            handleValidationResult(result)
        }
    }

    private func handleValidationResult(_ result: ValidationResult) {
        if result.isValid {
            validCount += 1
        } else {
            invalidCount += 1
        }

        showResult = true

        // Auto-dismiss and resume scanning after delay
        Task {
            try? await Task.sleep(nanoseconds: UInt64(AppConstants.UI.validationResultDisplaySeconds * 1_000_000_000))
            dismissResult()
        }
    }

    func dismissResult() {
        showResult = false
        // Resume scanning
        startScanning()
    }

    // MARK: - Stats Reset

    func resetStats() {
        validCount = 0
        invalidCount = 0
    }
}

// MARK: - AVCaptureMetadataOutputObjectsDelegate

extension ScannerViewModel: AVCaptureMetadataOutputObjectsDelegate {
    nonisolated func metadataOutput(_ output: AVCaptureMetadataOutput, didOutput metadataObjects: [AVMetadataObject], from connection: AVCaptureConnection) {
        guard let metadataObject = metadataObjects.first as? AVMetadataMachineReadableCodeObject,
              metadataObject.type == .qr,
              let stringValue = metadataObject.stringValue else {
            return
        }

        // Process on main thread
        Task { @MainActor in
            self.processScannedCode(stringValue)
        }
    }
}
