// pages/me/me.js

import { Main } from '../../utils/main.js'
let main = new Main();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    code: '',
    head: {
      'Content-Type': 'application/json',
      'Accept': ' application/json',
      'X-Gizwits-Application-Id': wx.getStorageSync('options').gizwitsAppId,
      'X-Gizwits-User-token': wx.getStorageSync('options').token,
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
  
  },

  _shareGizwits() {
    let that = this, code = "adc1b95729864eecb02cd614cd305abc";
    wx.scanCode({
      success(res) {
        console.log(res.result);
        that.setData({
          code: res.result.substring(16, 48)
        });
        //  创建设备分享
        wx.request({
          url: 'https://api.gizwits.com/app/sharing/code/' + that.data.code,
          method: "POST",
          header: that.data.head,
          success(result) {
            console.log(result.data);
            if (result.data.error_code == 9084) {
              wx.showModal({
                title: '警告!',
                content: result.data.error_message, // "共享记录未找到！", // result.data.error_message,
              })
              return false;
            } else {
              wx.showModal({
                title: '提示~~~',
                content: "分享成功!",
              })
              setTimeout(() => {
                wx.switchTab({
                  url: '../index/index',
                })
              }, 500)
            }
          },
        })
      },
    })
  },

  //  登出
  backLogin() {
    wx.showModal({
      title: '提示',
      content: "你确定要退出登录???",
      showCancel: true,
      success(res) {
        if (res.confirm == true) {
          wx.closeSocket({})  //  关闭websocket
          //  清除缓存
          wx.removeStorageSync('options');
          wx.removeStorageSync('userInformation');
          wx.redirectTo({ url: '../login/login', })
        }
      }
    });
  },

})