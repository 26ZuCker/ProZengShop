var Bmob = require("../../utils/Bmob-2.2.3.min.js");
Page({
  data: {
    objectId:"",
    address:[],
    showAddr:false,
    show:false,
    radio:"",
    color:""
  },
  onLoad: function (options) {
    
  },
  onChangeW(event) {
    this.setData({
      radio: event.detail
    });
    console.log(event.detail)
  },
  onReady: function () {

  },
  toPayOrder:function() {
    this.setData({color:"green"})
    var radio=this.data.radio;
    setTimeout(function () {
      wx.redirectTo({
        url: `../payorder/index?objectId=${radio}`
      })
    },250)
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    const query = Bmob.Query("area");
    query.equalTo("openId","==", wx.getStorageSync('openId'));
    query.find().then(result => {
      console.log(result)
      if(Object.keys(result).length!=0){
        let myAddr = [];
        for (let object of result) {
        myAddr.push({
          objectId:object.objectId,
          openId: object.openId,
          tel: object.tel,
          home: object.home,
          province: object.province,
          city:object.city,
          place:object.place,
          name:object.name
        })
      }
      console.log(myAddr)
        this.setData({
          address:myAddr,
          show:true
        })
      }
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})