// pages/index/index.js

var tools = require('../../utils/util.js');
import { $ } from '../../utils/main.js'

let com = require('../../utils/common/common.js');

let did = wx.getStorageSync('didJSon').did;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    buttonClicked: false,
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
    gizwitsAppId: '',
    did: '',
    host: '', //  websocket 请求地址 sandbox.gizwits.com
    ws_port: 0, //  端口
    wss_port: 0, //  端口
    hasRefesh: false,
    areaid: '', //  区域ID
    deviceID: '', //  设备ID,
    tabArrayID: '',
    didList: [],
    statusText: '关闭',
    currentItem: 0,
    typeDevice: 0,
    types: '',
    typea: ''
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
    wx.showLoading({
      title: '获取中。。。',
    })
    this.setData({
      currentTab: e.detail.current
    });
    wx.setStorageSync('currentTab', that.data.currentTab);
    let arr = [];
    for (let i in that.data.tabArray) {
      if (i == that.data.currentTab) {
        $.ajax({
          url: 'dev/getdev',
          method: 'POST',
          data: {
            rid: that.data.tabArray[i].id,
            uid: wx.getStorageSync('wxuser').id,
          },
        }).then(function (res) {
          wx.hideLoading();
          for (let y in res.data) {
            if (wx.getStorageSync('did') == that.data.tabArray[i].pid) {
              arr.push(res.data[y]);
              that.setData({
                spliceArray: arr,
                areaid: that.data.tabArray[i].id,
              });
            } else {
              return false;
            }
          }
        });
      }
    }
    if (arr.length == 0) {
      that.setData({
        spliceArray: [],
      });
    }
  },

  selected(e) {
    var that = this, arr = [];
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current
      })
    }
    wx.setStorageSync('currentTab', that.data.currentTab);

    let tabArray = wx.getStorageSync('tabArray');
    $.ajax({
      url: 'dev/getdev',
      method: 'POST',
      data: {
        rid: e.target.dataset.id,
        uid: wx.getStorageSync('wxuser').id,
      }
    }).then(function (res) {
      for (let i in tabArray) {
        if (tabArray[i].pid == wx.getStorageSync('did')) {
          for (let y in res.data) {
            arr.push(res.data[y]);
            that.setData({
              spliceArray: res.data,
              tabId: e.target.dataset.id,
              areaid: e.target.dataset.id,
            });
          }
        }
      }
      if (arr.length == 0) {
        that.setData({
          spliceArray: [],
        });
      }
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this;
    this.setData({
      did: wx.getStorageSync('did')
    });
    wx.getSystemInfo({
      success(res) {
        that.setData({
          winHeight: res.windowHeight,
          docHeight: res.windowHeight
        });
      },
    });
    if (wx.getStorageSync('options') == '') {
      wx.removeStorageSync('userInformation');
      wx.removeStorageSync('wxuser');
      wx.redirectTo({ url: '../login/login' });
    }

    //  else if (wx.getStorageSync('devices') == '') {
    //   wx.removeStorageSync('userInformation');
    //   wx.removeStorageSync('wxuser');
    //   wx.redirectTo({ url: '../login/login', });
    // }
    
    // let sHEX = "#fff";
    // let sRGB = $.colorRGB(sHEX);
    // console.log($.colorRGB(sHEX));
    // console.log($.colorHEX(sRGB));

    var array = [1, 230, 181, 139, 232, 175, 149, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1];
    array.splice(14, 1, 1);
    console.log(array);

  },

  getIndexGizwits() {
    let that = this;
    $.getName('title');
    $.ajax({
      url: 'dev/getregion',
      method: 'POST',
      data: {
        uid: wx.getStorageSync('wxuser').id
      },
    }).then(function (res) {
      let response = res.data;
      let json = {};
      let last = '';
      let arr = [];
      for (let i in response) {
        if (response[i].pid == wx.getStorageSync('did')) {
          arr.push(response[i]);
          wx.setStorageSync('tabArray', arr);
          last = arr[0].id;
          that.setData({
            tabArray: arr,
          });
          that.setData({
            currentTab: 0
          });
        }
      }
      $.ajax({
        url: 'dev/getdev',
        method: 'POST',
        data: {
          rid: last,
          uid: wx.getStorageSync('wxuser').id,
        },
      }).then(function (res) {
        wx.showLoading({
          title: '加载中...',
        })
        if (res.msg == "请求失败") {
          wx.hideLoading();
          // wx.removeStorageSync('tabArray');
          // wx.removeStorageSync('spliceArray');
          // that.setData({
          //   spliceArray: [],
          //   tabArray: [],
          // });
          return false;
        }
        wx.hideLoading();
        let device = res.data, json = {};
        let arr = [];
        for (let i in device) {
          if (typeof device[i].did) {
            let sdid = JSON.parse(device[i].did);
            if (sdid[1] == 0) {
              that.setData({
                types: 0,
              });
            } else if (sdid[1] == 1) {
              that.setData({
                typea: 1,
              });
            }
            json = {
              did: JSON.stringify(sdid),
              dname: device[i].dname,
              id: device[i].id,
              pid: device[i].pid,
              rid: device[i].rid,
              status: device[i].status,
              uid: device[i].uid,
              types: device[i].types,
            };
            arr.push(json);
          }
        }
        that.setData({
          spliceArray: arr,
          areaid: that.data.tabArray[0].id,
        });
        wx.setStorageSync('spliceArray', arr);
      });
    });
  },

  elePosition(rid) {
    let that = this;
    $.ajax({
      url: 'dev/getdev',
      method: 'POST',
      data: {
        rid: rid,
        uid: wx.getStorageSync('wxuser').id,
      },
    }).then(function (res) {
      let data = res.data;
      for (let i in res.data) {
        if (res.data[i].status == 'false') {
          that.setData({
            status: false,
            statusText: '关闭'
          });
        } else if (res.data[i].status == 'true') {
          that.setData({
            status: true,
            statusText: '开启'
          });
        }
      }
      let resDev = res.data;
      if (rid == that.data.areaid) {
        that.setData({
          spliceArray: res.data,
          areaid: that.data.areaid,
        });
        wx.setStorageSync('spliceArray', that.data.spliceArray);
      }
    });
  },

  onShow() {
    let that = this;
    wx.showLoading({
      title: '加载中...',
    })
    this._getBindingList(20, 0);
  },

  onReady() {
    let that = this;
    // setTimeout(function () {
    //   that.getIndexGizwits();
    // }, 500)
  },

  operating(e) {
    let currents = e.currentTarget.dataset;
    wx.showLoading({
      title: '加载中。。。',
    })
    let that = this, isLock = false;
    let id = currents.id;
    let sdid = currents.sdid;
    let arr = [], json = {};
    let brr = [], count = '';
    let areaid = currents.areaid;

    function socketGo(array1, array2) {
      if (typeof sdid == 'string') {
        sdid = JSON.parse(sdid);
      }
      count = array2.concat(sdid.concat(array1));
      json = {
        'data': $.getArrays(count),
      };
      tools.sendData('c2s_write', wx.getStorageSync('did'), json);
    }

    function ajax(status) {
      let that = this;
      $.ajax({
        url: 'dev/editdev',
        method: 'POST',
        data: {
          uid: wx.getStorageSync('wxuser').id,
          id: id,
          status: status
        }
      }).then(function (res) {

      });
    }

    try {
      let array1 = [0xA1, 0x01, 0x01];
      let array2 = [0x00, 0x08, 0xA2];
      for (let i in that.data.tabArray) {
        if (areaid == that.data.tabArray[i].id) {
          that.setData({
            tabArrayID: that.data.tabArray[i].id
          });
          for (let y in that.data.spliceArray) {
            if (id == that.data.spliceArray[y].id) {
              that.setData({
                deviceID: id,
                currentItem: id
              });
              switch (true) {
                case that.data.spliceArray[y].status == "false":
                  array1 = [0xA1, 0x01, 0x01];
                  array2 = [0x00, 0x08, 0xA2];
                  socketGo(array1, array2);
                  that.setData({
                    status: true,
                    statusText: '开启',
                  });

                  ajax("true");
                  wx.hideLoading();

                  // that.getIndexGizwits();
                  that.elePosition(that.data.areaid);
                  return;
                case that.data.spliceArray[y].status == "true":
                  array1 = [0xA1, 0x01, 0x00];
                  array2 = [0x00, 0x08, 0xA2];
                  socketGo(array1, array2);

                  that.setData({
                    status: false,
                    statusText: '关闭'
                  });

                  ajax("false");
                  wx.hideLoading();

                  that.elePosition(that.data.areaid);
                  return false;
                default:
                  wx.hideLoading();
                  return false;
              }
            }

          }
        }
      }
    } catch (e) {
    }

  },

  _login() {
    let that = this, json = {};
    wx.showLoading({ title: '' })
    var options = wx.getStorageSync('options');
    //  创建Socket
    wx.connectSocket({
      url: 'wss://' + that.data.host + ':' + that.data.wss_port + '/ws/app/v1',
    });

    //  监听 WebSocket 连接事件
    wx.onSocketOpen(function (res) {
      that.setData({ socketOpen: true });
      json = {
        cmd: "login_req",
        data: {
          appid: options.gizwitsAppId = com.gizwitsAppId,
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
    wx.onSocketMessage(function (res) {
      wx.hideLoading();
      var data = JSON.parse(res.data);
      try {
        if (data.data.success == true) {
          let arr = [];
          arr.push(0x00, 0x02, 0xA0, 0xFF);
          var json = {
            'data': $.getArrays(arr),
          };
          tools.sendData('c2s_write', wx.getStorageSync('did'), json);
        } else {
          if (data.data.msg == "M2M socket has closed, please login again!") {
            that._login();
          }
        }
      } catch (e) {

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
    wx.hideLoading();
    let devices = wx.getStorageSync('devices');
    let json = {}, arr = [];
    for (var i in devices) {
      var device = devices[i];
      json = {
        did: device.did,
        isonline: devices[i].is_online
      };
      arr.push(json);
      that.setData({
        didList: that.data.didList.concat(arr)
      });
      if (devices[i].is_online == true) {
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
    that._login();
    for (let i in that.data.didList) {
      let did = wx.getStorageSync('did');
      if (that.data.didList[i].did == did) {
        if (that.data.didList[i].isonline == false) {
          setTimeout(function () {
            that.getIndexGizwits();
          }, 500)
          wx.showModal({
            title: '警告',
            content: '设备已经下线',
            showCancel: false,
          })
          return false;
        }
        setTimeout(function () {
          that.getIndexGizwits();
        }, 500)
        return true;
      }
    }
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