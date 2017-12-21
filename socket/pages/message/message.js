// pages/message/message.js

var tools = require('../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    //  windowTop
    winTop: 0,
    //  弹出层
    layerShow: true,
    //  弹出icon
    newWordShow: true,
    //  网关
    deviceMac: '',
    //  wifi版本
    wifiVersion: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this;
    wx.getSystemInfo({
      success(res) {
        that.setData({
          winTop: (res.windowHeight - 300) / 2,
        });
      },
    });
    that._getBindingList(20, 0);
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
      // that.setData({ listDevices: result.data.devices });
      // var pKey = null;
      for (var i in result.data.devices) {
        var device = result.data.devices[i];
        if (result.data.devices[i].is_online == true) {
          that.setData({
            deviceMac: device.mac,
            wifiVersion: device.wifi_soft_version
          });
          console.log(that.data.deviceMac);
        }
      }
      // that._GizwitsDevdata(that.data.options.did);
      // that._getGizwitsDataing(pKey);
    }, (err) => { });
  },

  saveData() {
    this.setData({
      layerShow: true,
    });
  },

  /**
   * 弹出层
   */
  goLayer() {
    this.setData({
      layerShow: false,
    });
  },

  /**
   * 长按设置网关
   */
  chonseNetword() {
    this.setData({
      newWordShow: false,
    });
  },


  /**
   * 取消层
   */
  cancelPop() {
    this.setData({
      layerShow: true,
    });
  }

})