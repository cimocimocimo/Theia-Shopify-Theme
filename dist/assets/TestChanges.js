 // Change dress colour and show/hide the size inputs
  function changeDress(arg){
		$('body').trigger('colorChanged.productPage', {color: arg});
	}

// Swatch Related functions
	function showSwatch($el){
	   $el.addClass('js-hidden-size');
	}

	function hideSwatch($el){
		$el.removeClass('js-hidden-size');
	}

	function sizeShouldBeVisibile($colour, $input){
		console.log('color', $colour);
		console.log('input', $input);
		//$input === colour ? showSwatch($input.parent()) : hideSwatch($input.parent());
	}

	// Using Javascirpt PURE children because I'm an idiot who doesn't understand how elements should be passed

	function findChildrenByClassName(parentClassName, childrenClassName){
		var parent = document.getElementsByClassName(parentClassName);
	 	var orphans = parent[0].children;
	 	var adoptedKids = [];

	 	function adopt(child){
	 		adoptedKids.push(child);
	 	}

	 	function hasClass(el, cls) {
  		return el.className && new RegExp("(\\s|^)" + cls + "(\\s|$)").test(el.className);
		}

	 	for(var i = 0; i < orphans.length; i++){
	 		if(hasClass(orphans[i], childrenClassName)){
	 			adopt(orphans[i]);
	 		}
	 	}

	 	console.log(adoptedKids);
	 	return adoptedKids;
 	}


	function testEachInput(children, test){

		function innerTest(arg){
			return (function(){
				return test.apply(null, arguments, arg);
			})	
		};

		children.forEach(function(x){
			console.log(x);
		})

	}

	function colourSwatchIsActive($input){
		if ($input.attr( 'checked' )){ return $input.attr( 'data-colour' )};
	}
 

 	var children = findChildrenByClassName('size-swatch-field', 'swatch-element');
 
  console.log(parent.children, 'parents and kids');

  var $colourInput = $('.colourSelect');

	$colourInput.change(function() {
		var $colour = $(this).attr('data-colour');
		testEachInput(children, sizeShouldBeVisibile($colour));
    changeDress($colour);
	});

