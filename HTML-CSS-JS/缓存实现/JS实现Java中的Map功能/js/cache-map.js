/**
 * js实现java中的map功能，从而可以在前端作为缓存使用
 */
var CacheMap = {
  _entrys: new Array(),
  //存储map键值对， key的类型为String， value类型任意
  put: function(key, value) {
    if(key == null || key == undefined) {
      return false;
    }
    var index = CacheMap._getIndex(key);
    if(index == -1) {
      var entry = new Object();
      entry.key = key;
      entry.value = value;
      this._entrys[this._entrys.length] = entry;
    } else {
      this._entrys[index].value = value;
    }
  },
  //根据键名获取值
  get: function(key) {
    var index = CacheMap._getIndex(key);
    return (index != -1) ? this._entrys[index].value : null;
  },
  //移除指定键名的对象
  remove: function(key){
    var index = CacheMap._getIndex(key);
    if(index != -1) {
      this._entrys.splice(index, 1);
    }
  },
  //清除所有对象
  clear: function() {
    this._entrys.length = 0;
  },
  //对象是否包含指定键名
  contains: function(key) {
    var index = CacheMap._getIndex(key);
    return (index != -1) ? true : false;
  },
  //获取对象的长度，即保存对象的个数
  getCount: function() {
    return this._entrys.length;
  },
  //获取容器中的对象数据集
  getEntrys: function() {
    return this._entrys;
  },
  //获取指定键名的索引值
  _getIndex: function(key) {
    if(key == null || key == undefined) {
      return -1;
    }
    var _length = this._entrys.length;
    for(var i = 0; i < _length; i++) {
      var entry = this._entrys[i];
      if(entry == null || entry == undefined) {
        continue;
      }
      if(entry.key === key) {
        return i;
      }
    }
    return -1;
  }
}
