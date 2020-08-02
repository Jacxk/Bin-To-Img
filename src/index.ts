import * as SourceBin from 'sourcebin-wrapper';
import { create as createImage } from 'html-pdf';

import { highlight } from 'highlight.js';
import { readFileSync, readdirSync } from 'fs';

export class BinImage {

    private readonly lines: boolean;

    constructor(lines = true) {
        this.lines = lines;
    }

    public async fromSourceBin({ url, theme, saveTo }: BinImageOptions) {
        if (!url) throw 'No URL provided.';

        const { files } = await SourceBin.get(url);
        const imageOptions: BinImageOptions[] = [];

        for (const file of files) {
            // @ts-ignore
            const { content, language: { aceMode: language } } = file;
            imageOptions.push({ content, language, theme, saveTo });
        }

        return await this.create(imageOptions);
    }

    public async fromFile(options: BinImageOptions): Promise<Buffer | Buffer[] | object | object[]> {
        // @ts-ignore
        const fileName: string = options.file, files = isDir(fileName);
        const [ , language ] = fileName.split('.');

        if (files) {
            const imageOptions: BinImageOptions[] = [];
            for (const file of files) {
                const option: BinImageOptions = {};
                option.content = readFileSync(`${ fileName }/${ file }`, 'utf8');

                const [ f, ext ] = file.split('.');

                option.language = ext;
                if (options.saveTo) option.saveTo = `./out/${ f }.png`;
                imageOptions.push(option);
            }

            return await this.create(imageOptions);
        }

        options.content = readFileSync(fileName, 'utf8');
        options.language = language || 'plaintext';

        return await this.create(options);
    }

    public async create(options: BinImageOptions | BinImageOptions[]): Promise<Buffer | object | Buffer[] | object[]> {
        if (typeof options === 'object' && Array.isArray(options)) {
            const images = [];
            for (const option of options) {
                const {
                    language = 'plaintext',
                    theme = 'default',
                    content,
                    saveTo,
                    file,
                    url
                } = option;

                if (!content && !file && !url) throw 'No content provided.';
                if (!language) throw 'No language provided.';

                const preset = String(readFileSync(
                    `./src/presets/${ theme }.html`,
                    { encoding: 'utf8' }
                ));

                const { value: contents } = highlight(language, content);
                const html = parseContents(contents, preset, this.lines);
                const image = await makeImage(html, saveTo);

                images.push(image);
            }
            return images;
        } else {
            const {
                language = 'plaintext',
                theme = 'default',
                content,
                saveTo,
                file,
                url
            } = options;


            if (!content && !file && !url) throw 'No content provided.';
            if (!language) throw 'No language provided.';

            const preset = String(readFileSync(
                `./src/presets/${ theme }.html`,
                { encoding: 'utf8' }
            ));

            const { value: contents } = highlight(language, content);
            const html = parseContents(contents, preset, this.lines);
            return await makeImage(html, saveTo);
        }
    }

}

function makeImage(content: string, path: string | undefined): Promise<Buffer | object> {
    return new Promise((resolve, reject) => {
        const options = {
            type: 'png',
            format: 'Letter',
            orientation: 'portrait',
            renderDelay: 0,
        };
        if (path) {
            return createImage(content, options)
                .toFile(path, function (err: any, filePath: object) {
                    if (err) return reject(err);
                    resolve(filePath);
                });
        }

        createImage(content, options)
            .toBuffer(function (err: any, buffer: Buffer) {
                if (err) return reject(err);
                resolve(buffer);
            });
    });
}

function parseContents(contents: string, preset: string, lines = true): string {
    if (!contents) throw 'No content to parse.';
    const html = contents
        .replace(/\r/g, '')
        .split(/^/gms)
        .map((content, i, array) => {
            if (!lines) {
                return content;
            }
            const { length } = String(array.length);
            const lineNumber = String(i + 1).padStart(length, ' ');
            return `<line><num>${ lineNumber }</num><cnt>${ content }</cnt></line>`;
        })
        .join('');
    return preset.replace(/{{ contents }}/, html);
}

function isDir(path: string) {
    try {
        return readdirSync(path);
    } catch (e) {
        return undefined;
    }
}

interface BinImageOptions {
    language?: string;
    content?: string;
    saveTo?: string;
    theme?: string;
    file?: string;
    url?: string;
}

SourceBin.create([
    new SourceBin.BinFile({ content: 'export const test = "This is some test file."', languageId: 'js' }),
    new SourceBin.BinFile({ content: '{\n  "test": "This is a test file."\n}', languageId: 'json' }),
]).then(console.log)
    .catch(console.log);
