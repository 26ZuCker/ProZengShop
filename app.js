//app.js
var Bmob=require("utils/Bmob-2.2.3.min.js");
Bmob.initialize("0ee1861c5009c0e9", "170125");

App({
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    wx.cloud.init({
      traceUser: true,
    })
  },
  getUserInfo:function(cb){
    var that = this
  },
  globalData:{
    userInfo:null
  }
})