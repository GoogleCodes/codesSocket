//app.js

/**
 * https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wx82bd98556e74419d&secret=05b32110ac7df00b61d965e687f71495
 * 
 *  200	OK
 *   Connection: close
 *   Date: Tue, 08 Aug 2017 06:35:07 GMT
 *   Content-Type: application/json; encoding=utf-8
 *   Content-Length: 175
 *   {
 *       "access_token": "E4zeIEZXYhgrykQzRzF-wNeFj7Njsi_BLsxzKj7AOuRMwGEclOby1Hj0rqdRkAzBqV77dt1mITz3tS4JQ1rZub9f43tL_bX2-KGzkn_DdespF-WRwR8AYq9VhQDsWrXaIDLfAFATOW",
 * AbLD6HObyWI7JjAfO_bHEdJ47Lmd8fmFrpZmtx5dNnGVCLiLSVHOR2xAXDv6eftq7qyh-_wfkptPWBOsCoSBmJEUVR5tuzy-8QQMKTTinloQVOcAJAAFY
 *       "expires_in": 7200
 *   }
 */

require('utils/gizwits_ws_0.3.0.min.js');

App({
  onLaunch: function() {
    //  微信小程序appid  微信小程序secret
    var that = this, appID = 'wx82bd98556e74419d', secret = 'fc9c09765ac6d8c477f2ce71620d4ff1';
    //获取openid  
    var user = wx.getStorageSync('user') || {};
    if (typeof user == 'object' && !user.openid && (user.expires_in || Date.now()) < (Date.now() + 600)) {//不要在30天后才更换openid-尽量提前10分钟更新  
      wx.login({
        success: function (res) {
          var d = that.globalData.wxData;//这里存储了appid、secret、token串  
          var url = 'https://api.weixin.qq.com/sns/jscode2session?appid='+appID+'&secret='+secret+'&js_code='+res.code+'&grant_type=authorization_code';
          wx.request({
            url: url,
            data: {},
            method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT  
            // header: {}, // 设置请求的 header  
            success: function (res) {
              var obj = {};
              obj.openid = res.data.openid;
              obj.expires_in = Date.now() + res.data.expires_in;
              wx.setStorageSync('user', obj);//存储openid  
            }
          });
        }
      });
    } else {
      console.log(user);
    }

    wx.getUserInfo({
      success: function (res) {
        var userInfo = res.userInfo
        var nickName = userInfo.nickName
        var avatarUrl = userInfo.avatarUrl
        var gender = userInfo.gender //性别 0：未知、1：男、2：女 
        var province = userInfo.province
        var city = userInfo.city
        var country = userInfo.country
      }
    })

  },

  getUserInfo: function(cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.getUserInfo({
        withCredentials: false,
        success: function(res) {
          that.globalData.userInfo = res.userInfo
          typeof cb == "function" && cb(that.globalData.userInfo)
        }
      })
    }
  },

  globalData: {
    userInfo: null
  }
})
