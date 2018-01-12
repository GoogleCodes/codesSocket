// pages/index/index.js

var tools = require('../../utils/util.js');
import { Main } from '../../utils/main.js'
let main = new Main();
let did = wx.getStorageSync('didJSon').did;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentTab: 0,
    winHeight: 0,
    docHeight: 0,
    tabArray: [],
    status: false, //  开关状态
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
    areaid: '', //  区域ID
  },

  refesh(e) {
    console.log(e)
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
    // for (let i in this.data.tabArray) {
    //   // if (i == e.detail.current) {
    //   //   wx.request({
    //   //     url: 'http://yuyin.ittun.com/public/index/dev/getdev',
    //   //     method: 'POST',
    //   //     header: {
    //   //       'content-type': 'application/json',
    //   //       'content-type': 'application/x-www-form-urlencoded'
    //   //     },
    //   //     data: {
    //   //       rid: that.data.tabArray[i].id,
    //   //       uid: wx.getStorageSync('wxuser').id,
    //   //     },
    //   //     success(res) {
    //   //       that.setData({
    //   //         spliceArray: res.data.data,
    //   //         areaid: that.data.tabArray[i].id,
    //   //       });
    //   //     }
    //   //   });
    //   // }
    // }

  },

  selected(e) {
    var that = this;
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current
      })
    }
    main.ajax({
      data: {
        url: 'dev/getdev',
        method: 'POST',
        header: {
          'content-type': 'application/json',
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: {
          rid: e.target.dataset.id,
          uid: wx.getStorageSync('wxuser').id,
        }
      }
    }).then((res) => {
      that.setData({
        spliceArray: res.data.data,
        tabId: e.target.dataset.id,
        areaid: e.target.dataset.id,
      });
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
    if (wx.getStorageSync('options') == '' || wx.getStorageSync('wxuser') == '') {
      wx.removeStorageSync('userInformation');
      wx.removeStorageSync('wxuser');
      wx.redirectTo({ url: '../login/login', });
    }
    this._getBindingList(20, 0);
    
    // this.getIndexGizwits();

  },

  getIndexGizwits() {
    let that = this;
    main.ajax({
      data : {
        url: 'dev/getregion',
        method: 'POST',
        header: {
          'content-type': 'application/json',
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: {
          uid: wx.getStorageSync('wxuser').id
        },
      }
    }).then((res) => {
      that.setData({
        tabArray: res.data.data,
      });
      wx.setStorageSync('tabArray', that.data.tabArray);
      main.ajax({
        data: {
          url: 'dev/getdev',
          method: 'POST',
          header: {
            'content-type': 'application/json',
            'content-type': 'application/x-www-form-urlencoded'
          },
          data: {
            rid: res.data.data[0].id,
            uid: wx.getStorageSync('wxuser').id,
          },
        }
      }).then((res) => {
        that.setData({
          spliceArray: res.data.data,
          areaid: that.data.tabArray[0].id,
        });
        wx.setStorageSync('spliceArray', that.data.spliceArray);
      });
    });
  },

  onShow() {
    let that = this;
    this.getIndexGizwits();
  },

  operating(e) {
    let that = this;
    let id = e.currentTarget.dataset.id;
    let ids = '';
    let sdid = JSON.parse(e.currentTarget.dataset.sdid);
    let arr = [], json = {};
    let brr = [], count = '';

    let areaid = e.currentTarget.dataset.areaid;
    let areaiding = '';
    try {
      for (let i in that.data.tabArray) {
        if (areaid == that.data.tabArray[i].id) {
          areaiding = that.data.tabArray[i].id;
          for (let i in that.data.spliceArray) {

            function socketGo(array1, array2) {
              count = array2.concat(sdid.concat(array1));
              json = {
                'data': main.getArrays(count),
              };
              tools.sendData('c2s_write', did, json);
              main.getSocketResponse((data) => {
                if (that.data.status == false) {
                  that.setData({
                    status: true,
                  });
                } else if (that.data.status == true) {
                  that.setData({
                    status: false,
                  });
                }
              })
            }

            if (id == that.data.spliceArray[i].id) {

              if (that.data.status == false) {
                let array1 = [0xA1, 0x01, 0x01];
                let array2 = [0x00, 0x08, 0xA2];
                socketGo(array1, array2);
              } else if (that.data.status == true) {
                let array1 = [0xA1, 0x01, 0x00];
                let array2 = [0x00, 0x08, 0xA2];
                socketGo(array1, array2);
              }

            } else {
              return false;
            }
          }
        } else {
          return false;
        }
      }
    } catch(e) {

    }
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
        // arr.push(0x00, 0x02, 0xA0, 0xFF);
        // var json = {
        //   'data': main.getArrays(arr),
        // };
        // tools.sendData('c2s_write', wx.getStorageSync('didJSon').did, json);
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