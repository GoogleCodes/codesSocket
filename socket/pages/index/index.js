// pages/index/index.js

var tools = require('../../utils/util.js');
import { Main } from '../../utils/main.js'
let main = new Main();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentTab: 0,
    winHeight: 0,
    docHeight: 0,
    tabArray: [],
    status: 0, //  开关状态
    spliceArray: [],
    socketOpen: false,  //  WebSocket 开关
    imgUrls: [
      'https://www.getcodeing.com/static/images/banner.png',
    ],
    list: [],
    _heartbeatInterval: 60,  //  心跳
    _heartbeatTimerId: undefined,  //  心跳
    json: {
      'attrs': 'attrs_v4',
      'custom': 'custom'
    },
    tabId: 0,
    wechatOpenId: 'kceshi1',  //  测试:kceshi1
    gizwitsAppId: '141b9a9bb1df416cbb18bb85c864633f',
    did: '',
    host: '', //  websocket 请求地址 sandbox.gizwits.com
    ws_port: 0, //  端口
    wss_port: 0, //  端口
    hasRefesh: false,
  },

  refesh(e) {
    var that = this;
    that.setData({
      hasRefesh: true,
    });
    this.getIndexGizwits();
  },

  bindChange(e) {
    let that = this;
    this.setData({
      currentTab: e.detail.current
    });
    for (let i in this.data.tabArray) {
      if (i == e.detail.current) {
        // wx.request({
        //   url: 'http://yuyin.ittun.com/public/index/dev/getdev',
        //   method: 'POST',
        //   header: {
        //     'content-type': 'application/json',
        //     'content-type': 'application/x-www-form-urlencoded'
        //   },
        //   data: {
        //     rid: that.data.tabArray[i].id,
        //     uid: wx.getStorageSync('wxuser').id,
        //   },
        //   success(res) {
        //     that.setData({
        //       spliceArray: res.data.data
        //     });
        //   }
        // });
        wx.request({
          url: 'https://api.gizwits.com/app/group/' + that.data.tabArray[i].id + '/devices',
          method: 'GET',
          header: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Gizwits-User-token': wx.getStorageSync('options').token,
            'X-Gizwits-Application-Id': wx.getStorageSync('options').gizwitsAppId,
          },
          data: {},
          success(res) {
            that.setData({
              spliceArray: res.data,
            });
            console.log(that.data.spliceArray);
          }
        });
      }
    }

  },

  selected(e) {
    var that = this;
    console.log(e.target.dataset);
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current
      })
    }
    wx.request({
      url: 'https://api.gizwits.com/app/group/' + e.target.dataset.id +'/devices',
      method: 'GET',
      header: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Gizwits-User-token': wx.getStorageSync('options').token,
        'X-Gizwits-Application-Id': wx.getStorageSync('options').gizwitsAppId,
      },
      data: {
        // rid: e.target.dataset.id,
        // uid: wx.getStorageSync('wxuser').id,
      },
      success(res) {
        that.setData({
          spliceArray: res.data,
          tabId: e.target.dataset.id
        });
        console.log(that.data.spliceArray);
      }
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const that = this;
    wx.getSystemInfo({
      success(res) {
        that.setData({
          winHeight: res.windowHeight / 1,
          docHeight: res.windowHeight
        });
      },
    });
    if (wx.getStorageSync('options') == '') {
      wx.removeStorageSync('userInformation');
      wx.redirectTo({ url: '../login/login', });
    }
    this._getBindingList(20, 0);
    // this.getIndexGizwits();

  },

  getIndexGizwits() {
    let that = this;
    wx.request({
      url: 'https://api.gizwits.com/app/group',
      method: 'GET',
      header: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Gizwits-User-token': wx.getStorageSync('options').token,
        'X-Gizwits-Application-Id': wx.getStorageSync('options').gizwitsAppId,
      },
      data: {
        
      },
      success(res) {
        setTimeout(() => {
          that.setData({
            hasRefesh: false,
          });
        }, 500);
        that.setData({
          tabArray: res.data,
        });
        wx.request({
          url: 'https://api.gizwits.com/app/group/'+ res.data[0].id +'/devices',
          method: 'GET',
          header: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Gizwits-User-token': wx.getStorageSync('options').token,
            'X-Gizwits-Application-Id': wx.getStorageSync('options').gizwitsAppId,
          },
          success(res) {
            that.setData({
              spliceArray: res.data
            });
          }
        });
      }
    })
  },

  onShow() {
    let that = this;
    this.getIndexGizwits();
  },

  _login() {
    let that = this, json = {};
    wx.showLoading({ title: '' })

    //  创建Socket
    wx.connectSocket({
      url: 'wss://' + that.data.host + ':' + that.data.wss_port + '/ws/app/v1',
    });

    //  监听 WebSocket 连接事件
    wx.onSocketOpen((res) => {
      that.setData({ socketOpen: true });
      wx.showToast({
        title: 'WebSocket打开成功！',
      })
      var options = wx.getStorageSync('options');
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

    //  获取服务器返回的信息
    wx.onSocketMessage((res) => {
      wx.hideLoading();
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
          var noti = JSON.parse(res.data), _sendJson = {}, arr = [];
          switch (noti.cmd) {
            case 'subscribe_res':
              for (var i in noti.data.success) {
                that.setData({
                  did: noti.data.success[i].did
                });
              }
            case 'c2s_write':
              break;
            case 's2c_noti':
              // arr.push(0x00, 0x01, 0x40);
              // let json = {
              //   'data': main.getArrays(arr),
              // };
              // tools.sendData('c2s_write', that.data.did, json); 
              // let a = noti.data.attrs.data.slice(18, 36)
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
      wx.setStorageSync('devices', result.data.devices);
      // var pKey = null;
      for (var i in result.data.devices) {
        var device = result.data.devices[i];
        if (result.data.devices[i].is_online == true) {
          that.setData({
            did: device.did,
            host: device.host,
            wss_port: device.wss_port,
          });
          //  获取数据
          let json = {
            'did': device.did,  //  did
            'host': device.host,  //  websocket 请求地址
            'ws_port': device.ws_port, //  端口
            'wss_port': device.wss_port, //  端口
          };
          wx.setStorageSync('didJSon', json);
        }
      }
      // that._GizwitsDevdata(that.data.options.did);
      // that._getGizwitsDataing(pKey);
      that._login();
    }, (err) => { });
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

})