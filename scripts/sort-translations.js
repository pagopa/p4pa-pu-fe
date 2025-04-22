import fs from 'fs';
import path from 'path';

const sortObject = (obj) => {
    if (Array.isArray(obj)) return obj.map(sortObject);
    if (obj && typeof obj === "object") {
        return Object.keys(obj).sort().reduce((acc, key) => {
            acc[key] = sortObject(obj[key]);
            return acc;
        }, {});
    }
    return obj;
};

const jsonDir = path.join(process.cwd(), "src/translations");

const sortJsonFiles = (dir) => {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            sortJsonFiles(fullPath);
        } else if (file.endsWith(".json")) {
            const content = fs.readFileSync(fullPath, "utf8");
            const json = JSON.parse(content);
            const sorted = sortObject(json);
            fs.writeFileSync(fullPath, JSON.stringify(sorted, null, 2) + "\n");
        }
    });
};

sortJsonFiles(jsonDir);
