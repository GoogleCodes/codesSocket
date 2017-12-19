// pages/share/share.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cancel: true,
    top: 0,
    layer: true,
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
          winTop: (res.windowHeight - 231) / 2,
        });
      },
    });
  },

  longChose() {
    this.setData({
      cancel: false,
    });
  },

  addShare() {
    this.setData({
      layer: false,
    });
  },

  cancenLayer() {
    this.setData({
      layer: true,
    });
  }

})