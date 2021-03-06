let urls = require('common/common.js');

let options = {
  formatTime(number) {  //  时间格式化
    var n = number * 1000;
    let date = new Date(n),
      //  年份
      year = date.getFullYear(),
      //  月份
      month = date.getMonth() + 1,
      //  日期
      day = date.getDate(),
      //  小时
      hour = date.getHours(),
      //分钟
      minute = date.getMinutes(),
      //秒钟
      second = date.getSeconds()
    return [year, month, day].map(this.formatNumber).join('-') + ' ' + [hour, minute, second].map(this.formatNumber).join(':');
  },
  formatNumber(n) {  //  时间格式化
    n = n.toString()
    return n[1] ? n : '0' + n
  },
};

const sendRrquest = function(url, method, data, header) {
  return new Promise(function (resolve, reject) {
    wx.request({
      url: urls.purl + url,
      data: data,
      method: method,
      header: header,
      success: resolve,
      fail: reject
    })
  });
};

/**
 * 字符串转byte[]
 */
const stringToBytes = function(str) {
  var ch, st, re = [];
  for (var i = 0; i < str.length; i++) {
    ch = str.charCodeAt(i);   // get char
    st = [];                  // set up "stack"
    do {
      st.push(ch & 0xFF);     // push byte to stack
      ch = ch >> 8;           // shift value down by 1 byte
    }
    while (ch);
    re = re.concat(st.reverse());
  }
  return re;
}

//  发送数据
const sendDataJson = function(cmd, dids, form) {
  var that = this;
  var json = {
    cmd: cmd,
    data: {
      did: dids,
      attrs: form,
    },
  };
  storageJson(json);
}

//  格式化JSON
const storageJson = function(json) {
  wx.sendSocketMessage({
    //  对象转换字符串
    data: JSON.stringify(json),
    success(res) {

    }
  })
}

//  提示信息
const _Toast = function(message,types) {
  wx.showToast({
    title: message,
    icon: types,
    duration: 2000
  });
}

const _goShowModel = function(title, desc, success) {
  wx.showModal({
    title: title,
    content: desc,
    showCancel: false,
    success (res) {
      success(res)
    }
  });
}

//  对外开发接口
module.exports = {
  options: options,
  sendRrquest: sendRrquest,
  toStringTools: stringToBytes,
  storageJSONS: storageJson,
  sendData: sendDataJson,
  Toast: _Toast,
  showModel: _goShowModel
}