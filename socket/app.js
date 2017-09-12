//app.js
App({
  onLaunch: function() {
    //  微信小程序appid  微信小程序secret
    var that = this, appID = 'wx82bd98556e74419d', secret = 'f8695b267219ed670f0553e8a3ab1fbb';
    //获取openid
    var user = wx.getStorageSync('user') || {};
    if (typeof user == 'object' && !user.openid && (user.expires_in || Date.now()) < (Date.now() + 600)) {//不要在30天后才更换openid-尽量提前10分钟更新  
      wx.login({
        success: function (res) {
          console.log(res);
          var d = that.globalData.wxData; //  这里存储了appid、secret、token串
          var url = 'https://api.weixin.qq.com/sns/jscode2session?appid='+ appID +'&secret='+ secret +'&js_code='+ res.code +'&grant_type=authorization_code';
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
    });
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
  },

  
})
