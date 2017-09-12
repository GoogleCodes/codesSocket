// pages/login/login.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    uname: '',
    pword: '',
    wechatOpenId: 'kceshi1',
    gizwitsAppId: 'd8b4d2f0bce943ee9ecb4abfa01a2e55', //  032c92bbb0fc4b6499a2eaed58727a3a  d8b4d2f0bce943ee9ecb4abfa01a2e55 141b9a9bb1df416cbb18bb85c864633f
    token: '',
    loadHidden: true,
  },

  loginForm(e) {
    var that = this;      
    if (e.detail.value.uname == '') {
      wx.showToast({
        title: '账号框为空',
        icon: 'success',
        duration: 2000
      });
      return false;
    } else if (e.detail.value.pword == '') {
      wx.showToast({
        title: '密码框为空',
        icon: 'success',
        duration: 2000
      });
      return false;
    }
    that.setData({
      uname: e.detail.value.uname,
      pword: e.detail.value.pword,
      loadHidden: false,
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
        username: that.data.uname,
        password: that.data.pword,
      },
      success: function (result) {
        that.setData({ loadHidden : true, });
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
        wx.redirectTo({url: '../smart/smart',})
      },
      fail: function (evt) {
        console.log(evt);
      }
    });
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
    if (wx.getStorageSync('userInformation') !== '') {
      wx.redirectTo({ url: '../smart/smart', })
    }
  },

  forgetPwd (){
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