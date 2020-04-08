var Bmob = require("../../utils/Bmob-2.2.3.min.js");
import list from "../../area";
import Toast from '../../dist/toast/toast';
import Dialog from '../../dist/dialog/dialog';
Page({
  data: {
    areaList:list,
    name:"",
    tel:"",
    province:"",
    city:"",
    place:"",
    home:"",
    objectId:"",
    canAdd:false,
    default:false,
    iconType:""
  },
  showDialog:function () {
    Dialog.confirm({
      message: '您确定删除该地址吗？'
    }).then(() => {
      this.delete();
    }).catch(() => {
    });
  },
  delete:function() {
    const query = Bmob.Query('area');
    query.destroy(this.data.objectId).then(res => {
      this.showToast("删除成功");
      setTimeout(function() {
        wx.navigateBack({
          delta:1
        })
      })
    }).catch(err => {
    console.log(err)
    })
  },
  changeA:function(e) {
    //var name = e.detail.value.name;
    console.log(e)
    console.log(e.detail)
    var name = e.detail;
    this.setData({name:name})
  },
  changeB:function(e) {
    //var tel = parseInt(e.detail.value.tel);
    var tel = parseInt(e.detail);
    this.setData({tel:tel})
  },
  changeC(event) {
    const { values } = event.detail;
    console.log(values);
    this.setData({
      province:values[0].name,
      city:values[1].name,
      place:values[2].name
    })
    //Toast(values.map(item => item.name).join('-'));
  },
  changeD:function(e) {
    //var home = e.detail.value.home;
    var home = e.detail;
    this.setData({home:home})
  },
  changeE:function(e) {
    //var mailcode = e.detail.value.mailcode;
    var mailcode = e.detail;
    this.setData({mailcode:mailcode})
  },
  onChangeT({detail}){
    this.setData({ default: detail });
    if(detail){
      this.setData({iconType:"star"})
    }
    else{
      this.setData({iconType:""})
    }
  },
  onLoad: function (options) {
    //假如传入了数据，就直接查询赋予value
    console.log(options)
      if(Object.keys(options).length!=0){
        this.setData({
          objectId:options.objectId,
          canAdd:true
        })
      }
  },
  onShow: function () {
      if(this.data.objectId){
        const query = Bmob.Query("area");
        query.equalTo("objectId","==", this.data.objectId);
        query.find().then(res => {
          console.log(res[0])
        this.setData({
          objectId:res[0].objectId,
          name:res[0].name,
          tel:res[0].tel,
          province:res[0].province,
          city:res[0].city,
          place:res[0].place,
          home:res[0].home,
          default:res[0].default
        })
        if(res[0].default){
          this.setData({iconType:"star"})
        }
        else{
          this.setData({iconType:""})
        }
        });
      }
  },
  showToast(word) {
    Toast(word);
  },
  onAreaChange: function (e) {
    this.setData({
      areaIndex: e.detail.value
    });
  },

  cancel:function(){
     wx.redirectTo({
            url: '../payorder/index'
        })
  },  
  addAddr : function(){
    if (!this.data.name) {
      //common.showTip("名字不能为空", "loading");
      this.showToast("名字不能为空");
      return false;
    }
    else if (!this.data.tel) {
      //common.showTip("电话不能为空", "loading");
      this.showToast("电话不能为空");
      return false;
    }else if(!this.data.province||!this.data.city||!this.data.place){
      //ommon.showTip("请选着区域", "loading");
      this.showToast("请选着区域");
      return false;
    }else if(!this.data.home){
      //common.showTip("详细地址不能为空", "loading");
      this.showToast("详细地址不能为空");
      return false;
    }//else if(!this.data.mailcode){
     //common.showTip("邮政编码不能为空", "loading");
      //this.showToast("邮政编码不能为空");
      //return false;
    //}
    const query = Bmob.Query('area');
    if(this.data.objectId){
      query.set('id', this.data.objectId)
    }
    query.set("name",this.data.name)
    query.set("tel",this.data.tel)
    query.set("province",this.data.province)
    query.set("city",this.data.city)
    query.set("place",this.data.place)
    query.set("home",this.data.home)
    query.set("openId",wx.getStorageSync('openId'))
    query.save().then(res => {
      this.showToast("保存成功");
      setTimeout(function() {
        wx.navigateBack({
          delta:1
        })
      })
    }).catch(err => {
    console.log(err)
    })
    },
  
    onConfirm(event) {
      console.log(event);
      console.log(this.data.value)
    },
  
    onCancel(event) {
      console.log(event);
    }
});