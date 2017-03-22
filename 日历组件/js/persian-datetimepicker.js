/**
 @Name : persian.js
 @Author: wang
 @Date: 2016-8-1
 @description datetimepicker
 */
(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        factory(require('jquery'));
    } else {
        if (!jQuery) {
            throw 'bootstrap-datetimepicker requires jQuery to be loaded first';
        }
        factory(jQuery);
    }
}(function($) {
	'use strict';
	var dateTimePicker = function (element, options) {
		var picker = {},
			input,
			unset = true,
			isActive = true,
			component = false,
			widget = false,
			ayear,
			amonth,
			use24Hours,
			yearStep=0,
            minViewModeNumber = 0,
			actualFormat,
			parseFormats,
            currentViewMode,
			datePickerModes = [
                {
                    clsName: 'days',
                    navFnc: 'M',
                    navStep: 1
                },
                {
                    clsName: 'months',
                    navFnc: 'y',
                    navStep: 1
                },
                {
                    clsName: 'years',
                    navFnc: 'y',
                    navStep: 1
                }
            ],
			viewModes = ['days', 'months', 'years'],
			verticalModes = ['top', 'bottom', 'auto'],
			horizontalModes = ['left', 'right', 'auto'],
			toolbarPlacements = ['default', 'top', 'bottom'],
			leap = [1354,1358,1362,1366,1370,1375,1379,1383,1387,1391,1395,1399,1403,1408,1412,1416,1420,1424],
			fullMonth = ['January','February','March','April','May','June','July','August','September','October','November','December'],
			JULIAN_EPOCH_MILLIS = -210866803200000,
			ONE_DAY_MILLIS = 24 * 60* 60 * 1000,
			EPOCH = 1948321,
	
			/********************************************************************************
             * static data
			 * yearsOfSupport  Each group 12
             * weekOfPerMonth  [year month 1 week]
             * start:1354  end:1425
             ********************************************************************************/
			 yearsOfSupport = function(){
				 var result = new Array(),index=0;
				 var temp = new Array();
				 for(var k = 1354; k < 1426; k++){
					 temp.push(k);
					 index++;
					 if(index>11){
						index=0;
						result.push(temp);
						temp = new Array();
					 }
				 }
				 return result;
			 },
			 
			 weekOfPerMonth = function(){
				var result = new Array(),week = 6,
					isleap = [1354,1358,1362,1366,1370,1375,1379,1383,1387,1391,1395,1399,1403,1408,1412,1416];
				for(var k = 1354; k < 1420; k++){
					for(var i = 0; i < 12; i++){
						if(i<6){
							var temp = new Array();
							temp.push(k);
							temp.push(i+1);
							temp.push(1);
							temp.push(week);
							result.push(temp);
							for(var j = 0; j < 31; j++){
								week++;
								if(week>6){
									week = 0;
								}
							}
						}else{
							if(isleap.indexOf(k) == -1 && i == 11){
								var temp = new Array();
								temp.push(k);
								temp.push(i+1);
								temp.push(1);
								temp.push(week);
								result.push(temp);
								for(var j = 0; j < 29; j++){
									week++;
									if(week>6){
										week = 0;
									}
								}
							}else{
								var temp = new Array();
								temp.push(k);
								temp.push(i+1);
								temp.push(1);
								temp.push(week);
								result.push(temp);
								for(var j = 0; j < 30; j++){
									week++;
									if(week>6){
										week = 0;
									}
								}
							}	
						}
					}
				}
				return result;
			},
			
			/********************************************************************************
             *
             * Private functions
             *
             ********************************************************************************/
            isEnabled = function (granularity) {
                if (typeof granularity !== 'string' || granularity.length > 1) {
                    throw new TypeError('isEnabled expects a single character string parameter');
                }
                switch (granularity) {
                    case 'y':
                        return actualFormat.indexOf('Y') !== -1;
                    case 'M':
                        return actualFormat.indexOf('M') !== -1;
                    case 'd':
                        return actualFormat.toLowerCase().indexOf('d') !== -1;
                    case 'h':
                    case 'H':
                        return actualFormat.toLowerCase().indexOf('h') !== -1;
                    case 'm':
                        return actualFormat.indexOf('m') !== -1;
                    case 's':
                        return actualFormat.indexOf('s') !== -1;
                    default:
                        return false;
                }
            },

            hasTime = function () {
                return (isEnabled('h') || isEnabled('m') || isEnabled('s'));
            },

            hasDate = function () {
                return (isEnabled('y') || isEnabled('M') || isEnabled('d'));
            },
			
			getDatePickerTemplate = function () {
                var headTemplate = $('<thead>')
                        .append($('<tr>')
                            .append($('<th>').addClass('prev').attr('data-action', 'previous')
                                .append($('<span>').addClass(options.icons.previous))
                                )
                            .append($('<th>').addClass('picker-switch').attr('data-action', 'pickerSwitch').attr('colspan', (options.calendarWeeks ? '6' : '5')))
                            .append($('<th>').addClass('next').attr('data-action', 'next')
                                .append($('<span>').addClass(options.icons.next))
                                )
                            ),
                    contTemplate = $('<tbody>')
                        .append($('<tr>')
                            .append($('<td>').attr('colspan', (options.calendarWeeks ? '8' : '7')))
                            );

                return [
                    $('<div>').addClass('datepicker-days')
                        .append($('<table>').addClass('table-condensed')
                            .append(headTemplate)
                            .append($('<tbody>'))
                            ),
                    $('<div>').addClass('datepicker-months')
                        .append($('<table>').addClass('table-condensed')
                            .append(headTemplate.clone())
                            .append(contTemplate.clone())
                            ),
                    $('<div>').addClass('datepicker-years')
                        .append($('<table>').addClass('table-condensed')
                            .append(headTemplate.clone())
                            .append(contTemplate.clone())
                            )
                ];
            },
			
			getTimePickerMainTemplate = function () {
                var topRow = $('<tr>'),
                    middleRow = $('<tr>'),
                    bottomRow = $('<tr>');

                if (isEnabled('h')) {
                    topRow.append($('<td>')
                        .append($('<a>').attr('href', '#').addClass('btn').attr('data-action', 'incrementHours')
                            .append($('<span>').addClass(options.icons.up))));
                    middleRow.append($('<td>')
                        .append($('<span>').addClass('timepicker-hour').attr('data-time-component', 'hours').attr('data-action', 'showHours')));
                    bottomRow.append($('<td>')
                        .append($('<a>').attr('href', '#').addClass('btn').attr('data-action', 'decrementHours')
                            .append($('<span>').addClass(options.icons.down))));
                }
                if (isEnabled('m')) {
                    if (isEnabled('h')) {
                        topRow.append($('<td>').addClass('separator'));
                        middleRow.append($('<td>').addClass('separator').html(':'));
                        bottomRow.append($('<td>').addClass('separator'));
                    }
                    topRow.append($('<td>')
                        .append($('<a>').attr('href', '#').addClass('btn').attr('data-action', 'incrementMinutes')
                            .append($('<span>').addClass(options.icons.up))));
                    middleRow.append($('<td>')
                        .append($('<span>').addClass('timepicker-minute').attr('data-time-component', 'minutes').attr('data-action', 'showMinutes')));
                    bottomRow.append($('<td>')
                        .append($('<a>').attr('href', '#').addClass('btn').attr('data-action', 'decrementMinutes')
                            .append($('<span>').addClass(options.icons.down))));
                }
                if (isEnabled('s')) {
                    if (isEnabled('m')) {
                        topRow.append($('<td>').addClass('separator'));
                        middleRow.append($('<td>').addClass('separator').html(':'));
                        bottomRow.append($('<td>').addClass('separator'));
                    }
                    topRow.append($('<td>')
                        .append($('<a>').attr('href', '#').addClass('btn').attr('data-action', 'incrementSeconds')
                            .append($('<span>').addClass(options.icons.up))));
                    middleRow.append($('<td>')
                        .append($('<span>').addClass('timepicker-second').attr('data-time-component', 'seconds').attr('data-action', 'showSeconds')));
                    bottomRow.append($('<td>')
                        .append($('<a>').attr('href', '#').addClass('btn').attr('data-action', 'decrementSeconds')
                            .append($('<span>').addClass(options.icons.down))));
                }

                if (!use24Hours) {
                    topRow.append($('<td>').addClass('separator'));
                    middleRow.append($('<td>')
                        .append($('<button>').addClass('btn btn-primary').attr('data-action', 'togglePeriod')));
                    bottomRow.append($('<td>').addClass('separator'));
                }

                return $('<div>').addClass('timepicker-picker')
                    .append($('<table>').addClass('table-condensed')
                        .append([topRow, middleRow, bottomRow]));
            },

            getTimePickerTemplate = function () {
                var hoursView = $('<div>').addClass('timepicker-hours')
                        .append($('<table>').addClass('table-condensed')),
                    minutesView = $('<div>').addClass('timepicker-minutes')
                        .append($('<table>').addClass('table-condensed')),
                    secondsView = $('<div>').addClass('timepicker-seconds')
                        .append($('<table>').addClass('table-condensed')),
                    ret = [getTimePickerMainTemplate()];

                if (isEnabled('h')) {
                    ret.push(hoursView);
                }
                if (isEnabled('m')) {
                    ret.push(minutesView);
                }
                if (isEnabled('s')) {
                    ret.push(secondsView);
                }

                return ret;
            },
			
			getToolbar = function () {
                var row = [];
                if (options.showTodayButton) {
                    row.push($('<td>').append($('<a>').attr('data-action', 'today').append($('<span>').addClass(options.icons.today))));
                }
                if (!options.sideBySide && hasDate() && hasTime()) {
                    row.push($('<td>').append($('<a>').attr('data-action', 'togglePicker').append($('<span>').addClass(options.icons.time))));
                }
                if (options.showConfirm) {
                    row.push($('<td>').append($('<a>').attr('data-action', 'confirm').append($('<span>').addClass(options.icons.confirm))));
                }
                if (options.showClear) {
                    row.push($('<td>').append($('<a>').attr('data-action', 'clear').append($('<span>').addClass(options.icons.clear))));
                }
                return $('<table>').addClass('table-condensed').append($('<tbody>').append($('<tr>').append(row)));
            },
			
			getTemplate = function () {
                var template = $('<div>').addClass('bootstrap-datetimepicker-widget dropdown-menu'),
                    dateView = $('<div>').addClass('datepicker').append(getDatePickerTemplate()),
                    timeView = $('<div>').addClass('timepicker').append(getTimePickerTemplate()),
                    content = $('<ul>').addClass('list-unstyled'),
                    toolbar = $('<li>').addClass('picker-switch' + (options.collapse ? ' accordion-toggle' : '')).append(getToolbar());
					
				if (use24Hours) {
                    template.addClass('usetwentyfour');
                }
				
				if (options.sideBySide && hasDate() && hasTime()) {
                    template.addClass('timepicker-sbs');
                    template.append(
                        $('<div>').addClass('row')
                            .append(dateView.addClass('col-sm-6'))
                            .append(timeView.addClass('col-sm-6'))
                    );
                    template.append(toolbar);
                    return template;
                }

                if (options.toolbarPlacement === 'top') {
                    content.append(toolbar);
                }
                if (hasDate()) {
                    content.append($('<li>').addClass((options.collapse && hasTime() ? 'collapse in' : '')).append(dateView));
                }
                if (options.toolbarPlacement === 'default') {
                    content.append(toolbar);
                }
                if (hasTime()) {
                    content.append($('<li>').addClass((options.collapse && hasDate() ? 'collapse' : '')).append(timeView));
                }
                if (options.toolbarPlacement === 'bottom') {
                    content.append(toolbar);
                }

                return template.append(content);
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
                    throw new Error('datetimepicker component should be placed within a relative positioned container');
                }

                widget.css({
                    top: vertical === 'top' ? 'auto' : offset.top + element.outerHeight(),
                    bottom: vertical === 'top' ? offset.top + element.outerHeight() : 'auto',
                    left: horizontal === 'left' ? parent.css('padding-left') : 'auto',
                    right: horizontal === 'left' ? 'auto' : parent.css('padding-right')
                });
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
			
			today = new Date(),
			
			p_today = calendarToPersianForString(new Date()),
			
			year = p_today.split(" ")[0].split("-")[0],
			
			month = p_today.split(" ")[0].split("-")[1],
			
			date = p_today.split(" ")[0].split("-")[2],
			
			hour = p_today.split(" ")[1].split(":")[0],
			
			minute = p_today.split(" ")[1].split(":")[1],
			
			second = p_today.split(" ")[1].split(":")[2],

            notifyEvent = function (e) {
                if (e.type === 'dp.change') {
                    return;
                }
                element.trigger(e);
            },

            showMode = function (dir) {
                if (!widget) {
                    return;
                }
                if (dir) {
                    currentViewMode = Math.max(minViewModeNumber, Math.min(2, currentViewMode + dir));
                }
                widget.find('.datepicker > div').hide().filter('.datepicker-' + datePickerModes[currentViewMode].clsName).show();
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
			
			fillDow = function () {
                var row = $('<tr>'),
					weeksShort = ['Sa','Su','Mo','Tu','We','Th','Fr'];

                if (options.calendarWeeks === true) {
                    row.append($('<th>').addClass('cw').text('#'));
                }
				
				for(var i = 0; i < weeksShort.length; i++){
					 row.append($('<th>').addClass('dow').text(weeksShort[i]));
				}

                widget.find('.datepicker-days thead').append(row);
            },
			
			fillMonths = function () {
                var spans = [],
                    monthsShort = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
					
				for(var i = 0; i < monthsShort.length; i++){
					 spans.push($('<span>').attr('data-action', 'selectMonth').addClass('month').text(monthsShort[i]));
				}
                widget.find('.datepicker-months td').empty().append(spans);
            },
			
			updateMonths = function (y) {
                var monthsView = widget.find('.datepicker-months'),
                    monthsViewHeader = monthsView.find('th'),
                    months = monthsView.find('tbody').find('span');

                monthsView.find('.disabled').removeClass('disabled');
				
				if (options.minDate && parseInt(options.minDate.split(" ")[0].split("-")[0])==parseInt(y)) {
                    monthsViewHeader.eq(0).addClass('disabled');
                }

                monthsViewHeader.eq(1).text(y);

                if (options.maxDate && parseInt(options.maxDate.split(" ")[0].split("-")[0])==parseInt(y)) {
                    monthsViewHeader.eq(2).addClass('disabled');
                }
				
				months.removeClass('active');
                months.eq(month-1).addClass('active');
				
				months.each(function (index) {
                    if (options.minDate && parseInt(options.minDate.split(" ")[0].split("-")[0])==parseInt(y) && (index+1)<parseInt(options.minDate.split(" ")[0].split("-")[1])) {
                        $(this).addClass('disabled');
                    }
					if (options.maxDate && parseInt(options.maxDate.split(" ")[0].split("-")[0])==parseInt(y) && (index+1)>parseInt(options.maxDate.split(" ")[0].split("-")[1])) {
                        $(this).addClass('disabled');
                    }
                });
            },

            updateYears = function (value,target,mode) {
                var yearsView = widget.find('.datepicker-years'),
                    yearsViewHeader = yearsView.find('th'),
                    html = '';

				if(arguments.length === 3 && mode == 't' && target == 'years'){
					yearStep = parseInt(yearStep) + parseInt(value);
					if(yearStep < 0) yearStep = 0;
					if(yearStep > 5) yearStep = 5;
				}else{
					for(var i=0; i<yearsOfSupport().length; i++){
						if(yearsOfSupport()[i].indexOf(parseInt(year)) != -1){
							yearStep = i;
							break;
						}
					}
				}
				
                yearsView.find('.disabled').removeClass('disabled');
				if (options.minDate && yearsOfSupport()[yearStep][0]<=parseInt(options.minDate.split(" ")[0].split("-")[0]) && yearsOfSupport()[yearStep][11]>=parseInt(options.minDate.split(" ")[0].split("-")[0])) {
                    yearsViewHeader.eq(0).addClass('disabled');
                }

                yearsViewHeader.eq(1).text(yearsOfSupport()[yearStep][0]+"-"+yearsOfSupport()[yearStep][11]);

                if (options.maxDate && yearsOfSupport()[yearStep][0]<=parseInt(options.maxDate.split(" ")[0].split("-")[0]) && yearsOfSupport()[yearStep][11]>=parseInt(options.maxDate.split(" ")[0].split("-")[0])) {
                    yearsViewHeader.eq(2).addClass('disabled');
                }
               
				for(var j=0; j<yearsOfSupport()[yearStep].length; j++){
					html += '<span data-action="selectYear" class="year' + (yearsOfSupport()[yearStep][j]==year ? ' active' : '');
					if (options.minDate && yearsOfSupport()[yearStep][j]<parseInt(options.minDate.split(" ")[0].split("-")[0])) {
						html += ' disabled';
					}
					if (options.maxDate && yearsOfSupport()[yearStep][j]>parseInt(options.maxDate.split(" ")[0].split("-")[0])) {
						html += ' disabled';
					}
					html += '">' + yearsOfSupport()[yearStep][j] + '</span>';
				}
                yearsView.find('td').html(html);
            },
			
			fillDate = function (value,target,mode) {
                var daysView = widget.find('.datepicker-days'),
                    daysViewHeader = daysView.find('th'),
					firstWeekOfMonth,
					weekday = 0,
					index = 0,
					nextIndext = 0,
                    html = [],
                    row,
					clsName;
				
                if (!hasDate()) {
                    return;
                }
				
				if(arguments.length === 3){
					if(mode == 's'){
						switch(target){
							case 'y': year = value;break;
							case 'm': month = (value+1)<10?'0'+(value+1):(value+1);break;
							case 'od': {month = parseInt(month)-1; if(month<=0){month = 12; year = parseInt(year)-1;} month = month<10?'0'+month:month; date = value; break;}
							case 'nd': {month = parseInt(month)+1; if(month>12){month = 1; year = parseInt(year)+1;} month = month<10?'0'+month:month; date = value; break;}
						}
					}else if(mode == 't' && target == 'days'){
						isActive = false;
						if((parseInt(month)+parseInt(value))>12){
							year = parseInt(year)+parseInt(value);
							month = (parseInt(month)+parseInt(value))-12;
						}else if((parseInt(month)+parseInt(value))<1){
							year = parseInt(year)+parseInt(value);
							month = 12-(parseInt(month)+parseInt(value));
						}else{
							year = parseInt(year);
							month = parseInt(month)+parseInt(value);
						}
						month = month<10?'0'+month:month;
						if(ayear == year && amonth == month){
							isActive = true;
						}
					}else if(arguments.length === 3 && mode == 't' && target == 'months'){
						year = parseInt(year)+parseInt(value);
					}
				}
				
                daysView.find('.disabled').removeClass('disabled');
                daysViewHeader.eq(1).text(fullMonth[month-1] + ' ' + year);
				
				if (options.minDate && 
					parseInt(options.minDate.split(" ")[0].split("-")[0])==parseInt(year) && parseInt(options.minDate.split(" ")[0].split("-")[1])>=parseInt(month)) {
                    daysViewHeader.eq(0).addClass('disabled');
                }
                if (options.maxDate && 
					parseInt(options.maxDate.split(" ")[0].split("-")[0])==parseInt(year) && parseInt(options.maxDate.split(" ")[0].split("-")[1])<=parseInt(month)) {
                    daysViewHeader.eq(2).addClass('disabled');
                }
				
				var daysOfMonth = parseInt(month)<7?31:leap.indexOf(parseInt(year)) == -1&&parseInt(month) == 12?29:30,
					predaysOfMonth = (parseInt(month)-1)==0&&leap.indexOf(parseInt(year)-1) == -1?29:(parseInt(month)-1)<7&&(parseInt(month)-1)!=0?31:30;
				
				for(var w=0; w<weekOfPerMonth().length; w++){
					if(weekOfPerMonth()[w][0]==year && weekOfPerMonth()[w][1]==month){
						firstWeekOfMonth = weekOfPerMonth()[w][3];
					}
				}
				//var firstWeekOfMonth = parseInt(weekOfWeek)-(date%7-1)<0?parseInt(weekOfWeek)-(date%7-1)+7:parseInt(weekOfWeek)-(date%7-1);
				var preStep = firstWeekOfMonth-1;
				for(var i = 0; i < 42; i++){
					if(i<firstWeekOfMonth){
						if (weekday === 0) {
							row = $('<tr>');
							html.push(row);
						}
						weekday++;
						if(weekday == 7){
							weekday = 0;
						}
						clsName = ' old';
                    	row.append('<td data-action="selectDay" class="day' + clsName + '">' + (predaysOfMonth-(preStep--)) + '</td>');
					}else if((i-firstWeekOfMonth)>(daysOfMonth-1)){
						//if(i==35) break;
						if (weekday === 0) {
							row = $('<tr>');
							html.push(row);
						}
						weekday++;
						if(weekday == 7){
							weekday = 0;
						}
						nextIndext++;
						clsName = ' new';
						row.append('<td data-action="selectDay" class="day' + clsName + '">' + nextIndext + '</td>');
					}else{
						index++;
						if (weekday === 0) {
							row = $('<tr>');
							html.push(row);
						}
						weekday++;
						if(weekday == 7){
							weekday = 0;
						}
						clsName = '';
						if (p_today.split(" ")[0].split("-")[2] == index && p_today.split(" ")[0].split("-")[1]==month && p_today.split(" ")[0].split("-")[0]) {
							clsName += ' today';
						}
						if(options.minDate && parseInt(options.minDate.split(" ")[0].split("-")[0])==parseInt(year) && parseInt(options.minDate.split(" ")[0].split("-")[1])==parseInt(month) &&  parseInt(options.minDate.split(" ")[0].split("-")[2])>index){
							clsName += ' disabled';
						}
						if(options.maxDate && parseInt(options.maxDate.split(" ")[0].split("-")[0])==parseInt(year) && parseInt(options.maxDate.split(" ")[0].split("-")[1])==parseInt(month) &&  parseInt(options.maxDate.split(" ")[0].split("-")[2])<index){
							clsName += ' disabled';
						}
						if (date == index && isActive == true && !unset) {
							ayear = year;
							amonth = month;
							clsName += ' active';
						}
                    	row.append('<td data-action="selectDay" class="day' + clsName + '">' + index + '</td>');
					}
				}
				
                daysView.find('tbody').empty().append(html);
				
				updateMonths(year);

                updateYears(value,target,mode);
            },
			
			fillHours = function () {
                var table = widget.find('.timepicker-hours table'),
                    html = [],
					k = 0,
                    row = $('<tr>');

                if (!use24Hours) {
                    for(var i = 0; i < 12; i++){
						if (i % 4 === 0) {
							row = $('<tr>');
							html.push(row);
						}
						if(i == 0) k =12;
						else k = i;
						row.append('<td data-action="selectHour" class="hour">' + (k<10?'0'+k:k) + '</td>');
					}
                }else{
                    for(var i = 0; i < 24; i++){
						if (i % 4 === 0) {
							row = $('<tr>');
							html.push(row);
						}
						row.append('<td data-action="selectHour" class="hour">' + (i<10?'0'+i:i) + '</td>');
					}
                }
               
                table.empty().append(html);
            },
			
			fillMinutes = function () {
                var table = widget.find('.timepicker-minutes table'),
                    html = [],
					i = 0,
                    row = $('<tr>');

                while(i < 60){
                    if (i % 20 === 0) {
                        row = $('<tr>');
                        html.push(row);
                    }
                    row.append('<td data-action="selectMinute" class="minute">' + (i<10?'0'+i:i) + '</td>');
					i = i+5;
                }
                table.empty().append(html);
            },

            fillSeconds = function () {
                var table = widget.find('.timepicker-seconds table'),
                    html = [],
					i = 0,
                    row = $('<tr>');

                while(i < 60){
                    if (i % 20 === 0) {
                        row = $('<tr>');
                        html.push(row);
                    }
                    row.append('<td data-action="selectSecond" class="second">' + (i<10?'0'+i:i) + '</td>');
					i = i+5;
                }

                table.empty().append(html);
            },

            fillTime = function () {
                var timeComponents = widget.find('.timepicker span[data-time-component]');
                if (!use24Hours) {
                    widget.find('.timepicker [data-action=togglePeriod]').text(today.format('A'));
                }
                timeComponents.filter('[data-time-component=hours]').text(today.format(use24Hours ? 'HH' : 'hh'));
                timeComponents.filter('[data-time-component=minutes]').text(today.format('mm'));
                timeComponents.filter('[data-time-component=seconds]').text(today.format('ss'));

                fillHours();
                fillMinutes();
                fillSeconds();
            },
			
			update = function () {
                if (!widget) {
                    return;
                }
                fillDate();
                fillTime();
            },
			
			/********************************************************************************
             *
             * Widget UI interaction functions
             *
             ********************************************************************************/
            actions = {
				next: function () {
					var step = datePickerModes[currentViewMode].navStep, 
						cls = datePickerModes[currentViewMode].clsName;
                    fillDate(step,cls,'t');
                },

                previous: function () {
					var step = -datePickerModes[currentViewMode].navStep, 
						cls = datePickerModes[currentViewMode].clsName;
                    fillDate(step,cls,'t');
                },
				
				incrementHours: function () {
                    setValue(1,'h');
                },

                incrementMinutes: function () {
                    setValue(1,'mm');
                },

                incrementSeconds: function () {
                    setValue(1,'s');
                },

                decrementHours: function () {
                    setValue(-1,'h');
                },

                decrementMinutes: function () {
                    setValue(-1,'mm');
                },

                decrementSeconds: function () {
                    setValue(-1,'s');
                },
				
				pickerSwitch: function () {
                    showMode(1);
                },
				
				selectYear: function (e) {
                    var year = parseInt($(e.target).text(), 10) || 0;
                    if (currentViewMode === minViewModeNumber) {
                        setValue(year,'y');
                        fillDate(year,'y','s');
                        hide();
                    }
                    showMode(-1);
                    fillDate(year,'y','s');
                },
				
				selectMonth: function (e) {
                    var month = $(e.target).closest('tbody').find('span').index($(e.target));
                    if (currentViewMode === minViewModeNumber) {
                        setValue(parseInt(month)+1,'tm');
                        fillDate(month,'m','s');
                        hide();
                    }
                    showMode(-1);
                    fillDate(month,'m','s');
                },
				
				selectDay: function (e) {
					if ($(e.target).is('.old')) {
                        fillDate(parseInt($(e.target).text(), 10),'od','s');
                    }
                    if ($(e.target).is('.new')) {
                       fillDate(parseInt($(e.target).text(), 10),'nd','s');
                    }
					isActive = true;
					date = parseInt($(e.target).text(), 10);
                    setValue(parseInt($(e.target).text(), 10),'d');
                    if (!hasTime() && !options.keepOpen) {
                        hide();
                    }
                },
				
				togglePeriod: function () {
                    setValue((today.getHours() >= 12) ? today.getHours()-12 : today.getHours()+12, 'bth');
                },
                
                togglePicker: function (e) {
                    var $this = $(e.target),
                        $parent = $this.closest('ul'),
                        expanded = $parent.find('.in'),
                        closed = $parent.find('.collapse:not(.in)'),
                        collapseData;

                    if (expanded && expanded.length) {
                        collapseData = expanded.data('collapse');
                        if (collapseData && collapseData.transitioning) {
                            return;
                        }
                        expanded.collapse('hide');
                        closed.collapse('show');
                        if ($this.is('span')) {
                            $this.toggleClass(options.icons.time + ' ' + options.icons.date);
                        } else {
                            $this.find('span').toggleClass(options.icons.time + ' ' + options.icons.date);
                        }
                    }
                },

                showPicker: function () {
                    widget.find('.timepicker > div:not(.timepicker-picker)').hide();
                    widget.find('.timepicker .timepicker-picker').show();
                },

                showHours: function () {
                    widget.find('.timepicker .timepicker-picker').hide();
                    widget.find('.timepicker .timepicker-hours').show();
                },

                showMinutes: function () {
                    widget.find('.timepicker .timepicker-picker').hide();
                    widget.find('.timepicker .timepicker-minutes').show();
                },

                showSeconds: function () {
                    widget.find('.timepicker .timepicker-picker').hide();
                    widget.find('.timepicker .timepicker-seconds').show();
                },

                selectHour: function (e) {
                    var h = parseInt($(e.target).text(), 10);
                    if (!use24Hours) {
                        if (today.getHours() >= 12) {
                            if (h !== 12) {
                                h += 12;
                            }
                        } else {
                            if (h === 12) {
                                h = 0;
                            }
                        }
                    }
                    setValue(h+'','sh');
                    actions.showPicker.call(picker);
                },

                selectMinute: function (e) {
                    setValue($(e.target).text(),'sm');
                    actions.showPicker.call(picker);
                },

                selectSecond: function (e) {
                    setValue($(e.target).text(),'ss');
                    actions.showPicker.call(picker);
                },

                clear: function () {
                    setValue(null);
                },

                today: function () {
					isActive = true;
					year = p_today.split(" ")[0].split("-")[0];
					month = p_today.split(" ")[0].split("-")[1];
					date = p_today.split(" ")[0].split("-")[2];
					hour = p_today.split(" ")[1].split(":")[0];
					minute = p_today.split(" ")[1].split(":")[1];
					second = p_today.split(" ")[1].split(":")[2];
                    setValue(p_today);
                },
                
                confirm: function () {
                	 hide();
                }
            },
			
			doAction = function (e) {
                if ($(e.currentTarget).is('.disabled')) {
                    return false;
                }
                actions[$(e.currentTarget).data('action')].apply(picker, arguments);
                return false;
            },
			
			setValue = function (targetMoment,target) {
                var oldDate = unset ? null : p_today;
                // case of calling setValue(null or false)
                if (!targetMoment) {
                    unset = true;
                    input.val('');
                    element.data('date', '');
                    notifyEvent({
                        type: 'dp.change',
                        date: null,
                        oldDate: oldDate
                    });
                    update();
                    return;
                }
                if (targetMoment) {
					if(target){
						switch(target){
							case 'y': targetMoment = targetMoment+"-"+
													(parseInt(month)<10?'0'+parseInt(month):parseInt(month))+"-"+
													(parseInt(date)<10?'0'+parseInt(date):parseInt(date))+" "+
													(today.getHours()<10?'0'+today.getHours():today.getHours())+":"+
													(today.getMinutes()<10?'0'+today.getMinutes():today.getMinutes())+":"+
													(today.getSeconds()<10?'0'+today.getSeconds():today.getSeconds());
										break;
							case 'm': targetMoment = year+"-"+
													(targetMoment<10?'0'+targetMoment:targetMoment)+"-"+
													(parseInt(date)<10?'0'+parseInt(date):parseInt(date))+" "+
													(today.getHours()<10?'0'+today.getHours():today.getHours())+":"+
													(today.getMinutes()<10?'0'+today.getMinutes():today.getMinutes())+":"+
													(today.getSeconds()<10?'0'+today.getSeconds():today.getSeconds());
										break;
							case 'd': targetMoment = year+"-"+
													(parseInt(month)<10?'0'+parseInt(month):parseInt(month))+"-"+
													(targetMoment<10?'0'+targetMoment:targetMoment)+" "+
													(today.getHours()<10?'0'+today.getHours():today.getHours())+":"+
													(today.getMinutes()<10?'0'+today.getMinutes():today.getMinutes())+":"+
													(today.getSeconds()<10?'0'+today.getSeconds():today.getSeconds());
										break;
							case 'h': today.setHours(today.getHours()+targetMoment);
									  var h =today.getHours(); 
									  if(actualFormat=='hh:mm:ss') h = parseInt(today.format(actualFormat).toString().split(":")[0]);
									  else if(actualFormat=='YYYY-MM-DD hh:mm:ss' || actualFormat=='yyyy-MM-dd hh:mm:ss') h = parseInt(today.format(actualFormat).toString().split(" ")[1].split(":")[0]);
									  targetMoment = year+"-"+
												    (parseInt(month)<10?'0'+parseInt(month):parseInt(month))+"-"+
												    (parseInt(date)<10?'0'+parseInt(date):parseInt(date))+" "+
												    (h<10?'0'+h:h)+":"+
													(today.getMinutes()<10?'0'+today.getMinutes():today.getMinutes())+":"+
													(today.getSeconds()<10?'0'+today.getSeconds():today.getSeconds());
									  break;
							case 'mm': today.setMinutes(today.getMinutes()+targetMoment); 
									   var mm =today.getMinutes(); 
									   targetMoment = year+"-"+
									   				(parseInt(month)<10?'0'+parseInt(month):parseInt(month))+"-"+
													(parseInt(date)<10?'0'+parseInt(date):parseInt(date))+" "+
													(today.getHours()<10?'0'+today.getHours():today.getHours())+":"+
													(mm<10?'0'+mm:mm)+":"+
													(today.getSeconds()<10?'0'+today.getSeconds():today.getSeconds());
									  break;
							case 's': today.setSeconds(today.getSeconds()+targetMoment); 
									  var s =today.getSeconds(); 
									  targetMoment = year+"-"+
									  				(parseInt(month)<10?'0'+parseInt(month):parseInt(month))+"-"+
													(parseInt(date)<10?'0'+parseInt(date):parseInt(date))+" "+
													(today.getHours()<10?'0'+today.getHours():today.getHours())+":"+
													(today.getMinutes()<10?'0'+today.getMinutes():today.getMinutes())+":"+
													(s<10?'0'+s:s);
									  break;
							case 'sh': today.setHours(parseInt(targetMoment)); 
									  var h =today.getHours(); 
									  if(actualFormat=='hh:mm:ss') h = parseInt(today.format(actualFormat).toString().split(":")[0]);
									  else if(actualFormat=='YYYY-MM-DD hh:mm:ss' || actualFormat=='yyyy-MM-dd hh:mm:ss') h = parseInt(today.format(actualFormat).toString().split(" ")[1].split(":")[0]);
									  targetMoment = year+"-"+
												    (parseInt(month)<10?'0'+parseInt(month):parseInt(month))+"-"+
												    (parseInt(date)<10?'0'+parseInt(date):parseInt(date))+" "+
												    (h<10?'0'+h:h)+":"+
													(today.getMinutes()<10?'0'+today.getMinutes():today.getMinutes())+":"+
													(today.getSeconds()<10?'0'+today.getSeconds():today.getSeconds());
									  break;
							case 'sm': today.setMinutes(parseInt(targetMoment)); 
									   var mm =today.getMinutes(); 
									   targetMoment = year+"-"+
									   				(parseInt(month)<10?'0'+parseInt(month):parseInt(month))+"-"+
													(parseInt(date)<10?'0'+parseInt(date):parseInt(date))+" "+
													(today.getHours()<10?'0'+today.getHours():today.getHours())+":"+
													(mm<10?'0'+mm:mm)+":"+
													(today.getSeconds()<10?'0'+today.getSeconds():today.getSeconds());
									  break;
							case 'ss': today.setSeconds(parseInt(targetMoment)); 
									  var s =today.getSeconds(); 
									  targetMoment = year+"-"+
									  				(parseInt(month)<10?'0'+parseInt(month):parseInt(month))+"-"+
													(parseInt(date)<10?'0'+parseInt(date):parseInt(date))+" "+
													(today.getHours()<10?'0'+today.getHours():today.getHours())+":"+
													(today.getMinutes()<10?'0'+today.getMinutes():today.getMinutes())+":"+
													(s<10?'0'+s:s);
									  break;
							case 'bth': today.setHours(targetMoment); 
									  var h = (today.getHours() >= 12) ? today.getHours()-12 : today.getHours();
									  targetMoment = year+"-"+
												    (parseInt(month)<10?'0'+parseInt(month):parseInt(month))+"-"+
												    (parseInt(date)<10?'0'+parseInt(date):parseInt(date))+" "+
												    (h<10?'0'+h:h)+":"+
													(today.getMinutes()<10?'0'+today.getMinutes():today.getMinutes())+":"+
													(today.getSeconds()<10?'0'+today.getSeconds():today.getSeconds());
									  break;
							case 'tm': targetMoment = year+"-"+
										(targetMoment<10?'0'+targetMoment:targetMoment);
									  break;
						}
					}
				
					if(actualFormat){
						if(actualFormat.indexOf('a') != -1 || actualFormat.indexOf('A') != -1){
							targetMoment = targetMoment.split(" ")[0]+" "+today.format(actualFormat).split(" ")[1]+" "+today.format(actualFormat).split(" ")[2];
						}else if(actualFormat=='YYYY-MM-DD'||actualFormat=='yyyy-MM-dd'){
							targetMoment = targetMoment.split(" ")[0];
						}else if(actualFormat=='YYYY/MM/DD'||actualFormat=='yyyy/MM/dd'){
							targetMoment = targetMoment.split(" ")[0].replace(/\-/g,"\/");
						}else if(actualFormat=='hh:mm:ss'||actualFormat=='HH:mm:ss'){
							targetMoment = targetMoment.split(" ")[1];
						}else if(actualFormat=='YYYY/MM/DD hh:mm:ss'||actualFormat=='YYYY/MM/DD HH:mm:ss'||
								 actualFormat=='yyyy/MM/dd hh:mm:ss'||actualFormat=='yyyy/MM/dd HH:mm:ss'){
							targetMoment = targetMoment.split(" ")[0].replace(/\-/g,"\/")+" "+targetMoment.split(" ")[1];
						}else if(actualFormat=='YYYY-MM-DD 00:00:00'||actualFormat=='yyyy-MM-yy 00:00:00'){
							targetMoment = targetMoment.split(" ")[0] + ' 00:00:00';
						}else if(actualFormat=='YYYY/MM-/DD 00:00:00'||actualFormat=='yyyy/MM/yy 00:00:00'){
							targetMoment = targetMoment.split(" ")[0].replace(/\-/g,"\/") + ' 00:00:00';
						}else if(actualFormat=='YYYY-MM'||actualFormat=='yyyy-MM'){
							targetMoment = targetMoment.split(" ")[0].substring(0,7);
						}else if(actualFormat=='YYYY/MM'||actualFormat=='yyyy/MM'){
							targetMoment = targetMoment.split(" ")[0].replace(/\-/g,"\/").substring(0,7);
						}else if(actualFormat=='YYYY'||actualFormat=='yyyy'){
							targetMoment = targetMoment.split(" ")[0].replace(/\-/g,"\/").substring(0,4);
						}else{
							targetMoment = targetMoment;
						}
					}
                    input.val(targetMoment);
                    element.data('date', targetMoment);
                    update();
                    unset = false;
                    notifyEvent({
                        type: 'dp.change',
                        date: targetMoment,
                        oldDate: oldDate
                    });
                } else {
                    input.val(unset ? '' : p_today);
                    notifyEvent({
                        type: 'dp.error',
                        date: targetMoment
                    });
                }
            },
			
			hide = function () {
				var transitioning = false;
                if (!widget) {
                    return picker;
                }
                // Ignore event if in the middle of a picker transition
                widget.find('.collapse').each(function () {
                    var collapseData = $(this).data('collapse');
                    if (collapseData && collapseData.transitioning) {
                        transitioning = true;
                        return false;
                    }
                });
                if (transitioning) {
                    return picker;
                }
                if (component && component.hasClass('btn')) {
                    component.toggleClass('active');
                }
                widget.hide();

                $(window).off('resize', place);
                widget.off('click', '[data-action]');
                widget.off('mousedown', false);

                widget.remove();
                widget = false;

                notifyEvent({
                    type: 'dp.hide',
                    date: new Date()
                });
                return picker;
            },
			
			show = function () {
				var currentMoment;
				
				if (input.prop('disabled') || widget) {
                    return picker;
                }
				
				 if (unset) {
                    currentMoment = p_today;
                    setValue(currentMoment);
                }
				
				widget = getTemplate();
				
				fillDow();
				fillMonths();
				
				widget.find('.timepicker-hours').hide();
                widget.find('.timepicker-minutes').hide();
                widget.find('.timepicker-seconds').hide();

                update();
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
                return picker;
            },
			
			toggle = function () {
                return (widget ? hide() : show());
            },
			
			change = function (e) {
                var val = $(e.target).val().trim(),
                    parsedDate = val ? val : null;
                setValue(parsedDate);
                e.stopImmediatePropagation();
                return false;
            },
			
			keydown = function (e) {
                if (e.keyCode === 27) { // allow escape to hide picker
                    hide();
                }
            },
			
			attachDatePickerElementEvents = function () {
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
			
			detachDatePickerElementEvents = function () {
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
                var format = options.format || 'DD/MM/YYYY h:mm A';

                actualFormat = format.replace(/(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g, function (input) {
                    return calendarToPersianForString(new Date(input)) || input;
                });

                parseFormats = options.extraFormats ? options.extraFormats.slice() : [];
                if (parseFormats.indexOf(format) < 0 && parseFormats.indexOf(actualFormat) < 0) {
                    parseFormats.push(actualFormat);
                }

                use24Hours = (actualFormat.toLowerCase().indexOf('a') < 1 && actualFormat.indexOf('h') < 1);

                if (isEnabled('y')) {
                    minViewModeNumber = 2;
                }
                if (isEnabled('M')) {
                    minViewModeNumber = 1;
                }
                if (isEnabled('d')) {
                    minViewModeNumber = 0;
                }

                currentViewMode = Math.max(minViewModeNumber, currentViewMode);

                if (!unset) {
                    setValue(p_today);
                }
            };
		
		Date.prototype.format=function(fmt) {           
			var o = {           
			"h+" : this.getHours()%12 == 0 ? 12 : this.getHours()%12,       
			"H+" : this.getHours(),
			"m+" : this.getMinutes(),          
			"s+" : this.getSeconds(),                
			"S" : this.getMilliseconds(),
			"a+" : this.getHours()>12?"PM":"AM",
			"A+" : this.getHours()>12?"PM":"AM"
			};            
			for(var k in o){           
				if(new RegExp("("+ k +")").test(fmt)){           
					fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));           
				}           
			}           
			return fmt;           
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
		picker.destroy = function () {
            hide();
            detachDatePickerElementEvents();
            element.removeData('DateTimePicker');
            element.removeData('date');
        };
		 
		picker.toggle = toggle;

        picker.show = show;

        picker.hide = hide;
		 
		picker.disable = function () {
            hide();
            if (component && component.hasClass('btn')) {
                component.addClass('disabled');
            }
            input.prop('disabled', true);
            return picker;
        };
		
		picker.format = function (newFormat) {
            if (arguments.length === 0) {
                return options.format;
            }

            if ((typeof newFormat !== 'string') && ((typeof newFormat !== 'boolean') || (newFormat !== false))) {
                throw new TypeError('format() expects a sting or boolean:false parameter ' + newFormat);
            }

            options.format = newFormat;
            if (actualFormat) {
                initFormatting(); // reinit formatting
            }
            return picker;
        };
		
		picker.extraFormats = function (formats) {
            if (arguments.length === 0) {
                return options.extraFormats;
            }

            if (formats !== false && !(formats instanceof Array)) {
                throw new TypeError('extraFormats() expects an array or false parameter');
            }

            options.extraFormats = formats;
            if (parseFormats) {
                initFormatting(); // reinit formatting
            }
            return picker;
        };
		
		picker.defaultDate = function (defaultDate) {
            if (arguments.length === 0) {
                return options.defaultDate;
            }
            if (!defaultDate) {
                options.defaultDate = false;
                return picker;
            }
			
            options.defaultDate = options.defaultDate;

            if (options.defaultDate && input.val().trim() === '') {
                setValue(calendarToPersianForString(options.defaultDate));
            }
            return picker;
        };
		
		picker.collapse = function (collapse) {
            if (arguments.length === 0) {
                return options.collapse;
            }

            if (typeof collapse !== 'boolean') {
                throw new TypeError('collapse() expects a boolean parameter');
            }
            if (options.collapse === collapse) {
                return picker;
            }
            options.collapse = collapse;
            if (widget) {
                hide();
                show();
            }
            return picker;
        };
		
		picker.maxDate = function (date) {
            if (arguments.length === 0) {
                return options.maxDate;
            }

            if ((typeof date === 'boolean') && date === false) {
                options.maxDate = false;
                update();
                return picker;
            }
			
            //if (options.minDate && options.maxDate.getTime()<options.minDate.getTime()) {
                //throw new TypeError('maxDate date parameter is before minDate!');
           // }
            options.maxDate = calendarToPersianForString(options.maxDate);
            
            update();
            return picker;
        };

        picker.minDate = function (date) {
            if (arguments.length === 0) {
                return options.minDate;
            }

            if ((typeof date === 'boolean') && date === false) {
                options.minDate = false;
                update();
                return picker;
            }

            //if (options.maxDate && options.minDate.getTime()>options.maxDate.getTime()) {
                //throw new TypeError('minDate date parameter is after maxDate!');
			//}
            options.minDate = calendarToPersianForString(options.minDate);
			
            update();
            return picker;
        };
		
		picker.icons = function (icons) {
            if (arguments.length === 0) {
                return $.extend({}, options.icons);
            }

            if (!(icons instanceof Object)) {
                throw new TypeError('icons() expects parameter to be an Object');
            }
            $.extend(options.icons, icons);
            if (widget) {
                hide();
                show();
            }
            return picker;
        };
		
		picker.widgetPositioning = function (widgetPositioning) {
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
            update();
            return picker;
        };
		
		picker.widgetParent = function (widgetParent) {
            if (arguments.length === 0) {
                return options.widgetParent;
            }

            if (typeof widgetParent === 'string') {
                widgetParent = $(widgetParent);
            }

            if (widgetParent !== null && (typeof widgetParent !== 'string' && !(widgetParent instanceof jQuery))) {
                throw new TypeError('widgetParent() expects a string or a jQuery object parameter');
            }

            options.widgetParent = widgetParent;
            if (widget) {
                hide();
                show();
            }
            return picker;
        };
		
		picker.calendarWeeks = function (showCalendarWeeks) {
            if (arguments.length === 0) {
                return options.calendarWeeks;
            }

            if (typeof showCalendarWeeks !== 'boolean') {
                throw new TypeError('calendarWeeks() expects parameter to be a boolean value');
            }

            options.calendarWeeks = showCalendarWeeks;
            update();
            return picker;
        };
		
		picker.sideBySide = function (sideBySide) {
            if (arguments.length === 0) {
                return options.sideBySide;
            }

            if (typeof sideBySide !== 'boolean') {
                throw new TypeError('sideBySide() expects a boolean parameter');
            }
            options.sideBySide = sideBySide;
            if (widget) {
                hide();
                show();
            }
            return picker;
        };
		
		picker.viewMode = function (newViewMode) {
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
            return picker;
        };
		
		picker.showTodayButton = function (showTodayButton) {
            if (arguments.length === 0) {
                return options.showTodayButton;
            }

            if (typeof showTodayButton !== 'boolean') {
                throw new TypeError('showTodayButton() expects a boolean parameter');
            }

            options.showTodayButton = showTodayButton;
            if (widget) {
                hide();
                show();
            }
            return picker;
        };
        
        picker.showConfirm = function (showConfirm) {
            if (arguments.length === 0) {
                return options.showConfirm;
            }

            if (typeof showConfirm !== 'boolean') {
                throw new TypeError('showConfirm() expects a boolean parameter');
            }

            options.showConfirm = showConfirm;
            if (widget) {
                hide();
                show();
            }
            return picker;
        };

        picker.showClear = function (showClear) {
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
            return picker;
        };
		
		picker.toolbarPlacement = function (toolbarPlacement) {
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
            return picker;
        };
		
		picker.options = function (newOptions) {
            if (arguments.length === 0) {
                return $.extend(true, {}, options);
            }

            if (!(newOptions instanceof Object)) {
                throw new TypeError('options() options parameter should be an object');
            }
            $.extend(true, options, newOptions);
            $.each(options, function (key, value) {
                if (picker[key] !== undefined) {
                    picker[key](value);
                } else {
                    throw new TypeError('option ' + key + ' is not recognized!');
                }
            });
            return picker;
        };
		
		picker.keepOpen = function (keepOpen) {
            if (arguments.length === 0) {
                return options.format;
            }

            if (typeof keepOpen !== 'boolean') {
                throw new TypeError('keepOpen() expects a boolean parameter');
            }

            options.keepOpen = keepOpen;
            return picker;
        };
		 
		// initializing element and component attributes
        if (element.is('input')) {
            input = element;
        } else {
            input = element.find('.datepickerinput');
            if (input.size() === 0) {
                input = element.find('input');
            } else if (!input.is('input')) {
                throw new Error('CSS class "datepickerinput" cannot be applied to non input element');
            }
        }

        if (element.hasClass('input-group')) {
            // in case there is more then one 'input-group-addon' Issue #48
            if (element.find('.datepickerbutton').size() === 0) {
                component = element.find('[class^="input-group-"]');
            } else {
                component = element.find('.datepickerbutton');
            }
        }

        if (!input.is('input')) {
            throw new Error('Could not initialize DateTimePicker without an input element');
        }
		 
		$.extend(true, options, dataToOptions());
		
		picker.options(options);
		
		initFormatting();
		
		attachDatePickerElementEvents();
		
		if (input.prop('disabled')) {
            picker.disable();
        }

        if (input.val().trim().length !== 0) {
            setValue(input.val().trim());
        } else if (options.defaultDate) {
            setValue(calendarToPersianForString(options.defaultDate));
        }
		
		return picker;
	}
	
	
	/********************************************************************************
     *
     * jQuery plugin constructor and defaults object
     *
     ********************************************************************************/

    $.fn.datetimepicker = function (options) {
        return this.each(function () {
            var $this = $(this);
            if (!$this.data('DateTimePicker')) {
                options = $.extend(true, {}, $.fn.datetimepicker.defaults, options);
                $this.data('DateTimePicker', dateTimePicker($this, options));
            }
        });
    };
	
	$.fn.datetimepicker.defaults = {
		format: false,
        extraFormats: false,
		defaultDate: false,
		collapse: true,
		minDate: false,
        maxDate: false,
		icons: {
            time: 'glyphicon glyphicon-time',
            date: 'glyphicon glyphicon-calendar',
            up: 'glyphicon glyphicon-chevron-up',
            down: 'glyphicon glyphicon-chevron-down',
            previous: 'glyphicon glyphicon-chevron-left',
            next: 'glyphicon glyphicon-chevron-right',
            today: 'glyphicon glyphicon-screenshot',
            confirm: 'glyphicon glyphicon-ok',
            clear: 'glyphicon glyphicon-trash'
        },
		calendarWeeks: false,
		sideBySide: false,
		viewMode: 'days',
		showTodayButton: false,
        showConfirm: false,
        showClear: false,
		toolbarPlacement: 'default',
		widgetPositioning: {
            horizontal: 'auto',
            vertical: 'auto'
        },
		widgetParent: null,
		keepOpen: false
	}
	
}));