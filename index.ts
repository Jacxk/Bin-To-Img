import * as SourceBin from 'sourcebin-wrapper';
import { readFileSync } from 'fs';
import * as pdf from 'html-pdf';
import { highlight } from 'highlight.js';

const [ b, th ] = process.argv.slice(2);

export function convert(bin: string, theme?: string) {
    return new Promise<Buffer>(async (resolve, reject) => {
        const preset = String(readFileSync(
            `./presets/${ theme || th || "default" }.html`,
            { encoding: "utf8" }
        ));
		
        const { files } = await SourceBin.get(bin);
        const [ file ] = files;
        const content = file.content;
		
		const parsed = highlight(file.language.aceMode, content).value;
        const html = preset.replace(/{{ contents }}/, parsed);

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