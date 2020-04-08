var Bmob = require("../../utils/Bmob-2.2.3.min.js");
import Notify from "../../dist/notify/notify";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    coupon:null
  },
  showNotify(){
    Notify({ type: 'danger', message: '请先登录' });
  },
  onShow() {
    let id=wx.getStorageSync('openId')
    const UserQuery =Bmob.Query("user_coupon");
    UserQuery.equalTo("openId","==", id);
    UserQuery.find().then(results => {
      let isCoupon = [];
      console.log(results)
      if (results){
        for (let object of results) {
          isCoupon.push(object.coupon[0].objectId)
        }
      }
      const queryA =Bmob.Query("coupon");
        queryA.find().then(results => {
          console.log(results)
          let data = [];
          for(let object of results){
            let status = true;
            console.log(isCoupon.indexOf( object.objectId));
            if (isCoupon.indexOf( object.objectId) != -1){
              status = false
            }
            data.push({
              objectId: object.objectId,
              price: object.price,
              nprice: object.nprice,
              status: status
            })
          }
          this.setData({
            coupon: data
          })
        });
    });
  },
  getCoupon(e){
    if(wx.getStorageSync('openId')==="A"){
      this.showNotify();
    }else{
      const id = e.currentTarget.dataset.id;
      console.log(id)
      let data=this.data.coupon;
      let index = e.currentTarget.dataset.index;
      const queryB = Bmob.Query("coupon");
      queryB.equalTo("objectId","==", id);
      queryB.find().then(res => {
        console.log(res)
         let post = res;
         console.log(post)
         let id =wx.getStorageSync('openId')
         const diary =Bmob.Query("user_coupon");
         diary.set("openId", id);
         diary.set("status", 0);
         diary.set("coupon", post);
         diary.save().then(res => {
           console.log(res)
           wx.showToast({
             title: '领取成功',
             icon: 'success',
             duration: 1000,
           })
           data[index].status = !data[index].status
           this.setData({
             coupon: data
           })
         }).catch(err => {
           console.log(err)
         })
      }).catch(error=>{
        console.log(error)
      });
     
    }
   
  }
})