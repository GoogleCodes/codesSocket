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

})