// pages/reg/reg.js

var _util = require('../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    gizwitsAppId: 'd8b4d2f0bce943ee9ecb4abfa01a2e55',
    loadHidden: true,
    getCodeNumber: '获取验证码',
    disaCode: false,
    phone: '',  //  手机号码
    code: '', //  验证码
    pword: '',  //  密码
    unpword: '', //  重覆密码
    codeImages: '',  //  图片验证码,
    token: '',
    captcha_id: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getToken();
  },

  //  获取Token
  getToken() {
    let that = this;
    let headToken = {
      'content-type': 'application/json',
      'Accept': 'application/json',
      'X-Gizwits-Application-Auth': '14599c169b7a1ad3d13375533943db5b',
      'X-Gizwits-Application-Id': that.data.gizwitsAppId,
    };
    //  获取token
    _util.sendRrquest('request_token', 'POST', '', headToken).then(function (result) {
      console.log(result.data.token);
      that.setData({ token: result.data.token });
      //  获取图片验证码
      let head = {
        'content-type': 'application/json',
        'Accept': 'application/json',
        'X-Gizwits-Application-Token': that.data.token,
        'X-Gizwits-Application-Id': that.data.gizwitsAppId,
      };
      //  获取图片验证码
      _util.sendRrquest('verify/codes', 'GET', '', head).then(function (result) {
        console.log(result.data);
        that.setData({
          codeImages: result.data.captcha_url,
          captcha_id: result.data.captcha_id
        });
      });
    });
  },

  //  获取验证码
  getCodeNumber() {
    let that = this;
    var num = 10;
    var times = setInterval(function () {
      num--;
      that.setData({ getCodeNumber: "还有" + num + "秒", });
      if (num > 0) {
        that.setData({
          disaCode: true,
        });
      } else {
        clearInterval(times);
        that.setData({
          getCodeNumber: '重新获取',
          disaCode: false,
        });
      }
    }, 1000);
    let head = {
      'content-type': 'application/json',
      'Accept': 'application/json',
      'X-Gizwits-Application-Token': that.data.token,
      'X-Gizwits-Application-Id': that.data.gizwitsAppId,
    };
    let json = {
      "phone": that.data.phone
    };
    _util.sendRrquest('sms_code', 'POST', json, head).then(function (result) {
      console.log(result.data);
    });
  },

  bindChange(e) {
    let that = this;
    that.data.phone = e.detail.value;
  },

  ForgetForm(e) {
    console.log('forget');
    //  验证
    switch (true) {
      case e.detail.value.phone == '':
        wx.showModal({
          title: '提示',
          content: "请输入手机号码!",
          showCancel: false,
          success: function (res) { }
        });
        return false;
      case e.detail.value.code == '':
        wx.showModal({
          title: '提示',
          content: "验证码为空!",
          showCancel: false,
          success: function (res) { }
        });
        return false;
      case e.detail.value.pword == '':
        wx.showModal({
          title: '提示',
          content: "密码为空!",
          showCancel: false,
          success: function (res) { }
        });
        return false;
      case e.detail.value.unpword == '':
        wx.showModal({
          title: '提示',
          content: "密码为空!",
          showCancel: false,
          success: function (res) { }
        });
        return false;
      case e.detail.value.unpword !== e.detail.value.pword:
        wx.showModal({
          title: '提示',
          content: "两个密码不相等!",
          showCancel: false,
          success: function (res) { }
        });
        return false;
    }
    var json = {
      'lang': 'en',
      'phone': that.data.uname,
      'password': that.data.pword,
      'code': that.data.code
    };
    var head = {
      'content-type': 'application/json',
      'Accept': 'application/json',
      'X-Gizwits-Application-Id': that.data.gizwitsAppId,
    };
    wx.setStorageSync('userInformation', json);
    _util.sendRrquest('users', 'POST', json, head).then(function (result) {
      wx.showToast({
        title: '注册成功！',
        icon: 'success',
        duration: 2000
      });
      wx.removeStorageSync("userInformation");
      wx.removeStorageSync("options");
      wx.redirectTo({ url: '../login/login', });
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