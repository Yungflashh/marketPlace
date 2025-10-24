// scanLocalhost.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url'; // <-- must import this

// Convert import.meta.url to __filename and __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Adjust this to point to your frontend folder
const projectDir = path.join(__dirname, 'src'); 

// List of file extensions to scan
const allowedExtensions = ['.js', '.ts', '.jsx', '.tsx', '.html', '.css'];

function scanDir(dir) {
    const results = [];
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
            results.push(...scanDir(fullPath));
        } else if (stats.isFile() && allowedExtensions.includes(path.extname(file))) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const lines = content.split('\n');

            lines.forEach((line, index) => {
                if (line.includes('localhost')) {
                    results.push({
                        file: fullPath,
                        lineNumber: index + 1,
                        line: line.trim()
                    });
                }
            });
        }
    });

    return results;
}

const matches = scanDir(projectDir);

if (matches.length === 0) {
    console.log('No occurrences of "localhost" found in frontend code.');
} else {
    console.log(`Found ${matches.length} occurrences of "localhost" in frontend:\n`);
    matches.forEach(match => {
        console.log(`${match.file} [Line ${match.lineNumber}]: ${match.line}`);
    });
}
