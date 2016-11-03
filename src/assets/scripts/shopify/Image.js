'use strict';

export default class Image {
    constructor(data){
        this._data = data;

        [this.alt, this.type, this.color] = this.parseAlt(data.alt);
        this.src = data.src;
    }

    parseAlt(alt){
        const altKeys = {
            data: '%DATA%',
            item: '%ITEM%',
            pair: '%PAIR%'
        }
        var imgType, color, rest, pairs;

        if (alt.includes(altKeys.data)){
            [rest, alt] = alt.split(altKeys.data);

            if (rest.includes(altKeys.item) && rest.includes(altKeys.pair)){
                pairs = rest.split(altKeys.item);

                for (let p of pairs){
                    var [key, value] = p.split(altKeys.pair);

                    if (key === 'color'){
                        color = value;
                    } else if (key === 'type'){
                        imgType = value;
                    }
                }
            }
        }

        return [alt, imgType, color];
    }
}
