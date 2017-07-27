//index.js

var myUtils = require('../../utils/util.js');

//获取应用实例
var app = getApp()
Page({
  data: {
    messages: [],
  },
  onLoad: function () {
    var that = this;
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo){
      //更新数据
      that.setData({
        userInfo:userInfo
      })
    })

    myUtils.utils.getConn('ws://localhost:8080/MySocket/websocket',function(res) { //  成功调用
      console.log("请求成功！");
    },function(err) {  //  失败调用

    },function() {
      
    });

    //  打开链接
    myUtils.utils.getSocketOpen(function(res) {
      console.log(res, "WebSocket连接已打开！");
    });

  },
  //  收到消息
  getMessage: function () {
    var that = this;
    //  向服务器发送消息
    that.messages = [
      { 
        a: 1,
        b: 2,
      },
      {
        a: 3,
        b: 4,
      }
    ];
    myUtils.utils.setSaveMessages(JSON.stringify(that.messages));

    //  接收服务器的信息
    myUtils.utils.getServerMessage(that.data.messages,function(res) {
      that.setData({
        messages: res.data
      });
      console.log(res.data);
    });

  }
})
