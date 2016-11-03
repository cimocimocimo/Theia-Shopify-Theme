'use strict';

import Image from './Image.js';

export default class Product {
    constructor(data){

        console.log( 'Product constructor' );

        this._data = data;

        this.images = data.images.map(img => new Image(img));
    }

    get swatchImages(){
        return this.images.filter(img => img.type === 'swatch');
    }

    get productImages(){
        return this.images.filter(img => img.type === 'productImage');
    }
}
