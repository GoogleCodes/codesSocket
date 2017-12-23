// pages/control/control.js

var tools = require('../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log(wx.getStorageSync('devices'));
    this.setData({
      list: wx.getStorageSync('devices')
    });
  },

})