var Bmob = require("../../utils/Bmob-2.2.3.min.js");
Page({
  data: {
    data:null,
  },
  onLoad({objectId}) {
    //const brand = Bmob.Object.extend("good");
    //const Qbrand = new Bmob.Query(brand);
    const Qbrand = Bmob.Query('good');
    Qbrand.order("createdAt");
    Qbrand.equalTo("brand","==",objectId);
    Qbrand.find().then(results=>{
      if (results){
        this.setData({
          data: results
        })
      }
    }).catch(error=>{
      console.log("查询失败: " + error.code + " " + error.message);
    });
  //  Qbrand.find({
  //    success: (results) => {
  //      if (results){
  //        this.setData({
  //          data: results
  //        })
  //      }
  //    },
  //    error: (error) => {
  //      console.log("查询失败: " + error.code + " " + error.message);
  //    }
  //  });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
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