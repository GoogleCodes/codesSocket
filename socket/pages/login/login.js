// pages/login/login.js

var tools = require('../../utils/util.js');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    uname: '13630017088', // 13250672958
    pword: '654321', // 123456789
    wechatOpenId: 'kceshi1',
    gizwitsAppId: 'd8b4d2f0bce943ee9ecb4abfa01a2e55',
    token: '',
    loadHidden: true,
    uid: ''
  },

  loginForm(e) {
    var that = this;
    let fId = e.detail.formId, fObj = e.detail.value;
    switch (true) {
      case e.detail.value.uname == '':
        tools.showModel('提示', '用户账号为空!');
        return false;
      case e.detail.value.pword == '':
        tools.showModel('提示', '用户密码为空!');
        return false;
      default:
        break;
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
      formID: fId,
      fromObject: fObj,
    };
    var head = {
      'content-type': 'application/json',
      'X-Gizwits-Application-Id': that.data.gizwitsAppId,
    };
    wx.setStorageSync('userInformation', json);

    tools.sendRrquest('login', 'POST', json, head).then((result) => {
       //  如果账号或者密码错误 提示错误
      if (result.data.error_code == 9020) {
        tools.showModel('提示','账号或者密码错误', (res) => {
          that.setData({ loadHidden: true, });
        });
        return false;
      } else {
        //  登录成功后向后台发送一条消息记录
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
        console.log(this.data.uid);
        wx.switchTab({
          url: '../index/index',
        })
      }
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    var that = this;
    //  获取用户信息
    wx.request({
      url: 'http://yuyin.ittun.com/public/index/member/getUser',
      method: "POST",
      header: {
        'content-type': 'application/json',
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        tel: '13232800159'
      },
      success(res) {
        console.log(res.data.data);
        wx.setStorageSync('wxuser', res.data.data)
      }
    })
    var userInfom = wx.getStorageSync('userInformation');
    that.setData({
      uname: userInfom.username,
      pword: userInfom.password,
    });
    if (wx.getStorageSync('userInformation') !== '') {
      wx.redirectTo({ url: '../index/index', })
    }
  },
})