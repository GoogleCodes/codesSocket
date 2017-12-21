// pages/led/led.js

var tools = require('../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    //  windowTop
    winTop: 0,
    switchButton: true,
    currentTabs: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this;
    wx.getSystemInfo({
      success(res) {
        console.log(res.windowHeight);
        that.setData({
          winTop: (res.windowHeight - 225) / 2,
        });
      },
    });
  },

  gizwits(e) {
    let that = this, json = {}, arr = [];
    //  获取did
    const storage = wx.getStorageSync("didJSon");
    if (this.data.currentTabs === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTabs: e.target.dataset.current
      })
    }
    switch (true) {
      case e.target.dataset.current == 0:
        arr.push(0x00, 0x01, 0x40);
        json = {
          'data': main.getArrays(arr),
        };
        tools.sendData('c2s_write', storage.did, json);
        break;
      case e.target.dataset.current == 1:
        arr.push(0x00, 0x01, 0x40);
        json = {
          'data': main.getArrays(arr),
        };
        tools.sendData('c2s_write', storage.did, json);
        break;
      case e.target.dataset.current == 2:
        arr.push(0x00, 0x01, 0x40);
        json = {
          'data': main.getArrays(arr),
        };
        tools.sendData('c2s_write', storage.did, json);
        break;
    }
  },

  carryout() {
    this.setData({
      layerShow: false,
    });
  },

})