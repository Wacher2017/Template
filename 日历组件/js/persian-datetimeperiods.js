/**
 * Created by Mr.wang on 2016-11-05.
 * 特殊的选择日期时间控件，包含通配，适用于特殊的场景设置时间
 */
(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        factory(require('jquery'));
    } else {
        if (!jQuery) {
            throw 'bootstrap-datetimeperiods requires jQuery to be loaded first';
        }
        factory(jQuery);
    }
}(function($) {
	'use strict';
	var dateTimePeriods = function (element, options) {
		var periods = {},
			input,
			component = false,
			widget = false,
			minViewModeNumber = 0,
			currentViewMode,
			preViewMode,
			datePeriodsModes = [
				{
					clsName: 'years'
				},
				{
					clsName: 'months'
				},
				{
					clsName: 'days'
				},
				{
					clsName: 'weeks'
				},
				{
					clsName: 'hours'
				},
				{
					clsName: 'minutes'
				},
				{
					clsName: 'seconds'
				},
				{
					clsName: 'hundredths'
				}
			],
			icons = {
				confirm: 'glyphicon glyphicon-ok',
				backward: 'glyphicon glyphicon-backward',
				forward: 'glyphicon glyphicon-forward',
				clear: 'glyphicon glyphicon-trash'
			},
			shortWeeks = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
			viewModes = ['years', 'months', 'days', 'weeks', 'hours', 'minutes', 'seconds', 'hundredths'],
			verticalModes = ['top', 'bottom', 'auto'],
			horizontalModes = ['left', 'right', 'auto'],
			toolbarPlacements = ['default', 'top', 'bottom'],
			leap = [1354,1358,1362,1366,1370,1375,1379,1383,1387,1391,1395,1399,1403,1408,1412,1416,1420,1424],
			JULIAN_EPOCH_MILLIS = -210866803200000,
			ONE_DAY_MILLIS = 24 * 60* 60 * 1000,
			EPOCH = 1948321,
			
			/********************************************************************************
             *
             * Private functions
             *
             ********************************************************************************/
            getMainTemplate = function () {
				var headTemplate = $('<thead>')
							.append($('<tr>').append($('<th>').attr('colspan', '5')
							.append($('<div>').addClass('col-md-1 sys-padding-margin').attr('id','headtext'))
							.append($('<div>').addClass('col-md-10 sys-padding-margin').attr('id','headcont'))
							.append($('<div>').addClass('col-md-1 sys-padding-margin').attr('id','itemclose')))),
					contTemplate = $('<tbody>')
						.append($('<tr>')
							.append($('<td>').attr('colspan', '5'))
							);
						
				return [
					$('<div>').addClass('dateperiods-years')
						.append($('<table>').addClass('table-condensed')
							.append(headTemplate)
							.append($('<tbody>'))
							),
					$('<div>').addClass('dateperiods-months')
						.append($('<table>').addClass('table-condensed')
							.append(headTemplate.clone())
							.append(contTemplate.clone())
							),
					$('<div>').addClass('dateperiods-days')
						.append($('<table>').addClass('table-condensed')
							.append(headTemplate.clone())
							.append(contTemplate.clone())
							),
					$('<div>').addClass('dateperiods-weeks')
						.append($('<table>').addClass('table-condensed')
							.append(headTemplate.clone())
							.append(contTemplate.clone())
							),
					$('<div>').addClass('dateperiods-hours')
						.append($('<table>').addClass('table-condensed')
							.append(headTemplate.clone())
							.append(contTemplate.clone())
							),
					$('<div>').addClass('dateperiods-minutes')
						.append($('<table>').addClass('table-condensed')
							.append(headTemplate.clone())
							.append(contTemplate.clone())
							),
					$('<div>').addClass('dateperiods-seconds')
						.append($('<table>').addClass('table-condensed')
							.append(headTemplate.clone())
							.append(contTemplate.clone())
							),
					$('<div>').addClass('dateperiods-hundredths')
						.append($('<table>').addClass('table-condensed')
							.append(headTemplate.clone())
							.append(contTemplate.clone())
							)
				];
			},
			
			getToolbar = function () {
				var row = [];
				row.push($('<td>').append($('<a>').attr('data-action', 'backward').append($('<span>').addClass(icons.backward))));
				row.push($('<td>').append($('<a>').attr('data-action', 'confirm').append($('<span>').addClass(icons.confirm))));
				if (options.showClear) {
					row.push($('<td>').append($('<a>').attr('data-action', 'clear').append($('<span>').addClass(icons.clear))));
				}
				row.push($('<td>').attr('id','btn').append($('<a>').attr('data-action', 'nextward').append($('<span>').addClass('btn-text').attr('id','btnText'))));
				row.push($('<td>').append($('<a>').attr('data-action', 'nextward').append($('<span>').addClass('btn-text').attr('id','week').html('Week<i class="'+icons.forward+'" style="margin-left:5px;"></i>'))));
				row.push($('<td>').attr('id','placehold').addClass('toolbar-td-width'));
				return $('<table>').addClass('table-condensed').append($('<tbody>').append($('<tr>').append(row)));
			},
			
			getTemplate = function () {
               var template = $('<div>').addClass('bootstrap-datetimeperiods-widget dropdown-menu'),
					mainView = $('<div>').addClass('dateperiods').append(getMainTemplate()),
					content = $('<ul>').addClass('list-unstyled'),
					toolbar = $('<li>').addClass('periods-switch').append(getToolbar());
	
				content.append($('<li>').append(mainView));
				
				if (options.toolbarPlacement === 'top') {
					content.append(toolbar);
				}
				if (options.toolbarPlacement === 'default') {
					content.append(toolbar);
				}
				if (options.toolbarPlacement === 'bottom') {
					content.append(toolbar);
				}
				return template.append(content);
            },
			
			dataToOptions = function () {
                var eData = element.data(),
                    dataOptions = {};

                if (eData.dateOptions && eData.dateOptions instanceof Object) {
                    dataOptions = $.extend(true, dataOptions, eData.dateOptions);
                }

                $.each(options, function (key) {
                    var attributeName = 'date' + key.charAt(0).toUpperCase() + key.slice(1);
                    if (eData[attributeName] !== undefined) {
                        dataOptions[key] = eData[attributeName];
                    }
                });
                return dataOptions;
            },
			
			place = function () {
                var offset = (component || element).position(),
					vertical = options.widgetPositioning.vertical,
					horizontal = options.widgetPositioning.horizontal,
					parent;
	
				if (options.widgetParent) {
					parent = options.widgetParent.append(widget);
				} else if (element.is('input')) {
					parent = element.parent().append(widget);
				} else {
					parent = element;
					element.children().first().after(widget);
				}
	
				// Top and bottom logic
				if (vertical === 'auto') {
					if ((component || element).offset().top + widget.height() > $(window).height() + $(window).scrollTop() &&
							widget.height() + element.outerHeight() < (component || element).offset().top) {
						vertical = 'top';
					} else {
						vertical = 'bottom';
					}
				}
	
				// Left and right logic
				if (horizontal === 'auto') {
					if (parent.width() < offset.left + widget.outerWidth()) {
						horizontal = 'right';
					} else {
						horizontal = 'left';
					}
				}
	
				if (vertical === 'top') {
					widget.addClass('top').removeClass('bottom');
				} else {
					widget.addClass('bottom').removeClass('top');
				}
	
				if (horizontal === 'right') {
					widget.addClass('pull-right');
				} else {
					widget.removeClass('pull-right');
				}
	
				// find the first parent element that has a relative css positioning
				if (parent.css('position') !== 'relative') {
					parent = parent.parents().filter(function () {
						return $(this).css('position') === 'relative';
					}).first();
				}
	
				if (parent.length === 0) {
					throw new Error('datetimeperiods component should be placed within a relative positioned container');
				}
	
				widget.css({
					top: vertical === 'top' ? 'auto' : offset.top + element.outerHeight(),
					bottom: vertical === 'top' ? offset.top + element.outerHeight() : 'auto',
					left: horizontal === 'left' ? parent.css('padding-left') : 'auto',
					right: horizontal === 'left' ? 'auto' : parent.css('padding-right')
				});
            },
			
            notifyEvent = function (e) {
                if (e.type === 'dp.change') {
                    return;
                }
                element.trigger(e);
            },
			
			checkAll = function(sel,type){
				sel.on('click',function(){
					if(this.checked){
						if(type === 'day')
							widget.find('.dateperiods-'+type+'s').find('span[class!="day span-dispaly"]').find("input[name='"+type+"']").prop('checked', true);
						else
							widget.find('.dateperiods-'+type+'s').find("input[name='"+type+"']").prop('checked', true);
					}else{
						widget.find('.dateperiods-'+type+'s').find("input[name='"+type+"']").prop('checked', false);
					}
				});
			},
			
			checkWildcard = function(wild,type){
				wild.on('click',function(){
					if(this.checked){
						widget.find('.dateperiods-'+type+'s').find('td').find("input").prop('checked', false);
						widget.find('.dateperiods-'+type+'s').find('td').find("input").prop("disabled", true);
					}else{
						if(isHasMulCheck() || options.singleSelection)
							widget.find('.dateperiods-'+type+'s').find('td').find("input[id!='"+type+"']").prop("disabled", false);
						else
							widget.find('td').find("input").prop("disabled", false);
					}
				});
			},
			
			checkOne = function(type,value){
				widget.find('.dateperiods-'+type+'s').find('td').find("input[value!='"+value+"']:checked").prop("checked", false);
			},
			
			disabledCheckAll = function(type){
				for(var i=0; i<viewModes.length; i++){
					if(i!=type || options.singleSection)
						widget.find('.dateperiods-'+viewModes[i]).find("input[id='"+viewModes[i].substring(0,viewModes[i].length-1)+"']").prop("disabled", true);
				}
			},
			
			isHasMulCheck = function(type){
				var td = widget.find('td');
				if(type === 'year'){
					return td.find('input[name="month"]:checked').length>1 || td.find('input[name="day"]:checked').length>1
						||td.find('input[name="week"]:checked').length>1 || td.find('input[name="hour"]:checked').length>1 || td.find('input[name="minute"]:checked').length>1
						|| td.find('input[name="second"]:checked').length>1 || td.find('input[name="hundredth"]:checked').length>1;
				}else if(type === 'month'){
					return td.find('input[name="day"]:checked').length>1 ||td.find('input[name="week"]:checked').length>1
						|| td.find('input[name="hour"]:checked').length>1 || td.find('input[name="minute"]:checked').length>1
						|| td.find('input[name="second"]:checked').length>1 || td.find('input[name="hundredth"]:checked').length>1;
				}else if(type === 'day'){
					return td.find('input[name="hour"]:checked').length>1 || td.find('input[name="minute"]:checked').length>1
						|| td.find('input[name="second"]:checked').length>1 || td.find('input[name="hundredth"]:checked').length>1;
				}else if(type === 'week'){
					return td.find('input[name="hour"]:checked').length>1 || td.find('input[name="minute"]:checked').length>1
						|| td.find('input[name="second"]:checked').length>1 || td.find('input[name="hundredth"]:checked').length>1;
				}else if(type === 'hour'){
					return td.find('input[name="minute"]:checked').length>1 || td.find('input[name="second"]:checked').length>1 
						|| td.find('input[name="hundredth"]:checked').length>1;
				}else if(type === 'minute'){
					return td.find('input[name="second"]:checked').length>1 || td.find('input[name="hundredth"]:checked').length>1;
				}else if(type === 'second'){
					return td.find('input[name="hundredth"]:checked').length>1;
				}else{
					return td.find('input[name="year"]:checked').length>1 || td.find('input[name="month"]:checked').length>1 || td.find('input[name="day"]:checked').length>1
						||td.find('input[name="week"]:checked').length>1 || td.find('input[name="hour"]:checked').length>1 || td.find('input[name="minute"]:checked').length>1
						|| td.find('input[name="second"]:checked').length>1 || td.find('input[name="hundredth"]:checked').length>1;	
				}
			},
			
			isLeapYear = function(year){  
				return (year % 4 == 0) && (year % 100 != 0 || year % 400 == 0);  
			},
			
			eachDayOrWeek = function(){
				var td = widget.find('td');
				if(td.find('input[name="day"]:checked').length){
					widget.find('.dateperiods-weeks').find("input").prop("disabled", true);
				}else if(td.find('input[name="week"]:checked').length){
					widget.find('.dateperiods-days').find("input").prop("disabled", true);
				}else{
					widget.find('.dateperiods-weeks').find("input[id!='week']").prop("disabled", false);
					widget.find('.dateperiods-days').find("input[id!='day']").prop("disabled", false);
				}
			},
			
			excuteCheckOne = function(name,value,type){
				for(var i=0; i<viewModes.length; i++){
					if(viewModes[i] != type){
						if(name === viewModes[i].substring(0,viewModes[i].length-1)){
							checkOne(name,value);
						}
					}
				}
			},
			
			excuteCheckMode = function(name,value){
				var td = widget.find('td');
				if(td.find('input[name="year"]:checked').length<=1 && td.find('input[name="month"]:checked').length<=1 && td.find('input[name="day"]:checked').length<=1
					 && td.find('input[name="week"]:checked').length<=1 && td.find('input[name="hour"]:checked').length<=1 && td.find('input[name="minute"]:checked').length<=1
					  && td.find('input[name="second"]:checked').length<=1 && td.find('input[name="hundredth"]:checked').length<=1)
					td.find('span[class="periods-span"]').find("input").prop("disabled", false);
				eachDayOrWeek();
				for(var i=0; i<viewModes.length; i++){
					var type = viewModes[i].substring(0,viewModes[i].length-1);
					if(td.find('input[name="'+type+'"]:checked').length>1){
						if(isHasMulCheck(type)){
							checkOne(name,value);
						}else{
							td.find('span[class="periods-span"]').find("input").prop("disabled", false);
							disabledCheckAll(i);
							excuteCheckOne(name,value,viewModes[i]);
						}
					}
					if(type=='month'){
						updateDays();
					}
				}
			},
			
			limitMuilCheck = function(){
				if(options.singleSelection){
					disabledCheckAll();	
					widget.find('td').find('input').on('click',function(){
						eachDayOrWeek();
						for(var i=0; i<viewModes.length; i++){
							excuteCheckOne(this.name,this.value,viewModes[i])
						}
						updateDays();
					});
				}else{
					widget.find('td').find('input').on('click',function(){
						excuteCheckMode(this.name,this.value);
					});
				}
			},
			
			showMode = function (dir) {
				if (!widget) {
					return;
				}
				if(currentViewMode == 2 || currentViewMode == 3){
					preViewMode = currentViewMode;
				}
				if (dir) {
					currentViewMode = Math.max(minViewModeNumber, Math.min(7, dir));
				}
				
				widget.find('.dateperiods > div').hide().filter('.dateperiods-' + datePeriodsModes[currentViewMode].clsName).show();
				var btnView = widget.find('.periods-switch');
				switch(currentViewMode){
					case 0:	btnView.find('#btnText').html('Month<i class="'+icons.forward+'" style="margin-left:5px;"></i>');
							btnView.find('#btn').show();btnView.find('#week').hide();btnView.find('#placehold').hide();
							break;
					case 1:	btnView.find('#btnText').html('Day<i class="'+icons.forward+'" style="margin-left:5px;"></i>');
							btnView.find('#btn').show();btnView.find('#week').show();btnView.find('#placehold').hide();
							break;
					case 2:	
					case 3:	btnView.find('#btnText').html('Hour<i class="'+icons.forward+'" style="margin-left:5px;"></i>');
							btnView.find('#btn').show();btnView.find('#week').hide();btnView.find('#placehold').hide();
							break;
					case 4:	btnView.find('#btnText').html('Minute<i class="'+icons.forward+'" style="margin-left:5px;"></i>');
							btnView.find('#btn').show();btnView.find('#week').hide();btnView.find('#placehold').hide();
							break;
					case 5:	btnView.find('#btnText').html('Second<i class="'+icons.forward+'" style="margin-left:5px;"></i>');
							btnView.find('#btn').show();btnView.find('#week').hide();btnView.find('#placehold').hide();
							break;
					case 6:	btnView.find('#btnText').html('Hundredth<i class="'+icons.forward+'" style="margin-left:5px;"></i>');
							btnView.find('#btn').show();btnView.find('#week').hide();btnView.find('#placehold').hide();
							break;
					case 7: btnView.find('#btn').hide();btnView.find('#week').hide();btnView.find('#placehold').show();
							break
					default: break;
				}
				
			},
			
			changeDateToString = function (date) {
				var date=new Date(date);
				var year=date.getFullYear();
				var month=date.getMonth()+1;
				var day=date.getDate();
				var hour=date.getHours();
				var minute=date.getMinutes();
				var second=date.getSeconds();
				if (parseInt(month)<10) month = "0" + month;
				if (parseInt(day)<10) day = "0" + day;
				if (parseInt(hour)<10) hour = "0" + hour;
				if (parseInt(minute)<10) minute = "0" + minute;
				if (parseInt(second)<10) second = "0" + second;
				return year + "-" +month + "-" +day + " " +hour +":" +minute +":" +second;
			},
		
			div = function (a,b){
				return Math.floor(a / b);
			},
			
			getJulianDay = function (year,month,day){
				return div(new Date(year,month,day,8,1,1) - JULIAN_EPOCH_MILLIS, ONE_DAY_MILLIS);
			},
			
			mod = function (a,b){
				return (a - b * Math.floor(a / b));
			},
			
			pj = function (y, m, d){
				var a = y - 474;
				var b = mod(a, 2820) + 474;
				return (EPOCH - 1) + 1029983 * div(a, 2820) + 365 * (b - 1) + div(682 * b - 110, 2816) + (m > 6? 30 * m + 6: 31 * m) + d;
			},
			
			jp = function (j){
				var a = j - pj(475, 0, 1);
				var b = div(a, 1029983);
				var c = mod(a, 1029983);
				var d = c != 1029982? div(2816 * c + 1031337, 1028522): 2820;
				var year = 474 + 2820 * b + d;
				var f = (1 + j) - pj(year, 0, 1);
				var month = f > 186? Math.ceil((f - 6) / 30) - 1: Math.ceil(f / 31) - 1;
				var day = j - (pj(year, month, 1) - 1);
				return (year << 16) | (month << 8) | day;
			},
			
			y = function (r){
				return r>>16;
			},
			
			m = function (r){
				return (r & 0xff00) >> 8;
			},
			
			d = function (r){
				return (r & 0xff);
			},
			
			getPersianDay = function (year,month,day){
				var julianDay = getJulianDay(year,month,day);
				var r = jp(julianDay);
				var y1 = y(r);
				var m1 = m(r);
				var d1 = d(r);
				y1 = y1 > 0?y1:y1-1;
				var persiaDate = new Object();
				persiaDate.year  = y1;
				persiaDate.month = m1;
				persiaDate.day = d1;
				
				return persiaDate;
			},
			
			setJulianDay = function(julianDay){
				var current = new Date();
				var year = current.getFullYear();
				var month = current.getMonth()+1;
				var day = current.getDate();
				
				var datetimevalue = JULIAN_EPOCH_MILLIS + julianDay * ONE_DAY_MILLIS + mod(new Date(year,month,day,8,1,1) - JULIAN_EPOCH_MILLIS, ONE_DAY_MILLIS);
				current = new Date(datetimevalue);
				var julianDate = new Object();
				julianDate.year  = current.getFullYear();
				julianDate.month = eval(current.getMonth()+1);
				julianDate.day = current.getDate();
				return julianDate;
			},
			
			calendarToPersian = function (datetimeValue){
				var yearValue = datetimeValue.substring(0,4)*1;//Year value
				var monthValue = datetimeValue.substring(5,7)*1;//Month value
				var dayValue =datetimeValue.substring(8,10)*1;//Day value
				
				monthValue -= 1;
				
				var persianDate = getPersianDay(yearValue,monthValue,dayValue);
				
				persianDate.month += 1;
				
				persianDate.month = persianDate.month.toString().length==1?"0"+persianDate.month:persianDate.month;
				persianDate.day = persianDate.day.toString().length==1?"0"+persianDate.day:persianDate.day;
				return persianDate.year+"-"+persianDate.month+"-"+persianDate.day+" "+datetimeValue.substring(11,datetimeValue.length);
			},
			
			calendarToPersianForString = function(datetime) {
				var date_s = changeDateToString(datetime);
				var persian_s = calendarToPersian(date_s);
				return persian_s;
			},
			
			persianToGregorian = function(datetimeValue){
				 var array = new Array();
				 array = datetimeValue.split("-");
				 var persiaYear = datetimeValue.substring(0,4)*1;//Year value
				 var persiaMonth = datetimeValue.substring(5,7)*1;//Month value
				 var persiaDay =datetimeValue.substring(8,10)*1;//Day value
				 
				 persiaMonth -= 1;
				 
				 var julianDay = setJulianDay(pj(persiaYear > 0 ? persiaYear: persiaYear + 1, persiaMonth, persiaDay));
				 julianDay.month = julianDay.month.toString().length==1?"0"+julianDay.month:julianDay.month;
				 julianDay.day = julianDay.day.toString().length==1?"0"+julianDay.day:julianDay.day;
				 return julianDay.year+"-"+julianDay.month+"-"+julianDay.day;
			},
			
			fillHeader = function(type,text){
				var headView = widget.find('.dateperiods-'+type);
				if(type === 'years'){
					headView.find('#headtext').text(text);
					headView.find('#headcont').html('<input type="checkbox" class="input-position"/><span>0xFFFF</span>');
					headView.find('#itemclose').html('<button type="button" data-action="close" class="close" style="padding:0;">&times;</button> ');
				}else{
					headView.find('#headtext').text(text);
					headView.find('#headcont').html('<input type="checkbox" class="input-position"/><span>0xFF</span>');
					headView.find('#itemclose').html('<button type="button" data-action="close" class="close" style="padding:0;">&times;</button> ');
				}
			},
			
			fillData = function(type, col){
				var spans = [],
					index = 0,
					value;
					
				if(type === 'year'){
					var p_today = calendarToPersianForString(new Date());
					var currentYear = parseInt(p_today.split(" ")[0].split("-")[0]),
						row;
					spans.push('<tr><td colspan="5" noWrap="noWrap"><span class="periods-span"><input id="'+type+'" type="checkbox" class="input-position"/>Check All</span></td></tr>');
					while (index < col) {
						if (index%5 === 0) {
							row = $('<tr>');
							spans.push(row);
						}
						row.append('<td noWrap="noWrap"><input type="checkbox" class="input-position" name="'+type+'" value="'+(currentYear+index)+'"/>' + (currentYear+index) + '</td>');
						index++;
					}
				}else{
					if(type!=='hundredth')
						spans.push($('<span>').addClass('periods-span').html('<input id="'+type+'" type="checkbox" class="input-position"/>Check All'));
					while (index<col) {
						if(type === 'month' || type === 'day'){
							value = (index+1)<10?'0'+(index+1):(index+1);
						}else if(type === 'week'){
							value = (index+1)==7?'0':(index+1);
						}else{
							value = index<10?'0'+index:index;
						}
						if(type === 'week'){
							spans.push($('<span>').addClass(type).html('<input type="checkbox" class="input-position" name="'+type+'" value="'+value+'"/>'+ shortWeeks[index]));
						}else{
							spans.push($('<span>').addClass(type).html('<input type="checkbox" class="input-position" name="'+type+'" value="'+value+'"/>'+ value));
						}
						index++;
					}
				}
				return spans;
			},
	
			fillYear = function(){
				fillHeader('years','Year');
				widget.find('.dateperiods-years').find('tbody').empty().append(fillData('year',30));
				checkAll(widget.find('.dateperiods-years').find('#year'),'year');
				checkWildcard(widget.find('.dateperiods-years').find('th').find('input'),'year');
			},
			
			fillMonths = function () {
				fillHeader('months','Month');
				widget.find('.dateperiods-months td').empty().append(fillData('month',12));
				checkAll(widget.find('.dateperiods-months').find('#month'),'month');
				checkWildcard(widget.find('.dateperiods-months').find('th').find('input'),'month');
			},
			
			fillDays = function () {
				fillHeader('days','Day');
				widget.find('.dateperiods-days td').empty().append(fillData('day',31));
				checkAll(widget.find('.dateperiods-days').find('#day'),'day');
				checkWildcard(widget.find('.dateperiods-days').find('th').find('input'),'day');
			},
			
			fillWeeks = function () {
				fillHeader('weeks','Week');
				widget.find('.dateperiods-weeks td').empty().append(fillData('week',7));
				checkAll(widget.find('.dateperiods-weeks').find('#week'),'week');
				checkWildcard(widget.find('.dateperiods-weeks').find('th').find('input'),'week');
			},
			
			fillHours = function () {
				fillHeader('hours','Hour');
				widget.find('.dateperiods-hours td').empty().append(fillData('hour',24));
				checkAll(widget.find('.dateperiods-hours').find('#hour'),'hour');
				checkWildcard(widget.find('.dateperiods-hours').find('th').find('input'),'hour');
			},
			
			fillMinutes = function () {
				fillHeader('minutes','Munite');
				widget.find('.dateperiods-minutes td').empty().append(fillData('minute',60));
				checkAll(widget.find('.dateperiods-minutes').find('#minute'),'minute');
				checkWildcard(widget.find('.dateperiods-minutes').find('th').find('input'),'minute');
			},
			
			fillSeconds = function () {
				fillHeader('seconds','Second');
				widget.find('.dateperiods-seconds td').empty().append(fillData('second',60));
				checkAll(widget.find('.dateperiods-seconds').find('#second'),'second');
				checkWildcard(widget.find('.dateperiods-seconds').find('th').find('input'),'second');
			},
			
			fillHundredths = function () {
				fillHeader('hundredths','Hundredth');
				widget.find('.dateperiods-hundredths td').empty().append(fillData('hundredth',1));
				checkAll(widget.find('.dateperiods-hundredths').find('#hundredth'),'hundredth');
				checkWildcard(widget.find('.dateperiods-hundredths').find('th').find('input'),'hundredth');
			},
			
			updateDays = function(){
				if(!widget) return;
				var m = [];
				widget.find('.dateperiods-months td').find('input[name="month"]:checked').each(function(){
					m.push(parseInt(this.value));								
				});
				if(m.indexOf(1)!=-1 || m.indexOf(2)!=-1 || m.indexOf(3)!=-1 || m.indexOf(4)!=-1 || m.indexOf(5)!=-1 || m.indexOf(6)!=-1){
					widget.find('.dateperiods-days td').find('span').removeClass('span-dispaly');
				}else if(m.indexOf(7)!=-1 || m.indexOf(8)!=-1 || m.indexOf(9)!=-1 || m.indexOf(10)!=-1 || m.indexOf(11)!=-1){
					widget.find('.dateperiods-days td').find('span').removeClass('span-dispaly');
					widget.find('.dateperiods-days td').find('span:eq(31)').addClass('span-dispaly').prop('checked',false);
				}else if(m.indexOf(12)!=-1){
					var ychecked = true;
					widget.find('.dateperiods-years td').find('input[name="year"]:checked').each(function(){
						if(leap.indexOf(parseInt(this.value)) != -1){
							widget.find('.dateperiods-days td').find('span:gt(29)').addClass('span-dispaly').prop('checked',false);
							ychecked = false;
							return;
						}					
					});
					if(ychecked && widget.find('.dateperiods-years td').find('input[name="year"]:checked').length>0){
						widget.find('.dateperiods-days td').find('span:gt(28)').addClass('span-dispaly').prop('checked',false);
					}else{
						widget.find('.dateperiods-days td').find('span:gt(29)').addClass('span-dispaly').prop('checked',false);
					}
				}else{
					widget.find('.dateperiods-days td').find('span').removeClass('span-dispaly');
				}
			},
			
			calWeekByYMD = function(str){
				var datas = str.split(";"),result = '';
				for(var i=0; i<datas.length; i++){
					var data = datas[i].split(",");
					if(data[0]!='0xFFFF' && data[1] != '0xFF' && data[2] != '0xFF'){
						var d = persianToGregorian(data[0]+"-"+data[1]+"-"+data[2]);
						data[3] = new Date(parseInt(d.split('-')[0]),parseInt(d.split('-')[1])-1,parseInt(d.split('-')[2])).getDay() + '';
					}
					result += data+ ";";
				}
				return result.substring(0,result.length-1);
			},
			
			getFinalResult = function(temp){
				var result = '';
				if(temp.length!==0){
					var datas = temp.split(";");
					for(var i=0; i<datas.length; i++){
						var data = datas[i].split(",");
						var old = [].concat(data);
						for(var j=0; j<old.length; j++){
							if(old[j].indexOf('0xFF')==-1){
								for(var k=j+1; k<old.length; k++){
									if(old[k] == '0xFF' && widget.find('.dateperiods-'+viewModes[k]).find('th').find('input:checked').length<1){
										if(viewModes[k] === 'months' || viewModes[k] === 'days'){
											data[k] = '01';
										}else if(viewModes[k] !== 'weeks'){
											data[k] = '00';
										}
										
									}
								}
								break;
							}
						}
						result += data+ ";";
					}
					result = result.substring(0,result.length-1);
				}else{
					result = '';
				}
				return result;
			},
			
			getConfirmDatas = function(){
				if(!widget) return;
				var multiType = '',result = '',len = 1;
				//get maxchecked len and type
				for(var i=0; i<viewModes.length; i++){
					var type = viewModes[i].substring(0,viewModes[i].length-1);
					if(widget.find('td').find('input[name="'+type+'"]:checked').length>1){
						multiType = type;
						len = widget.find('td').find('input[name="'+type+'"]:checked').length;
						break;
					}
				}
				
				for(var j=0; j<len; j++){
					for(var k=0; k<viewModes.length; k++){
						var type = viewModes[k].substring(0,viewModes[k].length-1);
						if(type == multiType){
							widget.find('td').find('input[name="'+type+'"]:checked').each(function(n){
								if(j==n){
									if(result == ''){
										result = $(this).val();
									}else{
										if(type === 'year'){
											result += $(this).val();
										}else{
											result += ','+$(this).val();
										}
									}
								}
							});
						}else{
							if(widget.find('td').find('input[name="'+type+'"]:checked').length>0){
								if(result == ''){
									result = widget.find('td').find('input[name="'+type+'"]:checked').val();
								}else{
									if(type === 'year'){
										result += widget.find('td').find('input[name="'+type+'"]:checked').val();
									}else{
										result += ','+widget.find('td').find('input[name="'+type+'"]:checked').val();
									}
								}
							}else{
								if(result == ''){
									result = '0xFFFF';
								}else{
									if(type === 'year'){
										result += '0xFFFF';
									}else{
										result += ',0xFF';
									}
								}
							}
						}
					}
					result += ";";
				}
				setValue(getFinalResult(calWeekByYMD(result.substring(0,result.length-1))));
			},
			
			/********************************************************************************
             *
             * Widget UI interaction functions
             *
             ********************************************************************************/
            actions = {
				confirm: function () {
					getConfirmDatas();
					hide();
				},
				nextward: function(e) {
					switch($(e.target).parent().text()){
						case 'Month': showMode(1);break;
						case 'Day': showMode(2);break;
						case 'Week': showMode(3);break;
						case 'Hour': showMode(4);break;
						case 'Minute': showMode(5);break;
						case 'Second': showMode(6);break;
						case 'Hundredth': showMode(7);break;
						default: break;
					}
				},
				backward:function(e){
					if(currentViewMode <= viewModes.indexOf(options.viewMode)){
						if(viewModes.indexOf(options.viewMode) == 2)
							currentViewMode = viewModes.indexOf(options.viewMode)+2;
						else
							currentViewMode = viewModes.indexOf(options.viewMode)+1;
					}
					switch(currentViewMode){
						case 1: showMode(-1);break;
						case 2: 
						case 3: showMode(1);break;
						case 4: showMode(preViewMode);break;
						case 5: showMode(4);break;
						case 6: showMode(5);break;
						case 7: showMode(6);break;
						default: break;
					}
				},
				clear: function () {
					widget.find('input').prop('checked',false);
					widget.find('input').prop('disabled',false);
					getConfirmDatas();
				},
				close: function(){
					hide();	
				}
            },
			
			doAction = function (e) {
                if ($(e.currentTarget).is('.disabled')) {
                    return false;
                }
                actions[$(e.currentTarget).data('action')].apply(periods, arguments);
                return false;
            },
			
			setValue = function (value) {
                if (!value) {
					input.val('');
					notifyEvent({
						type: 'dp.change'
					});
					return;
				}
				if (value) {
					input.val(value);
					notifyEvent({
						type: 'dp.change'
					});
				} else {
					input.val('');
					notifyEvent({
						type: 'dp.error'
					});
				}
            },
			
			hide = function () {
				var transitioning = false;
				if (!widget) {
					return periods;
				}
				// Ignore event if in the middle of a periods transition
				widget.find('.collapse').each(function () {
					var collapseData = $(this).data('collapse');
					if (collapseData && collapseData.transitioning) {
						transitioning = true;
						return false;
					}
				});
				if (transitioning) {
					return periods;
				}
				if (component && component.hasClass('btn')) {
					component.toggleClass('active');
				}
				widget.hide();
				
				currentViewMode = Math.max(viewModes.indexOf(options.viewMode), minViewModeNumber);
	
				$(window).off('resize', place);
				widget.off('click', '[data-action]');
				widget.off('mousedown', false);
	
				widget.remove();
				widget = false;
	
				notifyEvent({
					type: 'dp.hide'
				});
				return periods;
            },
			
			show = function () {
				if (input.prop('disabled')|| widget) {
					return periods;
				}
				
				if (input.val().trim().length !== 0){
					setValue(input.val().trim());
				} else if (options.defaultDate) {
					setValue(options.defaultDate);
				}else {
					setValue('0xFFFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF');
				}
	
				widget = getTemplate();

				fillYear();
				fillMonths();
				fillDays();
				fillWeeks();
				fillHours();
				fillMinutes();
				fillSeconds();
				fillHundredths();
				limitMuilCheck();
				showMode();
	
				$(window).on('resize', place);
				widget.on('click', '[data-action]', doAction); // this handles clicks on the widget
				widget.on('mousedown', false);
	
				if (component && component.hasClass('btn')) {
					component.toggleClass('active');
				}
				widget.show();
				place();
	
				if (!input.is(':focus')) {
					input.focus();
				}
	
				notifyEvent({
					type: 'dp.show'
				});
				return periods;
            },
			
			toggle = function () {
                return (widget ? hide() : show());
            },
			
			change = function (e) {
               var val = $(e.target).val().trim();
				setValue(val);
				e.stopImmediatePropagation();
				return false;
            },
			
			keydown = function (e) {
                if (e.keyCode === 27) { // allow escape to hide periods
                    hide();
                }
            },
			
			attachDatePeriodsElementEvents = function () {
                input.on({
                    'change': change,
                    'blur': hide,
                    'keydown': keydown
                });

                if (element.is('input')) {
                    input.on({
                        'focus': show
                    });
                } else if (component) {
                    component.on('click', toggle);
                    component.on('mousedown', false);
                }
            },
			
			detachDatePeriodsElementEvents = function () {
                input.off({
                    'change': change,
                    'blur': hide,
                    'keydown': keydown
                });

                if (element.is('input')) {
                    input.off({
                        'focus': show
                    });
                } else if (component) {
                    component.off('click', toggle);
                    component.off('mousedown', false);
                }
            },
			
			initFormatting = function () {
				minViewModeNumber = 0;
				currentViewMode = Math.max(minViewModeNumber, currentViewMode);
			 };
		  
		/********************************************************************************
         *
         * Public API functions
         * =====================
         *
         * Important: Do not expose direct references to private objects or the options
         * object to the outer world. Always return a clone when returning values or make
         * a clone when setting a private variable.
         *
         ********************************************************************************/
		periods.destroy = function () {
            hide();
            detachDatePeriodsElementEvents();
            element.removeData('DateTimePeriods');
            element.removeData('date');
        };
		 
		periods.toggle = toggle;

        periods.show = show;

        periods.hide = hide;
		 
		periods.disable = function () {
            hide();
            if (component && component.hasClass('btn')) {
                component.addClass('disabled');
            }
            input.prop('disabled', true);
            return periods;
        };
		
		periods.defaultDate = function (defaultDate) {
            if (arguments.length === 0) {
                return options.defaultDate ? options.defaultDate.clone() : options.defaultDate;
            }
            if (!defaultDate) {
                options.defaultDate = false;
                return periods;
            }

            options.defaultDate = defaultDate;

            if (options.defaultDate && input.val().trim() === '') {
                setValue(options.defaultDate);
            }
            return periods;
        };
		
		periods.singleSelection = function(singleSelection){
			if (arguments.length === 0) {
                return options.singleSelection;
            }

            if (typeof singleSelection !== 'boolean') {
                throw new TypeError('singleSelection() expects a boolean parameter');
            }
            options.singleSelection = singleSelection;
            if (widget) {
                hide();
                show();
            }
            return periods;
		};
		
		periods.viewMode = function (newViewMode) {
            if (arguments.length === 0) {
                return options.viewMode;
            }

            if (typeof newViewMode !== 'string') {
                throw new TypeError('viewMode() expects a string parameter');
            }

            if (viewModes.indexOf(newViewMode) === -1) {
                throw new TypeError('viewMode() parameter must be one of (' + viewModes.join(', ') + ') value');
            }

            options.viewMode = newViewMode;
            currentViewMode = Math.max(viewModes.indexOf(newViewMode), minViewModeNumber);

            showMode();
            return periods;
        };
		
		periods.toolbarPlacement = function (toolbarPlacement) {
            if (arguments.length === 0) {
                return options.toolbarPlacement;
            }

            if (typeof toolbarPlacement !== 'string') {
                throw new TypeError('toolbarPlacement() expects a string parameter');
            }
            if (toolbarPlacements.indexOf(toolbarPlacement) === -1) {
                throw new TypeError('toolbarPlacement() parameter must be one of (' + toolbarPlacements.join(', ') + ') value');
            }
            options.toolbarPlacement = toolbarPlacement;

            if (widget) {
                hide();
                show();
            }
            return periods;
        };
		
		periods.showClear = function (showClear) {
            if (arguments.length === 0) {
                return options.showClear;
            }

            if (typeof showClear !== 'boolean') {
                throw new TypeError('showClear() expects a boolean parameter');
            }

            options.showClear = showClear;
            if (widget) {
                hide();
                show();
            }
            return periods;
        };
		
		periods.widgetPositioning = function (widgetPositioning) {
            if (arguments.length === 0) {
                return $.extend({}, options.widgetPositioning);
            }

            if (({}).toString.call(widgetPositioning) !== '[object Object]') {
                throw new TypeError('widgetPositioning() expects an object variable');
            }
            if (widgetPositioning.horizontal) {
                if (typeof widgetPositioning.horizontal !== 'string') {
                    throw new TypeError('widgetPositioning() horizontal variable must be a string');
                }
                widgetPositioning.horizontal = widgetPositioning.horizontal.toLowerCase();
                if (horizontalModes.indexOf(widgetPositioning.horizontal) === -1) {
                    throw new TypeError('widgetPositioning() expects horizontal parameter to be one of (' + horizontalModes.join(', ') + ')');
                }
                options.widgetPositioning.horizontal = widgetPositioning.horizontal;
            }
            if (widgetPositioning.vertical) {
                if (typeof widgetPositioning.vertical !== 'string') {
                    throw new TypeError('widgetPositioning() vertical variable must be a string');
                }
                widgetPositioning.vertical = widgetPositioning.vertical.toLowerCase();
                if (verticalModes.indexOf(widgetPositioning.vertical) === -1) {
                    throw new TypeError('widgetPositioning() expects vertical parameter to be one of (' + verticalModes.join(', ') + ')');
                }
                options.widgetPositioning.vertical = widgetPositioning.vertical;
            }
            return periods;
        };
		
		periods.options = function (newOptions) {
            if (arguments.length === 0) {
                return $.extend(true, {}, options);
            }

            if (!(newOptions instanceof Object)) {
                throw new TypeError('options() options parameter should be an object');
            }
            $.extend(true, options, newOptions);
            $.each(options, function (key, value) {
                if (periods[key] !== undefined) {
                    periods[key](value);
                } else {
                    throw new TypeError('option ' + key + ' is not recognized!');
                }
            });
            return periods;
        };
		 
		// initializing element and component attributes
        if (element.is('input')) {
            input = element;
        } else {

            input = element.find('.dateperiodsinput');
            if (input.size() === 0) {
                input = element.find('input');
            } else if (!input.is('input')) {
                throw new Error('CSS class "dateperiodsinput" cannot be applied to non input element');
            }
        }

        if (element.hasClass('input-group')) {
            // in case there is more then one 'input-group-addon' Issue #48
            if (element.find('.dateperiodsbutton').size() === 0) {
                component = element.find('[class^="input-group-"]');
            } else {
                component = element.find('.dateperiodsbutton');
            }
        }

        if (!input.is('input')) {
            throw new Error('Could not initialize DateTimePeriods without an input element');
        }
		 
		$.extend(true, options, dataToOptions());
		
		periods.options(options);
		
		initFormatting();
		
		attachDatePeriodsElementEvents();
		
		if (input.prop('disabled')) {
            periods.disable();
        }

        if (input.val().trim().length !== 0){
            setValue(input.val().trim());
        } else if (options.defaultDate) {
            setValue(options.defaultDate);
        }
		
		return periods;
	};
	
	
	/********************************************************************************
     *
     * jQuery plugin constructor and defaults object
     *
     ********************************************************************************/

    $.fn.datetimeperiods = function (options) {
        return this.each(function () {
            var $this = $(this);
            if (!$this.data('DateTimePeriods')) {
                options = $.extend(true, {}, $.fn.datetimeperiods.defaults, options);
                $this.data('DateTimePeriods', dateTimePeriods($this, options));
            }
        });
    };
	
	$.fn.datetimeperiods.defaults = {
		defaultDate: false,
		singleSelection: false,
		viewMode: 'years',
		toolbarPlacement: 'default',
		showClear: true,
		widgetPositioning: {
            horizontal: 'auto',
            vertical: 'auto'
        }
	}
	
}));