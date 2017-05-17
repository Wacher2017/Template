/**
 * 基于localStorage技术实现缓存对象
 */
var CacheMap = {
  //设置缓存，key：键名  value：值  endtime：过期时间（毫秒）
  "set": function(key, value, endtime) {
    var key = arguments[0] ? arguments[0] : "";
    var value = arguments[1] ? arguments[1] : "";
    var endtime = arguments[2] ? arguments[2] : 60 * 60 * 24 * 15;
    if(key == '') {
      return false;
    }
    if(key && value == '') {
      return CacheMap.del(key);
    }
    if(key && value != '') {
      var saveobj = {
        data: value,
        //time: time(), //保存时间
        etime: time() + endtime
      }
      localStorage.setItem(key, JSON.stringify(saveobj));
      return true;
    }
  },
  //清除缓存
  "clear": function() {
    localStorage.clear();
  },
  //删除指定键名的缓存
  "del": function(key) {
    localStorage.removeItem(key);
  },
  //获取指定键名的缓存
  "get": function(key) {
    var res = eval('(' + localStorage.getItem(key) + ')');
    if(!res) {
      return false;
    }
    if(res.etime < time()) {
      localStorage.removeItem(key);
      return false;
    }
    return res.data;
  },
  //获取所有缓存
  "all": function() {
    var a = new Array();
    for(var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      var res = eval('(' + localStorage.getItem(localStorage.key(i)) + ')');
      if(res.etime < time()) {
        localStorage.removeItem();
      } else {
        a[key] = res.data;
      }
    }
    return a;
  },
  //过期缓存垃圾回收
  "gc": function() {
    var ctime = time();
    for(var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      var res = eval('(' + localStorage.getItem(localStorage.key(i)) + ')');
      if(res.etime < time()) {
        localStorage.removeItem();
      }
    }
  },
  //初始化 可设定缓存过期时间
  "init": function() {
    var s = arguments[0]? arguments[0] : 3;
    s = s * 1000;
    CacheMap.gc();
    setIntercal(function() {
      CacheMap.gc();
    }, s);
  }
}

//获取当前时间戳
function time() {
  return Math.floor(new Date().getTime() / 1000);
}
