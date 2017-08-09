var utils = (function() {
  var options = {
    formatTime: function(number) {  //  时间格式化
      var n = number * 1000;
      var date = new Date(n);
      //  年份
      var year = date.getFullYear()
      //  月份
      var month = date.getMonth() + 1
      //  当日
      var day = date.getDate()
      //  小时
      var hour = date.getHours()
      //  分钟
      var minute = date.getMinutes()
      //  秒钟
      var second = date.getSeconds()
      //  合并变量 
      return [year, month, day].map(this.formatNumber).join('-') + ' ' + [hour, minute, second].map(this.formatNumber).join(':');
    },
    formatNumber: function(n) {  //  时间格式化
      n = n.toString()
      return n[1] ? n : '0' + n
    },
    /**
     * 显示内容
     */
    showMessage: function (message) {
      var that = this;
      that.setData({
        messages: message,
      });
    },
    socketOpen: false,  //  socket 开关
    /**
     * 链接socket
     */
    getConn: function(url, success, fail, complete) {
      wx.connectSocket({
        url: url, //  地址
        success: function(res) { //  链接成功调用
          success(res);
        },
        fail: function(err) {  //  失败调用
          fail(err);
        },
        complete: function() {
          complete();
        }
      })
    },
    getSocketOpen: function (callback) { //  监听WebSocket连接打开事件。
      var that = this;
      that.socketOpen = true;
      wx.onSocketOpen(function (res) {
        callback(res);
      })
    },
    setSaveMessages: function (message) { //  向服务器发送消息
      var that = this;
      if (that.socketOpen) {
        wx.sendSocketMessage({
          data: message
        });
      }
    },
    getServerMessage: function(data,callback) {
      wx.onSocketMessage(function(res) {
        callback(res);
      });
    }
  };

  return options;
})();

//  对外开发接口
module.exports = {
  utils: utils, //  工具类
}