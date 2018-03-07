let urls = require('common/common.js');

let tools = require('util.js');

var $ = {

  regex: /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/,

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

  /**
   * 数组去重方法
   */
  unique(arr) {
    var result = [], hash = {};
    for (var i = 0, elem; (elem = arr[i]) != null; i++) {
      if (!hash[elem]) {
        result.push(elem);
        hash[elem] = true;
      }
    }
    return result;
  },

  log(message) {
    console.log(message);
  },

  parse(obj) {
    return JSON.parse(obj);
  },

  stringify(obj) {
    return JSON.stringify(obj);
  },

  getArrays(reqArr) {
    let arrays = new Array(768), i = 0;
    for (i; i <= 768; i++) {
      arrays[i] = 0;
    }
    let arrtoo = arrays.slice(0);
    let t = reqArr;
    return t.concat(arrtoo).splice(0, 768)
  },

  _Toast(message, types) {
    wx.showToast({
      title: message,
      icon: types,
      duration: 2000
    });
  },

  _goShowModel(title, desc, success) {
    wx.showModal({
      title: title,
      content: desc,
      showCancel: false,
      success(res) {
        success(res)
      }
    });
  },

  goPages(url) {
    setTimeout(function () {
      wx.switchTab({
        url: url,
      })
    }, 500)
  },

  ajax(data) {
    return new Promise(function (resolve, reject) {
      wx.request({
        url: urls.serviceUri + data.url,
        data: data.data,
        method: data.method,
        header: {
          'content-type': 'application/json',
          'content-type': 'application/x-www-form-urlencoded'
        },
        success(res) {
          if (res.statusCode == 500) {
            wx.showToast({
              title: '服务器错误了!',
              duration: 1500,
            })
            return false;
          } else if (res.statusCode == 404) {
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
  },

  upload(data) {
    return new Promise(function (resolve, reject) {
      wx.uploadFile({
        url: urls.uploadFileUrl,
        filePath: data.data,
        method: 'POST',
        name: data.name,
        header: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT',
          'Access-Control-Allow-Headers': 'Origin, X-Requested - With, Content-Type, Accept'
        },
        formData: {
          'lan': 'zh' //s.data.arrayCharset, // 'zh',
        },
        success(res) {
          resolve(res);
        },
        fail(err) {
          s.setData({ voiceNow: true });
          //  错误提示
          $._goShowModel('提示', '录音的姿势不对!', function () { });
          wx.hideToast();
        }
      })
    });
  },

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
  },

  getSocketResponse(callback) {
    wx.onSocketMessage(function (res) {
      try {
        let data = JSON.parse(res.data).data.attrs.data;
        let did = JSON.parse(res.data).data.did;
        if (did != wx.getStorageSync('did')) {
          return false;
        }
        return callback(did, data);
      } catch (e) { }
    })
  },

  openScene(brr) {
    $.getSocketResponse(function (did, data) {
      try {
        let arrays = [];
        let list = arrays.concat(data.splice(4, 18));
        // brr = [0, 18, 0x50];
        let count = brr.concat(list);
        tools.sendData('c2s_write', wx.getStorageSync('did'), {
          'data': $.getArrays(count),
        });
        return false;
      } catch (e) { }
    })
  },

  IndexDemo(str) {
    var s = sqlStr.indexOf(str);
    return s;
  },

  alert(title) {
    wx.showToast({
      title: title,
      duration: 2000
    })
  },

  model(title, desc, flag) {
    wx.showModal({
      title: title,
      content: desc,
      showCancel: flag,
    })
  },

  utf8to16(str) {
    var out, i, len, c;
    var char2, char3;
    out = "";
    len = str.length;
    i = 0;
    while (i < len) {
      c = str.charCodeAt(i++);
      switch (c >> 4) {
        case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
          out += str.charAt(i - 1);
          break;
        case 12: case 13:
          char2 = str.charCodeAt(i++);
          out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
          break;
        case 14:
          char2 = str.charCodeAt(i++);
          char3 = str.charCodeAt(i++);
          out += String.fromCharCode(((c & 0x0F) << 12) |
            ((char2 & 0x3F) << 6) |
            ((char3 & 0x3F) << 0));
          break;
      }
    }
    return out;
  },

  colorHEX(str) {
    var that = str;
    let regex = this.regex;
    if (/^(rgb|RGB)/.test(that)) {
      let str = that.replace("(", "");
      let laststr = str.replace(")", "");
      var aColor = laststr.replace(/(?:|||rgb|RGB)*/g, "").split(",");
      var strHex = "#";
      for (var i = 0; i < aColor.length; i++) {
        var hex = Number(aColor[i]).toString(16);
        if (hex === "0") {
          hex += hex;
        }
        strHex += hex;
      }
      if (strHex.length !== 7) {
        strHex = that;
      }
      return strHex;
    } else if (regex.test(that)) {
      var aNum = that.replace(/#/, "").split("");
      if (aNum.length === 6) {
        return that;
      } else if (aNum.length === 3) {
        var numHex = "#";
        for (var i = 0; i < aNum.length; i += 1) {
          numHex += (aNum[i] + aNum[i]);
        }
        return numHex;
      }
    } else {
      return that;
    }
  },

  colorRGB(str) {
    var sColor = str.toLowerCase();
    if (sColor && this.regex.test(sColor)) {
      if (sColor.length === 4) {
        var sColorNew = "#";
        for (var i = 1; i < 4; i += 1) {
          sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
        }
        sColor = sColorNew;
      }
      //处理六位的颜色值
      var sColorChange = [];
      for (var i = 1; i < 7; i += 2) {
        sColorChange.push(parseInt("0x" + sColor.slice(i, i + 2)));
      }
      return "RGB(" + sColorChange.join(",") + ")";
    } else {
      return sColor;
    }
  },

  IndexDemo(str1, str2) {
    var s = str2.indexOf(str1);
    return s;
  },

  getRegion(content, callback) {
    let that = this;
    this.ajax({
      url: 'dev/getregion',
      method: 'POST',
      data: {
        uid: wx.getStorageSync('wxuser').id,
      },
    }).then((res) => {
      for (let i in res.data) {
        if (res.data[i].pid == wx.getStorageSync('did')) {
          if (that.IndexDemo(res.data[i].name, content) == 0 || that.IndexDemo(res.data[i].name, content) > 0) {
            let rid = res.data[i].id;
            callback(rid, res.data[i].name)
          }
        }
      }
    })
  },

  /**
   * 发送数据
   */
  sendData(count) {
    let that = this;
    tools.sendData('c2s_write', wx.getStorageSync('did'), {
      'data': that.getArrays(count),
    });
  },

};

export { $ }