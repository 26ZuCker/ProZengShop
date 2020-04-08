var Bmob = require("../../utils/Bmob-2.2.3.min.js");
Page({
  data: {
    currentTab: null,
    winHeight: 0,
    good: [],
  },
  onShareAppMessage: function() {
    let title = "分类";
    let path = "pages/type/index";
    return {
        title: title,
        path: path
    }
  },
  onLoad: function () {
    wx.getSystemInfo({
      success: res => {
        this.setData({
          winHeight: res.windowHeight
        });
      }
    });
    let typeArray = [];
    //let goodType = new Bmob.Query(Bmob.Object.extend("good_type"));
    const goodType = Bmob.Query("good_type");
    goodType.order("-weight");
    goodType.find().then(result => {

      for (let object of result) {
        typeArray.push({
          objectId: object.objectId,
          name: object.type_name
        })
      }
      //let good = new Bmob.Query(Bmob.Object.extend("good"));
      const good = Bmob.Query("good");
      good.equalTo("is_delete","==" ,0); //上架
      good.include("type");
      return good.find();
    }).then(result => {
      let res = [];
      for (let type of typeArray) {
        let data = [];
        let canGetType = true;
        for (let good of result) {
          if (!good.type) {
            canGetType = false
          }
          if (canGetType) {
            if (type.objectId == good.type.objectId) {
              data.push(good);
            }
          }
          canGetType = true
        }
        let goodData = {
          foodType: type.name,
          objectId: type.objectId,
          data: data
        };
        res.push(goodData);
        this.setData({
          good: res
        })

      }
      this.setData({
        good: res,
        currentTab: res[0].objectId,//第一个tab
      })
      console.log(this.data.good);
    });

  },

  chooseType: function(event) {
      let foodType = event.target.dataset.foodtype;
      this.setData({
        currentTab: foodType
      })
  },
})