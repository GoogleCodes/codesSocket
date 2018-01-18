let urls = require('common/common.js');

class Main {
  
  constructor() {
  }

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
  }

  getArrays(reqArr) {
    let arrays = new Array(768), i = 0;
    for (i; i <= 768; i++) {
      arrays[i] = 0;
    }
    let arrtoo = arrays.slice(0);
    let t = reqArr;
    return t.concat(arrtoo).splice(0, 768)
  }

  _Toast(message, types) {
    wx.showToast({
      title: message,
      icon: types,
      duration: 2000
    });
  }

  _goShowModel(title, desc, success) {
    wx.showModal({
      title: title,
      content: desc,
      showCancel: false,
      success(res) {
        success(res)
      }
    });
  }

  goPages(url) {
    setTimeout(() => {
      wx.switchTab({
        url: url,
      })
    }, 500)
  }

  ajax(data) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: urls.serviceUri + data.url,
        data: data.data,
        method: data.method,
        header: {
          'content-type': 'application/json',
          'content-type': 'application/x-www-form-urlencoded'
        },
        success(res) {
          if (res.statusCode == 404) {
            wx.showToast({
              title: '服务器关闭了!',
              duration: 1500,
            })
            return false;
          } else if (res.statusCode == 200) {
            resolve(res.data)
          }
        },
        fail(err) {
          reject(err)
        }
      })
    })
  }

  sendRrquest(url, method, data, header) {
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
  }

  getSocketResponse(callback) {
    wx.onSocketMessage((res) => {
      try {
        let data = JSON.parse(res.data).data.attrs.data;
        return callback(data);
      } catch (e) { }
    })
  }


  getSaveMessage(callback) {
    wx.onSocketMessage((res) => {
      try {
        callback()
      } catch(e) {}
    })
  }

  IndexDemo(str) {
    var s = sqlStr.indexOf(str);
    return s;
  }

  /*                      中文转unicode                          */

  unicode(str) {
    var value = '';
    for (var i = 0; i < str.length; i++) {
      value += '\\u' + this.left_zero_4(parseInt(str.charCodeAt(i)).toString(16));
    }
    console.log(value);
    return value;
  }

  left_zero_4(str) {
    if (str != null && str != '' && str != 'undefined') {
      if (str.length == 2) {
        return '00' + str;
      }
    }
    return str;
  }

  unicode1(str) {
    var value = '';
    for (var i = 0; i < str.length; i++)
      value += '&#' + str.charCodeAt(i) + ';';
    console.log(value);
    return value;
  }
  
  /*                      中文转unicode                          */


  alert(title) {
    wx.showToast({
      title: title,
      duration: 2000
    })
  }

}

export { Main }