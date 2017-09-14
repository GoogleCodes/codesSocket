// pages/login/login.js

var _util = require('../../utils/util.js');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    uname: '',
    pword: '',
    wechatOpenId: 'kceshi1',
    gizwitsAppId: 'd8b4d2f0bce943ee9ecb4abfa01a2e55',
    token: '',
    loadHidden: true,
  },

  loginForm(e) {
    var that = this;
    switch (true) {
      case e.detail.value.uname == '':
        wx.showModal({
          title: '提示',
          content: "用户账号为空!",
          showCancel: false,
          success: function (res) { }
        });
        return false;
      case e.detail.value.pword == '':
        wx.showModal({
          title: '提示',
          content: "用户账号为空!",
          showCancel: false,
          success: function (res) { }
        });
        return false;
    }
    that.setData({
      uname: e.detail.value.uname,
      pword: e.detail.value.pword,
      loadHidden: false,
    });
    var json = {
      lang: "en",
      username: that.data.uname,
      password: that.data.pword,
    };
    var head = {
      'content-type': 'application/json',
      'X-Gizwits-Application-Id': that.data.gizwitsAppId,
    };
    wx.setStorageSync('userInformation', json);
    _util.sendRrquest('login', 'POST', json, head).then(function (result) {
      if (result.data.error_code == 9020) { //  如果账号或者密码错误 提示错误
        wx.showModal({
          title: '提示',
          content: "账号或者密码错误!",
          showCancel: false,
          success: function (res) {
            that.setData({ loadHidden: true, });
          }
        });
        return false;
      } else {
        that.setData({ loadHidden: true, });
        var options = {
          uid: result.data.uid,
          token: result.data.token,
          gizwitsAppId: that.data.gizwitsAppId
        };
        wx.setStorageSync('options', options);
        that.setData({
          uid: result.data.uid,
          token: result.data.token,
        });
        wx.redirectTo({ url: '../smart/smart', });
      }
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  forgetPwd () {
    return;
    let that = this;
    wx.request({
      url: 'https://api.gizwits.com/app/reset_password',
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'Accept' : ' application/json',
        "X-Gizwits-Application-Id": that.data.gizwitsAppId, // phone_id: that.data.options.wechatOpenId,
      },
      data: {
        "phone": that.data.uname,
        "new_pwd": that.data.pword,
        "code": "string"    //  手机验证码
      },
      success (res) {},
      fail (err) {},
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var that = this;
    var userInfom = wx.getStorageSync('userInformation');
    that.setData({
      uname: userInfom.username,
      pword: userInfom.password,
    });
    if (wx.getStorageSync('userInformation') !== '') {
      wx.redirectTo({ url: '../smart/smart', })
    }
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