import * as SourceBin from 'sourcebin-wrapper';
import * as pdf from 'html-pdf';

import { highlight } from 'highlight.js';
import { readFileSync } from 'fs';

const [
    b, th
] = process.argv.slice(2);

export function convert(bin: string, theme?: string) {
    return new Promise<Buffer>(async (resolve, reject) => {
        const preset = String(readFileSync(
            `./src/presets/${ theme || th || 'default' }.html`,
            { encoding: 'utf8' }
        ));

        SourceBin.get(bin).then(({ files: [ file ] }) => {
            const { content, language: { aceMode } } = file;

            const { value: contents } = highlight(aceMode, content);
            const html = parseContents(contents, preset);

            pdf.create(html, {
                type: 'png',
                format: 'Letter',
                orientation: 'portrait',
                renderDelay: 0,
            }).toBuffer(function (err, buffer) {
                if (err) return reject(err);
                resolve(buffer);
            });
        }).catch(reject);
    });
}

function parseContents(contents: string, preset: string): string {
    const html = contents
        .replace(/\r/g, '')
        .split(/^/gms)
        .map((content, i, array) => {
            const { length } = String(array.length);
            const lineNumber = String(i + 1).padStart(length, ' ');
            return `<line><num>${ lineNumber }</num><cnt>${ content }</cnt></line>`;
        })
        .join('');
    return preset.replace(/{{ contents }}/, html);
}

if (b) {
    convert(b)
        .then(buffer => {
            console.log(buffer);
            process.exit();
        })
        .catch(error => {
            console.error(error);
            process.exit(1);
        });
}
