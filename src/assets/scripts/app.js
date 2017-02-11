'use strict';

import 'babel-polyfill';
import $ from 'jquery';
import slick from 'slick-carousel';
import Navigo from 'navigo';
import React from 'react';
import ReactDOM from 'react-dom';

/**
 * Import Components
 */
import PageFactory from 'pages/PageFactory';

// import globals
// TODO: remove this once done transitioning code
var timber = window.timber;

// create page object
var page = PageFactory.create(window.theia.pageData);

/**
 * Setup Routes
 */
var router = new Navigo();
router
    .on(
        // Product Page
        /(?:collections\/(\w+)\/)?products\/([\w-]+)/,
        (collectionHandle, productHandle) => {
            console.log('product page route');
            console.log( collectionHandle, productHandle );
        })
    .on(
        /collections\/([\w-]+)\/?(?:([\w-]+)?\/?([\w-]+)?\/?([\w-]+)?\/?)?/,
        (collectionHandle, ...tags) => {
            // filter out the undefined tags
            tags = tags.filter((el) => el !== undefined);
            console.log('collection route');
            console.log(collectionHandle, tags);
        }
    )
    .on(
        /pages\/([\w-]+)\/?/,
        (pageHandle) => {
            console.log('page route');
            console.log( 'pageHandle: ', pageHandle );
        }
    )
    .on(
        /blogs\/([\w-]+)\/?(?:tagged\/([\w-]+))/,
        (blogHandle, tagHandle) => {
            console.log('blog route');
            console.log('blogHandle: ', blogHandle);
            console.log('tagHandle: ', tagHandle);
        }
    )
    .on(
        /account\/login/,
        () => {
            console.log( 'account login route' );
        }
    )
    .on(
        /account\/addresses/,
        () => {
            console.log( 'account addresses route' );
        }
    ).
    on(
        /account\/?/,
        () => {
            console.log('account home');
        }
    )
    .on({
        '/search*': () => {
            console.log( 'search route' );
        },
        '/': () => {
            console.log('home route');
        },
        '*': () => {
            console.log('default route');
        }
    })
    .resolve();

class Shop {
    constructor(){
        console.log('shop constructor');
    }
}

var shop = new Shop();

// element cache
var cache = {
    // general page carousel
    // TODO: factor this out into page specific chunk
    $carousel: window.jQuery('.carousel'),

    collectionShop: {
        $body: window.jQuery('body.template-collection-shop'),
        $carousel: window.jQuery('.shop-hero-carousel')
    },

    heroCarousel: {
        $carousel: window.jQuery('.js-hero-carousel')
    }
};

function heroCarousel(){
    var $carousel = cache.heroCarousel.$carousel;

    $carousel.slick({
        prevArrow: '<a href="#" class="slick-prev"></a>',
        nextArrow: '<a href="#" class="slick-next"></a>',
        autoplay: true,
        fade: true,
        autoplaySpeed: 3500,
        speed: 1500
    });
};

timber.initShopCarousel = function(){
    // code from: http://stackoverflow.com/questions/6488104/how-to-know-when-all-images-inside-a-specific-div-are-loaded
    // TODO: replace this with https://github.com/alexanderdickson/waitForImages/blob/master/src/jquery.waitforimages.js
    // get the images in the carousel that have not yet loaded
    // show the carousel only after the images have loaded
    var $carousel = cache.collectionShop.$carousel,
        $carouselImagesNotLoaded = $carousel.find('img').not(function(){
            return this.complete;
        }),
        // count them
        imageCount = $carouselImagesNotLoaded.length;

    // if some images haven't loaded yet
    if (imageCount){
        // wire load events to them
        $carouselImagesNotLoaded.load(function(){
            imageCount--; // decrement the count
            // when count reaches 0 all images have loaded, show the carousel
            if (imageCount === 0){
                $carousel.addClass('js-carousel-loaded');
            }
        });
    } else {
        // else all images have loaded so just show it
        $carousel.addClass('js-carousel-loaded');
    }

    // init the carousel
    $carousel.slick({
        dots: false,
        arrows: false,
        infinite: true,
        slidesToShow: 1,
        centerMode: true,
        variableWidth: true,
        autoplay: true,
        autoplaySpeed: 3000,
        speed: 1500
    });

    console.log('shop carousel init');
};


timber.productCarouselInit = function () {
    // TODO use a better class name for the carousel block, also update the sass/css class name
    $('.carousel-block').slick({
        infinite: true,
        slidesToShow: 4,
        speed: 1000,
        slidesToScroll: 4,
        prevArrow: '<div class="arrow-box-left slick-link slick-left"></div>',
        nextArrow: '<div class="arrow-box-right slick-link slick-right"></div>',
        responsive: [
            {
                breakpoint: 1150,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 3,
                    infinite: true
                }
            },
            {
                breakpoint: 935,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2
                }
            },
            {
                breakpoint: 580,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2
                }
            }
          ]

    });

    console.log('product carousel init');
};

function carouselInit() {
    var $carousel = cache.$carousel;

    $carousel.slick({
        dots: true,
        prevArrow: '<a href="#" class="slick-prev"></a>',
        nextArrow: '<a href="#" class="slick-next"></a>',
        customPaging: function(slider, i) {
            return '<a href="#">' + (i + 1) + '</a>';
        }
    });

    console.log('carousel init');
};


/**
 * Carousels
 */
if (cache.$carousel.length !== 0){
    carouselInit();
}

if (cache.heroCarousel.$carousel.length !== 0){
    // timber.heroCarousel();
}

// hide the page loader once the images have loaded.
window.jQuery(window).load(() => {
  $('.page-loader')
    .addClass('images-loaded')
    .one(
      'transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd',
      function() {
        $(this).hide()
      })
})
