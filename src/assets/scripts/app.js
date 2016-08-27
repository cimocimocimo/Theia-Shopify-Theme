import 'babel-polyfill';

import slick from 'slick-carousel';
import moment from 'moment';
import smoothScroll from 'smoothscroll';
import headroom from 'headroom.js';
import Cookies from 'js-cookie';
import vex from 'vex';
import zoom from 'jquery-zoom';

console.log('loaded');

timber.heroCarousel = function(){
    var $carousel = timber.cache.heroCarousel.$carousel;

    $carousel.slick({
        prevArrow: '<a href="#" class="slick-prev"></a>',
        nextArrow: '<a href="#" class="slick-next"></a>',
        autoplay: true,
        fade: true,
        autoplaySpeed: 3500,
        speed: 1500
    });
};
