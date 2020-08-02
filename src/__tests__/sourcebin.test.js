import { BinImage } from '../index';

new BinImage().fromSourceBin({ url: '' })
    .then(buffer => {
        console.log(buffer);
        process.exit();
    })
    .catch(error => {
        console.error(error);
        process.exit(1);
    });