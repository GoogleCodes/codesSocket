// pages/message/message.js

import { $ } from '../../utils/main.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    //  windowTop
    winTop: 0,
    //  弹出层
    layerShow: true,
    //  弹出icon
    newWordShow: true,
    //  网关
    deviceMac: '',
    //  wifi版本
    wifiVersion: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this;
    wx.getSystemInfo({
      success(res) {
        that.setData({
          winTop: (res.windowHeight - 300) / 2,
        });
      },
    });
    that._getBindingList();
  },

  onShow() {
    $.getName('title');
  },

  _getBindingList() {
    var that = this;
    let devices = wx.getStorageSync('devices');
    for (let i in devices) {
      if (devices[i].did == wx.getStorageSync('did')) {
        console.log(devices[i].mac);
        that.setData({
          deviceMac: devices[i].mac,
          wifiVersion: devices[i].wifi_soft_version
        });
      }
    }
    
  },

  saveData() {
    this.setData({
      layerShow: true,
    });
  },

  /**
   * 弹出层
   */
  goLayer() {
    this.setData({
      layerShow: false,
    });
  },

  /**
   * 长按设置网关
   */
  chonseNetword() {
    this.setData({
      newWordShow: false,
    });
  },


  /**
   * 取消层
   */
  cancelPop() {
    this.setData({
      layerShow: true,
    });
  }

})