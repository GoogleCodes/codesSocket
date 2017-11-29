// pages/person.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    uname: '',      //  用户名
    wxhead: '',     //  微信图像
    wxname: '',     //  微信名称
    tel: ''         //  手机号码
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const userInfo = wx.getStorageSync('wxuser');
    this.setData({
      tel: userInfo.tel,
      uname: userInfo.name,
      wxname: userInfo.wxname,
      wxhead: userInfo.wximage
    });
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
  
  }
})