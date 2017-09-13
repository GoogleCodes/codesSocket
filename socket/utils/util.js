let options = {
  formatTime(number) {  //  时间格式化
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
  formatNumber(n) {  //  时间格式化
    n = n.toString()
    return n[1] ? n : '0' + n
  },
  _getGizwits(a,data, appid, success, fail) { // get请求
    wx.request({
      url: 'https://api.gizwits.com/app/' + a, //  请求连接
      data: data, //  请求数据
      header: {
        'content-type': 'application/json',
        'X-Gizwits-Application-Id': appid,
      },
      success: function (res) { //  请求成功调用
        success(res)
      },
      fail() {  //  请求失败调用
        fail();
      }
    })
  },

  _log(a, method, data, header) {
    
  },

  _loginGizwits(a, data, appid, success, fail) { // get请求
    wx.request({
      method: 'POST',
      url: 'https://api.gizwits.com/app/' + a, //  请求连接
      data: data, //  请求数据
      header: {
        'content-type': 'application/json',
        'X-Gizwits-Application-Id': appid,
      },
      success: function (res) { //  请求成功调用
        success(res)
      },
      fail() {  //  请求失败调用
        fail();
      }
    })
  },
  _privateGizw(a, d, i, t, success, fail) { // get请求
    wx.request({
      method: 'GET',
      url: 'https://api.gizwits.com/app/' + a, //  请求连接
      data: d, //  请求数据
      header: {
        'content-type': 'application/json',
        'X-Gizwits-Application-Id': i,
        'X-Gizwits-User-token': t,
      },
      success: function (res) { //  请求成功调用
        success(res)
      },
      fail() {  //  请求失败调用
        fail();
      }
    })
  },
  _privateGizws(a, d, i, t, success, fail) { // get请求
    wx.request({
      method: 'POST',
      url: 'https://api.gizwits.com/app/' + a, //  请求连接
      data: d, //  请求数据
      header: {
        'content-type': 'application/json',
        'X-Gizwits-Application-Id': i,
        'X-Gizwits-User-token': t,
      },
      success: function (res) { //  请求成功调用
        success(res)
      },
      fail() {  //  请求失败调用
        fail();
      }
    })
  }
};

var sendRrquest = (url, method, data, header) => {
  var promise = new Promise(function (resolve, reject) {
    wx.request({
      url: 'https://api.gizwits.com/app/' + url,
      data: data,
      method: method,
      header: header,
      success: resolve,
      fail: reject
    })
  });
  return promise;
};

//  对外开发接口
module.exports = {
  options: options,
  sendRrquest: sendRrquest
}