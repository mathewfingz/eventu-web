/**
 * Settlement Index
 * 
 * Exports all settlement functionality
 */

// Core settlement engine
export {
    RATES,
    calculateSettlement,
    createSettlement,
    processSettlementPayout,
    getOrganizerSettlements,
    type EventType,
    type TaxpayerType,
    type City,
    type OrganizerProfile,
    type SettlementBreakdown,
    type Settlement,
} from './engine';

// Audit logging
export {
    logAudit,
    queryAuditLogs,
    getEntityAuditTrail,
    logFinancialTransaction,
    logSecurityEvent,
    exportAuditLogs,
    type AuditEntityType,
    type AuditAction,
    type AuditLogEntry,
    type AuditLogQuery,
} from './audit';

// PDF Reports
export {
    generateSettlementReportPDF,
    generateTaxCertificatePDF,
    pdfToHTML,
    type PDFDocument,
    type PDFSection,
} from './reports';
