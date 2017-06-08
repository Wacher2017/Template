/** 
* Author: http://rainman.cnblogs.com/ 
* Date: 2014-06-06 
* Depend: jQuery 
*/ 
$.mixhover = function() { 
	// 整理参数 $.mixhover($e1, $e2, handleIn, handleOut) 
	var parms; 
	var length = arguments.length; 
	var handleIn = arguments[length - 2]; 
	var handleOut = arguments[length - 1]; 
	if ($.isFunction(handleIn) && $.isFunction(handleOut)) { 
		parms = Array.prototype.slice.call(arguments, 0, length - 2); 
	} else if ($.isFunction(handleOut)) { 
		parms = Array.prototype.slice.call(arguments, 0, length - 1); 
		handleIn = arguments[length - 1]; 
		handleOut = null; 
	} else { 
		parms = arguments; 
		handleIn = null; 
		handleOut = null; 
	} 
	
	//console.log("parms=====");
	//console.log(parms);

	// 整理参数 使得elements依次对应 
	var elems = []; 
	for (var i = 0, len = parms.length; i < len; i++) { 
		elems[i] = []; 
		var p = parms[i]; 
		if (p.constructor === String) { 
			p = $(p); 
		} 
		if (p.constructor === $ || p.constructor === Array) { 
			for (var j = 0, size = p.length; j < size; j++) { 
				elems[i].push(p[j]); 
			} 
		} else { 
			elems[i].push(p); 
		} 
	} 
	
	//console.log("elems=====");
	//console.log(elems);

	// 绑定Hover事件 
	for (var i = 0, len = elems[0].length; i < len; i++) { 
		var arr = []; 
		for (var j = 0, size = elems.length; j < size; j++) { 
			arr.push(elems[j][i]); 
		}		
		$._mixhover(arr, handleIn, handleOut); 
	} 
}; 

$._mixhover = function(elems, handleIn, handleOut) { 
    //console.log("arr=====");
    //console.log(elems);
	var isIn = false, timer; 
	$(elems).hover(function() { 
		window.clearTimeout(timer); 
		if (isIn === false) { 
			handleIn && handleIn.apply(elems, elems); 
			isIn = true; 
		} 
	}, function() { 
		timer = window.setTimeout(function() { 
			handleOut && handleOut.apply(elems, elems); 
			isIn = false; 
		}, 10); 
	}); 
}; 
