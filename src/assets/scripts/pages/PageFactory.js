'use strict';

import {ShopPage, BridalPage, BridesmaidsPage} from './ProductPage.js';

export default class PageFactory {
    static create(data){
        // decide what page to build based on passed page data
        if (ShopPage.is(data)){
            return new ShopPage(data);
        } else if (BridalPage.is(data)){
            return new ShopPage(data);
        } else if (BridesmaidsPage.is(data)){
            return new BridesmaidsPage(data);
        }
    }
}
