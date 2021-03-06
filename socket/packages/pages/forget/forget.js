// pages/forget/forget.js

var tools = require('../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    gizwitsAppId: 'd8b4d2f0bce943ee9ecb4abfa01a2e55',
    loadHidden: true,
    getCodeNumber: '获取验证码',
    disaCode: false,
    phone: '',          //  手机号码
    code: '',           //  验证码
    pword: '',          //  密码
    unpword: '',        //  重覆密码
    codeImages: '',     //  图片验证码,
    token: '',
    captcha_id: '',
    layer_top: 0,
    layer_success: false,
    disabled: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this;
    wx.getSystemInfo({
      success(res) {
        that.setData({
          layer_top: res.windowHeight / 3,
        });
      },
    });
    that.getToken();
  },

  //  获取Token
  getToken() {
    let that = this;
    let headToken = {
      'content-type': 'application/json',
      'Accept': 'application/json',
      'X-Gizwits-Application-Auth': '14599c169b7a1ad3d13375533943db5b', //  md5加密 appid + appsecret
      'X-Gizwits-Application-Id': that.data.gizwitsAppId,
    };
    //  获取token
    tools.sendRrquest('request_token', 'POST', '', headToken).then((result) => {
      that.setData({ token: result.data.token });
      //  获取图片验证码
      let head = {
        'content-type': 'application/json',
        'Accept': 'application/json',
        'X-Gizwits-Application-Token': that.data.token,
        'X-Gizwits-Application-Id': that.data.gizwitsAppId,
      };
      //  获取图片验证码
      tools.sendRrquest('verify/codes', 'GET', '', head).then((result) => {
        that.setData({
          codeImages: result.data.captcha_url,
          captcha_id: result.data.captcha_id
        });
      });
    });
    /*
    wx.request({
      url: 'http://yuyin.ittun.com/public/index/member/edit',
      header: {
        'content-type': 'application/json',
        'content-type': 'application/x-www-form-urlencoded'
      },
      method: "POST",
      data: {
        openid_f: wx.getStorageSync(key),
        password: '',
      },
      success(res) {
        wx.showToast({
          title: '修改成功！',
          icon: 'success',
          duration: 2000
        });
      }
    })*/

  },

  mobileInputEvent(e) {
    this.setData({
      phone: e.detail.value
    });
  },

  /**
   * 获取手机验证码
   */
  getCodeNumber(e) {
    let that = this, mobile = that.data.phone, num = 60;
    let regMobile = /^1[3|4|5|8][0-9]\d{4,8}$/;
    if (mobile == '') {
      wx.showModal({
        title: '提示!',
        content: '请输入手机号码！',
        showCancel: false
      })
      return false;
    } else if (!regMobile.test(mobile)) {
      wx.showModal({
        title: '提示!',
        content: '手机号有误！',
        showCancel: false
      })
      return false;
    }
    var intervalId = setInterval(() => {
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
    let head = {
      'content-type': 'application/json',
      'Accept': 'application/json',
      'X-Gizwits-Application-Token': that.data.token,
      'X-Gizwits-Application-Id': that.data.gizwitsAppId,
    };
    tools.sendRrquest('sms_code', 'POST', {
      "phone": that.data.phone
    }, head).then((result) => {
      console.log(result);
      if (result.data.error_code == 9037) {
        wx.showToast({
          title: '验证码发送失败!',
        })
        clearInterval(intervalId);
        that.setData({
          getCodeNumber: '重新获取',
          disaCode: false,
        });
        return false;
      } else if (result.statusCode == 200) {
        wx.showToast({
          title: '短信已发送!',
          duration: 2000,
        })
        return false;
      }
    });
  },

  bindChange(e) {
    let that = this;
    that.data.phone = e.detail.value;
  },

  ForgetForm(e) {
    let that = this;
    //  验证
    switch (true) {
      case e.detail.value.phone == '':
        tools.showModel('提示', '请输入手机号码', () => { });
        return false;
      case e.detail.value.code == '':
        tools.showModel('提示', '验证码为空', () => { });
        return false;
      case e.detail.value.pword == '':
        tools.showModel('提示', '密码为空', () => { });
        return false;
      case e.detail.value.unpword == '':
        tools.showModel('提示', '密码为空', () => { });
        return false;
      case e.detail.value.unpword !== e.detail.value.pword:
        tools.showModel('提示', '两个密码不相等', () => { });
        return false;
      default:
        break;
    }
    let json = {
      phone: e.detail.value.phone,
      new_pwd: e.detail.value.pword,
      code: e.detail.value.code
    };

    let head = {
      'content-type': 'application/json',
      'Accept': 'application/json',
      'X-Gizwits-Application-Token': that.data.token,
      'X-Gizwits-Application-Id': that.data.gizwitsAppId,
    };
    tools.sendRrquest('sms_code', 'POST', {
      "phone": that.data.phone,
      "code": e.detail.value.code
    }, head).then((result) => {
      if (result.data.error_code == 9008) {
        wx.showToast({
          title: '服务器错误',
        })
        console.log(result);
        return false;
      } else if (result.data.error_code == 9010) {
        wx.showToast({
          title: '验证码无效',
        })
        console.log(result);
        return false;
      }
    });
    tools.sendRrquest('reset_password', 'POST', {
      phone: e.detail.value.phone,
      new_pwd: e.detail.value.pword,
      code: e.detail.value.code
    }, {
      'content-type': 'application/json',
      'Accept': 'application/json',
      'X-Gizwits-Application-Id': that.data.gizwitsAppId,
    }).then((result) => {
      tools.Toast('密码修改成功！');
      wx.removeStorageSync("userInformation");
      wx.removeStorageSync("options");
      setTimeout(() => {
        wx.redirectTo({ url: '../login/login', });
      }, 500);
    });
  },

  layerClose() {
    this.setData({
      layer_success: true,
    });
  },

})