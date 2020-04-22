import * as SourceBin from 'sourcebin-wrapper';
import { readFileSync, writeFileSync } from 'fs';
import * as pdf from 'html-pdf';
import * as hljs from 'highlight.js';

const [ b, th ] = process.argv.slice(2);

export function convert(bin: string, theme?: string) {
    return new Promise<Buffer>(async (resolve, reject) => {
        const preset = String(readFileSync(
            `./presets/${ theme || th || "default" }.html`,
            { encoding: "utf8" }
        ));
        const { files } = await SourceBin.get(bin);
        const [ file ] = files;
        const content = file.content
            // .replace(/^ {4}/gm, "  ")
            // .replace(/\r/g, '')
            // .split(/^/gms)
            // .map((val, i, array) => {
            //     return `<line><num>${ i + 1 }</num><span>${
            //         val.replace(/</g, "&lt;")
            //             .replace(/</g, "&gt;")
            //     }</span></line>`
            // })
            // .map((val, i, array) => {
            //     const [ , maxLine ] = array[array.length - 1]
            //         .match(/<num>(\d+)<\/num>/) || [ undefined, '0' ]
            //     const lineNumber = String(i + 1);
            //     const line = lineNumber.padStart(maxLine.length, " ")
            //     return val.replace(
            //         new RegExp(`<num>${ lineNumber }</num>`, "g"),
            //         `<num>${ line }</num>`
            //     )
            // })
            // .join('')
        const html = preset.replace(/{{ contents }}/, hljs.highlight(file.language.aceMode, content).value);

        pdf.create(html, {
            type: "png",
            format: "Letter",
            orientation: "portrait",
            renderDelay: 0,
        }).toBuffer(function (err, buffer) {
            if (err) return reject(err);
            resolve(buffer)
        });
    });
}

convert(b).then(console.log).catch(console.error)