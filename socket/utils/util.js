
//  全局地址
const src = 'https://api.gizwits.com/app/';

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
};

const sendRrquest = (url, method, data, header) => {
  var promise = new Promise(function (resolve, reject) {
    wx.request({
      url: src + url,
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