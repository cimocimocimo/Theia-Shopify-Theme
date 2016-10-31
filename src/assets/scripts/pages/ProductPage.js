'use strict';

import $ from 'jquery';
import {Page} from './Page.js';
import Product from '../shopify/Product.js';

class ProductPage extends Page {
    constructor(data){
        super(data);

        console.log('ProductPage constructor')

        this.product = new Product(data.product);
    }

    static is(data){
        return data.product !== null && typeof data.product === 'object';
    }
}

class BridesmaidsPage extends ProductPage {
    constructor(data){
        super(data);

        console.log( 'BridesmaidsPage constructor' );
    }

    static is(data){
        return super.is(data) &&
            data.product.tags.indexOf('Bridal') > -1 &&
            data.product.tags.indexOf('Bridesmaids') > -1;
    }
}

class BridalPage extends ProductPage {
    constructor(){
        super();

        console.log( 'BridalPage constructor' );
    }

    static is(data){
        return super.is(data) &&
            data.product.tags.indexOf('Bridal') > -1 &&
            data.product.tags.indexOf('Bridesmaids') === -1;
    }
}

class ShopPage extends ProductPage {
    constructor(){
        super();

        console.log( 'ShopPage constructor' );
    }

    static is(data){
        return super.is(data) &&
            data.product.type.includes('Shop');
    }
}

export {ProductPage, BridesmaidsPage, BridalPage, ShopPage};
