// pages/login/login.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    uname: '',
    pword: '',
    wechatOpenId: 'kceshi1',
    gizwitsAppId: 'd8b4d2f0bce943ee9ecb4abfa01a2e55', //  032c92bbb0fc4b6499a2eaed58727a3a  d8b4d2f0bce943ee9ecb4abfa01a2e55
    token: ''
  },

  loginForm(e) {
    var that = this;
    that.setData({
      uname: e.detail.value.uname,
      pword: e.detail.value.pword
    });
    var userInfo = {
      username: that.data.uname,
      password: that.data.pword,
    };
    wx.setStorageSync('userInformation', userInfo);
    wx.request({
      url: "https://api.gizwits.com/app/login",
      method: 'POST',
      header: {
        'content-type': 'application/json',
        "X-Gizwits-Application-Id": that.data.gizwitsAppId, // phone_id: that.data.options.wechatOpenId,
      },
      data: {
        lang: "en",
        // phone_id: that.data.wechatOpenId,
        username: that.data.uname,
        password: that.data.pword,
      },
      success: function (result) {
        var options = {
          uid: result.data.uid,
          token: result.data.token,
          gizwitsAppId: 'd8b4d2f0bce943ee9ecb4abfa01a2e55'
        };
        wx.setStorageSync('options', options);
        that.setData({
          uid: result.data.uid,
          token: result.data.token,
        });
        wx.navigateTo({url: '../smart/smart',})
      },
      fail: function (evt) {
        console.log(evt);
      }
    })

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var userInfom = wx.getStorageSync('userInformation');
    that.setData({
      uname: userInfom.username,
      pword: userInfom.password,
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