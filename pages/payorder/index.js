//var common = require('../../utils/common.js');
var Bmob = require("../../utils/Bmob-2.2.3.min.js");
var util = require("../../utils/util.js");
import Notify from '../../dist/notify/notify';
import Toast from "../../dist/toast/toast";
Page({
  data: {
    place:false,
    remarks:"",
    showAddr: false,
    totalMoney: 0,
    goodMoney:0,
    price:0,
    showCoupon:false,
    fare: 0.00,
    allOrder: [],
    couponid:"",
    useCoupon:false,
    objectId:""
  },
  onLoad(opitions) {
    that = this;
    if(Object.keys(opitions).length!=0){
      this.setData({objectId:opitions.objectId})
    }
    console.log(opitions)
  },
  onShow() {
    ////////////////////////////////////////////////////获取地址
    console.log(this.data.objectId)
   if(Object.keys(this.data.objectId).length!=0)
   {
    const query = Bmob.Query('area');
    query.get(this.data.objectId).then(result => {
      console.log(result)
      this.setData({
        showAddr: true,
        name: result.name,
        addrdetail: result.province +"-"+ result.city+"-" + result.place +"-"+ result.home,
        tel: result.tel
      })
    }).catch(err => {
      console.log(err)
    })
   }else{
    const query = Bmob.Query('area');
    query.equalTo("openId","==", wx.getStorageSync('openId'));
    query.equalTo("default", "==", true);
    query.limit(1);
    query.find().then(result => {
      this.setData({
        showAddr: true,
        name: result[0].name,
        addrdetail: result[0].province +"-"+ result[0].city+"-" + result[0].place +"-"+ result[0].home,
        tel: result[0].tel
      })
    });
   }
    ///////////////////////////////////////////////////获取订单
    //let totalMoney = null;
    let total =null;
    wx.getStorage({
      key: 'orderResult',
      success: res => {
        console.log(res.data);
        let len = res.data.length;
        let fare = 0;
        let goodMoney = 0;
        for (let i = 0; i < len; i++) {
          goodMoney += res.data[i].number * res.data[i].price;
          if (res.data[i].fare > fare){
            fare = res.data[i].fare;
          }
        }
        total = goodMoney + fare;
        this.setData({
          fare: fare.toFixed(2),
          totalMoney: total.toFixed(2),
          goodMoney: goodMoney.toFixed(2),
          detail: res.data
        })
      }
    })
     ////////////////////////////////////////////////////////获取优惠券
     const query = Bmob.Query('user_coupon');
     query.equalTo("openId","==", wx.getStorageSync('openId'));
     query.equalTo("status","==",0);
     query.order("createdAt");
     query.find().then(result=>{
      console.log(result);
      let allOrder = []; //未使用的优惠券
    for (let object of result){
      console.log(object)
        let status = 0;
        let deadtime = object.coupon[0].deadtime;
        let today = object.createdAt;
        let expday = util.addDate(today,deadtime);
        let data={
          objectId:object.objectId,
          createdAt : today.substring(0,10),
          updateAt:expday,
          price:object.coupon[0].price,
          nprice:object.coupon[0].nprice
        }
        let date = new Date();
      let year = date.getFullYear(),
        month = date.getMonth()+1,
        day = date.getDate();
        month = month < 10 ? `0${month}` : month;
        day = day < 10 ? `0${day}` : day;
        let Today = `${year}-${month}-${day}`;
        console.log(today);
        console.log(total);
        if (!util.dateTab(Today, expday) && total > data.nprice) {
          this.setData({
            couponid: object.objectId
          })
          allOrder.push(data)
        }
      }
      this.setData({allOrder:allOrder})
      console.log(allOrder);
    }).catch(error=>{
    console.log(error);
    })
  },
  showdetail:function(params) {
    console.log(this.data.detail)
  },
  setCoupon(e) {
    let objectId = e.currentTarget.dataset.objectId;
    let price = e.currentTarget.dataset.price;
    this.setData({
      price: price,
      showCoupon: false,
      useCoupon:true,
      coupon: {
        objectId: objectId,
        price: price
      }
    })
  },
  getCoupon(){
    if(this.data.allOrder.length !=0){
      this.setData({
        showCoupon:true
      })
    }
  },
  getAddress() {
    wx.redirectTo({
      url: '../addrList/index',
    })
    //wx.navigateTo({
    //  url: '../addrList/index',
    //})
  },
  showNotifyW(){
    Notify({ type: 'warning', message: '请先选择地址' });
  },
  showToastO() {
    Toast('下单成功');
  },
  placeOrder:function(event){
    console.log(this.data.detail)
    wx.removeStorageSync('cartResult');
    var that = this;
    this.setData({place:true});
    if (!this.data.showAddr) {
      this.showNotifyW();
      //common.showTip("请填写收货地址", "loading");
      return false;
    }
    if(that.data.useCoupon){
      const queryCoupon = Bmob.Query("user_coupon");
      queryCoupon.get('this.data.couponid').then(result => {
        result.set('status',1);
        result.save();
      }).catch(err => {
        console.log(err)
      })        
    }
    var coupon = this.data.price;
    var totalPrice = parseFloat(this.data.totalMoney) - coupon;
    const query = Bmob.Query('order');
    query.set("orderDetail",this.data.detail)
    query.set("totalprice",totalPrice)
    query.set("coupon",this.data.couponid)
    query.set("status",1)
    query.set("addrdetail",this.data.addrdetail)
    query.set("tel",this.data.tel)
    query.set("openId",wx.getStorageSync('openId'))
    query.set("name",this.data.name)
    query.set("remarks",this.data.remarks)
    query.save().then(res => {
      this.showToastO();
      setTimeout(function() {
        wx.redirectTo({
          url: '../order/index'
        })
      },1000)
    }).catch(err => {
    console.log(err)
    })
    //var orderDetail = this.data.detail;
    //var userInfo = {
     // name: this.data.name,
      //tel: this.data.tel,
     // addrdetail: this.data.addrdetail
   // };
    //var remarks = event.detail.value.remark;
   // wx.getStorage({
    //  key: 'openid',
    //  success:function(res){
    //    var openId = res.data;
    //    if (!openId) {
    //      console.log('未获取到openId请刷新重试');
    //      return false;
    //    }
    //    const Order = Bmob.Query("Order");
    //    Order.set("remarks", this.data.remarks);
    //    Order.set("openId", wx.getStorageSync('openId'));
    //    Order.set("totalprice", parseFloat(totalPrice));
    //    Order.set("orderDetail", orderDetail);
    //    Order.set("status", 1);
    //    Order.set("userInfo", userInfo);
        //this.showToastO();
    //    Order.save().then(res => {
    //      setTimeout(function() {
    //        wx.redirectTo({
    //          url: '../order/index'
    //        })
    //      },1000)
    //      }).catch(err => {
    //      console.log(err)
    //      });
        
   //   },
   //   error:function(error){
   //     console.log(error);
   //   }
   // })
  },

});