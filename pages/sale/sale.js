var Bmob = require("../../utils/Bmob-2.2.3.min.js");
var util = require("../../utils/util.js");
Page({
  data: {
    currentTab: 0,
    winHeight: null,
    allOrder:[],
    shipments:[],
    noPayment:[]
  },
  onLoad(options) {
   // if (options.id) {
   //   this.setData({
   //     currentTab: options.id
   //   })
   // }
   // wx.getSystemInfo({
   //   success: (res) => {
   //     this.setData({
   //       winWidth: res.windowWidth,
   //       winHeight: res.windowHeight,
   //     });
   //   }
   // });
  },
  onReady () {
    // 页面渲染完成
  },
  onShow() {
    //获取全部订单信息
    const query = Bmob.Query("user_coupon");
    query.equalTo("openId","==",wx.getStorageSync('openId'));
    //query.include("coupon");
    query.order('createdAt');
    query.find().then(result=>{
      let allOrder = [], //未使用
      noPayment = [], //已使用
      shipments = []; //已过期
      console.log(result)
    for (let object of result) {
      //let status = "";
      console.log(object)
      let date = object.coupon[0].deadtime;
      let today = object.createdAt;
      let expday = util.addDate(today, date);
      
      let data = {
        createdAt: today.substring(0,10),
        updateAt: expday,
        price: object.coupon[0].price,
        nprice: object.coupon[0].nprice
      }
      
      if (!object.status){
        let date = new Date();
        let year = date.getFullYear(),
            month = date.getMonth() + 1,
            day = date.getDate();

        month = month < 10 ? `0${month}` : month;
        day = day < 10 ? `0${day}` : day;

        let Today = `${year}-${month}-${day}`;
        
        if (util.dateTab(Today, expday)) {
          shipments.push(data)
        }else{
          allOrder.push(data)
        }
      }else{
        noPayment.push(data)
      }
      
    }
    this.setData({
      allOrder: allOrder,
      noPayment: noPayment,
      shipments: shipments
    })
    }).catch(error=>{
      console.log(error);
    })
console.log(this.data.noPayment.length);
console.log(this.data.shipments.length);
console.log(this.data.allOrder);
  },

});
