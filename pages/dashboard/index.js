var Bmob = require("../../utils/Bmob-2.2.3.min.js");
Page({
  data: {
    indicatorDots: true, //是否出现焦点
    autoplay: true, //是否自动播放轮播图
    interval: 4000, //时间间隔
    duration: 1000, //延时时间
    hiddenModal: true,
    rec:[],
  },

  onLoad: function() {
    wx.setStorageSync('openId', "A");
  },
  getCoupon:function () {
    wx.navigateTo({
      url: '../getCoupon/getCoupon',
    })
  },
  onShow: function() {
    
    //查询出推荐的商品
    //var Good = Bmob.Object.extend("good");
    //var query = new Bmob.Query(Good);
    const query =Bmob.Query("good");
    query.equalTo("is_delete","==" ,0); //上架
    query.equalTo("is_rec","==" , 1); //推荐
    query.find().then(result=>{
      let rec = [];
      let recrow = [];
      for (let gid in result){
        recrow.push({
          menu_logo: result[gid].menu_logo,
          menu_name: result[gid].menu_name,
          objectId: result[gid].objectId,
          price: result[gid].price
        });
        if (recrow.length  == 2){
          rec.push(recrow);
          recrow = [];
        }  
      }
      rec.push(recrow);
      this.setData({
        rec: rec,
      })
      console.log(rec);
    }).catch(error=>{
      console.log(error);
    })

   // query.find({
   //   success: result => {
   //     let rec = [];
   //     let recrow = [];
   //     for (let gid in result){
   //       recrow.push({
   //         menu_logo: result[gid].get('menu_logo'),
   //         menu_name: result[gid].get('menu_name'),
   //         id: result[gid].id,
   //         price: result[gid].get('price'),
   //       });
   //       if (recrow.length  == 2){
   //         rec.push(recrow);
   //         recrow = [];
   //       }  
   //     }
   //     rec.push(recrow);
   //     this.setData({
   //       rec: rec,
   //     })
   //     console.log(rec);
    //  },
    //  error: function(error) {

   //   }
   // })

    //const advs = new Bmob.Query(Bmob.Object.extend("adv"));

    const advs = Bmob.Query("adv");
    // 查询所有数据
    advs.equalTo("is_show","==", 1); //推荐

    advs.find().then(results=>{
      const data = [];
      for (let object of results) {
        data.push({
          //id: object.get('good_id'),
          objectId: object.good_id,
          //url: object.get('adv')
          url: object.adv
        })
      }
      this.setData({
        banner: data
      })
    }).catch(error=>{
      console.log("查询失败: " + error.code + " " + error.message);
    })

    //advs.find({
    //  success: (results) => {
    //    const data = [];
    //    for (let object of results) {
    //      data.push({
    //        id: object.get('good_id'),
    //        url: object.get('adv')
     //     })
    //    }
    //    this.setData({
    //      banner: data
    //    })
    //  },
    //  error: (error) => {
    //    console.log("查询失败: " + error.code + " " + error.message);
    //  }
   // });

    //查询品牌
    //const brand = Bmob.Object.extend("brand");
    //const Qbrand = new Bmob.Query(brand);
    const Qbrand = Bmob.Query("brand");
    Qbrand.order("createdAt");

    Qbrand.find().then(results=>{
      const data = [];
        for (let object of results) {
          data.push({
            objectId: object.objectId,
            //name: object.get('name'),
            name: object.name,
            //logo: object.get('logo')
            logo: object.logo
          })
        }
        this.setData({
          people: data
        })
    }).catch(error=>{
      console.log("查询失败: " + error.code + " " + error.message);
    })

   // Qbrand.find({
   //   success: (results) => {
   //     const data = [];
   //     for (let object of results) {
   //       data.push({
   //         id: object.id,
   //         name: object.get('name'),
   //         logo: object.get('logo')
   //       })
   //     }
   //     this.setData({
   //       people: data
   //     })
   //   },
   //   error: (error) => {
   //     console.log("查询失败: " + error.code + " " + error.message);
   //   }
   // });
  },
  more: function() {
    wx.navigateTo({
      url: '../shop/index'
    })
  },
  brand: function () {
    wx.navigateTo({
      url: '../brand/brand'
    })
  },
  selectPeople(e) {
    let objectId = e.currentTarget.dataset.objectId
    wx.navigateTo({
      url: `../brandShop/brandShop?objectId=${objectId}`
    })
  },
  toIndexPage:function(){
    wx.navigateTo({
            url: "../shop/index"
      });
  }
})