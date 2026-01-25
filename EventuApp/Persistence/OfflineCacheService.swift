import Foundation
import SQLite3

actor OfflineCacheService {
    static let shared = OfflineCacheService()

    private var db: OpaquePointer?
    private let dbPath: String

    private init() {
        let documentsPath = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        dbPath = documentsPath.appendingPathComponent(AppConstants.Database.fileName).path
        openDatabase()
        createTables()
    }

    // MARK: - Database Setup

    private func openDatabase() {
        if sqlite3_open(dbPath, &db) != SQLITE_OK {
            print("Error opening database at \(dbPath)")
        }
    }

    private func createTables() {
        let ticketsTable = """
        CREATE TABLE IF NOT EXISTS tickets (
            id TEXT PRIMARY KEY,
            event_id TEXT NOT NULL,
            ticket_type_id TEXT NOT NULL,
            ticket_type_name TEXT NOT NULL,
            section TEXT,
            seat_row TEXT,
            seat_number TEXT,
            safetix_secret TEXT NOT NULL,
            status TEXT NOT NULL,
            buyer_name TEXT,
            buyer_email TEXT,
            downloaded_at INTEGER NOT NULL,
            expires_at INTEGER NOT NULL
        );
        """

        let indexSQL = """
        CREATE INDEX IF NOT EXISTS idx_tickets_event ON tickets(event_id);
        CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
        """

        let metadataTable = """
        CREATE TABLE IF NOT EXISTS cache_metadata (
            event_id TEXT PRIMARY KEY,
            event_name TEXT NOT NULL,
            downloaded_at INTEGER NOT NULL,
            ticket_count INTEGER NOT NULL,
            expires_at INTEGER NOT NULL,
            last_sync_at INTEGER,
            processed_count INTEGER DEFAULT 0
        );
        """

        executeSQL(ticketsTable)
        executeSQL(indexSQL)
        executeSQL(metadataTable)
    }

    private func executeSQL(_ sql: String) {
        var errorMessage: UnsafeMutablePointer<CChar>?
        if sqlite3_exec(db, sql, nil, nil, &errorMessage) != SQLITE_OK {
            if let error = errorMessage {
                print("SQL Error: \(String(cString: error))")
                sqlite3_free(error)
            }
        }
    }

    // MARK: - Download Tickets for Event

    func downloadTicketsForEvent(_ eventId: String, eventName: String) async throws -> Int {
        // 1. Fetch tickets from API
        let tickets = try await fetchTicketsFromAPI(eventId: eventId)

        // 2. Clear existing tickets for this event
        clearTickets(forEvent: eventId)

        // 3. Insert new tickets
        for ticket in tickets {
            saveTicket(ticket)
        }

        // 4. Update metadata
        let metadata = OfflineCacheMetadata(
            eventId: eventId,
            eventName: eventName,
            ticketCount: tickets.count
        )
        saveMetadata(metadata)

        return tickets.count
    }

    private func fetchTicketsFromAPI(eventId: String) async throws -> [OfflineTicket] {
        let urlString = AppConstants.baseURL + AppConstants.Endpoints.coordinatorTicketsOffline.replacingOccurrences(of: "{eventId}", with: eventId)
        guard let url = URL(string: urlString) else {
            throw OfflineCacheError.invalidURL
        }

        let session = try await SupabaseManager.shared.client.auth.session
        var request = URLRequest(url: url)
        request.setValue("Bearer \(session.accessToken)", forHTTPHeaderField: "Authorization")

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw OfflineCacheError.serverError
        }

        struct APIResponse: Codable {
            let tickets: [APITicket]
            let downloadedAt: Int64
            let expiresAt: Int64

            struct APITicket: Codable {
                let id: String
                let ticketTypeId: String
                let ticketTypeName: String
                let section: String?
                let seatRow: String?
                let seatNumber: String?
                let safetixSecret: String
                let status: String
                let buyerName: String?
                let buyerEmail: String?
            }
        }

        let apiResponse = try JSONDecoder().decode(APIResponse.self, from: data)
        let downloadedAt = Date(timeIntervalSince1970: Double(apiResponse.downloadedAt) / 1000)
        let expiresAt = Date(timeIntervalSince1970: Double(apiResponse.expiresAt) / 1000)

        return apiResponse.tickets.map { ticket in
            OfflineTicket(
                id: ticket.id,
                eventId: eventId,
                ticketTypeId: ticket.ticketTypeId,
                ticketTypeName: ticket.ticketTypeName,
                section: ticket.section,
                seatRow: ticket.seatRow,
                seatNumber: ticket.seatNumber,
                safetixSecret: ticket.safetixSecret,
                status: TicketStatus(rawValue: ticket.status) ?? .active,
                buyerName: ticket.buyerName,
                buyerEmail: ticket.buyerEmail,
                downloadedAt: downloadedAt,
                expiresAt: expiresAt
            )
        }
    }

    // MARK: - Ticket Operations

    func saveTicket(_ ticket: OfflineTicket) {
        let sql = """
        INSERT OR REPLACE INTO tickets
        (id, event_id, ticket_type_id, ticket_type_name, section, seat_row, seat_number,
         safetix_secret, status, buyer_name, buyer_email, downloaded_at, expires_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """

        var stmt: OpaquePointer?
        guard sqlite3_prepare_v2(db, sql, -1, &stmt, nil) == SQLITE_OK else { return }

        sqlite3_bind_text(stmt, 1, ticket.id, -1, unsafeBitCast(-1, to: sqlite3_destructor_type.self))
        sqlite3_bind_text(stmt, 2, ticket.eventId, -1, unsafeBitCast(-1, to: sqlite3_destructor_type.self))
        sqlite3_bind_text(stmt, 3, ticket.ticketTypeId, -1, unsafeBitCast(-1, to: sqlite3_destructor_type.self))
        sqlite3_bind_text(stmt, 4, ticket.ticketTypeName, -1, unsafeBitCast(-1, to: sqlite3_destructor_type.self))
        bindOptionalText(stmt, 5, ticket.section)
        bindOptionalText(stmt, 6, ticket.seatRow)
        bindOptionalText(stmt, 7, ticket.seatNumber)
        sqlite3_bind_text(stmt, 8, ticket.safetixSecret, -1, unsafeBitCast(-1, to: sqlite3_destructor_type.self))
        sqlite3_bind_text(stmt, 9, ticket.status.rawValue, -1, unsafeBitCast(-1, to: sqlite3_destructor_type.self))
        bindOptionalText(stmt, 10, ticket.buyerName)
        bindOptionalText(stmt, 11, ticket.buyerEmail)
        sqlite3_bind_int64(stmt, 12, Int64(ticket.downloadedAt.timeIntervalSince1970))
        sqlite3_bind_int64(stmt, 13, Int64(ticket.expiresAt.timeIntervalSince1970))

        sqlite3_step(stmt)
        sqlite3_finalize(stmt)
    }

    private func bindOptionalText(_ stmt: OpaquePointer?, _ index: Int32, _ value: String?) {
        if let value = value {
            sqlite3_bind_text(stmt, index, value, -1, unsafeBitCast(-1, to: sqlite3_destructor_type.self))
        } else {
            sqlite3_bind_null(stmt, index)
        }
    }

    func getTicket(id: String) -> OfflineTicket? {
        let sql = "SELECT * FROM tickets WHERE id = ?"
        var stmt: OpaquePointer?

        guard sqlite3_prepare_v2(db, sql, -1, &stmt, nil) == SQLITE_OK else {
            return nil
        }

        sqlite3_bind_text(stmt, 1, id, -1, unsafeBitCast(-1, to: sqlite3_destructor_type.self))

        defer { sqlite3_finalize(stmt) }

        guard sqlite3_step(stmt) == SQLITE_ROW else {
            return nil
        }

        return ticketFromStatement(stmt)
    }

    func markAsUsed(ticketId: String) {
        let sql = "UPDATE tickets SET status = 'USED' WHERE id = ?"
        var stmt: OpaquePointer?
        guard sqlite3_prepare_v2(db, sql, -1, &stmt, nil) == SQLITE_OK else { return }
        sqlite3_bind_text(stmt, 1, ticketId, -1, unsafeBitCast(-1, to: sqlite3_destructor_type.self))
        sqlite3_step(stmt)
        sqlite3_finalize(stmt)

        // Update processed count in metadata
        incrementProcessedCount(forTicket: ticketId)
    }

    private func incrementProcessedCount(forTicket ticketId: String) {
        let sql = """
        UPDATE cache_metadata SET processed_count = processed_count + 1
        WHERE event_id = (SELECT event_id FROM tickets WHERE id = ?)
        """
        var stmt: OpaquePointer?
        guard sqlite3_prepare_v2(db, sql, -1, &stmt, nil) == SQLITE_OK else { return }
        sqlite3_bind_text(stmt, 1, ticketId, -1, unsafeBitCast(-1, to: sqlite3_destructor_type.self))
        sqlite3_step(stmt)
        sqlite3_finalize(stmt)
    }

    func getTicketCount(forEvent eventId: String) -> Int {
        let sql = "SELECT COUNT(*) FROM tickets WHERE event_id = ?"
        var stmt: OpaquePointer?
        guard sqlite3_prepare_v2(db, sql, -1, &stmt, nil) == SQLITE_OK else { return 0 }
        sqlite3_bind_text(stmt, 1, eventId, -1, unsafeBitCast(-1, to: sqlite3_destructor_type.self))

        if sqlite3_step(stmt) == SQLITE_ROW {
            let count = sqlite3_column_int(stmt, 0)
            sqlite3_finalize(stmt)
            return Int(count)
        }

        sqlite3_finalize(stmt)
        return 0
    }

    func clearTickets(forEvent eventId: String) {
        let sql = "DELETE FROM tickets WHERE event_id = ?"
        var stmt: OpaquePointer?
        guard sqlite3_prepare_v2(db, sql, -1, &stmt, nil) == SQLITE_OK else { return }
        sqlite3_bind_text(stmt, 1, eventId, -1, unsafeBitCast(-1, to: sqlite3_destructor_type.self))
        sqlite3_step(stmt)
        sqlite3_finalize(stmt)
    }

    private func ticketFromStatement(_ stmt: OpaquePointer?) -> OfflineTicket? {
        guard let stmt = stmt else { return nil }

        return OfflineTicket(
            id: String(cString: sqlite3_column_text(stmt, 0)),
            eventId: String(cString: sqlite3_column_text(stmt, 1)),
            ticketTypeId: String(cString: sqlite3_column_text(stmt, 2)),
            ticketTypeName: String(cString: sqlite3_column_text(stmt, 3)),
            section: sqlite3_column_text(stmt, 4).map { String(cString: $0) },
            seatRow: sqlite3_column_text(stmt, 5).map { String(cString: $0) },
            seatNumber: sqlite3_column_text(stmt, 6).map { String(cString: $0) },
            safetixSecret: String(cString: sqlite3_column_text(stmt, 7)),
            status: TicketStatus(rawValue: String(cString: sqlite3_column_text(stmt, 8))) ?? .active,
            buyerName: sqlite3_column_text(stmt, 9).map { String(cString: $0) },
            buyerEmail: sqlite3_column_text(stmt, 10).map { String(cString: $0) },
            downloadedAt: Date(timeIntervalSince1970: Double(sqlite3_column_int64(stmt, 11))),
            expiresAt: Date(timeIntervalSince1970: Double(sqlite3_column_int64(stmt, 12)))
        )
    }

    // MARK: - Metadata Operations

    func saveMetadata(_ metadata: OfflineCacheMetadata) {
        let sql = """
        INSERT OR REPLACE INTO cache_metadata
        (event_id, event_name, downloaded_at, ticket_count, expires_at, last_sync_at, processed_count)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """

        var stmt: OpaquePointer?
        guard sqlite3_prepare_v2(db, sql, -1, &stmt, nil) == SQLITE_OK else { return }

        sqlite3_bind_text(stmt, 1, metadata.eventId, -1, unsafeBitCast(-1, to: sqlite3_destructor_type.self))
        sqlite3_bind_text(stmt, 2, metadata.eventName, -1, unsafeBitCast(-1, to: sqlite3_destructor_type.self))
        sqlite3_bind_int64(stmt, 3, Int64(metadata.downloadedAt.timeIntervalSince1970))
        sqlite3_bind_int(stmt, 4, Int32(metadata.ticketCount))
        sqlite3_bind_int64(stmt, 5, Int64(metadata.expiresAt.timeIntervalSince1970))
        if let lastSync = metadata.lastSyncAt {
            sqlite3_bind_int64(stmt, 6, Int64(lastSync.timeIntervalSince1970))
        } else {
            sqlite3_bind_null(stmt, 6)
        }
        sqlite3_bind_int(stmt, 7, Int32(metadata.processedCount))

        sqlite3_step(stmt)
        sqlite3_finalize(stmt)
    }

    func getMetadata(forEvent eventId: String) -> OfflineCacheMetadata? {
        let sql = "SELECT * FROM cache_metadata WHERE event_id = ?"
        var stmt: OpaquePointer?

        guard sqlite3_prepare_v2(db, sql, -1, &stmt, nil) == SQLITE_OK else {
            return nil
        }

        sqlite3_bind_text(stmt, 1, eventId, -1, unsafeBitCast(-1, to: sqlite3_destructor_type.self))

        defer { sqlite3_finalize(stmt) }

        guard sqlite3_step(stmt) == SQLITE_ROW else {
            return nil
        }

        let lastSyncValue = sqlite3_column_int64(stmt, 5)

        return OfflineCacheMetadata(
            eventId: String(cString: sqlite3_column_text(stmt, 0)),
            eventName: String(cString: sqlite3_column_text(stmt, 1)),
            downloadedAt: Date(timeIntervalSince1970: Double(sqlite3_column_int64(stmt, 2))),
            ticketCount: Int(sqlite3_column_int(stmt, 3)),
            expiresAt: Date(timeIntervalSince1970: Double(sqlite3_column_int64(stmt, 4))),
            lastSyncAt: lastSyncValue > 0 ? Date(timeIntervalSince1970: Double(lastSyncValue)) : nil,
            processedCount: Int(sqlite3_column_int(stmt, 6))
        )
    }

    func hasValidCache(forEvent eventId: String) -> Bool {
        guard let metadata = getMetadata(forEvent: eventId) else { return false }
        return !metadata.isExpired
    }

    // MARK: - Clear All

    func clearAllCache() {
        executeSQL("DELETE FROM tickets")
        executeSQL("DELETE FROM cache_metadata")
    }
}

// MARK: - Errors

enum OfflineCacheError: Error, LocalizedError {
    case invalidURL
    case serverError
    case downloadFailed
    case databaseError

    var errorDescription: String? {
        switch self {
        case .invalidURL: return "URL invalida"
        case .serverError: return "Error del servidor"
        case .downloadFailed: return "Fallo la descarga"
        case .databaseError: return "Error de base de datos"
        }
    }
}
