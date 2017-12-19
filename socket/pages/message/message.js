// pages/message/message.js
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