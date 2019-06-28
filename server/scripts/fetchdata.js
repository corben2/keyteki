/*eslint no-console:0 */
const commandLineArgs = require('command-line-args');
const monk = require('monk');
const path = require('path');

const CardImport = require('./fetchdata/CardImport.js');
const KeyforgeImageSource = require('./fetchdata/KeyforgeImageSource.js');
const KeyforgeCardSource = require('./fetchdata/KeyforgeCardSource.js');
const NoImageSource = require('./fetchdata/NoImageSource.js');

const optionsDefinition = [
    { name: 'card-source', type: String, defaultValue: 'keyforge' },
    { name: 'image-source', type: String, defaultValue: 'keyforge' },
    { name: 'image-dir', type: String, defaultValue: path.join(__dirname, '..', '..', 'public', 'img', 'cards') },
    { name: 'no-images', type: Boolean, defaultValue: false }
];

function createDataSource(options) {
    switch(options['card-source']) {
        case 'keyforge':
            return new KeyforgeCardSource();
    }

    throw new Error(`Unknown card source '${options['card-source']}'`);
}

function createImageSource(options) {
    if(options['no-images']) {
        return new NoImageSource();
    }

    switch(options['image-source']) {
        case 'none':
            return new NoImageSource();
        case 'keyforge':
            return new KeyforgeImageSource();
    }

    throw new Error(`Unknown image source '${options['image-source']}'`);
}

let options = commandLineArgs(optionsDefinition);

let db = monk('mongodb://127.0.0.1:27017/keyforge');
let dataSource = createDataSource(options);
let imageSource = createImageSource(options);

let cardImport = new CardImport(db, dataSource, imageSource, options['image-dir']);

cardImport.import();

