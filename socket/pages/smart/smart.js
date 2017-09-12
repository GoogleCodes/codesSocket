// smart.js
//  导入js
var myUtils = require('../../utils/util.js');

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
      apiHost: 'api.gizwits.com',
      json: {
        'attrs': 'attrs_v4',
        'custom': 'custom'
      },
      wechatOpenId: 'kceshi1',  //  测试:kceshi1
      gizwitsAppId: '141b9a9bb1df416cbb18bb85c864633f',   //  虚拟测试:032c92bbb0fc4b6499a2eaed58727a3a || d8b4d2f0bce943ee9ecb4abfa01a2e55 || ba5546adce5e4efa9f2923e60a602fed
    },
    uid: '',
    token: '',
    did: '',
    host: '', //  websocket 请求地址
    ws_port: 0, //  端口
    wss_port: 0, //  端口
    recodePath: '',  //  录音路径
    keepalive: 180,
    socketOpen: false,  //  socket 开关
    url: 'sandbox.gizwits.com',  //  websocket 请求地址 sandbox.gizwits.com
    switchButton: false,  //  开关
    _heartbeatInterval: 60,  //  心跳
    _heartbeatTimerId: undefined,
    array: ['国语', '粤语'],
    index: 0,
    arrayCharset: 'zh',
    startPoint: [0, 0],
    openMessage: '',
    isSpeaking: false,  //  是否正在说话
    listDevices: {},  //  设备列表
    chonseDid: 0,
    gizwitsVisible: true,
    ins_i: 0,
    ins_y: '',
    ins_l: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    var that = this;
    // this._getUserToken();
    var limit = 20;
    var skip = 0;
    wx.getSystemInfo({
      success: function(res) {
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
            that.setData({
              voices: voices
            })
          }
        });
      },
      fail: function (err) {
        console.log(err.data);
      }
    });
  },

  //点击播放录音  
  gotoPlay: function (e) {
    var filePath = e.currentTarget.dataset.key;
    //点击开始播放  
    wx.showToast({
      title: '开始播放',
      icon: 'success',
      duration: 1000
    })
    wx.playVoice({
      filePath: filePath,
      success: function () {
        wx.showToast({
          title: '播放结束',
          icon: 'success',
          duration: 1000
        })
      }
    })
  },

  /**
   * 结束录音
   */
  endRecode: function (e) {
    var s = this;
    wx.stopRecord();
    var options = wx.getStorageSync('options');
    s.setData({ isSpeaking: false });
    wx.showToast();
    setTimeout(function () {
      var urls = 'http://yuyin.ittun.com/public/index/index/zhen';
      wx.uploadFile({
        url: urls,
        filePath: s.data.recodePath,
        method: "POST",
        name: 'abc',
        header: ('Access-Control-Allow-Origin: *'),
        header: ("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept"),
        formData: {
          'lan': s.data.arrayCharset,
        },
        header: ('Access-Control-Allow-Methods: GET, POST, PUT'),
        success: function (res) {
          clearInterval(times);
          s.setData({ ins_i: ins });
          var error_text = '语音识别失败';
          console.log("返回的东西是：", res.data);
          if (res.data.toString() == error_text) {
            wx.showToast({
              title: '语音识别失败!请重试!',
              icon: 'success',
              duration: 2000
            });
          }
          // if (res.statusCode == 404) {
          //   wx.showToast({
          //     title: '服务器搞飞机去了!呜呜呜~~~~',
          //     icon: 'success',
          //     duration: 2000
          //   });
          //   return;
          // }
          var options = JSON.parse(res.data), result = null, sqlStr = null;
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
            if (myString == "开" || myString == '打') {
              s.setData({ switchButton: true });
              //  发送数据
              s.sendJSON('c2s_write', s.data.did, s.data.switchButton);
              wx.showToast({
                title: '打开成功',
                icon: 'success',
                duration: 2000
              });
            } else if (myString == "关") {
              s.setData({ switchButton: false });
              //  发送数据
              s.sendJSON('c2s_write', s.data.did, s.data.switchButton);
              wx.showToast({
                title: '关闭成功',
                icon: 'success',
                duration: 2000
              });
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
            clearInterval(times);
          }
          wx.hideToast();
        },
        fail: function (res) {  //  错误提示
          wx.showModal({
            title: '提示',
            content: "录音的姿势不对!",
            showCancel: false,
            success: function (res) {}
          });
          wx.hideToast();
        }
      });
    }, 1000)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function (res) {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},

  backLogin() {
    wx.showModal({
      title: '提示',
      content: "你确定要退出登录???",
      showCancel: true,
      success: function (res) {
        console.log(res.cancel,  res.confirm);
        if (res.confirm == true) {
          wx.removeStorageSync('options');
          wx.removeStorageSync('userInformation');
          wx.redirectTo({ url: '../login/login', })
        } else if (res.cancel == false) {
          return;
        }
      }
    });
  },

  touchMoveView () {
    console.log(1);
  },

  _getUserToken() {
    var that = this;
    wx.request({
      // https://api.gizwits.com/app/users
      url: "https://api.gizwits.com/app/login",
      method: 'POST',
      header: {
        'content-type': 'application/json',
        "X-Gizwits-Application-Id": that.data.options.gizwitsAppId, // phone_id: that.data.options.wechatOpenId,
      },
      data: {
        lang: "en",
        username: '13250672958',
        password: '123456789',
      },
      success: function (result) {
        that.setData({
          uid: result.data.uid,
          token: result.data.token,
        });
        var limit = 20;
        var skip = 0;
        that._getBindingList(limit, skip)
      },
      fail: function (evt) {
        console.log(evt);
      }
    })
  },

  _getBindingList: function (limit, skip) {
    var that = this;
    var options = wx.getStorageSync('options');
    var query = "?show_disabled=0&limit=" + limit + "&skip=" + skip;
    wx.request({
      url: "https://api.gizwits.com/app/bindings" + query,
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'X-Gizwits-Application-Id': options.gizwitsAppId, //  that.data.options.gizwitsAppId,
        'X-Gizwits-User-token': options.token,
      },
      success: function (result) {
        that.setData({
          listDevices: result.data.devices
        });
        for (var i in result.data.devices) {
          var device = result.data.devices[i];
          if (result.data.devices[i].is_online == true) {
            //  获取数据
            that.setData({
              did: device.did,  //  did
              host: device.host,  //  websocket 请求地址
              ws_port: device.ws_port, //  端口
              wss_port: device.wss_port, //  端口
            });
          }
        }
        // that._login();
      },
      fail: function (evt) { }
    })
  },

  //  选中列表设备
  chonseDid(e) {
    var that = this;
    that._login();
    that.setData({gizwitsVisible: false});
    var did = e.currentTarget.dataset.did, index = e.currentTarget.dataset.index
    if (that.data.chonseDid === index) {
      console.log(did);
      this.setData({did: did,});
      return;
    } else {
      this.setData({
        did: did,
        chonseDid: index,
      });
      console.log(that.data.did);
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
      url: 'wss://' + that.data.url + ':' + that.data.wss_port + '/ws/app/v1',
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
          heartbeat_interval: that.data.keepalive,
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
          },]
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

  //  智能灯开关
  chonseSocket: function (e) {
    var that = this, json = [];
    that.setData({ socketOpen: true });
    //  发送数据开关 true : 打开  false : 关闭
    if (e.detail.value == true) {
      that.setData({ switchButton: true });
      //  发送数据
      that.sendJSON('c2s_write', that.data.did, that.data.switchButton);
      wx.showToast({
        title: '打开成功',
        icon: 'success',
        duration: 2000
      });
    } else {
      that.setData({ switchButton: false });
      //  发送数据
      that.sendJSON('c2s_write', that.data.did, that.data.switchButton);
      wx.showToast({
        title: '关闭成功',
        icon: 'success',
        duration: 2000
      });
    }
  },

  getJSON: function (cmd, dids, names) {
    var that = this;
    //  读取数据
    var json = {
      cmd: cmd,
      data: {
        did: dids,
        names: names
      }
    };
    this._sendJson(json);
  },

  sendJSON: function (cmd, dids, form) {
    var that = this;
    var json = {
      cmd: cmd,
      data: {
        did: dids,
        attrs: {
          "onoffAll": form,
        },
      },
    };
    that._sendJson(json);
  },

  /**
  * 发送数据
  */
  _sendJson: function (json) {
    var that = this;
    wx.sendSocketMessage({
      //  对象转换字符串
      data: JSON.stringify(json),
      success: function (res) { },
      fail: function (err) { },
      complete: function () { }
    })
  },

  bindPickerChange: function (e) {
    var that = this;
    that.setData({
      index: e.detail.value
    });
    if (that.data.index == 0) {
      that.setData({
        arrayCharset: 'zh', //  国语
      });
      console.log('picker发送选择改变，携带值为', e.detail.value, that.data.index);
    } else if (that.data.index == 1) {
      that.setData({
        arrayCharset: 'ct',// 粤语
      });
      console.log('picker发送选择改变，携带值为', e.detail.value, that.data.index)
    }
  },

  orderSign: function (e) {
    var that = this;
    var fId = e.detail.formId, fObj = e.detail.value;
    var countdown = 24 * 3600 * 5;
    var num = 5;
    num--;
    console.log(num);
    // // 立即显示还剩五天
    console.log("还剩余5天0小时0分0秒");
    // 倒计时
    var countdownTimer = setInterval(function () {
      countdown -= 1;
      var rest = countdown;
      // 天
      var days = parseInt(rest / (24 * 3600), 10);
      rest -= days * 24 * 3600;
      // 时
      var hours = parseInt(rest / 3600, 10);
      rest -= hours * 3600;
      // 分
      var minutes = parseInt(rest / 60, 10);
      rest -= minutes * 60;
      // 秒
      var seconds = parseInt(rest, 10);
      console.log("还剩余" + days + "天" + hours + "小时" + minutes + "分" + seconds + "秒");
    }, 1e3);
    if (num == 0) {
      var url = 'https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=' + 'fazdORwCMHy9xDhht38IpLrEBkjAlwl_DIFKfnowSsQZGh_ANXeGukzHitmXt638k6qUPH1iQHubHOVok_XEPs4ljISfgm5SDP4-UFtzhBQxY1ljS1RmA_c6nd5I_xawLFTfADAYSG';
      wx.request({
        url: url,
        data: {
          touser: wx.getStorageSync('user').openid,
          template_id: 'ho9RAP7GBHDJYg3EVHqiBgxSQmt1apwOpGAhLBCfgkI',//这个是1、申请的模板消息id，  
          page: '/pages/smart/smart',
          form_id: fId,
          data: {
            "keyword1": {
              "value": '测试发送消息',
              "color": "#4a4a4a"
            },
            "keyword2": {
              "value": '智能灯已经开启',
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
      clearInterval(countdownTimer);
    };
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
});
