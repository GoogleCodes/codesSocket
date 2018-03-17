// pages/voicelist/voicelist.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ok: true,
    activeIndex: 0,
    list: [
      {
        'Language': 'zh',
        'siri': '国语'
      }, {
        'Language': 'ct',
        'siri': '粤语'
      }
    ],
  },

  selectLanguage(e) {
    let that = this;
    that.setData({
      activeIndex: e.currentTarget.dataset.id,
    });
    if (that.data.activeIndex == 0) {
      wx.setStorageSync('Language', 'zh');
      that.goBack('国语');
    } else if (that.data.activeIndex == 1) {
      wx.setStorageSync('Language', 'ct');
      that.goBack('粤语');
    }
  },

  goBack(t) {
    wx.showToast({
      title: '已选择' + t,
    })
    setTimeout(() => {
      wx.switchTab({
        url: '../../../pages/index/index',
      })
    }, 500);
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let Language = wx.getStorageSync('Language');
    let that = this;
    if (Language == '') {
      return false;
    }
    if (Language == 'zh') {
      that.setData({
        activeIndex: 0
      });
    } else if (Language == 'ct') {
      that.setData({
        activeIndex: 1
      });
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    $.getName('title');
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
  
  }
})