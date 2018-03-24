// pages/me/me.js

import { $ } from '../../utils/main.js';
var tools = require('../../utils/util.js');
// let main = new Main();

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

    lastX: 0,     //滑动开始x轴位置
    lastY: 0,     //滑动开始y轴位置
    currentGesture: 0, //标识手势
    status: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  onShow() {
    $.getName('title');
  },

  _shareGizwits() {
    let that = this;
    wx.scanCode({
      success(res) {
        console.log(res);
        that.setData({
          code: res.result
        });
        wx.request({
          url: 'https://api.gizwits.com/app/sharing/code/' + that.data.code,
          method: "POST",
          header: {
            'Content-Type': 'application/json',
            'Accept': ' application/json',
            'X-Gizwits-Application-Id': wx.getStorageSync('options').gizwitsAppId,
            'X-Gizwits-User-token': wx.getStorageSync('options').token,
          },
          success(result) {
            console.log(result);
            switch(true) {
              case result.data.error_code == 9084:
                wx.showModal({
                  title: '警告!',
                  content: '共享记录未找到！', // "共享记录未找到！",
                  showCancel: false,
                })
                return false;
              case result.data.error_code == 9088:
                wx.showModal({
                  title: '警告!',
                  content: '共享记录过期!', // "共享记录未找到！",
                  showCancel: false,
                })
                return false;
              case result.data.error_code == 9083:
                wx.showModal({
                  title: '警告!',
                  content: '客人已经绑定到设备!', // "共享记录未找到！",
                  showCancel: false,
                })
                return false;
              case result.data.error_code == 9089:
                wx.showModal({
                  title: '警告!',
                  content: '共享记录状态不是不接受!', // "共享记录未找到！",
                  showCancel: false,
                })
                return false;
            }
            let options = wx.getStorageSync('options');
            let query = "?show_disabled=0&limit=" + 20 + "&skip=" + 0;
            let json = {}, arr = [], pson = {};
            tools.sendRrquest('bindings' + query, 'GET', '', {
              'content-type': 'application/json',
              'X-Gizwits-Application-Id': options.gizwitsAppId,
              'X-Gizwits-User-token': options.token,
            }).then((result) => {
              wx.setStorageSync('devices', result.data.devices);
              wx.showModal({
                title: '提示~~~',
                content: "分享成功!",
                showCancel: false,
                success(res) {
                  if (res.confirm == true) {
                    wx.switchTab({
                      url: '../index/index',
                    })
                  }
                },
              })
            }, function (err) {
            });
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
          wx.removeStorageSync('wxuser');
          wx.removeStorageSync('devices');
          wx.removeStorageSync('indexDevice');
          wx.removeStorageSync('userInformation');
          wx.clearStorageSync();
          wx.redirectTo({ url: '../login/login', })
        }
      }
    });
  },

  goPages(e) {
    let pageNames = e.currentTarget.dataset.pagename;
    wx.navigateTo({
      url: '../../packages/pages/' + pageNames,
    })
  },

})