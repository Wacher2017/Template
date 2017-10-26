/**
 * Created by Mr.wang on 2016-10-31.
 * js常用工具类
 */

/**
 * 方法作用：【格式化时间】
 * 使用方法
 * 示例：
 *      使用方式一：
 *      var now = new Date();
 *      var nowStr = now.dateFormat("yyyy-MM-dd hh:mm:ss");
 *      使用方式二：
 *      new Date().dateFormat("yyyy年MM月dd日");
 *      new Date().dateFormat("MM/dd/yyyy");
 *      new Date().dateFormat("yyyyMMdd");
 *      new Date().dateFormat("yyyy-MM-dd hh:mm:ss");
 * @param format {date} 传入要格式化的日期类型
 * @returns {2016-10-31 16:30:00}
 */
Date.prototype.dateFormat = function (format){
    var o = {
        "M+" : this.getMonth()+1, //month
        "d+" : this.getDate(), //day
        "h+" : this.getHours(), //hour
        "m+" : this.getMinutes(), //minute
        "s+" : this.getSeconds(), //second
        "q+" : Math.floor((this.getMonth()+3)/3), //quarter
        "S" : this.getMilliseconds() //millisecond
    }
    if(/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    }
    for(var k in o) {
        if(new RegExp("("+ k +")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length));
        }
    }
    return format;
}
/**
 * 方法作用：【日期时间加值】
 * 使用方法
 * 示例：
 *      new Date().add("h",5);  增加5小时
 *      new Date().add("y",1)   增加1年
 * @param strInterval {String} 日期时间值类型
 *       's'  秒
 *		 'n'  分钟
 *       'h'  小时
 *		 'd'  日
 *       'w'  星期
 *		 'q'  季度
 *       'm'  月
 *		 'y'  年
 * @param Number {int} 增量值
 * @returns {Date}
 */
Date.prototype.add = function (strInterval, Number) {
    var dtTmp = this;
    switch (strInterval) {
        case 's' :
            return new Date(Date.parse(dtTmp) + (1000 * Number));
        case 'n' :
            return new Date(Date.parse(dtTmp) + (60000 * Number));
        case 'h' :
            return new Date(Date.parse(dtTmp) + (3600000 * Number));
        case 'd' :
            return new Date(Date.parse(dtTmp) + (86400000 * Number));
        case 'w' :
            return new Date(Date.parse(dtTmp) + ((86400000 * 7) * Number));
        case 'q' :
            return new Date(dtTmp.getFullYear(), (dtTmp.getMonth()) + Number * 3, dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds());
        case 'm' :
            return new Date(dtTmp.getFullYear(), (dtTmp.getMonth()) + Number, dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds());
        case 'y' :
            return new Date((dtTmp.getFullYear() + Number), dtTmp.getMonth(), dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds());
    }
}

/***********************************************************************
 *                           日期时间工具类                            *
 *                     注：调用方式，dateUtils.方法名                   *
 * ********************************************************************/
var dateUtils = {
	/**
	 * 方法作用：【获当前日期时间】
	 * 使用方法：dateUtils.curDateTime();
	 * @param 无
	 * @return {Date}
	 */
	curDateTime:function(){
		return new Date();
	},
	/**
	 * 方法作用：【获取日期的年】
	 * 使用方法：dateUtils.getYear();或者dateUtils.getYear(date);
	 * @param {}||{Date}无参默认当前日期时间
	 * @return year
	 */
	getYear:function(date){
		var year = null;
		if(date != null){
			if(date instanceof Date){
				year = date.getFullYear();	
			}else{
				return "Param error,date type!";
			}
		}else{
			year = dateUtils.curDateTime().getFullYear();	
		}
		return year;
	},
	/**
	 * 方法作用：【获取日期的月】
	 * 使用方法：dateUtils.getMonth();或者dateUtils.getMonth(date);
	 * @param {}||{Date}无参默认当前日期时间
	 * @return month
	 */
	getMonth:function(date){
		var month = null;
		if(date != null){
			if(date instanceof Date){
				month = date.getMonth() + 1;	
			}else{
				return "Param error,date type!";
			}
		}else{
			month = dateUtils.curDateTime().getMonth() + 1;	
		}
		return month;
	},
	/**
	 * 方法作用：【获取日期的日】
	 * 使用方法：dateUtils.getDay();或者dateUtils.getDay(date);
	 * @param {}||{Date}无参默认当前日期时间
	 * @return day
	 */
	getDay:function(date){
		var day = null;
		if(date != null){
			if(date instanceof Date){
				day = date.getDate();
			}else{
				return "Param error,date type!";
			}
		}else{
			day = dateUtils.curDateTime().getDate();	
		}
		return day;
	},
	/**
	 * 方法作用：【获取时间的小时】
	 * 使用方法：dateUtils.getHour();或者dateUtils.getHour(date);
	 * @param {}||{Date}无参默认当前日期时间
	 * @return hour
	 */
	getHour:function(date){
		var hour = null;
		if(date != null){
			if(date instanceof Date){
				hour = date.getHours();	
			}else{
				return "Param error,date type!";
			}
		}else{
			hour = dateUtils.curDateTime().getHours();	
		}
		return hour;
	},
	/**
	 * 方法作用：【获取时间的分钟】
	 * 使用方法：dateUtils.getMinute();或者dateUtils.getMinutes(date);
	 * @param {}||{Date}无参默认当前日期时间
	 * @return minute
	 */
	getMinute:function(date){
		var minute = null;
		if(date != null){
			if(date instanceof Date){
				minute = date.getMinutes();	
			}else{
				return "Param error,date type!";
			}
		}else{
			minute = dateUtils.curDateTime().getMinutes();	
		}
		return minute;
	},
	/**
	 * 方法作用：【获取时间的秒】
	 * 使用方法：dateUtils.getSecond();或者dateUtils.getSecond(date);
	 * @param {}||{Date}无参默认当前日期时间
	 * @return second
	 */
	getSecond:function(date){
		var second = null;
		if(date != null){
			if(date instanceof Date){
				second = date.getSeconds();
			}else{
				return "Param error,date type!";
			}
		}else{
			second = dateUtils.curDateTime().getSeconds();	
		}
		return second;
	},
	/**
	 * 方法作用：【判断是否是闰年】
	 * 使用方法：dateUtils.isLeapYear();或者dateUtils.getLeapYear(date);
	 * @param {}||{Date}无参默认当前日期时间
	 * @return {Boolean}
	 */
	isLeapYear:function(date){
		var flag = false;
		if((dateUtils.getYear(date) % 4 == 0 && dateUtils.getYear(date) % 100 != 0) || (dateUtils.getYear(date) % 400 == 0)){
			flag = true;	
		}
		return flag;
	},
	/**
	 * 方法作用：【获取月的最大天数】
	 * 使用方法：dateUtils.getMaxDaysByMonth();或者dateUtils.getMaxDaysByMonth(date);
	 * @param {}||{Date}无参默认当前日期时间
	 * @return days
	 */
	getMaxDaysByMonth:function(date){  
        var days = 31;  
        var month = dateUtils.curDateTime().getMonth() + 1;
		if(date != null){
			if(date instanceof Date){
				month = date.getMonth() + 1;	
			}else{
				return "Param error,date type!";
			}
		}
        switch(month){  
            case 2:  
                if(this.isLeapYear()){  
                    days = 29;  
                }else{  
                    days = 28;  
                }  
                break;  
            case 4:  
            case 6:  
            case 9:  
            case 11:  
                days = 30;  
                break;  
            default:  
                break;  
        }  
        return days;  
    },
    /*
     * 方法作用：【取传入日期是星期几】
     * 使用方法：dateUtils.nowFewWeeks();或者dateUtils.nowFewWeeks(new Date());
     * @param  {}||{Date}无参默认当前日期时间
     * @returns {星期四，...}
     */
    getWeek:function(date){
		var dayNames = new Array("星期天","星期一","星期二","星期三","星期四","星期五","星期六");
		if(date != null){
			if(date instanceof Date){
				return dayNames[date.getDay()];
			} else{
				return "Param error,date type!";
			}
		}else{
			return dayNames[dateUtils.curDateTime().getDay()];	
		}
    },
    /*
     * 方法作用：【字符串转换成日期】
	 * 传入格式：yyyy-mm-dd(2016-10-31)或yyyy-MM-ss hh:mm:ss
     * 使用方法：dateUtils.strTurnDate("2016-11-01");
     * @param str {String}字符串格式的日期
     * @return {Date}由字符串转换成的日期
     */
    strTurnDate:function(str){
		var re = /^(\d{4})\S(\d{1,2})\S(\d{1,2})$/;
        var rel = /^(\d{4})\S(\d{1,2})\S(\d{1,2})\s(\d{1,2})\S(\d{1,2})\S(\d{1,2})$/;
        var dt;
        if(re.test(str)){
            dt = new Date(RegExp.$1,RegExp.$2 - 1,RegExp.$3);
        }else if(rel.test(str)){
			dt = new Date(RegExp.$1,RegExp.$2 - 1,RegExp.$3,RegExp.$4,RegExp.$5,RegExp.$6);
		}
        return dt;
    },
    /*
     * 方法作用：【计算2个日期之间的天数】
     * 传入格式：yyyy-mm-dd(2016-10-31)
     * 使用方法：dateUtils.dayMinus(startDate,endDate);
     * @param startDate {Date}起始日期
     * @param endDate {Date}结束日期
     * @return endDate - startDate的天数差
     */
    dayMinus:function(startDate, endDate){
        if(startDate instanceof Date && endDate instanceof Date){
            var days = Math.floor((endDate-startDate)/(1000 * 60 * 60 * 24));
            return days;
        }else{
            return "Param error,date type!";
        }
    }
};

/***********************************************************************
 *                           字符串操作工具类                          *
 *                     注：调用方式，strUtils.方法名                   *
 * ********************************************************************/
var strUtils = {
    /*
     * 方法作用：【判断字符串是否为空】
	 * 使用方法：strUtils.isEmpty(str)
     * @param str {String}
     * @returns {Boolean}
     */
    isEmpty:function(str){
        if(str != null && str.length > 0){
            return true;
        }else{
            return false;
        }
    },
    /*
     * 方法作用：【判断两个字符串是否相同】
	 * 使用方法：strUtils.isEquals(str1,str2)
     * @param str1 {String}
     * @param str2 {String}
     * @returns {Boolean}
     */
    isEquals:function(str1,str2){
        if(str1==str2){
            return true;
        }else{
            return false;
        }
    },
    /*
     * 方法作用：【忽略大小写判断字符串是否相同】
	 * 使用方法：strUtils.isEqualsIgnorecase(str1,str2)
     * @param str1 {String}
     * @param str2 {String}
     * @returns {Boolean}
     */
    isEqualsIgnorecase:function(str1,str2){
        if(str1.toUpperCase() == str2.toUpperCase()){
            return true;
        }else{
            return false;
        }
    },
    /**
     * 方法作用：【判断是否是数字】
	 * 使用方法：strUtils.isNum(value)
     * @param value {String}
     * @returns {Boolean}
     */
    isNum:function (value){
        if( value != null && value.length>0 && isNaN(value) == false){
            return true;
        }else{
            return false;
        }
    },
    /**
     * 方法作用：【判断是否是中文】
	 * 使用方法：strUtils.isChinese(str)
     * @param str {String}
     * @returns {Boolean}
     */
    isChinese:function(str){
        var reg = /^([u4E00-u9FA5]|[uFE30-uFFA0])*$/;
        if(reg.test(str)){
            return false;
        }
        return true;
    },
	/**
     * 方法作用：【判断字符串长度是否大于指定长度】
	 * 使用方法：strUtils.isValidateMinCols(str,cols)
     * @param str {String},cols {int}
     * @returns {Boolean}
     */
	isValidateMinCols:function(str,cols){  
		if(str.length >= cols){  
			return true;  
		}else{  
			return false;  
		}  
	},
	/**
     * 方法作用：【判断字符串长度是否小于指定长度】
     * 使用方法：strUtils.isValidateMaxCols(str,cols)
     * @param str {String},cols {int}
     * @returns {Boolean}
     */  
	isValidateMaxCols:function(str,cols){  
		if(str.length <= cols){  
			return true;  
		}else{  
			return false;  
		}  
	}, 
	/**
     * 方法作用：【判断字符串长度是否在指定长度范围内】
     * 使用方法：strUtils.isValidateRangeCols(str,min,max)
     * @param str {String},min {int},max {int}
     * @returns {Boolean}
     */  
	isValidateRangeCols:function(str,min,max){  
		if(str.length >= min   
			&& str.length <=max){  
			return true;  
		}else{  
			return false;  
		}  
	}, 
	/**
	 * 方法作用：【去掉字符串前的空格】
	 * 使用方法：strUtils.trimLeft(str)
	 * @param str {String}
	 * @returns {String}
	 */
	trimLeft:function(str){
		return str.replace(/^\s*/g,'');
	},
	/**
	 * 方法作用：【去掉字符串后的空格】
	 * 使用方法：strUtils.trimRight(str)
	 * @param str {String}
	 * @returns {String}
	 */
	trimRight:function(str){
		return str.replace(/\s*$/g,'');
	},
	/**
	 * 方法作用：【去掉字符串前后的空格】
	 * 使用方法：strUtils.trim(str)
	 * @param str {String}
	 * @returns {String}
	 */
	trim:function(str){
		return str.replace(/(^\s*)|(\s*$)/g,'');
	}
};

/***********************************************************************
 *                           加载工具类                                *
 *                     注：调用方式，loadUtils.方法名                   *
 * ********************************************************************/
var loadUtils = {
    /*
     * 方法说明：【动态加载js文件css文件】
     * 使用方法：loadUtils.loadjscssfile("http://libs.baidu.com/jquery/1.9.1/jquery.js","js")
     * @param fileurl 文件路径，
     * @param filetype 文件类型，支持传入类型，js、css
     */
    loadjscssfile:function(fileurl,filetype){
        if(filetype == "js"){
            var fileref = document.createElement('script');
            fileref.setAttribute("type","text/javascript");
            fileref.setAttribute("src",fileurl);
        }else if(filetype == "css"){

            var fileref = document.createElement('link');
            fileref.setAttribute("rel","stylesheet");
            fileref.setAttribute("type","text/css");
            fileref.setAttribute("href",fileurl);
        }
        if(typeof fileref != "undefined"){
            document.getElementsByTagName("head")[0].appendChild(fileref);
        }else{
            alert("loadjscssfile method error!");
        }
    },
	/*
	* 方法说明：【ajax异步操作】
	* 使用方法：loadUtils.ajax(url,function(str){},function(status){})第三个参数可以省略
	* @param url 文件路径，
	* @param fnSuccess 接收信息成功回调方法，返回接收内容
	* @param fnFaild 接收失败回调方法，返回错误信息
	*/
	ajax:function(url,fnSuccess,fnFaild){
		//1.创建Ajax对象
		if(window.XMLHttpRequest){
			var oAjax = new XMLHttpRequest();	
		}else{
			var oAjax = new ActiveXObject("Microsoft.XMLHTTP");	
		}
		//2.连接服务器
		//open(方法，文件名，异步传输)
		oAjax.open('GET', url, true);
		//3.发送请求
		oAjax.send();
		//4.接收返回
		oAjax.onreadystatechange=function(){
			//oAjax.readyState //浏览器和服务器，进行到哪一步了
			if(oAjax.readyState==4){//读取完成
				if(oAjax.status==200){ //成功
					fnSuccess(oAjax.responseText);
				}else{
					if(fnFaild){
						fnFaild(oAjax.status);
					}
				}
			}
		}
	}
};

/***********************************************************************
 *                           cookie工具类                          *
 *                     注：调用方式，cookieUtils.方法名                   *
 * ********************************************************************/
var cookieUtils = {
	/**
	 * 方法作用：【写入cookie,数据保存30天】
	 * 使用方法：cookieUtils.setCookie(name, value)
	 * @param name {String}
	 * @param value {String}
	 */
	setCookie:function(name, value) {
		var Days = 30; //此 cookie 将被保存 30 天
		var exp = new Date();
		exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
		document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
	},
	/**
	 * 方法作用：【删除cookie】
	 * 使用方法：cookieUtils.delCookie(name)
	 * @param name {String}
	 */
	delCookie:function(name) {
		var exp = new Date();
		exp.setTime(exp.getTime() - 1);
		var cval = getCookie(name);
		if (cval != null) 
			document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
	},
	/**
	 * 方法作用：【读取cookie】
	 * 使用方法：cookieUtils.getCookie(name)
	 * @param name {String}
	 */
	getCookie:function(name) {
		var arr = document.cookie.match(new RegExp("(^| )" + name + "=([^;]*)(;|$)"));
		if (arr != null)
			return unescape(arr[2]);
		return null;
	}
};

/***********************************************************************
 *                           验证邮箱工具类                          *
 *                     注：调用方式，emailUtils.方法名                   *
 * ********************************************************************/
var emailUtils = {
	/*
     * 方法说明：【校验邮箱格式】
     * 使用方法：emailUtils.isValidateEmail(email)
     * @param email {String}
     * @return {Boolean}
     */
	isValidateEmail:function(email){  
		var emailPattern = "^(([0-9a-zA-Z]+)|([0-9a-zA-Z]+[_.0-9a-zA-Z-]*[0-9a-zA-Z]+))" +  
					//"@([a-zA-Z0-9-]+[.])+([a-zA-Z]{2}|net|NET|com|COM|gov|GOV|mil" +  
					"@([a-zA-Z0-9-]+[.])+(cn|net|NET|com|COM|gov|GOV|mil" +  
					"|MIL|org|ORG|edu|EDU|int|INT)$"  
		var re = new RegExp(emailPattern);  
		if(re.test(email)){  
			return true;  
		}else{  
			return false;  
		}  
	} 
};