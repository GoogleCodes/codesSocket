// pages/aboutme/aboutme.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    Cooperation: '0757-22903337',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
  
  },

  wxPhoneCall(e) {
    wx.makePhoneCall({
      phoneNumber: this.data.Cooperation
    })
  }

})