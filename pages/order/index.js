var that;
var Bmob = require("../../utils/Bmob-2.2.3.min.js");
var common = require("../../utils/common.js");
import Toast from "../../dist/toast/toast";
import Dialog from '../../dist/dialog/dialog';
Page({
  data: {
    a:false,
    currentTab: 0,
    winHeight: null,
    allOrder:[],
    noPayment:[],
    shipments:[],
    Receiving:[],
    finish: []
  },
  showToastD() {
    Toast('已删除订单');
  },
  showToastC() {
    Toast('已确认收货');
  },
  showA:function(e){
    Dialog.confirm({
      title: '',
      message: '您确定收货吗？'
    }).then(() => {
     this.overOrder(e)
    }).catch(() => {
    });
  },
  showB:function(e){
    Dialog.confirm({
      title: '',
      message: '您确定删除该订单吗？'
    }).then(() => {
     this.deleteOrder(e) // on confirm
    }).catch(() => {
    });
  },
  onLoad: function(options) {
    that = this;
    console.log(this.data.allOrder);
    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight,
        });
      }
    });
  },
  onShow: function() {
    // 页面显示
    //获取全部订单信息
    const query = Bmob.Query("order");
    query.equalTo("openId","==",wx.getStorageSync('openId'));
    query.order('createdAt');
    query.find().then(result=>{
      console.log(result)
      var allOrder = [], //全部
          noPayment = [], //待付款
          shipments = [], //待发货
          Receiving = [], //待收货
          finish = []; //已完成
        for (let object of result) {
          var status = "";
          var resData = {
            user:object.name,
            totalprice: object.totalprice,
            remarks: object.remarks,
            orderId: object.objectId, //订单编号为该订单对应的objectId
            status: status,
            option:object.orderDetail[0].option,
            name:object.orderDetail[0].name,
            pic:object.orderDetail[0].pic,
            number:object.orderDetail[0].number,
            price:object.orderDetail[0].price,
            fare:object.orderDetail[0].fare,
            expressId:"SF"+object.objectId, //快递编号为该订单对应的"SF"+objectId
            createdAt: object.createdAt,
            tel:object.tel,
            addrdetail:object.addrdetail
          }
          //console.log(object.orderDetail[0])
          //console.log(resData)
          switch (object.status) {
            case 0: //待付款
              resData.status = "待付款";
              noPayment.push(resData);
              break;
            case 1: //已付款-->待发货
              resData.status = "待发货";
              shipments.push(resData);
              break;
            case 2: //已发货-->待收货
              resData.status = "正在配送";
              Receiving.push(resData);
              break;
            case 3: //已收货-->全部完
              resData.status = "已完成";
              finish.push(resData);
              break;
            default: //全部状态
          }
          allOrder.push(resData);
        }
        that.setData({
          allOrder: allOrder, //全部
          noPayment: noPayment, //待付款
          shipments: shipments, //待发货
          Receiving: Receiving, //待收货
          finish: finish
        })
      console.log(this.data.allOrder.length!=0)
      console.log(this.data.noPayment.length!=0)
      console.log(this.data.shipments.length!=0)
      console.log(this.data.Receiving.length!=0)
      console.log(this.data.finish.length!=0)
    }).catch(error=>{
      console.log(error);
    })
  },
  onReady: function() {
    // 页面渲染完成
  },
  showDialog:function (word) {
    Dialog.confirm({
      message: word
    }).then(() => {
      this.deleteOrder();
    }).catch(() => {
    });
  },
  onPullDownRefresh: function() {
    wx.stopPullDownRefresh();
    that.onShow()
  },
  cancelOrder: function(e) {
    var that = this;
    var objectId = e.target.dataset.id;
    common.showModal('你确定取消订单吗？', '提示', true, function(e) {
      if (e.confirm) {
        //取消订单
       // var Order = Bmob.Object.extend("Order");
        //var query = new Bmob.Query(Order);
        const query =Bmob.Query("Order");
        query.equalTo("openId","==",wx.getStorageSync('openId'));
        query.equalTo("objectId","==",objectId);
        query.find().then(function(result) {
          return Bmob.Object.destroyAll(result);
        }).then(function(result) {
          common.showTip('取消订单成功');
          setTimeout(function() {
            that.onShow()
          }, 3000);
          // 删除成功
        }, function(error) {
          // 异常处理
        });
      }
    });
  },
  overOrder: function(e) {
    var that = this;
    var orderid = e.target.dataset.id;
    console.log(e.target.dataset)
    //common.showModal('你确定收货了吗？', '提示', true, function(e) {
      //if (e.confirm) {
        //var Order = Bmob.Object.extend("Order");
        //var query = new Bmob.Query(Order);
      //}
    //});
    const query =Bmob.Query("Order");
        query.equalTo("objectId","==",orderid);
        query.find().then(function(result) {
            for (let obj of result) {
              obj.set('status', 3)
              for (let item of obj.get('orderDetail')) {
                //var good = Bmob.Object.extend("good");
                //var qgood = new Bmob.Query(good);
                const qgood =Bmob.Query("good");
                qgood.get("item.id").then(result=>{
                  console.log(result)
                  result.set("sale_number", item.number);
                  result.save()
                }).catch(error=>{
                  console.log(error)
                })
              }
              obj.save().then(result=>{
                common.showTip('收货成功');
                setTimeout(function() {
                  that.onShow()
                }, 1000);
              }).catch(error=>{
                console.log(error)
              })
            }
          }),
          function(error) {
            // 异常处理
          };
  },
  deleteOrder: function(e) {
    var that = this;
    var orderId = e.target.dataset.id;
    console.log(orderId)
    //取消订单
        const query =Bmob.Query("order");
        query.equalTo("objectId", "==",orderId);
        query.destroy(orderId).then(res => {
          common.showTip('删除订单成功');
          setTimeout(function() {
            that.onShow()
          }, 1000);
        }).catch(err => {
          console.log(err)
        })
  },
  payOrder: function(e) {
    var orderid = e.target.dataset.id;
    var money = e.target.dataset.price
    var that = this;
    // 发起支付
    wx.getStorage({
      key: 'openid',
      success: function(res) {
        var openId = res.data;
        if (!openId) {
          console.log('未获取到openId请刷新重试');
          return false;
        }
        //传参数金额，名称，描述,openid
        Bmob.Pay.wechatPay(money, '小程序商城', '描述', openId).then(function(resp) {

          //服务端返回成功
          var timeStamp = resp.timestamp,
            nonceStr = resp.noncestr,
            packages = resp.package,
            orderId = resp.out_trade_no, //订单号，如需保存请建表保存。
            sign = resp.sign;
          //发起支付
          wx.requestPayment({
            'timeStamp': timeStamp,
            'nonceStr': nonceStr,
            'package': packages,
            'signType': 'MD5',
            'paySign': sign,
            'success': function(res) {
              //付款成功,修改订单的状态
              //var Order = Bmob.Object.extend("Order");
              //var query = new Bmob.Query(Order);
              const query =Bmob.Query("Order");
              query.equalTo("orderId", "==",orderid);
              query.find().then(results=>{
                result[0].set("status", 1);
                result[0].save();
                common.showTip('支付成功');
                setTimeout(function() {
                  that.onShow()
                }, 3000);
              }).catch(error=>{
                console.log(error);
              })

            },
            'fail': function(res) {
              common.showTip('支付失败');
              const Order =Bmob.Query("Order");
              let openId=wx.getStorageSync('openId');
              Order.set("remarks", remarks);
              Order.set("openId", openId);
              Order.set("totalprice", parseInt(totalPrice));
              Order.set("orderDetail", orderDetail);
              Order.set("status", 0);
              Order.set("userInfo", userInfo);
              Order.set("orderId", orderId);
              Order.save().then(res => {
                console.log(result.id)
              }).catch(err => {
                console.log(err)
              })

            }
          })

        }, function(err) {
          console.log('服务端返回失败');
          console.log(err);
        });

      }
    })
  },
  selectExpress(e){
    console.log(e);
    var expressId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/expressInfo/index?expressId=' + expressId
    });
  }

});