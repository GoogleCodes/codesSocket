// pages/upatearea.js

var tools = require('../../utils/util.js');
import { $ } from '../../utils/main.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    index: 0,
    areaid: 0,
    areaText: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this;
    this.getArea();
  },

  getArea() {
    let that = this;
    $.ajax({
      url: 'dev/getregion',
      method: 'POST',
      data: {
        uid: wx.getStorageSync('wxuser').id,
      },
    }).then((res) => {
      let arr = [];
      for (let i in res.data) {
        if (res.data[i].pid == wx.getStorageSync('did')) {
          arr.push(res.data[i]);
          that.setData({
            list: arr,
          });
          that.setData({
            areaid: that.data.list[0].id
          });
        }
      }

    });
  },

  bindMultiPickerChange(e) {
    let that = this;
    for (let i in that.data.list) {
      if (e.detail.value == i) {
        that.setData({
          areaid: that.data.list[i].id
        });
      }
    }
    this.setData({
      index: e.detail.value,
    })
  },

  blurText(e) {
    let that = this;
    if (e.detail.value == '') {
      return false;
    }
    that.setData({
      areaText: e.detail.value
    });
  },

  editdev() {
    let that = this;
    $.ajax({
      url: 'dev/editregion',
      method: 'POST',
      data: {
        id: that.data.areaid,
        uid: wx.getStorageSync('wxuser').id,
        name: that.data.areaText,
      }
    }).then((res) => {
      if (res.code == 1) {
        wx.showToast({
          title: res.msg,
        });
        setTimeout(() => {
          wx.switchTab({
            url: '../index/index',
          })
        }, 500);
        return false;
      } else if (res.code == 0) {
        wx.showModal({
          title: '警告',
          content: res.msg,
          showCancel: false
        });
        return false;
      }
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow () {
    $.getName('title');
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