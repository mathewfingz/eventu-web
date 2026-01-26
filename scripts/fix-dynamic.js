
const fs = require('fs');
const path = require('path');

const filesToFix = [
    'src/app/api/audit/route.ts',
    'src/app/api/presale/validate/route.ts',
    'src/app/api/settlements/[settlementId]/route.ts',
    'src/app/api/settlements/route.ts',
    'src/app/api/settlements/tax-certificate/route.ts',
    'src/app/api/tickets/[ticketId]/qr/route.ts'
];

filesToFix.forEach(relPath => {
    const filePath = path.join(process.cwd(), relPath);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');

        // Check if the line exists inside an import block
        if (content.includes("export const dynamic = 'force-dynamic';")) {
            // Simple heuristic: if it's indented or surrounded by other imports
            // But better: removing it and re-inserting it properly.

            // Remove the line
            const lines = content.split('\n');
            const filteredLines = lines.filter(l => !l.includes("export const dynamic = 'force-dynamic';"));
            content = filteredLines.join('\n');

            // Re-insert properly (after all imports)
            // Find the index of the last line starting with 'import' or '}' (end of import)
            // or just put it after the last import statement

            // We will put it blank line + export const...

            // Find the last "from " occurrence as a heuristic for end of imports?
            // Or look for first "export function" or "export async function"

            let insertIndex = -1;
            const newLines = content.split('\n');

            // Find first export that is NOT the dynamic one (it's gone now)
            for (let i = 0; i < newLines.length; i++) {
                if (newLines[i].includes('export async function') || newLines[i].includes('export function')) {
                    insertIndex = i;
                    break;
                }
            }

            if (insertIndex !== -1) {
                newLines.splice(insertIndex, 0, "export const dynamic = 'force-dynamic';", '');
                fs.writeFileSync(filePath, newLines.join('\n'));
                console.log(`Fixed ${filePath}`);
            } else {
                console.log(`Could not find insertion point for ${filePath}`);
            }
        }
    } else {
        console.log(`File not found: ${filePath}`);
    }
});
