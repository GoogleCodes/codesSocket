//app.js
App({
  data: {
    deviceInfo: {},

    json: {
      'attrs': 'attrs_v4',
      'custom': 'custom'
    },
    options: wx.getStorageSync('options'),
    wechatOpenId: 'kceshi1',  //  测试:kceshi1
    gizwitsAppId: '141b9a9bb1df416cbb18bb85c864633f',
    did: '',
    host: '', //  websocket 请求地址 sandbox.gizwits.com
    ws_port: 0, //  端口
    wss_port: 0, //  端口
  },


  onLaunch: function() {
    this.data.deviceInfo = wx.getSystemInfoSync();
    //  微信小程序appid  微信小程序secret
    var that = this, appID = 'wx427aa2cee61883dd', secret = '945ffa55aed70a50c4db910df20c778e';
    //获取openid
    var user = wx.getStorageSync('user') || {};
    if (typeof user == 'object' && !user.openid && (user.expires_in || Date.now()) < (Date.now() + 600)) {//不要在30天后才更换openid-尽量提前10分钟更新
      wx.login({
        success: function (res) {
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


    // this.goConnSocket();

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

  goConnSocket() {
    let that = this, json = {};
    //  创建Socket
    wx.connectSocket({
      url: 'wss://sandbox.gizwits.com:8880/ws/app/v1',
      success(res) {
        console.log(res);
      }, fail(err) {
        console.log(err);
      }
    });

    wx.onSocketError((res) => {
      console.log(res, 'WebSocket连接打开失败，请检查！')
    })

    //  监听 WebSocket 连接事件
    wx.onSocketOpen((res) => {
      that.setData({ socketOpen: true });
      json = {
        cmd: "login_req",
        data: {
          appid: that.data.options.gizwitsAppId,
          uid: that.data.options.uid,
          token: that.data.options.token,
          p0_type: that.data.json.attrs,
          heartbeat_interval: 180,
          auto_subscribe: true
        }
      };
      that._startPing();
      that._sendJson(json);

      let option = {}, arr = [];
      for (let i in that.data.list) {
        option = {
          did: that.data.list[i].did,
        }
        arr.push(option);
      }
      wx.onSocketMessage((res) => {
        wx.hideLoading();
        var data = JSON.parse(res.data);
        //  链接socket
        json = {
          cmd: "subscribe_req",
          data: arr
        };
        //  发送数据
        that._sendJson(json);
        //  获取服务器返回的信息
        that.getServiceBack();
      });

    });

  },

  
})
