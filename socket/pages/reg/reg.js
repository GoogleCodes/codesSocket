// pages/reg/reg.js

var tools = require('../../utils/util.js');

import { $ } from '../../utils/main.js'
// let $ = new Main();

Page({
  data: {
    gizwitsAppId: 'd8b4d2f0bce943ee9ecb4abfa01a2e55',
    loadHidden: true,
    getCodeNumber: '获取验证码',
    disaCode: false,
    name: '',           //  名称
    mobile: '',         //  手机号码
    code: '',           //  验证码
    pword: '',          //  密码
    unpword: '',        //  重覆密码
    codeImages: '',     //  图片验证码,
    webcharName: '',    //  微信名称
    webcharImg: '',     //  微信头像
    token: '',
    captcha_id: '',
    layer_top: 0,
    layer_success: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getToken();
    let that = this;
    wx.getSystemInfo({
      success(res) {
        console.log(res);
        that.setData({
          layer_top: res.windowHeight / 3,
        });
      },
    });
  },

  mobileInputEvent(e) {
    this.setData({
      mobile: e.detail.value
    })
  },

  //  获取Token
  getToken() {
    let that = this;
    let headToken = {
      'content-type': 'application/json',
      'content-type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
      'X-Gizwits-Application-Auth': '14599c169b7a1ad3d13375533943db5b',
      'X-Gizwits-Application-Id': that.data.gizwitsAppId,
    };
    //  获取token
    tools.sendRrquest('request_token', 'POST', '', headToken).then(function(result) {
      that.setData({ token: result.data.token });
      //  获取图片验证码
      let head = {
        'content-type': 'application/json',
        'Accept': 'application/json',
        'X-Gizwits-Application-Token': that.data.token,
        'X-Gizwits-Application-Id': that.data.gizwitsAppId,
      };
      //  获取图片验证码
      tools.sendRrquest('verify/codes', 'GET', '', head).then(function(result) {
        console.log(result.data);
        that.setData({
          codeImages: result.data.captcha_url,
          captcha_id: result.data.captcha_id
        });
      });

    });

    wx.getUserInfo({
      success(res) {
        let userInfo = res.userInfo;
        that.setData({
          webcharName: userInfo.nickName,
          webcharImg: userInfo.avatarUrl
        });
      }
    });

  },

  //  获取验证码
  getCodeNumbers() {
    let that = this;
    let mobile = this.data.mobile;
    const regMobile = /^1[3|4|5|8][0-9]\d{4,8}$/;
    if (!regMobile.test(mobile)) {
      wx.showToast({
        title: '手机号有误！'
      })
      return false;
    }
    var num = 60;
    var intervalId = setInterval(function() {
      num--;
      that.setData({ getCodeNumber: "还有" + num + "秒", });
      if (num > 0) {
        that.setData({
          disaCode: true,
        });
      } else {
        clearInterval(intervalId);
        that.setData({
          getCodeNumber: '重新获取',
          disaCode: false,
        });
      }
    }, 1000);
    let json = {
      'phone': mobile
    };
    let head = {
      'content-type': 'application/json',
      'Accept': 'application/json',
      'X-Gizwits-Application-Token': that.data.token,
      'X-Gizwits-Application-Id': that.data.gizwitsAppId,
    };
    tools.sendRrquest('sms_code', 'POST', json, head).then(function (result) {
      try {
        if (result.data.error_code == 9008) {
          
          wx.showModal({
            title: '提示',
            content: "请输入手机号码!",
            showCancel: false,
          });
        }
      }catch(e){
      }
    });
  },

  bindChange(e) {
    let that = this;
    that.data.phone = e.detail.value;
  },

  ForgetForm(e) {
    let that = this;
    var json = {
      'tel': e.detail.value.mobile,
      'name': e.detail.value.name,
      'password': e.detail.value.pword,
      'wxname': that.data.webcharName,
      'wximage': that.data.webcharImg
    };

    //  验证
    switch (true) {
      case e.detail.value.name == '':
        tools.showModel('提示', '请输入名称',() => {});
        return false;
      case e.detail.value.mobile == '':
        tools.showModel('提示', '请输入手机号码', () => { });
        return false;
      case e.detail.value.code == '':
        tools.showModel('提示', '验证码为空', () => { });
        return false;
      case e.detail.value.pword == '':
        tools.showModel('提示', '密码为空', () => { });
        return false;
    }
    var head = {
      'content-type': 'application/json',
      'Accept': 'application/json',
      'X-Gizwits-Application-Id': that.data.gizwitsAppId,
    };
    wx.setStorageSync('userInformation', json);
    let options = {
      'phone': e.detail.value.mobile,
      'password': e.detail.value.pword,
      "code": e.detail.value.code
    };
    tools.sendRrquest('users', 'POST', options, head).then((result) => {
      switch(true) {
        case result.data.error_code == 910:
          tools.showModel('提示', '验证码错误');
          break;
      }

      $.ajax({
        url: 'member/add',
        method: "POST",
        data: json,
      }).then(function(res) {
        that.setData({
          layer_success: false,
        });
        wx.showToast({
          title: '注册成功！',
          icon: 'success',
          duration: 2000
        });
      })

      wx.removeStorageSync("userInformation");
      wx.removeStorageSync("options");
      wx.redirectTo({ url: '../login/login', });
    });

  },

  layerClose() {
    this.setData({
      layer_success: true,
    });
  },

})