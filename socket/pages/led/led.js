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

  goGizwits() {
    let that = this;
    that.setData({ switchButton: true });
    //  获取did
    const DID = wx.getStorageSync("didJSon");
    console.log(DID.did);
    var json = {
      'onoffAll': that.data.switchButton,
    };
    //  发送数据
    tools.sendData('c2s_write', DID.did, json);
  },

  carryout() {
    this.setData({
      layerShow: false,
    });
  },

})