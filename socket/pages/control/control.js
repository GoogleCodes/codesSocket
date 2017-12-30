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
    options: wx.getStorageSync('options'),
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
    this._getBindingList(20, 0);
  },

  _getBindingList(limit, skip) {
    var that = this;
    let query = "?show_disabled=0&limit=" + limit + "&skip=" + skip;
    var head = {
      'content-type': 'application/json',
      'X-Gizwits-Application-Id': that.data.options.gizwitsAppId,
      'X-Gizwits-User-token': that.data.options.token,
    };
    tools.sendRrquest('bindings' + query, 'GET', '', head).then((result) => {
      that.setData({
        list: result.data.devices
      });
      wx.setStorageSync('devices', result.data.devices);
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
      // that._login();
    }, (err) => { });
  },

  _login(did) {
    let that = this, json = {};
    wx.showLoading({ title: '' })


    // wx.onSocketClose(() => {
    //   wx.closeSocket();
    // });

    // var socketOpen = false;
    //  创建Socket
    // wx.connectSocket({
    //   url: 'wss://' + that.data.host + ':' + that.data.wss_port + '/ws/app/v1',
    // });

    //  链接socket
    json = {
      cmd: "subscribe_req",
      data: [{
        did: did,
        passcode: '' // IJLAAQTWBM
      }]
    };
    that._sendJson(json);

    wx.onSocketMessage((res) => {
      var data = JSON.parse(res.data);
      console.log(data);
      let arr = [0x00, 0x02, 0xA0, 0xFF];
      var json = {
        'data': main.getArrays(arr),
      };
      tools.sendData('c2s_write', did, json);
    })

    /*
    //  监听 WebSocket 连接事件
    wx.onSocketOpen((res) => {
      // socketOpen = true;
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
    });

    wx.onSocketMessage((res) => {
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
        //  获取服务器返回的信息
        wx.onSocketMessage((res) => {
          var noti = JSON.parse(res.data), _sendJson = {}, arr = [];
          switch (noti.cmd) {
            case 'subscribe_res':
              let arr = [0x00, 0x02, 0xA0, 0xFF];
              var json = {
                'data': main.getArrays(arr),
              };
              tools.sendData('c2s_write', did, json);
              break;
            case 'c2s_write':
              break;
            case 's2c_noti':
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
    });*/

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
    wx.setStorageSync('did', did);
    this._login(did);
    setTimeout(() => {
      wx.switchTab({
        url: '../index/index',
      })
    }, 1000);
    
  },

  Selecteding() {
    wx.switchTab({
      url: '../index/index',
    })
  }

})