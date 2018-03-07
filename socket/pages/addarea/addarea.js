// pages/addarea/addarea.js

var tools = require('../../utils/util.js');
import { $ } from '../../utils/main.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    addAreaText: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
  
  },

  addArea(e) {
    const that = this;
    if (e.detail.value == '') {
      return false;
    }
    that.setData({
      addAreaText: e.detail.value
    });
  },

  saveIMessage() {
    let that = this;
    if (this.data.addAreaText == "") {
      $.alert('请输入内容!');
      return;
    }
    $.ajax({
      url: 'dev/addregion',
      method: "POST",
      data: {
        uid: wx.getStorageSync('wxuser').id,
        name: that.data.addAreaText,
        pid: wx.getStorageSync('did'),
      },
    }).then((res) => {
      that.setData({
        areaid: res.data.data
      })
      $.goPages('../index/index');
    })
    $.alert('请求成功!');
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