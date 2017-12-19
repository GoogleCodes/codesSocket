// pages/equipment/equipment.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //  windowTop
    winTop: 0,
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
          winTop: (res.windowHeight - 300) / 2,
        });
      },
    });
  },

})