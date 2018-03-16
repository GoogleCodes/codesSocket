// pages/control/control.js

var tools = require('../../utils/util.js');
import { $ } from '../../utils/main.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    _heartbeatInterval: 60,  //  心跳
    _heartbeatTimerId: undefined,  //  心跳
    socketOpen: false,  //  WebSocket 开关
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
    isOnList: [],
    isOffList: [],
    rid: 0,
  },

  selectingAll() {
    let arr = [0x00, 0x02, 0xA0, 0xFF];
    tools.sendData('c2s_write', wx.getStorageSync('did'), {
      'data': main.getArrays(arr),
    });
    wx.switchTab({
      url: '../index/index',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this._getBindingList(20, 0);
  },

  onShow() {
    $.getName('title');
  },

  _getBindingList(limit, skip) {
    wx.showLoading({
      title: '获取中...',
    })
    var that = this;
    that.setData({
      list: wx.getStorageSync('devices')
    });
    for (let i in that.data.list) {
      var device = that.data.list[i];
      if (that.data.list[i].is_online == true) {
        let arr = [];
        arr.push(that.data.list[i]);
        that.setData({
          did: device.did,
          host: device.host,
          wss_port: device.wss_port,
          isOnList: that.data.isOnList.concat(arr)
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
      if (that.data.list[i].is_online == false) {
        let arr = [];
        arr.push(that.data.list[i]);
        that.setData({
          did: device.did,
          host: device.host,
          wss_port: device.wss_port,
          isOffList: that.data.isOffList.concat(arr)
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
    wx.hideLoading();
  },

  goConnSocket() {
    let that = this, json = {};
    //  创建Socket
    wx.connectSocket({
      url: 'wss://' + that.data.host + ':' + that.data.wss_port + '/ws/app/v1',
      success(res) {
        console.log(res);
      },fail(err) {
        console.log(err);
      }
    });

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

  goSelectDevice(e) {
    let did = e.currentTarget.dataset.did;
    wx.setStorageSync('did', did);

    this._login(did);
    $.ajax({
      url: 'dev/addregion',
      method: "POST",
      data: {
        uid: wx.getStorageSync('wxuser').id,
        name: '全部',
        pid: did,
        isall: 1
      },
    }).then((res) => {
    })
    wx.setStorageSync('title', e.currentTarget.dataset.name);
    this.getDevice(did);
  },

  getRegion(callback) {
    $.ajax({
      url: 'dev/getregion',
      method: 'POST',
      data: {
        uid: wx.getStorageSync('wxuser').id
      },
    }).then((res) => {
      callback(res);
    });
  },

  getDevice(did) {
    let that = this;
    let arr = [0x00, 0x02, 0xA0, 0xFF];
    tools.sendData('c2s_write', wx.getStorageSync('did'), {
      'data': $.getArrays(arr),
    });
    $.getSocketResponse((did, data) => {
      if (wx.getStorageSync('did') == did) {
        if (data[2] == 161) {
          let k = data, rid = 0;
          let last = null, brr = [], json = {};
          that.getRegion((res) => {
            let list = res.data;
            for (let i in list) {
              if (list[i].pid == did) {
                if (list[i].name == '全部') {
                  that.setData({
                    rid: list[i].id
                  });

                  for (let i in k) {
                    last = k.splice(4, 6 + data[9]);
                    if (last.indexOf(1) == 0) {
                      let name = last;
                      let doname = name.splice(6, last[5]);
                      let str = "";
                      for (let y in doname) {
                        str += "%" + doname[y].toString(16);
                      }
                      let deviceDid = last.splice(0, 4);

                      json = {
                        uid: wx.getStorageSync('wxuser').id,
                        did: $.stringify(deviceDid),
                        dname: $.utf8to16(unescape(str)),
                        rid: that.data.rid,
                        status: 'false',
                        pid: wx.getStorageSync('did'),
                        types: deviceDid[1],
                        isall: 1
                      };
                      $.ajax({
                        url: 'dev/adddev',
                        method: "POST",
                        data: json,
                      }).then(function (res) {
                      })

                    }
                  }

                }
              }
            }
          });

          

        }
      }
    });

  },

  addArea(did) {

    $.ajax({
      url: 'dev/getregion',
      method: 'POST',
      data: {
        uid: wx.getStorageSync('wxuser').id
      },
    }).then(function (res) {
      for (let i in res.data) {
        if (res.data[i].pid == wx.getStorageSync('did')) {

          if (res.data[i].name !== '全部') {
            $.ajax({
              url: 'dev/addregion',
              method: "POST",
              data: {
                uid: wx.getStorageSync('wxuser').id,
                name: '全部',
                pid: did,
              },
            }).then((res) => {
            })
          }

        }
      }
    });
    
  },

  _login(did) {
    let that = this, json = {};
    wx.showLoading({ title: '' })
    wx.setStorageSync('did', did);
    let arr = [];
    json = {
      did: did,
    }
    arr.push(json);
    json = {
      cmd: "subscribe_req",
      data: arr
    };
    that._sendJson(json);
    setTimeout(() => {
      wx.switchTab({
        url: '../index/index',
      })
    }, 500);

    // let arr = [0x00, 0x02, 0x40];
    // json = {
    //   'data': main.getArrays(arr),
    // };
    // tools.sendData('c2s_write', did, json);
    
    // wx.onSocketMessage((res) => {
    //   let noti = JSON.parse(res.data).cmd;
    //   wx.hideLoading();
    //   switch (noti) {
    //     case 'subscribe_res':

    //       break;
    //     case 'c2s_write':
    //       break;
    //     case 's2c_noti':
    //       break;
    //     case 'c2s_read':

    //       break;
    //     case 'pong':
    //       break;
    //   }

    //   // var data = JSON.parse(res.data);
    //   // //  链接socket
    //   // json = {
    //   //   cmd: "subscribe_req",
    //   //   data: arr
    //   // };
    //   // //  发送endRecode
    
    //   // that._sendJson(json);
    //   //  获取服务器返回的信息
    //   // that.getServiceBack();
    //   // if (data.data.success == true) {
        
    //   // } else {
    //   //   if (data.data.msg == "M2M socket has closed, please login again!") {
    //   //     that._login(did);
    //   //   }
    //   // }
    // });

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

  Selecteding() {
    wx.switchTab({
      url: '../index/index',
    })
  },

  //  获取服务器返回的信息
  getServiceBack() {
    let that = this;
    wx.onSocketMessage((res) => {
      var noti = JSON.parse(res.data), _sendJson = {}, arr = [];
      switch (noti.cmd) {
        case 'subscribe_res':
          // let arr = [0x00, 0x02, 0xA0, 0xFF];
          // var json = {
          //   'data': main.getArrays(arr),
          // };
          // tools.sendData('c2s_write', did, json);
          break;
        case 'c2s_write':
          break;
        case 's2c_noti':
          break;
        case 'pong':
          break;
      }
    });
  }

})