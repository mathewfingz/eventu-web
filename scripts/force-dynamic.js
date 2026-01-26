
const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            if (file === 'route.ts') {
                arrayOfFiles.push(path.join(dirPath, "/", file));
            }
        }
    });

    return arrayOfFiles;
}

const apiDir = path.join(process.cwd(), 'src/app/api');
const routes = getAllFiles(apiDir);

routes.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes('export const dynamic')) {
        // Insert after imports
        const lines = content.split('\n');
        let lastImportIndex = -1;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('import ')) {
                lastImportIndex = i;
            }
        }

        // Insert after the last import, or at the top if no imports
        if (lastImportIndex !== -1) {
            lines.splice(lastImportIndex + 1, 0, '', "export const dynamic = 'force-dynamic';");
        } else {
            lines.unshift("export const dynamic = 'force-dynamic';", '');
        }

        fs.writeFileSync(filePath, lines.join('\n'));
        console.log(`Updated ${filePath}`);
    } else {
        console.log(`Skipped ${filePath} (already exists)`);
    }
});
