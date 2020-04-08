const app = getApp()
// pages/center/index.js
import Notify from "../../dist/notify/notify";
var Bmob = require("../../utils/Bmob-2.2.3.min.js");
Page({
  data:{
    loading: true,
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    activeName: [0],
    checked: true,
    status: "",
    getId:false,
    myAddr:[]
  },
  onChangeA(event) {
    //let myId=wx.getStorageSync('openId');
    if(!this.data.getId){
      this.showNotify();
    }
    else{
      const { key } = event.currentTarget.dataset;
      this.setData({
      [key]: event.detail
    });
    }
  },
  changeSta:function(){
    if(this.data.checked){
      this.setData({ 
        status: "默认地址"
      });
    }
    else{
      this.setData({ 
        status: ""
      });
    }
  },
  showNotify(){
    Notify({ type: 'danger', message: '请先登录' });
  },
  onLoad:function(options){
    //初始化地址信息
    //页面初始化 options为页面跳转所带来的参数
    this.getID();
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
    //var that = this;
    //var value = wx.getStorageSync('openid')
    //if (value) {
      //var u = Bmob.Object.extend("_User");
      //var query = new Bmob.Query(u);
    //  const query =Bmob.Query("_User");
    //  query.equalTo("openid","==" ,value);
    //  query.find({
    //    success: function (results) {
    //      that.setData({    
    //        userInfo: results[0],
    //      })  
    //    },
    //    error: function (error) {
    //    }
    //  });
   // }
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    
    // 页面显示
   if(this.getID){
    this.getAddr();
   }
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  },

  cart:function(){
    wx.switchTab({ 
      url: '../cart/index' 
    })
  },

  sale: function () {
    //let myId=wx.getStorageSync('openId');
    if(!this.data.getId){
      this.showNotify();
    }
    else{
      wx.navigateTo({
        url: '../sale/sale'
      })
    }
  },
  toaddress : function(e){
    const objectId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `../addr/index?objectId=${objectId}`
    })
  },
  setInfo:function (e) {
    wx.setStorageSync('userInfo', e.detail.userInfo);
    const query = Bmob.Query('user');
    query.equalTo("openId","==", wx.getStorageSync('openId'));
    query.find().then(res => {
      if(Object.keys(res).length===0){
        query.set("openId",wx.getStorageSync('openId'))
        query.set("userPic", e.detail.userInfo.avatarUrl)
        query.set("city", e.detail.userInfo.city)
        query.set("country",e.detail.userInfo.country)
        query.set("gender",e.detail.userInfo.gender)
        query.set("nickName",e.detail.userInfo.nickName)
        query.set("province",e.detail.userInfo.province)
        query.save().then(res => {
          console.log(res+"保存成功")
        }).catch(err => {
          console.log(err)
        })
      }
    });
  },
  getUserInfo: function(e) {
    //console.log(wx.getStorageSync('openId'))
    //this.getID();
    //console.log(wx.getStorageSync('openId'))
    this.setData({getId:true})
    console.log(e);
    this.setInfo(e);
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
    this.getAddr();
  },
  getID(){
    wx.cloud.callFunction({
      name: 'getOpenId',
      complete: res => {
        console.log('callFunction test result: ', res.result.openid);
        wx.setStorageSync('openId', res.result.openid);
        //wx.setStorage({
        //  data:  res.result.openid,
        //  key: 'openId',
        //})
      }
    })
  },
  addAddr:function(){
    wx.navigateTo({
      url: '../addr/index',
    })
  },
  getAddr:function() {
    if(wx.getStorageSync('openId')!="A"){
      const query = Bmob.Query("area");
      query.equalTo("openId","==",wx.getStorageSync('openId'));
      query.find().then(result => {
        console.log(result)
      let addrrow=[];
      for (let res of result) {
        if(typeof(res) != undefined){
          addrrow.push({
            objectId:res.objectId,
            openId:res.openId,
            name:res.name,
            tel:res.tel,
            province:res.province,
            city:res.city,
            place:res.place,
            home:res.home,
            mailcode:res.mailcode,
            default:res.default
          })
        }
      }
      this.setData({myAddr:addrrow});
    });
    }
  },
  ////////////////////////////////////////////////////////////////以下为原码
  openA:function(){
    var that= this;
    this.getID();
    wx.login({
      success: function (res) {
        var user = new Bmob.User();//开始注册用户
        user.loginWithWeapp(res.code).then(function (user) {
          var openid = user.get("authData").weapp.openid;
          if (user.get("nickName")) {
            // 第二次访问
            wx.setStorageSync('openid', openid)
            that.onLoad()
          } else {
            //保存用户其他信息
            wx.getUserInfo({
              success: function (result) {
                that.setData({
                  loading: false
                })
                var userInfo = result.userInfo;
                var nickName = userInfo.nickName;
                var avatarUrl = userInfo.avatarUrl;

                var u = Bmob.Object.extend("_User");
                var query = new Bmob.Query(u);
                // 这个 id 是要修改条目的 id，你在生成这个存储并成功时可以获取到，请看前面的文档
                query.get(user.id, {
                  success: function (result) {
                    // 自动绑定之前的账号
                    result.set('nickName', nickName);
                    result.set("userPic", avatarUrl);
                    result.set("openid", openid);
                    result.save();
                    wx.setStorageSync('openid', openid)
                    setTimeout(function () {
                      that.setData({
                        loading: true
                      })
                      that.onLoad()
                    }, 2000);
                  }
                });
                
              },fail:function(res){
                that.setData({
                  loading: true
                })
              }
            });
          }

        }, function (err) {
          console.log(err, 'errr');
        });
      }
    });
  }
})