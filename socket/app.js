//app.js

let $com = require('utils/common/common.js');
let utils = require('utils/util.js');
let $ = require('utils/main.js');

console.log($com.j.appID);

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
    var that = this, appID = 'wx427aa2cee61883dd', secret = '945ffa55aed70a50c4db910df20c778e';
    //获取openid
    var user = wx.getStorageSync('user') || {};
    if (typeof user == 'object' && !user.openid && (user.expires_in || Date.now()) < (Date.now() + 600)) {//不要在30天后才更换openid-尽量提前10分钟更新
      wx.login({
        success(res) {
          var d = that.globalData.wxData; //  这里存储了appid、secret、token串
          var url = $com.loginUri + '?appid=' + $com.j.appID + '&secret=' + $com.j.secret +'&js_code='+ res.code +'&grant_type=authorization_code';
          wx.request({
            url: url,
            method: 'GET',
            success(res) {
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
      success(res) {
        let userInfo = res.userInfo,
            nickName = userInfo.nickName,
            avatarUrl = userInfo.avatarUrl,
            gender = userInfo.gender, //性别 0：未知、1：男、2：女,
            province = userInfo.province,
            city = userInfo.city,
            country = userInfo.country;
      }
    });
    // this._getBindingList(20, 0);

    // wx.getSystemInfo({
    //   success: function (res) {
    //     console.log(res.model)
    //     console.log(res.pixelRatio)
    //     console.log(res.windowWidth)
    //     console.log(res.windowHeight)
    //     console.log(res.language)
    //     console.log(res.version)
    //     console.log(res.platform)
    //   }
    // })

  },

  _getBindingList(limit, skip) {
    var that = this;
    let options = wx.getStorageSync('options');
    let query = "?show_disabled=0&limit=" + limit + "&skip=" + skip;
    var head = {
      'content-type': 'application/json',
      'X-Gizwits-Application-Id': options.gizwitsAppId,
      'X-Gizwits-User-token': options.token,
    };

    if (options !== "") {
      utils.sendRrquest('bindings' + query, 'GET', '', head).then((result) => {
        let json = {}, arr = [], pson = {};
        wx.setStorageSync('devices', result.data.devices);
        for (var i in result.data.devices) {
          var device = result.data.devices[i];
          json = {
            did: device.did,
          };
          arr.push(json);
          if (result.data.devices[i].is_online == true) {
            //  获取数据
            pson = {
              'did': device.did,  //  did
              'host': device.host,  //  websocket 请求地址
              'ws_port': device.ws_port, //  端口
              'wss_port': device.wss_port, //  端口
            };
            wx.setStorageSync('didJSon', json);
          }
        }
        that._login(pson.host, pson.wss_port);
      }, (err) => { });
    }    
    
  },

  _login(host, port) {
    let that = this, json = {};
    //  获取options缓存数据
    var options = wx.getStorageSync('options');
    //  开启提示加载中。。。
    wx.showLoading({ title: '' })
    //  创建Socket
    wx.connectSocket({
      url: 'wss://' + host + ':' + port + '/ws/app/v1',
    });
    //  监听 WebSocket 连接事件
    wx.onSocketOpen((res) => {
      json = {
        cmd: "login_req",
        data: {
          appid: options.gizwitsAppId,
          uid: options.uid,
          token: options.token,
          p0_type: that.data.json.attrs,
          heartbeat_interval: 180,
          auto_subscribe: true
        }
      };
      that._startPing();
      that._sendJson(json);
    });
    wx.hideLoading();
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
    that.data._heartbeatTimerId = setInterval(() => {
      var options = {
        cmd: "ping"
      };
      that._sendJson(options);
    }, heartbeatInterval);
  },

})
