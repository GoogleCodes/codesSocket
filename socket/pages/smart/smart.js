// smart.js

var myUtils = require('../../utils/util.js');
var gizwitsws = require('../../utils/gizwits_ws_0.3.0.min.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    array: ['custom', 'attrs_v4'],
    messages: '',
    apiHost: 'api.gizwits.com',
    commType: 'attr_v4',
    wechatOpenId: 'kceshi1',
    gizwitsAppId: '032c92bbb0fc4b6499a2eaed58727a3a',
    token: '0bcd85f5c5184d67bd4358807df51653',
    uids: '032c92bbb0fc4b6499a2eaed58727a3a',
    did: '',
    port: 0,
    port_s: 0,
    ws_port: 0,
    wss_port: 0,
    onInit : undefined,
    _bindingDevices: undefined,
    recodePath: '',  //  录音路径
    host: '', //  websocket 请求地址
  },

  /**
     * 显示内容
     */
  showMessage: function (message) {
    var that = this;
    that.setData({
      messages: message,
    });
  },

  onReceivedRaw: function (value) {
    var str = value.did;
    for (var i = 0; i < value.raw.length; i++) {
      str = str + value.raw[i] + ",";
    }
    str = str.substr(0, str.length - 1) + "]";
    this.showMessage(str);
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that._getUserToken();
    //  初始化
    this.showMessage("初始化成功！");

    gizwitsws.GizwitsWS.prototype.connect(that.data.did);

  },
  /**
   * 开始录音
   */
  startRecode: function () {
    var that = this;
    console.log("start");
    wx.startRecord({
      success: function (res) {
        console.log(res);
        var tempFilePath = res.tempFilePath;
        that.setData({ recodePath: tempFilePath, isRecode: true });
        console.log(tempFilePath + "----");
      },
      fail: function (res) {
        console.log("fail");
        console.log(res.data);
        //录音失败
      }
    });
  },

  /**
   * 结束录音
   */
  endRecode: function () {
    var s = this;
    console.log("end" + "----");
    wx.stopRecord();
    s.setData({ isRecode: false });

    wx.showToast();
    setTimeout(function () {
      var urls = 'http://yuyin.ittun.com/public/index/index/fanyi';
      console.log(s.data.recodePath + "----");
      wx.uploadFile({
        url: urls,
        filePath: s.data.recodePath,
        method: "GET",
        name: 'abc',
        header: ('Access-Control-Allow-Origin: *'),
        header: ("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept"),
        header: ('Access-Control-Allow-Methods: GET, POST, PUT'),
        success: function (res) {
          var str = res.data;
          var data = JSON.parse(str);
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
              success: function (res) {

              }
            });
          }
          wx.hideToast();
        },
        fail: function (res) {
          console.log(res);
          wx.showModal({
            title: '提示',
            content: "网络请求失败，请确保网络是否正常",
            showCancel: false,
            success: function (res) {

            }
          });
          wx.hideToast();
        }
      });
    }, 1000)
  },

  chooseImages: function () {
    wx.chooseImage({
      count: 1,
      header: ('Access-Control-Allow-Origin: *'),
      header: ("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept"),
      header: ('Access-Control-Allow-Methods: GET, POST, PUT'),
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      name: 'abc',
      success: function (res) {
        var tempFilePaths = res.tempFilePaths
        wx.uploadFile({
          url: 'http://yuyin.ittun.com/public/index/index/fanyi',
          filePath: tempFilePaths[0],
          name: 'abc',
          formData: {
            'user': 'test'
          },
          success: function (res) {
            var data = res.data
            console.log(res);
          }
        })
      }
    })
  },

  chooseVideo: function () {
    wx.chooseVideo({
      //相机和相册
      sourceType: ['album', 'camera'],
      //录制视频最大时长
      maxDuration: 60,
      //摄像头
      camera: ['front', 'back'],
      //这里返回的是tempFilePaths并不是tempFilePath
      success: function (res) {
        var tempFilePaths = res.tempFilePaths
        console.log(res.tempFilePaths[0])
        wx.uploadFile({
          url: 'http://yuyin.ittun.com/public/index/index/fanyi',
          filePath: res.tempFilePaths[0],
          name: 'abcdsfd',
          success: function (res) {
            var data = res.data
            console.log(res);
          }
        })
      },
      fail: function (e) {
        console.log(e)
      }
    });
  },

  read: function () {
    var that = this;
  },

  writeCommand: function () {
    var that = this;
    var options = {
      "lang": 10
    };
    console.log(options);
    gizwitsws.GizwitsWS.prototype.send(that.data.dids, options);

    this.showMessage("已对设备" + that.data.dids + "发送raw指令: " + JSON.stringify(options));
  },

  /**
   * 下拉列表
   */
  bindPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index: e.detail.value
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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
  onShareAppMessage: function () {

  },

  _getUserToken: function () {
    var that = this;
    wx.request({
      url: "https://" + that.data.apiHost + "/app/users",
      method: 'POST',
      header: {
        'content-type': 'application/json',
        "X-Gizwits-Application-Id": that.data.gizwitsAppId
      },
      data: {
        lang: "en",
        phone_id: that.data.wechatOpenId
      },
      success: function (result) {
        that.data.token = result.data.token;
        that.data.uid = result.data.uid;
        var limit = 20;
        var skip = 0;
        that._getBindingList(limit, skip)
      },
      fail: function (evt) {

      }
    })
  },

  _getBindingList: function (limit, skip) {
    var that = this;
    var query = "?show_disabled=0&limit=" + limit + "&skip=" + skip;
    wx.request({
      url: "https://api.gizwits.com/app/bindings" + query,
      method: 'GET',
      header: {
        'content-type': 'application/json',
        "X-Gizwits-Application-Id": '032c92bbb0fc4b6499a2eaed58727a3a',
        "X-Gizwits-User-token": '5e13097e89464309905d15a72a66a3d4'
      },
      success: function (result) {
        for (var i in result.data.devices) {
          var device = result.data.devices[i];
          that.data.did = device.did;
          that.setData({
            did: device.did,  //  did
            host: device.host,  //  websocket 请求地址
          });
          
          // _bindingDevices = device;

          // _bindingDevices[didType] = device;
          that._getWebSocketConn(result.data.devices[i], that.data.host, that.data.did);
        }
        if (result.data.devices.length == limit) {
          that._getBindingList(limit, skip + limit)
        } else {
          that._returnDeviceList()
        }
      },
      fail: function (evt) {

      }
    })
  },

  _getWebSocketConn(data, host, did) {
    var len = did.length;
    var reqData = [];
    for (var i = 0; i < len.length; i++) {
      reqData.push({
        did: did[i]
      });
    }

    var that = this;
    wx.connectSocket({
      url: 'wss://' + host + ":" + 8880 + "/ws/app/v1",
    });

    wx.onSocketOpen(function () {
      var success = [], that = this;
      success = {
        "did": data.did,
        "mac": data.mac,
        "product_key": data.product_key,
        "is_online": data.is_online,
        "dev_alias": data.dev_alias,
        "remark": data.remark
      };
      wx.sendSocketMessage({
        data: JSON.stringify(success),
        success: function (res) {
          console.log(res);
        },
        fail: function (err) {
          console.log(err)
        }
      });

      wx.onSocketMessage(function (res) {
        console.log(res);
      })

    })

    

    this.showMessage("已发送read指令!");
  },

  _returnDeviceList: function () {
    var devices = [], that = this;
    if (that.onInit) {
      var devices = [];
      var i = 0;
      for (var key in that._bindingDevices) {
        devices[i] = {
          "did": that._bindingDevices[key].did,
          "mac": that._bindingDevices[key].mac,
          "product_key": that._bindingDevices[key].product_key,
          "is_online": that._bindingDevices[key].is_online,
          "dev_alias": that._bindingDevices[key].dev_alias,
          "remark": that._bindingDevices[key].remark
        };
        i++
      }
      that.onInit(devices)
    }
  }

})