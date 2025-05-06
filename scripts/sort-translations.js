import fs from 'fs';

const files = process.argv.slice(2);

files.forEach((file) => {
    const content = JSON.parse(fs.readFileSync(file, 'utf8'));
    const sorted = Object.keys(content).sort().reduce((acc, key) => {
        acc[key] = content[key];
        return acc;
    }, {});
    fs.writeFileSync(file, JSON.stringify(sorted, null, 2) + '\n');
});
