// smart.js
//  导入js
var tools = require('../../utils/util.js');
let urls = require('../../utils/common/common.js');
var app = new getApp();
var times = null, ins = 0;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    imgUrls: [
      'https://img.alicdn.com/tfs/TB1fknxexrI8KJjy0FpXXb5hVXa-760-460.png',
      'https://img.alicdn.com/tfs/TB1fKrBewLD8KJjSszeXXaGRpXa-760-460.jpg',
    ],
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
      gizwitsAppId: '141b9a9bb1df416cbb18bb85c864633f',
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
    switchSpec: false,
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
    language: '',  //  语义,
    sliceArrays: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
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
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady(res) {
    // this.orderSign();
    let that = this;
    that.mapCtx = wx.createMapContext('myMap');
    if (that.data.gizwitsVisible == true) {
      that.setData({
        chonseDid: -1
      });
    }
  },

  //  登出
  backLogin() {
    wx.showModal({
      title: '提示',
      content: "你确定要退出登录???",
      showCancel: true,
      success(res) {
        if(res.confirm == true) {
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
    tools.sendRrquest('datapoint?product_key=' + key, 'GET', '', head).then(function (result) { }, function (err) { });
  },

  //  监控设备
  _GizwitsDevdata(did) {
    let that = this;
    let head = {
      'content-type': 'application/json',
      'X-Gizwits-Application-Id': wx.getStorageSync('options').gizwitsAppId,
    };
    tools.sendRrquest('devdata/' + did + '/latest', 'GET', '', head).then(function (result) { }, function (err) { });
  },

  //  扫描二维码分享
  _shareGizwits() {
    let that = this, code = "adc1b95729864eecb02cd614cd305abc";
    wx.scanCode({
      success(res) {
        //  创建设备分享
        tools.sendRrquest('sharing/code/' + code, 'POST', '', that.data.head).then((result) => {
          console.log(result);
        }, (err) => { });
      },
    })

    // //  创建设备分享
    tools.sendRrquest('sharing/code/' + code, 'POST', '', that.data.head).then((result) => {
      console.log(result);
    }, (err) => {
      console.log(err);
    });

    // var options = {
    //   "type": 0,
    //   "did": that.data.options.did,
    //   "uid": wx.getStorageSync('options').uid,
    // };
    // tools.sendRrquest('sharing', 'POST', options, that.data.head).then(function (result) {
    //   console.log(result);
    // }, function (err) {
    //   console.log(err);
    // });

    //  查询分享设备
    // var sharing_type = 1, status = 0;
    // tools.sendRrquest('sharing?sharing_type=' + sharing_type + '&status=' + status + '', 'GET', '', that.data.head).then(function (result) {
    //   console.log(result.data);
    // }, function (err) {
    //   console.log(err);
    // });
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
    tools.sendRrquest('bindings' + query, 'GET', '', head).then((result) => {
      that.setData({ listDevices: result.data.devices });
      console.log(that.data.listDevices);
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
    },(err) => { });
  },

  //  选中列表设备
  chonseDid(e) {
    var that = this;
    that._login();
    //  获取语义
    /*
    wx.request({
      url: 'http://yuyin.ittun.com/public/index/dev/semlist',
      method: "POST",
      header: {
        'content-type': 'application/json',
        'content-type': 'application/x-www-form-urlencoded',
      },
      success(res) {
        let datas = res.data.data, i = 0;
        for (i; i <= datas.length; i++) {
          that.setData({
            language: datas[i].word
          });
        }
      }
    })*/
    that.setData({ gizwitsVisible: false });
    var did = e.currentTarget.dataset.did, index = e.currentTarget.dataset.index
    if (that.data.chonseDid === index) {
      this.setData({ did: did, });
      return;
    } else {
      this.setData({
        did: did,
        chonseDid: index,
      });
    }
  },

  //  心跳开始
  _startPing() {
    var that = this;
    var heartbeatInterval = that.data._heartbeatInterval * 1000;
    that.data._heartbeatTimerId = setInterval(() => {
      var options = {
        cmd: "ping"
      };
      that._sendJson(options);
    }, heartbeatInterval);
  },

  _login() {
    var that = this, json = [];
    //  创建Socket
    wx.connectSocket({
      url: 'wss://' + that.data.options.host + ':' + that.data.options.wss_port + '/ws/app/v1',
    });
    //  监听 WebSocket 连接事件
    wx.onSocketOpen((res) => {
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
    wx.onSocketMessage((res) => {
      var data = JSON.parse(res.data);
      if (data.data.success == true) {
        //  链接socket
        json = {
          cmd: "subscribe_req",
          data: [{
            did: that.data.did,
            passcode: 'IJLAAQTWBM'
          }]
        };
        that._sendJson(json);
        //  读取数据
        that.getJSON('c2s_read', that.data.did);
        //  获取服务器返回的信息
        wx.onSocketMessage((res) => {
          var noti = JSON.parse(res.data), _sendJson = {};
          switch (noti.cmd) {
            case 'subscribe_res':
              for (var i in noti.data.success) {
                that.setData({
                  did: noti.data.success[i].did
                });
              }
            case 'c2s_write':
              try {
                that.setData({
                  switchButton: noti.data.attrs.onoffAll
                });
              } catch(e) {}
              break;
            case 's2c_noti':
              let a = noti.data.attrs.data.slice(18, 36)
              that.setData({
                sliceArrays: noti.data.attrs.data.slice(18, 36)
              });
              console.log(that.data.sliceArrays);
              // let b = [0,18, 0x50];
              // let c = b.concat(a);
              // console.log(c, b, b.length);
              break;
            case 'pong':
              break;
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
    let that = this;
    let arr = [];
    switch(true) {
      case e.detail.value == 0:
        arr.push(0x00, 0x02, 0xA0, 0xFF);
        var json = {
          'data': this.getArrays(arr),
        };
        tools.sendData('c2s_write', that.data.did, json);
        break;
      case e.detail.value == 33:
        arr.push(0x00, 0x01, 0x40);
        let json = {
          'data': this.getArrays(arr),
        };
        tools.sendData('c2s_write', that.data.did, json);
        break;
      case e.detail.value == 66:
        console.log(that.data.sliceArrays.pop());
        arr.push(0, 18, 0x50, 1, 229, 188, 128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0 + 1, 1, 1);
        var json = {
          'data': this.getArrays(arr),
        };
        tools.sendData('c2s_write', that.data.did, json);
        break;
      case e.detail.value == 100:
        arr.push(0, 0x01, 0x10);
        var json = {
          'data': this.getArrays(arr),
        };
        tools.sendData('c2s_write', that.data.did, json);
        break;
      default:
        break;
    }
  },

  getArrays(reqArr) {
    let arrays = new Array(768), i = 0;
    for (i; i <= 768; i++) {
      arrays[i] = 0;
    }
    let arrtoo = arrays.slice(0);
    let t = reqArr;
    return t.concat(arrtoo).splice(0,768)
  },


  //  智能灯开关
  chonseSocket(e) {
    var that = this, json = {};
    let arr = [];
    that.setData({ socketOpen: true });
    //  发送数据开关 true : 打开  false : 关闭
    switch (e.detail.value) {
      case true:
        that.setData({ switchButton: true });
        //  发送数据
        // arr.push(0, 0x01, 0x50, 2, 0, 1, 1, 0, 0, 2, 1, 0, 0, 0, 0, 2, 0, 1, 1, 0, 0,);
        arr.push(0x00, 0x01, 0x20);
        json = {
          'data': this.getArrays(arr),
        };
        tools.sendData('c2s_write', that.data.did, json);
        tools.Toast('打开成功', 'success');
        that.getDev(that.data.switchButton);
        break;
      case false:
        that.setData({ switchButton: false });
        that.getDev(that.data.switchButton);
        //  发送数据
        // json = {
        //   "onoffAll": that.data.switchButton,
        // };
        arr.push(0x00, 0x01, 0x01);
        json = {
          'data': this.getArrays(arr),
        };
        tools.sendData('c2s_write', that.data.did, json);
        tools.Toast('关闭成功', 'success');
        break;
      default:
        break;
    }
  },
  //  记录操作
  getDev(tools) {
    const that = this;
    const uid = wx.getStorageSync('wxuser').id;
    const head = {
      'content-type': 'application/json',
      'content-type': 'application/x-www-form-urlencoded',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Origin, X-Requested - With, Content-Type, Accept'
    };
    /*
    wx.request({
      url: 'http://yuyin.ittun.com/public/index/dev/add',
      method: "post",
      header: head,
      data: {
        dev_id: wx.getStorageSync('options').gizwitsAppId,
        uid: uid,
        operation: tools
      },
      success(res) {
        if (res.data.data.repeat == 7) {
          that.orderSign();
        }
      },
    });*/
  },

  specSocket(e) {
    let arr = [], that = this, json = {};
    console.log(arr.concat(Number('0x40')));
    console.log(this.getArrays(tools.toStringTools('64')));
    that.setData({ socketOpen: true });
    //  发送数据开关 true : 打开  false : 关闭
    if (e.detail.value == true) {
      // arr.push(0x00, 0x01, 0x01, 0x11, 0x01)
      arr.push(0x00, 0xA1, 2, 1, 1, 0, 1, 1, 1)
      that.getArrays(arr);
      that.setData({ switchSpec: true });
      //  发送数据
      json = {
        "raw": that.getArrays(arr),
      };
      tools.sendData('c2s_write', that.data.did, json);
      tools.Toast('打开成功', 'success');
    } else {
      /*
      that.setData({ switchSpec: false });
      arr.push(0x00, 0x06, 0x50)
      that.getArrays(arr);
      //  发送数据
      json = {
        "data": that.getArrays(arr)
      };
      tools.sendData('c2s_write', that.data.did, json);
      tools.Toast('关闭成功', 'success');
      */
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
    tools.storageJSONS(json);
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

  orderSign() {
    let that = this;
    var url = urls.wxopen + urls.access_token;
    wx.request({
      url: url,
      data: {
        touser: wx.getStorageSync('user').openid,
        template_id: urls.template_id,
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
      success(res) {
        that.setData({ switchButton: true });
        //  发送数据
        tools.sendData('c2s_write', that.data.did, that.data.switchButton);
        tools.Toast('发送成功', 'success');
      }
    });
  },

  tap_ch(e) {
    if (this.data.open) {
      this.setData({ translate: 'transform: translateX(0px)' })
      this.data.open = false;
    } else {
      this.setData({
        translate: 'transform: translateX(' + this.data.windowWidth * 0.5 + 'px)'
      })
      this.data.open = true;
    }
  },

  tap_start(e) {
    this.data.mark = this.data.newmark = e.touches[0].pageX;
    if (this.data.staus == 1) {
      // staus = 1指默认状态
      this.data.startmark = e.touches[0].pageX;
    } else {
      // staus = 2指屏幕滑动到右边的状态
      this.data.startmark = e.touches[0].pageX;
    }
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
      success(res) {
        switch (true) {
          case res.confirm == true:
            let json = {
              devices: [{
                did: e.currentTarget.dataset.did,
              }]
            };
            tools.sendRrquest('bindings', 'DELETE', json, that.data.head).then(function (result) {
              that.setData({
                gizwitsVisible: true,
                gizwitsListVisible: true,
              });
            });
            break;
          case res.cancel == true:
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

  //  开始录音
  startRecode(e) {
    var that = this;
    wx.startRecord({
      success(res) {
        var tempFilePath = res.tempFilePath;
        that.setData({ recodePath: tempFilePath, isSpeaking: true });
        tools.Toast('录音成功', 'success');
        wx.getSavedFileList({
          success(res) {
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
      fail(err) {
        console.log(err.data);
      }
    });
  },

  //  结束录音
  endRecode(e) {
    var s = this;
    wx.stopRecord();
    s.setData({ isSpeaking: false });
    wx.showToast();
    setTimeout(() => {
      wx.uploadFile({
        url: 'https://www.chlorop.com.cn/yuyin/public/index/index/zhen',
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
        success(res) {
          var error_text = '语音识别失败';
          console.log("返回的东西是：", res.data.toString() == error_text, res.data.toString());
          switch(true) {
            case res.data.toString() == error_text:
              tools.Toast('语音识别失败!请重试!','success');
              break;
            case res.statusCode == 404:
              tools.Toast('服务器搞飞机去了!呜呜呜~~~~', 'success');
              return;
          }
          var options = JSON.parse(res.data), result = null, sqlStr = null, json = {};
          s.setData({
            ins_y: options.time1,
            ins_l: options.time2,
          });
          for (var i in options) {
            var sqlStr = options[i].toString();
            s.setData({
              openMessage: sqlStr,
            });
            if (typeof (sqlStr) == "string") {
              var myString = sqlStr.substring(0, 1);
            }
            switch (true) {
              case myString == "开" || myString == '打' || myString == s.data.language:
                s.setData({ switchButton: true });
                json = {
                  "onoffAll": s.data.switchButton,
                };
                //  发送数据
                tools.sendData('c2s_write', s.data.did, json);
                tools.Toast('打开成功!', 'success');
                break;
              case myString == "关" || myString == s.data.language: 
                s.setData({ switchButton: false });
                json = {
                  "onoffAll": s.data.switchButton,
                };
                //  发送数据
                tools.sendData('c2s_write', s.data.did, json);
                tools.Toast('关闭成功!', 'success');
                break;
              default:
                break;
            }
          }
          var str = res.data;
          if (data.states == 1) {
            var cEditData = s.data.editData;
            cEditData.recodeIdentity = data.identitys;
            s.setData({ editData: cEditData });
          } else {
            tools.showModel('提示', data.message, () => {});
          }
          wx.hideToast();
        },
        fail(res) {  //  错误提示
          tools.showModel('提示', '录音的姿势不对!', () => {});
          wx.hideToast();
        }
      });
    }, 1000)
  },
});