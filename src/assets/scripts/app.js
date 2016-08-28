import 'babel-polyfill';

import slick from 'slick-carousel';
import moment from 'moment';
import smoothScroll from 'smoothscroll';
import headroom from 'headroom.js';
import Cookies from 'js-cookie';
import vex from 'vex';
import zoom from 'jquery-zoom';

// import globals
var timber = window.timber,
    $ = window.jQuery;

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

timber.initShopCarousel = function(){
    // code from: http://stackoverflow.com/questions/6488104/how-to-know-when-all-images-inside-a-specific-div-are-loaded
    // TODO: replace this with https://github.com/alexanderdickson/waitForImages/blob/master/src/jquery.waitforimages.js
    // get the images in the carousel that have not yet loaded
    // show the carousel only after the images have loaded
    var $carousel = timber.cache.collectionShop.$carousel,
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

timber.carouselInit = function () {
    $('.carousel').slick({
        dots: true,
        prevArrow: '<a href="#" class="slick-prev"></a>',
        nextArrow: '<a href="#" class="slick-next"></a>',
        customPaging: function(slider, i) {
            return '<a href="#">' + (i + 1) + '</a>';
        }
    });

    console.log('carousel init');
};
