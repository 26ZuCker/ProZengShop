var common = require('../../utils/common.js');
const WxParse = require('../../utils/wxParse/wxParse.js');
var Bmob = require("../../utils/Bmob-2.2.3.min.js");
import Notify from "../../dist/notify/notify";
Page({
  data: {
    showPop:false,
    indicatorDots: true, //是否出现焦点
    autoplay: true, //是否自动播放轮播图
    interval: 4000, //时间间隔
    duration: 1000, //延时时间
    detail:[],//页面数据
    hiddenModal: true,
    goodId:0,
    goodNum:0,//库存
    price:0,//商品价格
    minPrice: 999999999999,//商品最低价格
    maxPrice:  0,//商品最高价格
    quantity1: {
      quantity: 1,
      min: 1,
      max: 20
    },
    maxQuantity:20,
    actionType: 'payOrder',
    cartResult:false,
    option: [],
    optionIndex: -1,
    isOption: false,//是否显示商品属性
    fare:0.00
  },
  showNotifyD(word){
    Notify({ type: 'danger', message: word });
  },
  showNotifyW(word){
    Notify({ type: 'warning', message: word });
  },
  onLoad: function (options) {
    //console.log(options.id);
    if (!options.objectId) {
      common.showModal("获取商品信息失败", '', false, () => {
        wx.navigateBack({
          delta: 1
        })
      });
      return false;
    }
    this.setData({
      goodId: options.objectId
    })

    this.getData();//获取页面数据
    this.getCartResult();//购物车是否有商品
  },
  onShow: function () { },
  showPopup() {
    this.setData({  showPop: true });
  },
  onClose() {
    this.setData({ showPop: false });
  },
  getData: function () {
    wx.showLoading({
      title: '加载中',
    })
    //查询商品详情
    let goodId = this.data.goodId;
   // let good = new Bmob.Query(Bmob.Object.extend("good"));
    const good = Bmob.Query("good");
    good.equalTo("is_delete","==" ,0);
    let cover = '';
    good.get(goodId).then(result => {
      //使用第三方插件渲染商品详情html => wxml
      //let good_desc = result.get("good_desc");
      let good_desc = result.good_desc;

      if (good_desc) {
        let reg = new RegExp("&quot;", "g");
        let detail = good_desc.replace(reg, "");
        WxParse.wxParse('content', 'html', detail, this);
      }

      cover = result.menu_logo;//商品封面
      let fare = result.fare ? result.fare.toFixed(2) : 0.00;
      this.setData({
        goodNum: result.good_number,
        price: result.price,
        detail: result,
        fare: fare,
        quantity1: {
          quantity: 1,
          min: 1,
          max: result.good_number
        },
        maxQuantity:result.good_number
      })

      console.log(this.data.detail);
      //let goodPic = new Bmob.Query(Bmob.Object.extend("good_pic"));
      const goodPic =Bmob.Query("good_pic");
      goodPic.equalTo("good_id","==", goodId);
      
      return goodPic.find();
    }).then(result => {
      //**********商品图片 ************/
      let pic_attr = new Array();
      for (let object of result) {
        pic_attr.push(object.good_pic)
      }
      pic_attr.unshift(cover)
      this.setData({
        imgUrls: pic_attr
      })
      //let option = new Bmob.Query(Bmob.Object.extend("option"));
      const option = Bmob.Query("option");
      option.equalTo("good", "==", goodId);
      return option.find();
    }).then(result => {
      //*********如果设置了商品属性********
      if (result.length > 0) {
        let optionArr = [];
        for (let goodOption of result){
          optionArr.push({
            optionName: goodOption.optionName,
            gnum: goodOption.gnum,
            price: goodOption.price,
          });
        }
        this.setData({
          isOption: true,
          option: optionArr
        });
        let minPrice = this.data.minPrice;
        let maxPrice = this.data.maxPrice;
        let goodNum = this.data.goodNum;
        //设置商品属性价格
        for (let option of this.data.option) {
          if (option.price < minPrice) {
            minPrice = option.price;
          }
          if (option.price > maxPrice) {
            maxPrice = option.price;
          }
          if (option.gnum > goodNum) {
            goodNum = option.gnum;
          }
        }
        this.setData({
          maxPrice: maxPrice,
          minPrice: minPrice,
          goodNum: goodNum,
        });
      }
      wx.hideLoading();
      
    }).catch(error => {
      console.log(error);
      wx.hideLoading();
      common.showTip('系统出错请重试', 'loading');
    });
  },

  placeOrder: function(event) {
    var myId=wx.getStorageSync('openId');
    if(myId==="A"){
      this.showNotifyD("请先登录");
    }
    else{
      var name = event.target.dataset.name;
      console.log(name)
    this.setData({
      actionType: name
    })
    this.showPopup();
    //this.showModal();
    }
  },

  showModal: function() {
    // 显示遮罩层
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(300).step()
    this.setData({
      animationData: animation.export(),
      showModalStatus: true
    })
    setTimeout(function() {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export()
      })
    }.bind(this), 200)
  },

  hideModal: function() {
    // 隐藏遮罩层
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(300).step()
    this.setData({
      animationData: animation.export(),
    })
    setTimeout(function() {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export(),
        showModalStatus: false
      })
    }.bind(this), 200)
  },

  click_cancel: function(){
    this.hideModal()
  },
  onChangeV(event) {
    let a = event.detail;
    this.setData({
      quantity1: {
        quantity: event.detail,
        min: 1,
        max: this.data.maxQuantity
      },
    })
  },
  payOrder: function() {
    //获取传递过来的数量，商品名称，价格
    let number = this.data.quantity1.quantity;
    let good_number = this.data.goodNum;
    if (parseInt(number) > parseInt(good_number)) {
      this.showNotifyW("货存不足");
      //common.showTip("货存不足！", 'loading');
      return false;
    }

    if (this.data.isOption && this.data.optionIndex == -1) {
      this.showNotifyW("请选择商品属性");
      //common.showTip("请选择商品属性", 'loading');
      return false;
    }
    let goodOption = this.data.isOption ? this.data.option[this.data.optionIndex].optionName : '';
    let detailArray = {
      number: number,
      price: this.data.isOption ? this.data.option[this.data.optionIndex].price : this.data.detail.price,
      name: this.data.detail.menu_name,
      pic: this.data.detail.menu_logo,
      fare: this.data.detail.fare,
      option: goodOption,
    };
    let orderResult = new Array();
    orderResult.push(detailArray);
    wx.setStorage({
      key: "orderResult",
      data: orderResult
    })
    wx.redirectTo({
      url: '../payorder/index'
    })
  },
  addCart: function() {
    //购物车数据放进本地缓存
    let number = this.data.quantity1.quantity;
    let good_number = this.data.goodNum;
    if (parseInt(number) > parseInt(good_number)) {
      common.showTip("货存不足！", 'loading');
      return false;
    }

    if (this.data.isOption && this.data.optionIndex == -1) {
      common.showTip("请选择商品属性", 'loading');
      return false;
    }
    let goodOption = this.data.isOption ? this.data.option[this.data.optionIndex].optionName : '';
    let detailArray = {
      number: number,
      good_number: good_number,
      objectId: this.data.detail.objectId,
      price: this.data.price,
      name: this.data.detail.menu_name,
      pic: this.data.detail.menu_logo,
      fare: this.data.detail.fare,
      option: goodOption,
      active: true
    };
    let cartResult = wx.getStorageSync('cartResult') || [];
    cartResult.push(detailArray);
    wx.setStorage({
      key: "cartResult",
      data: cartResult
    })
    this.hideModal();
    this.getCartResult();
    common.showTip("加入购物车成功");
  },


  handleZanQuantityChange(e) {
    var componentId = e.componentId;
    var quantity = e.quantity;
    this.setData({
      [`${componentId}.quantity`]: quantity
    });
  },
  getCartResult: function(){
    wx.getStorage({
      key: 'cartResult',
      success: res => {
        if (res.data.length > 0){
          this.setData({
            cartResult: true
          });
        }
      },
    })
  },
  index: function() {
    wx.switchTab({
      url: '../dashboard/index'
    })
  },
  cart: function() {
    wx.switchTab({
      url: '../cart/index'
    })
  },
  //选择商品属性
  selectOption : function(e){
    let opIndex = e.currentTarget.dataset.opindex;
    let option = this.data.option;
    let goodNum = option[opIndex].gnum;
    let price = option[opIndex].price;
    this.setData({
      optionIndex: opIndex,
      goodNum: goodNum,
      price: price,
    });
  }

})