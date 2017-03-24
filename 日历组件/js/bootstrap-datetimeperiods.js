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
      ponitWeeks = ['Every','1st','2nd','3rd','4th','The last but one','The last'],
			viewModes = ['years', 'months', 'days', 'weeks', 'hours', 'minutes', 'seconds', 'hundredths'],
			verticalModes = ['top', 'bottom', 'auto'],
			horizontalModes = ['left', 'right', 'auto'],
			toolbarPlacements = ['default', 'top', 'bottom'],

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
						widget.find('.dateperiods-'+type+'s').find('td').find("input[id!='weekEvery']").prop('checked', false);
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
				widget.find('.dateperiods-'+type+'s').find('td').find("input[type='checkbox'][value!='"+value+"']:checked").prop("checked", false);
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
        if(td.find('input[name="year"]:checked').length && td.find('input[name="month"]:checked').length){
          widget.find('.dateperiods-weeks').find("input[type='radio']").prop("disabled", true);
        }else{
          widget.find('.dateperiods-weeks').find("input[type='radio']").prop("disabled", false);
        }
        if(td.find('input[name="week"][type="checkbox"]:checked').length || td.find('input[name="week"][id="weekEvery"]:checked').length){
          widget.find('.dateperiods-weeks').find('#hint').hide();
        }
				// if(td.find('input[name="day"]:checked').length){
				// 	widget.find('.dateperiods-weeks').find("input").prop("disabled", true);
				// } else if(td.find('input[name="week"][id!="weekEvery"]:checked').length){
				// 	widget.find('.dateperiods-days').find("input").prop("disabled", true);
				// } else {
        //   widget.find('.dateperiods-weeks').find("input[id!='week']").prop("disabled", false);
        //   widget.find('.dateperiods-days').find("input[id!='day']").prop("disabled", false);
        // }
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
					var currentYear = new Date().getFullYear(),
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
          if(type === 'week'){
            for (var i = 0; i < ponitWeeks.length; i++) {
              if(ponitWeeks[i] === 'The last but one'){
                spans.push($('<span>').addClass('lastweekbutx').html('<input type="radio" class="input-position" name="'+type+'" value="'+(i+1000)+'"/>'+ ponitWeeks[i]));
              }else if(ponitWeeks[i] === 'The last'){
                spans.push($('<span>').addClass('lastweek').html('<input type="radio" class="input-position" name="'+type+'" value="'+(i+1000)+'"/>'+ ponitWeeks[i]));
              } else if(ponitWeeks[i] === 'Every'){
                spans.push($('<span>').addClass('pointweek').html('<input id="weekEvery" type="radio" class="input-position" name="'+type+'" value="'+(i+100)+'" checked/>'+ ponitWeeks[i]));
              }else{
                spans.push($('<span>').addClass('pointweek').html('<input type="radio" class="input-position" name="'+type+'" value="'+(i+1000)+'"/>'+ ponitWeeks[i]));
              }
            }
            spans.push($('<span>').attr('id', 'hint').addClass('periods periods-span').html('Please select the following week!'));
          }
          if(type!=='hundredth'){
            spans.push($('<span>').addClass('periods-span').html('<input id="'+type+'" type="checkbox" class="input-position"/>Check All'));
          }
					while (index<col) {
						if(type === 'month' || type === 'day'){
							value = (index+1)<10?'0'+(index+1):(index+1);
						}else if(type === 'week'){
							value = index+1;
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
          if(type === 'day'){
            spans.push($('<span>').addClass('pointday').html('<input type="checkbox" class="input-position" name="'+type+'" value="0xFD"/>0xFD'));
            spans.push($('<span>').addClass('pointday').html('<input type="checkbox" class="input-position" name="'+type+'" value="0xFE"/>0xFE'));
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
				if(m.indexOf(1)!=-1 || m.indexOf(3)!=-1 || m.indexOf(5)!=-1 || m.indexOf(7)!=-1 || m.indexOf(8)!=-1 || m.indexOf(10)!=-1 || m.indexOf(12)!=-1){
					widget.find('.dateperiods-days td').find('span').removeClass('span-dispaly');
				}else if(m.indexOf(4)!=-1 || m.indexOf(6)!=-1 || m.indexOf(9)!=-1 || m.indexOf(11)!=-1){
					widget.find('.dateperiods-days td').find('span').removeClass('span-dispaly');
					widget.find('.dateperiods-days td').find('span:eq(31)').addClass('span-dispaly').prop('checked',false);
				}else if(m.indexOf(2)!=-1){
					var ychecked = false;
          widget.find('.dateperiods-days td').find('span').removeClass('span-dispaly');
					widget.find('.dateperiods-years td').find('input[name="year"]:checked').each(function(){
						if(isLeapYear(parseInt(this.value))){
							ychecked = true;
							return;
						}
					});
					if(ychecked || widget.find('.dateperiods-years td').find('input[name="year"]:checked').length==0){
            widget.find('.dateperiods-days td').find('span:gt(29):lt(2)').addClass('span-dispaly').prop('checked',false);
					}else{
						widget.find('.dateperiods-days td').find('span:gt(28):lt(3)').addClass('span-dispaly').prop('checked',false);
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
						data[3] = new Date(parseInt(data[0]),parseInt(data[1])-1,parseInt(data[2])).getDay() + '';
					}
					result += data+ ";";
				}
				return result.substring(0,result.length-1);
			},

			getFinalResult = function(temp){
				var result = '', rstemp = '', lastSel = 0;
				if(temp.length!==0){
					var datas = temp.split(";");
          if(widget.find('td').find('input[type="radio"][name="week"][id!="weekEvery"]:checked').length){
            for(var i=0; i<datas.length; i++){
    					var data = datas[i].split(",");
    					if(data[0]=='0xFFFF' || data[1] == '0xFF'){
                switch(parseInt(widget.find('td').find('input[type="radio"][name="week"]:checked').val())){
                  case 1001:data[2] = "01";break;
                  case 1002:data[2] = "08";break;
                  case 1003:data[2] = "15";break;
                  case 1004:data[2] = "22";break;
                  case 1005:data[2] = "0xFD";break;
                  case 1006:data[2] = "0xFE";break;
                  defaut:break;
                }
    					}
    					rstemp += data+ ";";
    				}
            rstemp = rstemp.substring(0,rstemp.length-1);
            datas = [];
            datas = rstemp.split(";");
          }
          for(var i=0; i<viewModes.length; i++){
            var type = viewModes[i].substring(0,viewModes[i].length-1);
            if(widget.find('td').find('input[type="checkbox"][name="'+type+'"]:checked').length){
              lastSel = i;
            }
          }
					for(var i=0; i<datas.length; i++){
						var data = datas[i].split(",");
						var old = [].concat(data);
            for(var k=(lastSel+1); k<old.length; k++){
              if(old[k] == '0xFF' && widget.find('.dateperiods-'+viewModes[k]).find('th').find('input:checked').length<1){
                if(viewModes[k] === 'months' || viewModes[k] === 'days'){
                  data[k] = '01';
                }else if(viewModes[k] !== 'weeks'){
                  data[k] = '00';
                }
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
					if(widget.find('td').find('input[type="checkbox"][name="'+type+'"]:checked').length>1){
						multiType = type;
						len = widget.find('td').find('input[type="checkbox"][name="'+type+'"]:checked').length;
						break;
					}
				}
				for(var j=0; j<len; j++){
					for(var k=0; k<viewModes.length; k++){
						var type = viewModes[k].substring(0,viewModes[k].length-1);
						if(type == multiType){
							widget.find('td').find('input[type="checkbox"][name="'+type+'"]:checked').each(function(n){
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
							if(widget.find('td').find('input[type="checkbox"][name="'+type+'"]:checked').length>0){
								if(result == ''){
									result = widget.find('td').find('input[type="checkbox"][name="'+type+'"]:checked').val();
								}else{
									if(type === 'year'){
										result += widget.find('td').find('input[type="checkbox"][name="'+type+'"]:checked').val();
									}else{
										result += ','+widget.find('td').find('input[type="checkbox"][name="'+type+'"]:checked').val();
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
						case 'Week': widget.find('.dateperiods-weeks').find('#hint').hide();
                        showMode(3);break;
						case 'Hour': if(widget.find('td').find('input[name="week"][type="radio"][id!="weekEvery"]:checked').length &&
                            widget.find('td').find('input[name="week"][type="checkbox"]:checked').length == 0){
                           widget.find('.dateperiods-weeks').find('#hint').show();
                           break;
                         }else{
                           showMode(4);break;
                         }
						case 'Minute': showMode(5);break;
						case 'Second': showMode(6);break;
						case 'Hundredth': showMode(7);break;
						default: break;
					}
				},
				backward:function(e){
          //Return to remove the current panel options
          if(currentViewMode > 0){
              switch(currentViewMode){
    						case 1: widget.find('.dateperiods-months').find("input").prop('checked', false);break;
    						case 2: widget.find('.dateperiods-days').find("input").prop('checked', false);break;
    						case 3: widget.find('.dateperiods-weeks').find("input").prop('checked', false);
                        widget.find('.dateperiods-weeks').find("input[id='weekEvery']").prop('checked', true);
                        widget.find('.dateperiods-weeks').find('#hint').hide();
                        break;
    						case 4: widget.find('.dateperiods-hours').find("input").prop('checked', false);break;
    						case 5: widget.find('.dateperiods-minutes').find("input").prop('checked', false);break;
    						case 6: widget.find('.dateperiods-seconds').find("input").prop('checked', false);break;
    						case 7: widget.find('.dateperiods-hundredths').find("input").prop('checked', false);break;
    						default: break;
    					}
          }
          //Return to disable the check all
          if(!options.singleSelection)
            widget.find('td').find('span[class="periods-span"]').find("input").prop("disabled", false);
          for(var i=0; i<viewModes.length; i++){
  					var type = viewModes[i].substring(0,viewModes[i].length-1);
  					if(widget.find('td').find('input[name="'+type+'"]:checked').length>1){
  							disabledCheckAll(i);
  					}
  				}
          //show the current panel
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
