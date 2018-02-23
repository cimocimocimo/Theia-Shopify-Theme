// Override Settings
var bcSfFilterSettings = {
    general: {
        limit: 12,
      	paginationType: 'infinite',
        /* Optional */
        loadProductFirst: true,
    },
  	selector: {
        products: '#collection-items'
    }
};

// Declare Templates
var bcSfFilterTemplate = {
    // Grid Template
    'productGridItemHtml':  '<div id="style-{{itemStyleNumber}}" class="{{itemBlockClass}} {{itemLastClass}} {{itemSoldOutClass}} {{itemOnSaleClass}}">' +    
                                '<div class="header-row">' +
                                    '<h4>' +
                                        '<a href="{{itemUrl}}">{{itemTitle}}</a>' +
                                    '</h4>' +
                                '</div>' +
                                '<div id="image-row-{{itemHandle}}"></div>' +
                                '<div class="meta-row">' +
                                    '<div class="info-block">' +
                                        '{{itemPrice}}' +
                                    '</div>' +
                                    '<div class="button-block">' +
                                        '<a class="button" href="{{itemUrl}}">' +
                                            '<span class="label">' +
                                                '{{itemLabel}}' +
                                            '</span>' +
                                            '<span class="icon"></span>' +
                                        '</a>' +
                                    '</div>' +
                                '</div>' +
                            '</div>',

    // Pagination Template
    'previousActiveHtml': '<li><a href="{{itemUrl}}">&larr;</a></li>',
    'previousDisabledHtml': '<li class="disabled"><span>&larr;</span></li>',
    'nextActiveHtml': '<li><a href="{{itemUrl}}">&rarr;</a></li>',
    'nextDisabledHtml': '<li class="disabled"><span>&rarr;</span></li>',
    'pageItemHtml': '<li><a href="{{itemUrl}}">{{itemTitle}}</a></li>',
    'pageItemSelectedHtml': '<li><span class="active">{{itemTitle}}</span></li>',
    'pageItemRemainHtml': '<li><span>{{itemTitle}}</span></li>',
    'paginateHtml': '<ul class="pagination-block">{{previous}}{{pageItems}}{{next}}</ul>'
};

/************************** BUILD PRODUCT LIST **************************/

// Build Product Grid Item
BCSfFilter.prototype.buildProductGridItem = function(data, index) {
    /*** Prepare data ***/
    var images = data.images_info;
    data.price_min *= 100, data.price_max *= 100, data.compare_at_price_min *= 100, data.compare_at_price_max *= 100; // Displaying price base on the policy of Shopify, have to multiple by 100
    var soldOut = !data.available; // Check a product is out of stock
    var onSale = data.compare_at_price_min > data.price_min; // Check a product is on sale
    var priceVaries = data.price_min != data.price_max; // Check a product has many prices
    // Get First Variant (selected_or_first_available_variant)
    var firstVariant = data['variants'][0];
    if (getParam('variant') !== null && getParam('variant') != '') {
        var paramVariant = data.variants.filter(function(e) { return e.id == getParam('variant'); });
        if (typeof paramVariant[0] !== 'undefined') firstVariant = paramVariant[0];
    } else {
        for (var i = 0; i < data['variants'].length; i++) {
            if (data['variants'][i].available) {
                firstVariant = data['variants'][i];
                break;
            }
        }
    }
    /*** End Prepare data ***/

    // Get Template
    var itemHtml = bcSfFilterTemplate.productGridItemHtml;

    // style_number
    var itemStyleNumber = 0;
    var curr_tag = 0;
    if(data.tags && data.tags.length > 0){
        for(var i in data.tags){
            var tag = data.tags[i];
          	console.log(tag, tag.length);
            if(tag.length == 6){
                curr_tag = tag * 1;
                if(curr_tag != 0){
                    itemStyleNumber = curr_tag;
                  	break;
                };
              	
            }
        }
    }
    itemStyleNumber = jQ.trim(itemStyleNumber) * 1;
    itemHtml = itemHtml.replace(/{{itemStyleNumber}}/g, itemStyleNumber);

    // itemBlockClass
    var itemBlockClass = 'product-grid-item';
    itemHtml = itemHtml.replace(/{{itemBlockClass}}/g, itemBlockClass);

    // itemLastClass
    var itemLastClass = '';
    if(data.length == index){
        itemLastClass = 'last-item';
    }
    itemHtml = itemHtml.replace(/{{itemLastClass}}/g, itemLastClass);

    // itemSoldOutClass
    var itemSoldOutClass = '';
    if(soldOut){
        itemSoldOutClass = 'sold-out';
    }
    itemHtml = itemHtml.replace(/{{itemSoldOutClass}}/g, itemSoldOutClass);

    // itemOnSaleClass
    var itemOnSaleClass = '';
    if(onSale){
        itemOnSaleClass = 'on-sale';
    }
    itemHtml = itemHtml.replace(/{{itemOnSaleClass}}/g, itemOnSaleClass);

    // itemPrice
    var itemPrice = '';
    if(onSale){
        itemPrice += '<div class="sale-price">';
        itemPrice += 'Now: ';
        itemPrice += this.formatMoney(data.price_min,this.moneyFormat);
      	itemPrice += '</div>';
        itemPrice += '<div class="compare-at-price">';
        itemPrice += ' MRSP: <span>';
        itemPrice += this.formatMoney(data.compare_at_price_min, this.moneyFormat);
        itemPrice += '</span>';
        itemPrice += '</div>';
    }else{
        if(data.price_min > 0){
            itemPrice += '<div>';
            itemPrice += 'US ';
            itemPrice += this.formatMoney(data.price_min,this.moneyFormat);
            itemPrice += '</div>';
        }
        if(itemStyleNumber != 0){
            itemPrice += '<div>';
            itemPrice += 'Style #: ';
            itemPrice += itemStyleNumber;
            itemPrice += '</div>';
        }
    }
    itemHtml = itemHtml.replace(/{{itemPrice}}/g, itemPrice);

    // itemLabel
    var itemLabel = '';
    if(onSale){
        itemLabel += 'Sale';        
    }else{
        itemLabel += 'View Dress';
    }
    itemHtml = itemHtml.replace(/{{itemLabel}}/g, itemLabel);

    // Add main attribute (Always put at the end of this function)
    itemHtml = itemHtml.replace(/{{itemId}}/g, data.id);
    itemHtml = itemHtml.replace(/{{itemHandle}}/g, data.handle);
    itemHtml = itemHtml.replace(/{{itemTitle}}/g, data.title);
    itemHtml = itemHtml.replace(/{{itemUrl}}/g, this.buildProductItemUrl(data));


    // Build content for Modal
    var quickUrl = this.buildProductItemUrl(data) + '?view=image';
    jQ.ajax({url: quickUrl, success: function(result){
        jQ('#image-row-' + data.handle).html(result);
    }});

    return itemHtml;
};

// Build Product List Item
BCSfFilter.prototype.buildProductListItem = function(data) {
    // // Add Description
    // var itemDescription = jQ('<p>' + data.body_html + '</p>').text();
    // // Truncate by word
    // itemDescription = (itemDescription.split(" ")).length > 51 ? itemDescription.split(" ").splice(0, 51).join(" ") + '...' : itemDescription.split(" ").splice(0, 51).join(" ");
    // // Truncate by character
    // itemDescription = itemDescription.length > 350 ? itemDescription.substring(0, 350) + '...' : itemDescription.substring(0, 350);
    // itemHtml = itemHtml.replace(/{{itemDescription}}/g, itemDescription);
};

// Customize data to suit the data of Shopify API
BCSfFilter.prototype.prepareProductData = function(data) {
    for (var k in data) {
        // Add Options
        var optionsArr = [];
        for (var i in data[k]['options_with_values']) {
            optionsArr.push(data[k]['options_with_values'][i]['name']);
        }
        data[k]['options'] = optionsArr;

        // Customize variants
        for (var i in data[k]['variants']) {
            var variantOptionArr = [];
            var count = 1;
            var variant = data[k]['variants'][i];
            // Add Options
            var variantOptions = variant['merged_options'];
            if (Array.isArray(variantOptions)) {
                for (var j = 0; j < variantOptions.length; j++) {
                    var temp = variantOptions[j].split(':');
                    data[k]['variants'][i]['option' + (parseInt(j) + 1)] = temp[1];
                    data[k]['variants'][i]['option_' + temp[0]] = temp[1];
                    variantOptionArr.push(temp[1]);
                }
                data[k]['variants'][i]['options'] = variantOptionArr;
            }
            data[k]['variants'][i]['compare_at_price'] = parseFloat(data[k]['variants'][i]['compare_at_price']) * 100;
            data[k]['variants'][i]['price'] = parseFloat(data[k]['variants'][i]['price']) * 100;
        }

        // Add Description
        data[k]['description'] = data[k]['body_html'];
    }
    return data;
};

/************************** END BUILD PRODUCT LIST **************************/

// Build Pagination
BCSfFilter.prototype.buildPagination = function(totalProduct) {
    if (this.getSettingValue('general.paginationType') == 'default') {
        // Get page info
        var currentPage = parseInt(this.queryParams.page);
        var totalPage = Math.ceil(totalProduct / this.queryParams.limit);

        // If it has only one page, clear Pagination
        if (totalPage == 1) {
            jQ(this.selector.bottomPagination).html('');
            return false;
        }

        if (this.getSettingValue('general.paginationType') == 'default') {
            var paginationHtml = bcSfFilterTemplate.paginateHtml;

            // Build Previous
            var previousHtml = (currentPage > 1) ? bcSfFilterTemplate.previousActiveHtml : bcSfFilterTemplate.previousDisabledHtml;
            previousHtml = previousHtml.replace(/{{itemUrl}}/g, this.buildToolbarLink('page', currentPage, currentPage - 1));
            paginationHtml = paginationHtml.replace(/{{previous}}/g, previousHtml);

            // Build Next
            var nextHtml = (currentPage < totalPage) ? bcSfFilterTemplate.nextActiveHtml :  bcSfFilterTemplate.nextDisabledHtml;
            nextHtml = nextHtml.replace(/{{itemUrl}}/g, this.buildToolbarLink('page', currentPage, currentPage + 1));
            paginationHtml = paginationHtml.replace(/{{next}}/g, nextHtml);

            // Create page items array
            var beforeCurrentPageArr = [];
            for (var iBefore = currentPage - 1; iBefore > currentPage - 3 && iBefore > 0; iBefore--) {
                beforeCurrentPageArr.unshift(iBefore);
            }
            if (currentPage - 4 > 0) {
                beforeCurrentPageArr.unshift('...');
            }
            if (currentPage - 4 >= 0) {
                beforeCurrentPageArr.unshift(1);
            }
            beforeCurrentPageArr.push(currentPage);

            var afterCurrentPageArr = [];
            for (var iAfter = currentPage + 1; iAfter < currentPage + 3 && iAfter <= totalPage; iAfter++) {
                afterCurrentPageArr.push(iAfter);
            }
            if (currentPage + 3 < totalPage) {
                afterCurrentPageArr.push('...');
            }
            if (currentPage + 3 <= totalPage) {
                afterCurrentPageArr.push(totalPage);
            }

            // Build page items
            var pageItemsHtml = '';
            var pageArr = beforeCurrentPageArr.concat(afterCurrentPageArr);
            for (var iPage = 0; iPage < pageArr.length; iPage++) {
                if (pageArr[iPage] == '...') {
                    pageItemsHtml += bcSfFilterTemplate.pageItemRemainHtml;
                } else {
                    pageItemsHtml += (pageArr[iPage] == currentPage) ? bcSfFilterTemplate.pageItemSelectedHtml : bcSfFilterTemplate.pageItemHtml;
                }
                pageItemsHtml = pageItemsHtml.replace(/{{itemTitle}}/g, pageArr[iPage]);
                pageItemsHtml = pageItemsHtml.replace(/{{itemUrl}}/g, this.buildToolbarLink('page', currentPage, pageArr[iPage]));
            }
            paginationHtml = paginationHtml.replace(/{{pageItems}}/g, pageItemsHtml);

            jQ(this.selector.bottomPagination).html(paginationHtml);
        }
    }
};

/************************** BUILD TOOLBAR **************************/

// Build Sorting
BCSfFilter.prototype.buildFilterSorting = function() {
    if (bcSfFilterTemplate.hasOwnProperty('sortingHtml')) {
        jQ(this.selector.topSorting).html('');

        var sortingArr = this.getSortingList();
        if (sortingArr) {
            // Build content 
            var sortingItemsHtml = '';
            for (var k in sortingArr) {
                sortingItemsHtml += '<option value="' + k +'">' + sortingArr[k] + '</option>';
            }
            var html = bcSfFilterTemplate.sortingHtml.replace(/{{sortingItems}}/g, sortingItemsHtml);
            jQ(this.selector.topSorting).html(html);

            // Set current value
            jQ(this.selector.topSorting + ' select').val(this.queryParams.sort);
        }
    }
};

// Build Display type (List / Grid / Collage)
// BCSfFilter.prototype.buildFilterDisplayType = function() {
//     var itemHtml = '<a href="' + this.buildToolbarLink('display', 'list', 'grid') + '" title="Grid view" class="change-view bc-sf-filter-display-grid" data-view="grid"><span class="icon-fallback-text"><i class="fa fa-th" aria-hidden="true"></i><span class="fallback-text">Grid view</span></span></a>';
//     itemHtml += '<a href="' + this.buildToolbarLink('display', 'grid', 'list') + '" title="List view" class="change-view bc-sf-filter-display-list" data-view="list"><span class="icon-fallback-text"><i class="fa fa-list" aria-hidden="true"></i><span class="fallback-text">List view</span></span></a>';
//     jQ(this.selector.topDisplayType).html(itemHtml);

//     // Active current display type
//     jQ(this.selector.topDisplayType).find('.bc-sf-filter-display-list').removeClass('active');
//     jQ(this.selector.topDisplayType).find('.bc-sf-filter-display-grid').removeClass('active');
//     if (this.queryParams.display == 'list') {
//         jQ(this.selector.topDisplayType).find('.bc-sf-filter-display-list').addClass('active');
//     } else if (this.queryParams.display == 'grid') {
//         jQ(this.selector.topDisplayType).find('.bc-sf-filter-display-grid').addClass('active');
//     }
// };

/************************** END BUILD TOOLBAR **************************/

// Add additional feature for product list, used commonly in customizing product list
BCSfFilter.prototype.buildExtrasProductList = function(data, eventType) {};

// Build additional elements
BCSfFilter.prototype.buildAdditionalElements = function(data, eventType) {};


// BCSfFilter.prototype.buildProductItemUrl = function(data, hasCollection) {
//     var hasCollection = typeof hasCollection !== 'undefined' ? hasCollection : true;
//     if (hasCollection) {
//         // Homepage or Search page
//         if (window.location.pathname == '/' || this.isSearchPage() || this.isVendorPage()) {
//             return '/collections/all/products/' + data.handle;
//         }
//         // Tag Page
//         else if (typeof bcSfFilterConfig.general.current_tag_handle !== 'undefined' && bcSfFilterConfig.general.current_tag_handle !== null && bcSfFilterConfig.general.current_tag_handle.length > 0) {
//             var elements = window.location.pathname.split('/');
//             if (elements.length >= 4) return '/collections/' + elements[2] + '/products/' + data.handle + '?tag=' + bcSfFilterConfig.general.current_tag_handle;
//             return '/collections/all/products/' + data.handle;
//         } else {
//             var elements = window.location.pathname.split('/');
//             if (typeof elements[2] !== 'undefined') return '/collections/' + elements[2] + '/products/' + data.handle;
//             return window.location.pathname + '/products/' + data.handle;
//         }
//     }
  	
//     return '/products/' + data.handle;
// };