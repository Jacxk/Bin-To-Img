import { BinImage } from '../index';

new BinImage().fromFile({ file: './src/__tests__/code/' })
    .then(buffer => {
        console.log(buffer);
        process.exit();
    })
    .catch(error => {
        console.error(error);
        process.exit(1);
    });