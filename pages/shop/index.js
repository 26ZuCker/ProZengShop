var Bmob = require("../../utils/Bmob-2.2.3.min.js");
Page({
  data: {
    goods: [], //页面数据
    pagination: 0, //页码
    pageSize: 5, //每页数据
    nodata: true, //无数据
    searchVal:"",
    urlA:'/images/triangle_2.png',
    urlB:'/images/triangle_2.png',
    urlC:'/images/triangle_2.png',
    number:0,
    forS:[] //提供搜索
  },
  onLoad() {
  //初始页面第一次获取页面数据
    let data=[];
    this.getData("weight" , 2);
    const queryB = Bmob.Query("good");
    queryB.equalTo("is_delete", "==",0); //上架
    queryB.order("weight"); //按排序
    queryB.find().then(res=>{
      for (let object of res) {
        data.push({
          objectId: object.objectId,
          title: object.menu_name,
        })
      }
    }).catch(error=>{
      console.log(error)
    })
    this.setData({forS:data})
  },
  input(e){
    this.setData({
      searchVal: e.detail.value
    })
    this.search();
  },
  clear(){
   this.setData({
     // goods: [], //页面数据
      pagination: 0, //页码
      pageSize: 5, //每页数据
      //nodata: true, //无数据
      searchVal: ""
    })
    this.getData("weight",1);
  },
  search(){
    this.setData({
      goods: [], //页面数据
      pagination: 0, //页码
      pageSize: 5, //每页数据
      nodata: true, //无数据
    })
    let getS=[];
    for (let good of this.data.forS) {
      if(good.title.indexOf(this.data.searchVal)!=-1){
        getS.push(good.objectId)
      }
    }
    const query = Bmob.Query("good");
    for (let n of getS) {
    query.equalTo("objectId","==",n)
    query.limit(this.data.pageSize); //返回n条数据
    query.skip(this.data.pageSize * this.data.pagination); //分页查询
    query.order('createdAt'); 
    query.find().then(results=>{
      var data = [];
      //将得到的数据存入数组
      for (let object of results) {
        data.push({
          objectId: object.objectId,
          title: object.menu_name,
          image: object.menu_logo,
          price: object.price,
          sale_number:object.sale_number
        })
      }
      console.log(data)
     this.setData({
       goods:data
      })
    }).catch(error=>{
      console.log(error);
    });
    }
  },
  sortFun(data) {
    this.setData({
      sortActive: data.currentTarget.dataset.data,
    })
    if (data.currentTarget.dataset.data == 1){
      this.setData({
        urlA:'/images/triangle.png',
        urlB:'/images/triangle_2.png',
        urlC:'/images/triangle_2.png'
      });
      this.setData({
        // goods: [], //页面数据
         pagination: 0, //页码
         pageSize: 5, //每页数据
         //nodata: true, //无数据
         searchVal: ""
       })
      this.getData("weight",1);
    } 
    else if (data.currentTarget.dataset.data == 2){
      this.setData({
        urlA:'/images/triangle_2.png',
        urlB:'/images/triangle.png',
        urlC:'/images/triangle_2.png'
      });
      this.setData({
        // goods: [], //页面数据
         pagination: 0, //页码
         pageSize: 5, //每页数据
         //nodata: true, //无数据
         searchVal: ""
       })
      this.getData("-price",1);
    } 
    else if (data.currentTarget.dataset.data == 3) {
      this.setData({
        urlA:'/images/triangle_2.png',
        urlB:'/images/triangle_2.png',
        urlC:'/images/triangle.png'
      });
      this.setData({
        // goods: [], //页面数据
         pagination: 0, //页码
         pageSize: 5, //每页数据
         //nodata: true, //无数据
         searchVal: ""
       })
      this.getData("-sale_number",1);
    }
  },
/////////////////////////////////////////////////////
  getData:function (sortType,isBegin=1) {
    // query.equalTo("menu_name", { "$regex": `${this.data.searchVal}.*` })
    if(isBegin==1){
      this.setData({goods:[]})
    }
   //query.limit(this.data.pageSize); //返回n条数据
    const query = Bmob.Query("good");
    query.limit(this.data.pageSize); 
    query.skip(this.data.pageSize * this.data.pagination); //分页查询
    query.equalTo("is_delete", "==",0); //上架
    query.order(sortType); //按排序
    query.find().then(results=>{
      console.log(results)
      let data = [];
      //将得到的数据存入数组
      for (let object of results) {
        data.push({
          objectId: object.objectId,
          title: object.menu_name,
          image: object.menu_logo,
          price: object.price,
          sale_number:object.sale_number,
          hot:object.sale_number>50?"热卖":""
        })
      }
      //判断是否有数据返回
      if (data.length) {
        let goods = this.data.goods; //得到页面上已经渲染的数据(数组)
        let pagination = this.data.pagination; //获取当前分页(第几页)
        goods.push.apply(goods, data); //将页面上面的数组和最新获取到的数组进行合并
        pagination = pagination ? pagination + 1 : 1; //此处用于判断是首次渲染数据还是下拉加载渲染数据
        //更新数据
        this.setData({
          goods: goods,
          pagination: pagination
        })
        if(isBegin==1){
          this.setData({
            nodata: false
          })
        }
       //if(isBegin!=1){
       //   this.setData({
       //     allGoods:goods
       //   })
       // }
      } else {
        //没有返回数据，页面不再加载数据
      this.setData({
        nodata: false
        })
      }
    }).catch(error=>{
      console.log(error);
    });
  },
////////////////////////////////////////
  router(e) {
    //跳转至商品详情页
    const objectId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/good/index?objectId=${objectId}`
    })
  },
  onReachBottom() {
    //下拉触底加载更多数据
    this.getData("weight",2);
    //if (this.data.sortActive===1) {
    //  this.getData("weight",2);
  //} else if (this.data.sortActive===2) {
  //  this.getData("price",2);
  // } else {
  //  this.getData("sale_number",2);
 // }
  }
})
