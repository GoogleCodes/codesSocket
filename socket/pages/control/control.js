// pages/control/control.js

var tools = require('../../utils/util.js');
import { Main } from '../../utils/main.js'
let main = new Main();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    _heartbeatInterval: 60,  //  心跳
    _heartbeatTimerId: undefined,  //  心跳
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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log(wx.getStorageSync('devices'));
    this.setData({
      list: wx.getStorageSync('devices')
    });

    this._getBindingList(20, 0);
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
      // that.setData({ listDevices: result.data.devices });
      // var pKey = null;
      let devices = wx.getStorageSync('devices');
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
      // that._login();
    }, (err) => { });
  },

  _login(did) {
    let that = this, json = {};
    wx.showLoading({ title: '' })
    let devices = wx.getStorageSync('devices'), i;

    //  创建Socket
    // wx.connectSocket({
    //   url: 'wss://' + that.data.host + ':' + that.data.wss_port + '/ws/app/v1',
    // });
    for (i in devices) {
      if (devices[i].did == did) {
        //  监听 WebSocket 连接事件
        // wx.onSocketOpen((res) => {
        //   var options = wx.getStorageSync('options');
        //   json = {
        //     cmd: "login_req",
        //     data: {
        //       appid: options.gizwitsAppId,
        //       uid: options.uid,
        //       token: options.token,
        //       p0_type: that.data.json.attrs,
        //       heartbeat_interval: 180,
        //       auto_subscribe: true
        //     }
        //   };
        //   that._startPing();
        //   that._sendJson(json);
        // });

        wx.onSocketMessage((res) => {
          console.log(res)
          wx.hideLoading();
          var data = JSON.parse(res.data);
          if (data.data.success == true) {
            //  链接socket
            json = {
              cmd: "subscribe_req",
              data: [{
                did: did,
                passcode: '' // IJLAAQTWBM
              }]
            };
            that._sendJson(json);
            //  读取数据
            // that.getJSON('c2s_read', that.data.did);
            //  获取服务器返回的信息
            wx.onSocketMessage((res) => {
              var noti = JSON.parse(res.data), _sendJson = {}, arr = [];
              console.log(noti)
              switch (noti.cmd) {
                case 'subscribe_res':
                  for (var i in noti.data.success) {
                    that.setData({
                      did: did
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
              that._login(did);
            }
          }
        });

      }
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

  goSelectDevice(e) {
    let did = e.currentTarget.dataset.did;
    this._login(did);
    // wx.switchTab({
    //   url: '../index/index',
    // })
  },

  Selecteding() {
    wx.switchTab({
      url: '../index/index',
    })
  }

})