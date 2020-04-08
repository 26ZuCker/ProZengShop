var Bmob = require("../../utils/Bmob-2.2.3.min.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    brand:null
  },
  onLoad(options) {
    //查询品牌
    //const brand = Bmob.Object.extend("brand");
    //const Qbrand = new Bmob.Query(brand);
    const Qbrand = Bmob.Query('brand');
    //Qbrand.descending("createdAt");
    Qbrand.order("createdAt");
    Qbrand.find().then(results => {
      const data = [];
      for (let object of results) {
        data.push({
          objectId: object.objectId,
          name: object.name,
          logo: object.logo
        })
      }
      this.setData({
        brand: data
      })
  }).catch(error=>{
    console.log("查询失败: " + error.code + " " + error.message);
  });

   // Qbrand.find({
     // success: (results) => {
      //  const data = [];
        //for (let object of results) {
          //data.push({
            //id: object.id,
           // name: object.get('name'),
    //        logo: object.get('logo')
      //    })
      //  }
      //  this.setData({
       //   brand: data
       // })
     // },
    //  error: (error) => {
      //  console.log("查询失败: " + error.code + " " + error.message);
    //  }
    //});

  }

})