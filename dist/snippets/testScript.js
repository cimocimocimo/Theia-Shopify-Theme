  var colours = "http://cdn.shopify.com/s/files/1/0894/1412/t/1/assets/colours.json?5507754851843671021";

  function findColourHexByName(colours, name){
    var colour;  

    $.getJSON(colours, function(json){
      json.colours.forEach(function(x){
        if(x.name === name){
          return colour = "#"+x.hex;
        }
      })
    });

    console.log(colour);

  }

findColourHexByName(colours, 'Blue');