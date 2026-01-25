/**
 * PDF Report Generator
 * 
 * Generates settlement reports, tax certificates, and audit exports.
 * Uses server-side PDF generation for security.
 */

import { Settlement, SettlementBreakdown, OrganizerProfile, RATES } from './engine';
import { formatPrice } from '@/lib/utils';

// PDF content as JSON structure (to be rendered by PDF library)
export interface PDFDocument {
    type: 'settlement_report' | 'tax_certificate' | 'audit_export';
    title: string;
    subtitle?: string;
    generatedAt: Date;
    sections: PDFSection[];
    footer?: string;
}

export interface PDFSection {
    title?: string;
    type: 'header' | 'table' | 'summary' | 'text' | 'signature';
    content: any;
}

/**
 * Generate Settlement Report PDF structure
 */
export function generateSettlementReportPDF(
    settlement: Settlement,
    organizer: OrganizerProfile,
    eventName: string,
    eventDate: Date
): PDFDocument {
    const b = settlement.breakdown;

    return {
        type: 'settlement_report',
        title: 'INFORME DE LIQUIDACIÓN',
        subtitle: `Evento: ${eventName}`,
        generatedAt: new Date(),
        sections: [
            // Header
            {
                type: 'header',
                content: {
                    logo: '/logo.png',
                    company: 'EVENTU COLOMBIA SAS',
                    nit: '901.XXX.XXX-X',
                    address: 'Calle XX #XX-XX, Bogotá D.C.',
                },
            },

            // Event Info
            {
                title: 'INFORMACIÓN DEL EVENTO',
                type: 'table',
                content: {
                    rows: [
                        ['Nombre del Evento', eventName],
                        ['Fecha del Evento', eventDate.toLocaleDateString('es-CO')],
                        ['Número de Liquidación', settlement.id],
                        ['Fecha de Liquidación', settlement.createdAt.toLocaleDateString('es-CO')],
                        ['Estado', translateStatus(settlement.status)],
                    ],
                },
            },

            // Organizer Info
            {
                title: 'INFORMACIÓN DEL ORGANIZADOR',
                type: 'table',
                content: {
                    rows: [
                        ['Razón Social', organizer.legalName],
                        ['Documento', `${organizer.documentType} ${organizer.documentNumber}`],
                        ['Tipo de Contribuyente', translateTaxpayerType(organizer.taxpayerType)],
                        ['Ciudad', organizer.city],
                    ],
                },
            },

            // Revenue Summary
            {
                title: 'RESUMEN DE INGRESOS',
                type: 'table',
                content: {
                    headers: ['Concepto', 'Cantidad', 'Valor'],
                    rows: [
                        ['Boletas vendidas', b.ticketCount.toLocaleString(), formatPrice(b.grossRevenue)],
                    ],
                    total: ['TOTAL INGRESOS BRUTOS', '', formatPrice(b.grossRevenue)],
                },
            },

            // Deductions
            {
                title: 'DEDUCCIONES',
                type: 'table',
                content: {
                    headers: ['Concepto', 'Tasa', 'Valor'],
                    rows: [
                        ['Comisión Eventu', `${RATES.PLATFORM_COMMISSION * 100}%`, formatPrice(b.platformCommission)],
                        ['IVA sobre comisión', `${RATES.IVA * 100}%`, formatPrice(b.platformCommissionIVA)],
                        ['Procesamiento de pagos', `${RATES.PAYMENT_PROCESSING * 100}%`, formatPrice(b.paymentProcessing)],
                        ['SAYCO (Derechos de autor)', `${(RATES.SAYCO[b.eventType] || 0) * 100}%`, formatPrice(b.sayco)],
                        ['ACINPRO (Derechos conexos)', `${(RATES.ACINPRO[b.eventType] || 0) * 100}%`, formatPrice(b.acinpro)],
                        ['Retención en la fuente', `${(RATES.WITHHOLDING_TAX[b.taxpayerType] || 0) * 100}%`, formatPrice(b.withholdingTax)],
                        ['ICA Municipal', formatICARate(b.city), formatPrice(b.icaTax)],
                        ['IVA recaudado (servicio)', '', formatPrice(b.iva)],
                    ],
                    total: ['TOTAL DEDUCCIONES', '', formatPrice(b.totalDeductions)],
                },
            },

            // Net Payout
            {
                title: 'PAGO NETO AL ORGANIZADOR',
                type: 'summary',
                content: {
                    value: formatPrice(b.netPayout),
                    note: settlement.status === 'PAID'
                        ? `Pagado el ${settlement.paidAt?.toLocaleDateString('es-CO')} - Ref: ${settlement.paymentReference}`
                        : 'Pendiente de pago',
                },
            },

            // Bank Info
            {
                title: 'INFORMACIÓN BANCARIA',
                type: 'table',
                content: {
                    rows: [
                        ['Banco', organizer.bankName],
                        ['Tipo de cuenta', organizer.bankAccountType],
                        ['Número de cuenta', maskAccountNumber(organizer.bankAccountNumber)],
                    ],
                },
            },

            // Legal Text
            {
                type: 'text',
                content: {
                    text: `
Este documento constituye el soporte de la liquidación realizada por EVENTU COLOMBIA SAS 
al organizador del evento. Las retenciones y deducciones se realizan conforme a la normatividad 
tributaria colombiana vigente.

SAYCO: Sociedad de Autores y Compositores de Colombia (Ley 23 de 1982)
ACINPRO: Asociación Colombiana de Intérpretes y Productores Fonográficos
IVA: Impuesto al Valor Agregado (19%)
Retención en la fuente: Decreto 1625 de 2016

Para consultas sobre esta liquidación, contactar a: contabilidad@eventu.co
          `.trim(),
                },
            },

            // Signature
            {
                type: 'signature',
                content: {
                    lines: [
                        { label: 'Generado por', value: 'Sistema Eventu' },
                        { label: 'Fecha', value: new Date().toLocaleDateString('es-CO') },
                        { label: 'Hora', value: new Date().toLocaleTimeString('es-CO') },
                    ],
                    qrCode: `https://eventu.co/verify/settlement/${settlement.id}`,
                },
            },
        ],
        footer: `Documento generado electrónicamente - ID: ${settlement.id}`,
    };
}

/**
 * Generate Tax Certificate PDF structure (Certificado de Retención)
 */
export function generateTaxCertificatePDF(
    settlements: Settlement[],
    organizer: OrganizerProfile,
    year: number
): PDFDocument {
    const totalGross = settlements.reduce((sum, s) => sum + s.breakdown.grossRevenue, 0);
    const totalWithholding = settlements.reduce((sum, s) => sum + s.breakdown.withholdingTax, 0);
    const totalICA = settlements.reduce((sum, s) => sum + s.breakdown.icaTax, 0);

    return {
        type: 'tax_certificate',
        title: 'CERTIFICADO DE RETENCIÓN EN LA FUENTE',
        subtitle: `Año Gravable ${year}`,
        generatedAt: new Date(),
        sections: [
            {
                type: 'header',
                content: {
                    logo: '/logo.png',
                    company: 'EVENTU COLOMBIA SAS',
                    nit: '901.XXX.XXX-X',
                    address: 'Calle XX #XX-XX, Bogotá D.C.',
                },
            },

            {
                type: 'text',
                content: {
                    text: `
EVENTU COLOMBIA SAS, identificada con NIT 901.XXX.XXX-X, certifica que durante el año 
gravable ${year} practicó las siguientes retenciones en la fuente a:
          `.trim(),
                },
            },

            {
                title: 'DATOS DEL RETENIDO',
                type: 'table',
                content: {
                    rows: [
                        ['Nombre/Razón Social', organizer.legalName],
                        ['Documento', `${organizer.documentType} ${organizer.documentNumber}`],
                        ['Dirección', organizer.address],
                        ['Ciudad', organizer.city],
                    ],
                },
            },

            {
                title: 'RESUMEN DE RETENCIONES',
                type: 'table',
                content: {
                    headers: ['Concepto', 'Base', 'Tarifa', 'Valor Retenido'],
                    rows: [
                        ['Retención por servicios', formatPrice(totalGross), translateTaxpayerType(organizer.taxpayerType), formatPrice(totalWithholding)],
                        ['Retención ICA', formatPrice(totalGross), 'Municipal', formatPrice(totalICA)],
                    ],
                    total: ['TOTAL RETENCIONES', '', '', formatPrice(totalWithholding + totalICA)],
                },
            },

            {
                title: 'DETALLE POR EVENTO',
                type: 'table',
                content: {
                    headers: ['Fecha', 'Evento', 'Base', 'Retención', 'ICA'],
                    rows: settlements.map(s => [
                        s.createdAt.toLocaleDateString('es-CO'),
                        s.eventId.substring(0, 8) + '...',
                        formatPrice(s.breakdown.grossRevenue),
                        formatPrice(s.breakdown.withholdingTax),
                        formatPrice(s.breakdown.icaTax),
                    ]),
                },
            },

            {
                type: 'text',
                content: {
                    text: `
Este certificado se expide en cumplimiento del artículo 381 del Estatuto Tributario y 
constituye prueba de las retenciones practicadas.

Expedido en Bogotá D.C. a los ${new Date().getDate()} días del mes de ${getMonthName(new Date().getMonth())} de ${new Date().getFullYear()}.
          `.trim(),
                },
            },

            {
                type: 'signature',
                content: {
                    lines: [
                        { label: 'Firma Autorizada', value: '________________________' },
                        { label: 'Representante Legal', value: 'EVENTU COLOMBIA SAS' },
                    ],
                },
            },
        ],
        footer: `Certificado generado electrónicamente`,
    };
}

/**
 * Convert PDF structure to HTML for rendering
 */
export function pdfToHTML(doc: PDFDocument): string {
    let html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${doc.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica', Arial, sans-serif; font-size: 12px; line-height: 1.5; padding: 40px; }
    .header { display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 2px solid #E53935; padding-bottom: 20px; }
    .title { font-size: 24px; font-weight: bold; color: #212121; margin-bottom: 5px; }
    .subtitle { font-size: 14px; color: #757575; }
    .section { margin-bottom: 25px; }
    .section-title { font-size: 14px; font-weight: bold; color: #E53935; margin-bottom: 10px; text-transform: uppercase; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
    th, td { padding: 8px; text-align: left; border-bottom: 1px solid #E0E0E0; }
    th { background: #F5F5F5; font-weight: bold; }
    .total-row { font-weight: bold; background: #FFF3F3; }
    .summary-box { background: #E53935; color: white; padding: 20px; text-align: center; margin: 20px 0; }
    .summary-value { font-size: 28px; font-weight: bold; }
    .summary-note { font-size: 12px; opacity: 0.9; margin-top: 5px; }
    .text-section { color: #757575; font-size: 11px; margin: 15px 0; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #E0E0E0; text-align: center; color: #9E9E9E; font-size: 10px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="title">${doc.title}</div>
  ${doc.subtitle ? `<div class="subtitle">${doc.subtitle}</div>` : ''}
  `;

    for (const section of doc.sections) {
        html += '<div class="section">';

        if (section.title) {
            html += `<div class="section-title">${section.title}</div>`;
        }

        switch (section.type) {
            case 'table':
                html += '<table>';
                if (section.content.headers) {
                    html += '<thead><tr>';
                    section.content.headers.forEach((h: string) => html += `<th>${h}</th>`);
                    html += '</tr></thead>';
                }
                html += '<tbody>';
                section.content.rows.forEach((row: string[]) => {
                    html += '<tr>';
                    row.forEach((cell: string) => html += `<td>${cell}</td>`);
                    html += '</tr>';
                });
                if (section.content.total) {
                    html += '<tr class="total-row">';
                    section.content.total.forEach((cell: string) => html += `<td>${cell}</td>`);
                    html += '</tr>';
                }
                html += '</tbody></table>';
                break;

            case 'summary':
                html += `
          <div class="summary-box">
            <div class="summary-value">${section.content.value}</div>
            <div class="summary-note">${section.content.note}</div>
          </div>
        `;
                break;

            case 'text':
                html += `<div class="text-section">${section.content.text.replace(/\n/g, '<br/>')}</div>`;
                break;
        }

        html += '</div>';
    }

    html += `
  <div class="footer">${doc.footer || ''}</div>
</body>
</html>
  `;

    return html;
}

// Helper functions
function translateStatus(status: string): string {
    const map: Record<string, string> = {
        'PENDING': 'Pendiente',
        'PROCESSING': 'En proceso',
        'PAID': 'Pagado',
        'ON_HOLD': 'Retenido',
        'DISPUTED': 'En disputa',
    };
    return map[status] || status;
}

function translateTaxpayerType(type: string): string {
    const map: Record<string, string> = {
        'PERSONA_NATURAL': 'Persona Natural (11%)',
        'PERSONA_JURIDICA': 'Persona Jurídica (4%)',
        'GRAN_CONTRIBUYENTE': 'Gran Contribuyente (2.5%)',
        'NO_APLICA': 'No Aplica',
    };
    return map[type] || type;
}

function formatICARate(city: string): string {
    const rate = RATES.ICA[city as keyof typeof RATES.ICA] || RATES.ICA.DEFAULT;
    return `${(rate * 1000).toFixed(2)}‰`;
}

function maskAccountNumber(account: string): string {
    return '****' + account.slice(-4);
}

function getMonthName(month: number): string {
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return months[month];
}
