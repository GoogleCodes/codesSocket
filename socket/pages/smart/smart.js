// smart.js
//  导入js
var myUtils = require('../../utils/util.js');
let urls = require('../../utils/common/common.js');
var app = new getApp();
var times = null, ins = 0;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    open: false,
    mark: 0,
    newmark: 0,
    startmark: 0,
    endmark: 0,
    windowWidth: wx.getSystemInfoSync().windowWidth,
    staus: 1,
    translate: '',
    eleHeight: 0,
    uname: '',
    pword: '',
    voices: [],
    socketOpen: false,  //  开关
    options: {
      json: {
        'attrs': 'attrs_v4',
        'custom': 'custom'
      },
      wechatOpenId: 'kceshi1',  //  测试:kceshi1
      gizwitsAppId: '141b9a9bb1df416cbb18bb85c864633f',   //  虚拟测试:032c92bbb0fc4b6499a2eaed58727a3a || d8b4d2f0bce943ee9ecb4abfa01a2e55 || ba5546adce5e4efa9f2923e60a602fed
      did: '',
      host: '', //  websocket 请求地址 sandbox.gizwits.com
      ws_port: 0, //  端口
      wss_port: 0, //  端口
    },
    head: {
      'Content-Type': 'application/json',
      'Accept': ' application/json',
      'X-Gizwits-Application-Id': wx.getStorageSync('options').gizwitsAppId,
      'X-Gizwits-User-token': wx.getStorageSync('options').token,
    },
    uid: '',
    token: '',
    recodePath: '',  //  录音路径
    socketOpen: false,  //  socket 开关
    switchButton: false,  //  开关
    _heartbeatInterval: 60,  //  心跳
    _heartbeatTimerId: undefined,  //  心跳
    array: ['国语', '粤语'],
    index: 0,
    arrayCharset: 'zh',
    openMessage: '',
    isSpeaking: false,  //  是否正在说话
    listDevices: {},  //  设备列表
    chonseDid: 0,
    gizwitsVisible: true,
    gizwitsListVisible: false,
    ins_i: 0,
    ins_y: '',
    ins_l: '',
    chonseUpdate: false,
    chonseDelete: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    let that = this, limit = 20, skip = 0;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          eleHeight: res.windowHeight - 145,
        });
      },
    });
    if (wx.getStorageSync('options') == '') {
      wx.removeStorageSync('userInformation');
      wx.redirectTo({ url: '../login/login', });
    } else {
      that._getBindingList(20, 0);
    }
    console.log(myUtils.toStringTools('打开'));
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function (res) {
    // this.orderSign();
    let that = this;
    that.mapCtx = wx.createMapContext('myMap');
    if (that.data.gizwitsVisible == true) {
      that.setData({
        chonseDid: -1
      });
    }

    // let arr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    // console.log(arr.length);

    let arr = new Array(768);
    for (let i = 0; i <= 677; i++) {
      arr[i] = 0;
    }
    console.log(arr.length);
    // let too = myUtils.toStringTools('打开情景模式');
    // var arrtoo = arr.slice(0);
    // console.log(too.concat(arrtoo).splice(0, 768));
    
    // myUtils.sendRrquest('scene', 'GET', '', that.data.head).then(function (result) {
    //   console.log(result.data);
    // }, function (err) {
    //   console.log(err);
    // });

    // wx.openSetting({
    //   success: (res) => {
    //     res.authSetting = {
    //       "scope.userinfo": true,
    //       "scope.userLocation": true,
    //       "scope.record": true
    //     };
    //   }
    // });
    // //  返回值中只会出现小程序已经向用户请求过的权限。
    // wx.getSetting({
    //   success: (res) => {
    //     res.authSetting = {
    //       "scope.userinfo": true,
    //       "scope.userLocation": true,
    //       "scope.record": true
    //     };
    //   },
    // })
  },

  stringToBytes(str) {
    var ch, st, re = [];
    for (var i = 0; i < str.length; i++) {
      ch = str.charCodeAt(i);
      st = [];
      do {
        st.push(ch & 0xFF);
        ch = ch >> 8;
      }
      while (ch);
      re = re.concat(st.reverse());
    }
    return re;
  },

  //  登出
  backLogin() {
    wx.showModal({
      title: '提示',
      content: "你确定要退出登录???",
      showCancel: true,
      success: function (res) {
        if (res.confirm == true) {
          wx.closeSocket({})  //  关闭websocket
          //  清除缓存
          wx.removeStorageSync('options');
          wx.removeStorageSync('userInformation');
          wx.redirectTo({ url: '../login/login', })
        }
      }
    });
  },

  //  获取产品数据点定义
  _getGizwitsDataing(key) {
    let that = this, options = wx.getStorageSync('options');
    var head = {
      'content-type': 'application/json',
      'X-Gizwits-Application-Id': wx.getStorageSync('options').gizwitsAppId,
    };
    myUtils.sendRrquest('datapoint?product_key=' + key, 'GET', '', head).then(function (result) { }, function (err) { });
  },

  //  监控设备
  _GizwitsDevdata(did) {
    let that = this;
    let head = {
      'content-type': 'application/json',
      'X-Gizwits-Application-Id': wx.getStorageSync('options').gizwitsAppId,
    };
    myUtils.sendRrquest('devdata/' + did + '/latest', 'GET', '', head).then(function (result) { }, function (err) { });
  },

  //  扫描二维码分享
  _shareGizwits() {
    let that = this, code = "adc1b95729864eecb02cd614cd305abc";
    wx.scanCode({
      success(res) {
        //  创建设备分享
        myUtils.sendRrquest('sharing/code/' + code, 'POST', '', that.data.head).then(function (result) {
          console.log(result);
        }, function (err) { });
      },
    })

    // //  创建设备分享
    myUtils.sendRrquest('sharing/code/' + code, 'POST', '', that.data.head).then(function (result) {
      console.log(result);
    }, function (err) {
      console.log(err);
    });

    // var options = {
    //   "type": 0,
    //   "did": that.data.options.did,
    //   "uid": wx.getStorageSync('options').uid,
    // };
    // myUtils.sendRrquest('sharing', 'POST', options, that.data.head).then(function (result) {
    //   console.log(result);
    // }, function (err) {
    //   console.log(err);
    // });

    //  查询分享设备
    // var sharing_type = 1, status = 0;
    // myUtils.sendRrquest('sharing?sharing_type=' + sharing_type + '&status=' + status + '', 'GET', '', that.data.head).then(function (result) {
    //   console.log(result.data);
    // }, function (err) {
    //   console.log(err);
    // });
  },

  _postScheduler(did) {
    let that = this;
    let dodate = new Date();
    let y = dodate.getFullYear(), m = dodate.getMonth() + 1, d = dodate.getDate();
    var thatTime = y + '-' + m + '-' + d;
    let json = {
      "raw": "string",
      "attrs": {
        'onoffAll': true,
      },
      "date": thatTime,
      "time": "19:00",
      "repeat": "day",  //"mon,tue,wed,thu,fri,sat,sun",
      "days": [20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
      "start_date": thatTime,
      "end_date": "2017-09-23",
      "enabled": true,
      "remark": ""
    };
    myUtils.sendRrquest('devices/' + did + '/scheduler', 'POST', json, that.data.head).then(function (result) {
      console.log(result);
      myUtils.sendRrquest('devices/' + did + '/scheduler?limit=20&skip=0', 'GET', '', that.data.head).then(function (result) {
        var url = 'https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=' + 'OuvB3IxXvzl5vqP6p1T7anDYHKBpzFAZEipOlElbRwBWSsDMlNbX2GEVH59tpR-dcSV4W6np0lzOqjn5eUqga9lvRqEVUVgGZfMmjD5tf37PL_Iz_G3DAhXM5pzdenHwTOCeACAJES';
        wx.request({
          url: url,
          data: {
            touser: wx.getStorageSync('user').openid,
            template_id: 'ho9RAP7GBHDJYg3EVHqiBgxSQmt1apwOpGAhLBCfgkI',//这个是1、申请的模板消息id，  
            page: '/pages/smart/smart',
            form_id: wx.getStorageSync('userInformation').formID,
            data: {
              "keyword1": {
                "value": '测试发送消息',
                "color": "#4a4a4a"
              },
              "keyword2": {
                "value": '智能灯已开启',
                "color": "#4a4a4a"
              }
            },
            emphasis_keyword: 'keyword1.DATA'
          },
          method: 'POST',
          success: function (res) {
            console.log(res);
            that.setData({ switchButton: true });
            //  发送数据
            that.sendJSON('c2s_write', that.data.did, that.data.switchButton);
            wx.showToast({
              title: '发送成功',
              icon: 'success',
              duration: 2000
            });
          },
          fail: function (err) {
            
          }
        });
      }, function (err) { });
    }, function (err) { });
    // wx.getLocation({
    //   type: 'gcj02', // gcj02 wgs84
    //   success: function (res) {
    //     var latitude = res.latitude //  纬度，浮点数，范围为-90~90，负数表示南纬
    //     var longitude = res.longitude //  经度，浮点数，范围为-180~180，负数表示西经
    //     var speed = res.speed //  速度，浮点数，单位m/s
    //     var accuracy = res.accuracy //  位置的精确度
    //   }
    // });
  },

  _getBindingList: function (limit, skip) {
    var that = this;
    let options = wx.getStorageSync('options');
    let query = "?show_disabled=0&limit=" + limit + "&skip=" + skip;
    var head = {
      'content-type': 'application/json',
      'X-Gizwits-Application-Id': options.gizwitsAppId,
      'X-Gizwits-User-token': options.token,
    };
    myUtils.sendRrquest('bindings' + query, 'GET', '', head).then(function (result) {
      that.setData({ listDevices: result.data.devices });
      var pKey = null;
      for (var i in result.data.devices) {
        var device = result.data.devices[i];
        if (result.data.devices[i].is_online == true) {
          //  获取数据
          that.setData({
            'options.did': device.did,  //  did
            'options.host': device.host,  //  websocket 请求地址
            'options.ws_port': device.ws_port, //  端口
            'options.wss_port': device.wss_port, //  端口
          });
          pKey = device.product_key;
        }
      }
      // that._GizwitsDevdata(that.data.options.did);
      // that._getGizwitsDataing(pKey);
    }, function (err) { });
  },

  //  选中列表设备
  chonseDid(e) {
    var that = this;
    that._login();
    that.setData({ gizwitsVisible: false });
    var did = e.currentTarget.dataset.did, index = e.currentTarget.dataset.index
    if (that.data.chonseDid === index) {
      console.log(did);
      this.setData({ did: did, });
      that._postScheduler(that.data.options.did);
      return;
    } else {
      this.setData({
        did: did,
        chonseDid: index,
      });
    }
  },

  //  心跳开始
  _startPing: function () {
    var that = this;
    var heartbeatInterval = that.data._heartbeatInterval * 1000;
    that.data._heartbeatTimerId = setInterval(function () {
      var options = {
        cmd: "ping"
      };
      that._sendJson(options);
    }, heartbeatInterval);
  },

  _login: function () {
    var that = this, json = [];
    //  创建Socket
    wx.connectSocket({
      url: 'wss://' + that.data.options.host + ':' + that.data.options.wss_port + '/ws/app/v1',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) { },
    });
    //  监听 WebSocket 连接事件
    wx.onSocketOpen(function (res) {
      var options = wx.getStorageSync('options');
      that.data.socketOpen = true;
      json = {
        cmd: "login_req",
        data: {
          appid: options.gizwitsAppId,
          uid: options.uid,
          token: options.token,
          p0_type: that.data.options.json.attrs,
          heartbeat_interval: 180,
          auto_subscribe: true
        }
      }
      that._startPing();
      that._sendJson(json);
    });
    wx.onSocketMessage(function (res) {
      var data = JSON.parse(res.data);
      if (data.data.success == true) {
        //  链接socket
        json = {
          cmd: "subscribe_req",
          data: [{
            did: that.data.did,
            passcode: 123456
          }]
        };
        that._sendJson(json);
        //  读取数据
        that.getJSON('c2s_read', that.data.did);
        //  获取服务器返回的信息
        wx.onSocketMessage(function (res) {
          var noti = JSON.parse(res.data), _sendJson = {};
          switch (noti.cmd) {
            case 'subscribe_res':
              for (var i in noti.data.success) {
                that.setData({
                  did: noti.data.success[i].did
                });
              }
            case 'pong':
              break;
            case 's2c_noti':
            //  do somethings
            case 's2c_raw':
            //  do somethings
          }
        });
      } else {
        if (data.data.msg == "M2M socket has closed, please login again!") {
          that._login();
        }
      }
    });
  },

  //  拉动按钮
  sliderchange(e) {
    let that = this, json = {
      'hardwareVersion': e.detail.value,
    };
    that.sendJSON('c2s_write', that.data.did, json);
  },

  //  智能灯开关
  chonseSocket(e) {
    var that = this, json = {};
    let arr = new Array(768);
    for (let i = 0; i < 768; i++) {
      arr[i] = 0; 
    }
    console.log(arr);
    var arrtoo = arr.slice(0);
    that.setData({ socketOpen: true });
    //  发送数据开关 true : 打开  false : 关闭
    if (e.detail.value == true) {
      that.setData({ switchButton: true });
      let too = myUtils.toStringTools('打开情景模式');
      let aoo = too.concat(arrtoo).splice(0, 768);
      console.log(aoo.length);
      //  发送数据
      json = {
        "onoffAll": that.data.switchButton,
        "data": too.concat(arrtoo).splice(0, 768)
      };
      console.log(json.data);
      that.sendJSON('c2s_write', that.data.did, json);
      myUtils.Toast('打开成功', 'success');
    } else {
      let too = myUtils.toStringTools('关闭情景模式');
      that.setData({ switchButton: false });
      //  发送数据
      json = {
        "onoffAll": that.data.switchButton,
        "data": too.concat(arrtoo).splice(0, 768)
      };
      that.sendJSON('c2s_write', that.data.did, json);
      myUtils.Toast('关闭成功', 'success');
    }
  },

  getJSON(cmd, dids, names) {
    var that = this;
    //  读取数据
    var json = {
      cmd: cmd,
      data: {
        did: dids,
        names: names
      }
    };
    myUtils.sendJsons(json);
  },

  sendJSON(cmd, dids, form) {
    var that = this;
    var json = {
      cmd: cmd,
      data: {
        did: dids,
        attrs: form,
      },
    };
    myUtils.sendJsons(json);
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

  bindPickerChange(e) {
    var that = this;
    that.setData({
      index: e.detail.value
    });
    if (that.data.index == 0) {
      that.setData({
        arrayCharset: 'zh', //  国语
      });
    } else if (that.data.index == 1) {
      that.setData({
        arrayCharset: 'ct',// 粤语
      });
    }
  },

  orderSign: function (e) {
    let that = this;
    // let countdown = 24 * 3600 * 5;
    // let num = 5;
    // num--;
    // // // 立即显示还剩五天
    // console.log("还剩余5天0小时0分0秒");
    // // 倒计时
    // var countdownTimer = setInterval(function () {
    //   countdown -= 1;
    //   var rest = countdown;
    //   // 天
    //   var days = parseInt(rest / (24 * 3600), 10);
    //   rest -= days * 24 * 3600;
    //   // 时
    //   var hours = parseInt(rest / 3600, 10);
    //   rest -= hours * 3600;
    //   // 分
    //   var minutes = parseInt(rest / 60, 10);
    //   rest -= minutes * 60;
    //   // 秒
    //   var seconds = parseInt(rest, 10);
    //   // console.log("还剩余" + days + "天" + hours + "小时" + minutes + "分" + seconds + "秒");
    // }, 1e3);
    var url = 'https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=' + '2BVg5XaXPn8MD6UgPp-bbMQ03VjKFxmn03ZBqpMp23ZN7V4uIhPNDZC2sIP6ArX2fjvUaUUKCrx-xLkLyRDGU2T8zqB3Q9ck9G-kczwwwIsgCIMLi1di2pdaXzNFTOIHJNWiAJAWAJ';
    wx.request({
      url: url,
      data: {
        touser: wx.getStorageSync('user').openid,   //  e.detail.formId   wx.getStorageSync('user').openid
        template_id: 'ho9RAP7GBHDJYg3EVHqiBgxSQmt1apwOpGAhLBCfgkI',//这个是1、申请的模板消息id，  
        page: '/pages/smart/smart',
        form_id: wx.getStorageSync('userInformation').formID,
        data: {
          "keyword1": {
            "value": '测试发送消息',
            "color": "#4a4a4a"
          },
          "keyword2": {
            "value": '智能灯已开启',
            "color": "#4a4a4a"
          }
        },
        emphasis_keyword: 'keyword1.DATA'
      },
      method: 'POST',
      success: function (res) {
        that.setData({ switchButton: true });
        //  发送数据
        that.sendJSON('c2s_write', that.data.did, that.data.switchButton);
        wx.showToast({
          title: '发送成功',
          icon: 'success',
          duration: 2000
        });
      },
      fail: function (err) {
        console.log("push err")
        console.log(err);
      }
    });
    // if (num == 0) {
    //   clearInterval(countdownTimer);
    // };
  },

  tap_ch: function (e) {
    if (this.data.open) {
      this.setData({ translate: 'transform: translateX(0px)' })
      this.data.open = false;
    } else {
      this.setData({
        translate: 'transform: translateX(' + this.data.windowWidth * 0.75 + 'px)'
      })
      this.data.open = true;
    }
  },

  tap_start: function (e) {
    this.data.mark = this.data.newmark = e.touches[0].pageX;
    if (this.data.staus == 1) {
      // staus = 1指默认状态
      this.data.startmark = e.touches[0].pageX;
    } else {
      // staus = 2指屏幕滑动到右边的状态
      this.data.startmark = e.touches[0].pageX;
    }
  },
  tap_drag: function (e) {
    /*
     * 手指从左向右移动
     * @newmark是指移动的最新点的x轴坐标 ， @mark是指原点x轴坐标
     */
    this.data.newmark = e.touches[0].pageX;
    if (this.data.mark < this.data.newmark) {
      if (this.data.staus == 1) {
        if (this.data.windowWidth * 0.75 > Math.abs(this.data.newmark - this.data.startmark)) {
          this.setData({
            translate: 'transform: translateX(' + (this.data.newmark - this.data.startmark) + 'px)'
          })
        }
      }
    }
    /*
     * 手指从右向左移动
     * @newmark是指移动的最新点的x轴坐标 ， @mark是指原点x轴坐标
     */
    if (this.data.mark > this.data.newmark) {
      if (this.data.staus == 1 && (this.data.newmark - this.data.startmark) > 0) {
        this.setData({
          translate: 'transform: translateX(' + (this.data.newmark - this.data.startmark) + 'px)'
        })
      } else if (this.data.staus == 2 && this.data.startmark - this.data.newmark < this.data.windowWidth * 0.75) {
        this.setData({
          translate: 'transform: translateX(' + (this.data.newmark + this.data.windowWidth * 0.75 - this.data.startmark) + 'px)'
        })
      }
    }
    this.data.mark = this.data.newmark;
  },
  tap_end: function (e) {
    if (this.data.staus == 1 && this.data.startmark < this.data.newmark) {
      if (Math.abs(this.data.newmark - this.data.startmark) < (this.data.windowWidth * 0.2)) {
        this.setData({
          translate: 'transform: translateX(0px)'
        })
        this.data.staus = 1;
      } else {
        this.setData({
          translate: 'transform: translateX(' + this.data.windowWidth * 0.75 + 'px)'
        })
        this.data.staus = 2;
      }
    } else {
      if (Math.abs(this.data.newmark - this.data.startmark) < (this.data.windowWidth * 0.2)) {
        this.setData({
          translate: 'transform: translateX(' + this.data.windowWidth * 0.75 + 'px)'
        })
        this.data.staus = 2;
      } else {
        this.setData({
          translate: 'transform: translateX(0px)'
        })
        this.data.staus = 1;
      }
    }
    this.data.mark = 0;
    this.data.newmark = 0;
  },

  onMarkMsgTap() {
    let that = this;
    that.setData({
      chonseUpdate: true,
      chonseDelete: false,
    });
  },

  //  删除设备
  onDevicesDelete(e) {
    let that = this;
    wx.showModal({
      title: '提示',
      content: "你确定要删除嘛???",
      showCancel: true,
      success: function (res) {
        if (res.confirm == true) {
          let json = {
            devices: [{
              did: e.currentTarget.dataset.did,
            }]
          };
          myUtils.sendRrquest('bindings', 'DELETE', json, that.data.head).then(function (result) {
            that.setData({
              gizwitsVisible: true,
              gizwitsListVisible: true,
            });
          });
        } else if (res.cancel == true) {
          that.setData({
            chonseUpdate: false,
            chonseDelete: true,
          });
          return;
        }
      },
      fail(err) { }
    });
  },

  //  返回
  goReturn() {
    let that = this;
    that.setData({
      chonseDelete: true,
      chonseUpdate: false,
    });
  },

  /**
   * 开始录音
   */
  startRecode: function (e) {
    var that = this;
    wx.startRecord({
      success: function (res) {
        var tempFilePath = res.tempFilePath;
        that.setData({ recodePath: tempFilePath, isSpeaking: true });
        wx.showToast({
          title: '录音成功!',
          icon: 'success',
          duration: 1000
        });
        wx.getSavedFileList({
          success: function (res) {
            var voices = [];
            for (var i in res.fileList) {
              //  格式化时间  
              var createTime = new Date(res.fileList[i].createTime)
              //  将音频大小B转为KB  
              var size = (res.fileList[i].size / 1024).toFixed(2);
              var voice = { filePath: res.fileList[i].filePath, createTime: createTime, size: size };
              voices = voices.concat(voice);
            }
            that.setData({ voices: voices })
          }
        });
      },
      fail: function (err) {
        console.log(err.data);
      }
    });
  },

  //  结束录音
  endRecode: function (e) {
    var s = this;
    wx.stopRecord();
    s.setData({ isSpeaking: false });
    wx.showToast();
    setTimeout(function () {
      wx.uploadFile({
        url: 'https://www.chlorop.com.cn/yuyin/public/index/index/zhen', // urls.onloadurl, //
        filePath: s.data.recodePath,
        method: "POST",
        name: 'abc',
        header: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Origin, X-Requested - With, Content-Type, Accept'
        },
        formData: {
          'lan': s.data.arrayCharset, // 'zh',
        },
        header: ('Access-Control-Allow-Methods: GET, POST, PUT'),
        success: function (res) {
          var error_text = '语音识别失败';
          console.log("返回的东西是：", res.data.toString() == error_text, res.data.toString());
          switch(true) {
            case res.data.toString() == error_text:
              myUtils.Toast('语音识别失败!请重试!','success');
              break;
            case res.statusCode == 404:
              myUtils.Toast('服务器搞飞机去了!呜呜呜~~~~', 'success');
              return;
          }
          var options = JSON.parse(res.data), result = null, sqlStr = null, json = {};
          s.setData({
            ins_y: options.time1,
            ins_l: options.time2,
          });
          for (var i in options) {
            var sqlStr = options[i].toString();
            console.log(sqlStr);
            s.setData({
              openMessage: sqlStr,
            });
            if (typeof (sqlStr) == "string") {
              var myString = sqlStr.substring(0, 1);
            }
            switch (true) {
              case myString == "开" || myString == '打':
                s.setData({ switchButton: true });
                json = {
                  "onoffAll": s.data.switchButton,
                };
                //  发送数据
                s.sendJSON('c2s_write', s.data.did, json);
                myUtils.Toast('打开成功!', 'success');
                break;
              case myString == "关":
                s.setData({ switchButton: false });
                json = {
                  "onoffAll": s.data.switchButton,
                };
                //  发送数据
                s.sendJSON('c2s_write', s.data.did, json);
                myUtils.Toast('关闭成功!', 'success');
                break;
            }
          }
          var str = res.data;
          if (data.states == 1) {
            var cEditData = s.data.editData;
            cEditData.recodeIdentity = data.identitys;
            s.setData({ editData: cEditData });
          }
          else {
            wx.showModal({
              title: '提示',
              content: data.message,
              showCancel: false,
              success: function (res) { }
            });
          }
          wx.hideToast();
        },
        fail: function (res) {  //  错误提示
          wx.showModal({
            title: '提示',
            content: "录音的姿势不对!",
            showCancel: false,
            success: function (res) { }
          });
          wx.hideToast();
        }
      });
    }, 1000)
  },
});