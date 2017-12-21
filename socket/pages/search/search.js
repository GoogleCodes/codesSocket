// pages/search/search.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    array: ['吊灯','照明灯','台灯'],
    index: 0,
    currentTab: 0,
    winHeight: 0,
    pickerShow: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const that = this;
    wx.getSystemInfo({
      success(res) {
        that.setData({
          winHeight: res.windowHeight / 2
        });
      },
    });
  },

  bindPickerChange(e) {
    console.log(e.detail.value);
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
  },

  bindChange(e) {
    var that = this;
    that.setData({
      currentTab: e.detail.current
    });
  },

  inputSet() {
    this.setData({
      pickerShow: false,
    });
  },

  outputSet() {
    this.setData({
      pickerShow: true,
    });
  }

})