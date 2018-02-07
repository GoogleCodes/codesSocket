//app.js

let urls = require('utils/common/common.js');

App({
  data: {
    deviceInfo: {},

    json: {
      'attrs': 'attrs_v4',
      'custom': 'custom'
    },
    _heartbeatInterval: 60,  //  心跳
    _heartbeatTimerId: undefined,  //  心跳
    options: wx.getStorageSync('options'),
    wechatOpenId: 'kceshi1',  //  测试:kceshi1
    gizwitsAppId: '141b9a9bb1df416cbb18bb85c864633f',
    did: '',
    host: '', //  websocket 请求地址 sandbox.gizwits.com
    ws_port: 0, //  端口
    wss_port: 0, //  端口
  },

  onLaunch() {
    this.data.deviceInfo = wx.getSystemInfoSync();
    //  微信小程序appid  微信小程序secret
    var that = this;
    //获取openid
    var user = wx.getStorageSync('user') || {};
    //不要在30天后才更换openid-尽量提前10分钟更新
    if (typeof user == 'object' && !user.openid && (user.expires_in || Date.now()) < (Date.now() + 600)) {
      wx.login({
        success(res) {
          var d = that.globalData.wxData; //  这里存储了appid、secret、token串
          if (res.errMsg == 'login:ok') {

            // wx.request({
            //   url: 'http://www.getcodeing.cn/public/index/member/getWeChatOpenId',
            //   method: 'POST',
            //   header: {
            //     'content-type': 'application/json',
            //     'content-type': 'application/x-www-form-urlencoded'
            //   },
            //   data: {
            //     code: res.code
            //   },
            //   success(res) {
            //     if (res.data.statusCode == 200) {
            //       var obj = {};
            //       obj.openid = res.data.openid;
            //       obj.expires_in = Date.now() + res.data.expires_in;
            //       wx.setStorageSync('user', obj); //  存储openid
            //     }
            //   },
            // })

            that.ajax({
              url: 'member/getWeChatOpenId',
              method: 'POST',
              data: {
                code: res.code
              },
            }).then(function (res) {
              var obj = {};
              obj.openid = res.openid;
              obj.expires_in = Date.now() + res.expires_in;
              wx.setStorageSync('user', obj); //  存储openid
            });
          } 
        }
      });
    }
    // wx.getUserInfo({
    //   success(res) {
    //     let userInfo = res.userInfo,
    //         nickName = userInfo.nickName,
    //         avatarUrl = userInfo.avatarUrl,
    //         gender = userInfo.gender, //性别 0：未知、1：男、2：女,
    //         province = userInfo.province,
    //         city = userInfo.city,
    //         country = userInfo.country;
    //   }
    // });

  },

  getUserInfo(cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.getUserInfo({
        withCredentials: false,
        success(res) {
          that.globalData.userInfo = res.userInfo
          typeof cb == "function" && cb(that.globalData.userInfo)
        }
      })
    }
  },

  globalData: {
    userInfo: null
  },
  
  /**
  * 发送数据
  */
  _sendJson(json) {
    var that = this;
    wx.sendSocketMessage({
      //  对象转换字符串
      data: JSON.stringify(json),
    })
  },

  //  心跳开始
  _startPing() {
    var that = this;
    console.log(that.data._heartbeatInterval);
    var heartbeatInterval = that.data._heartbeatInterval * 1000;
    that.data._heartbeatTimerId = setInterval(function() {
      var options = {
        cmd: "ping"
      };
      that._sendJson(options);
    }, heartbeatInterval);
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

})
