// pages/index/index.js

var tools = require('../../utils/util.js');
import { $ } from '../../utils/main.js'

let com = require('../../utils/common/common.js');

let that;

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
    did: '',
    host: '', //  websocket 请求地址 sandbox.gizwits.com
    ws_port: 0, //  端口
    wss_port: 0, //  端口
    areaid: '', //  区域ID
    deviceID: '', //  设备ID,
    tabArrayID: '',
    didList: [],
    statusText: '关闭',
    currentItem: 0,
    typeDevice: 0,
    types: '',
    typea: '',
    allDevice: [],
    tabArrayAll: [],
  },

  bindChange(e) {
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
        }).then((res) => {
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
    var arr = [];
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
    }).then((res) => {
      for (let i in tabArray) {
        if (tabArray[i].pid == wx.getStorageSync('did')) {
          that.setData({
            spliceArray: res.data,
            tabId: e.target.dataset.id,
            areaid: e.target.dataset.id,
          });
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
    that = this;
    if (wx.getStorageSync('options') == '') {
      wx.removeStorageSync('userInformation');
      wx.removeStorageSync('wxuser');
      wx.redirectTo({ url: '../login/login' });
    }
  },

  onShow() {
    this._getBindingList(20, 0);
  },

  getIndexGizwits() {
    $.getName('title');
    $.ajax({
      url: 'dev/getregion',
      method: 'POST',
      data: {
        uid: wx.getStorageSync('wxuser').id
      },
    }).then((res) => {
      let response = res.data;
      let json = {};
      let last = '';
      let arr = [], brr = [];
      for (let i in response) {
        if (response[i].pid == wx.getStorageSync('did')) {
          arr.push(response[i]);
          that.setData({
            tabArray: arr.reverse(),
            tabArrayAll: brr,
            currentTab: 0
          });
          wx.setStorageSync('tabArray', arr.reverse());
        }
      }
      for (let i in that.data.tabArray) {
        if (wx.getStorageSync('did') == that.data.tabArray[i].pid) {
          if (that.data.tabArray[i].name == '全部') {
            last = that.data.tabArray[i].id;
          }
        }
      }
      $.ajax({
        url: 'dev/getdev',
        method: 'POST',
        data: {
          rid: last,
          uid: wx.getStorageSync('wxuser').id,
        },
      }).then((res) => {
        let device = res.data, json = {};
        let arr = [];
        for (let i in device) {
          let sdid = JSON.parse(device[i].did);
          if (sdid[1] == 0) {
            that.setData({
              types: 0,
            });
          } else if (sdid[1] == 1) {
            that.setData({
              types: 1,
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
            isall: device[i].isall
          };
          arr.push(json);
          wx.setStorageSync("indexDevice", arr);
        }
        wx.getSystemInfo({
          success(res) {
            that.setData({
              winHeight: 100 * arr.length,
            });
          },
        });
        that.setData({
          spliceArray: arr,
          areaid: arr[arr.length - 1].rid,
        });
        wx.setStorageSync('spliceArray', arr);
      });
    });
  },

  elePosition(rid) {
    $.ajax({
      url: 'dev/getdev',
      method: 'POST',
      data: {
        rid: rid,
        uid: wx.getStorageSync('wxuser').id,
      },
    }).then((res) => {
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
      $.ajax({
        url: 'dev/editdev',
        method: 'POST',
        data: {
          uid: wx.getStorageSync('wxuser').id,
          id: id,
          status: status
        }
      }).then((res) => {
        if (res.msg == '请求失败') {
          wx.showToast({
            title: res.msg,
            duration: 2000,
          })
          return false;
        }
        wx.hideLoading();
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
                  ajax("true");
                  array1 = [0xA1, 0x01, 0x01];
                  array2 = [0x00, 0x08, 0xA2];
                  socketGo(array1, array2);
                  that.setData({
                    status: true,
                    statusText: '开启',
                  });
                  wx.hideLoading();
                  that.elePosition(that.data.areaid);
                  return;
                case that.data.spliceArray[y].status == "true":
                  ajax("false");
                  array1 = [0xA1, 0x01, 0x00];
                  array2 = [0x00, 0x08, 0xA2];
                  socketGo(array1, array2);
                  that.setData({
                    status: false,
                    statusText: '关闭'
                  });
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
    let json = {};
    wx.showLoading({ title: '' })
    var options = wx.getStorageSync('options');
    //  创建Socket
    wx.connectSocket({
      url: 'wss://' + that.data.host + ':' + that.data.wss_port + '/ws/app/v1',
    });

    //  监听 WebSocket 连接事件
    wx.onSocketOpen((res) => {
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
      //  获取服务器返回的信息
      wx.onSocketMessage((res) => {
        var data = JSON.parse(res.data);
        if (data.cmd == 'subscribe_res') {
          that.getDevice();
        }
        let options = null;
        try {
          if (data.data.success == true) {

          } else {
            if (data.data.msg == "M2M socket has closed, please login again!") {
              that._login();
            }
          }
        } catch (e) {
        }
      });
      // that.getDevice();
    });
    wx.hideLoading();
  },

  getDevice() {
    let arr = [0x00, 0x02, 0xA0, 0xFF];
    tools.sendData('c2s_write', wx.getStorageSync('did'), {
      'data': $.getArrays(arr),
    });
    if (wx.getStorageSync('backData') == "") {
      $.getSocketResponse((did, data) => {
        wx.setStorageSync('backData', JSON.stringify(data));
        if (wx.getStorageSync('did') == did) {
          that.getIndexGizwits();
        }
        that.getIndexGizwits();
      });
    } else {
      $.getSocketResponse((did, data) => {
        if (wx.getStorageSync('did') == did) {
          if (data[2] == 161) {
            if (wx.getStorageSync('backData') !== JSON.stringify(data)) {
              // $.ajax({
              //   url: 'dev/delallregion',
              //   method: 'POST',
              //   data: {
              //     uid: wx.getStorageSync('wxuser').id
              //   },
              // }).then((res) => {
              //   if (res.code == 1) {
                  $.ajax({
                    url: 'dev/addregion',
                    method: 'POST',
                    data: {
                      name: '全部',
                      uid: wx.getStorageSync('wxuser').id,
                      pid: wx.getStorageSync('did'),
                    },
                  }).then((res) => {
                    let id = res.data;
                    let arr = [0x00, 0x02, 0xA0, 0xFF];
                    tools.sendData('c2s_write', wx.getStorageSync('did'), {
                      'data': $.getArrays(arr),
                    });
                    $.getSocketResponse((did, data) => {
                      if (data[2] == 23) {
                        let k = data;
                        let last = null, json = {};
                        for (let p in k) {
                          last = k.splice(4, 10 + k[13])
                          if (last.indexOf(1) == 0) {
                            let name = last;
                            let doname = name.splice(10, last[9]);
                            let deviceDid = last.splice(0, 4);
                            let str = "";
                            for (let y in doname) {
                              str += "%" + doname[y].toString(16);
                            }
                            json = {
                              uid: wx.getStorageSync('wxuser').id,
                              did: $.stringify(deviceDid),
                              dname: $.utf8to16(unescape(str)),
                              rid: id,
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
                        wx.reLaunch({
                          url: '../index/index',
                        })
                        that.getIndexGizwits();
                      }
                    });
                  });
                // }
              // });
            }
          }
        }
      });
    }

  },

  //  心跳开始
  _startPing() {
    var heartbeatInterval = that.data._heartbeatInterval * 1000;
    that.data._heartbeatTimerId = setInterval(() => {
      var options = {
        cmd: "ping"
      };
      that._sendJson(options);
    }, heartbeatInterval);
  },

  _getBindingList(limit, skip) {
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
      if (that.data.didList[i].did == that.data.did) {
        if (that.data.didList[i].isonline == false) {
          that.getIndexGizwits();
          wx.showModal({
            title: '警告',
            content: '设备已经下线',
            showCancel: false,
          })
          return false;
        }
        that.getIndexGizwits();
        return true;
      }
    }
  },

  /**
  * 发送数据
  */
  _sendJson(json) {
    wx.sendSocketMessage({
      //  对象转换字符串
      data: JSON.stringify(json),
    })
  },

  getJSON(cmd, dids, names) {
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

  goPages(e) {
    wx.navigateTo({
      url: '../../packages/pages/' + e.currentTarget.dataset.pagename,
    })
  }

})