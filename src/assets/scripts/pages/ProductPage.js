'use strict';

import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

import {Page} from './Page.js';
import Product from '../shopify/Product.js';
import {SwatchFieldset} from '../components/SwatchFieldset.jsx';

class ProductPage extends Page {
    constructor(data){
        super(data);

        this.product = new Product(data.product);
    }

    static is(data){
        return data.product !== null && typeof data.product === 'object';
    }
}

class BridesmaidsPage extends ProductPage {
    constructor(data){
        super(data);

        var swatches = this.product.swatchImages.map(img => {
            return {
                color: img.color,
                src: img.src.icon,
                key: img.color
            };
        });

        ReactDOM.render(
            <SwatchFieldset swatches={swatches} legendLabel="Color" />,
            document.getElementById('color-swatches')
        );
    }

    static is(data){
        return super.is(data) &&
            data.product.tags.indexOf('Bridal') > -1 &&
            data.product.tags.indexOf('Bridesmaids') > -1;
    }
}

class BridalPage extends ProductPage {
    constructor(data){
        super(data);
    }

    static is(data){
        return super.is(data) &&
            data.product.tags.indexOf('Bridal') > -1 &&
            data.product.tags.indexOf('Bridesmaids') === -1;
    }
}

class ShopPage extends ProductPage {
    constructor(data){
        super(data);
    }

    static is(data){
        return super.is(data) &&
            data.product.type.includes('Shop');
    }
}

export {ProductPage, BridesmaidsPage, BridalPage, ShopPage};
