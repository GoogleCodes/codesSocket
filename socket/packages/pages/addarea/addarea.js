// pages/addarea/addarea.js

var tools = require('../../utils/util.js');
import { $ } from '../../utils/main.js'

let arrays = [];

Page({

  /**
   * 页面的初始数据
   */
  data: {
    addAreaText: '',
    name_focus: true
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

  storageMsg(text) {
    let json = {
      name: text,
      devices: [],
    };
    arrays.push(json);
    wx.setStorageSync('regionList', arrays);
  },

  saveIMessage() {
    let that = this;
    // let regionList = wx.getStorageSync('regionList');
    // for (let i in regionList) {
    //   if (regionList[i].name == that.data.addAreaText) {
    //     wx.showToast({
    //       title: '区域已经重覆!',
    //       duration: 2000
    //     })
    //     return false;
    //   }
    // }
    // that.storageMsg(that.data.addAreaText);

    $.ajax({
      url: 'dev/addregion',
      method: "POST",
      data: {
        uid: wx.getStorageSync('wxuser').id,
        name: that.data.addAreaText,
        pid: wx.getStorageSync('did'),
        isall: 0
      },
    }).then((res) => {
      if (res.msg == '区域已存在') {
        $.alert('区域已存在!');
        return false;
      } else if (res.msg == '请求成功') {
        $.alert('请求成功!');
        setTimeout(() => {
          wx.redirectTo({
            url: '../search/search',
          })
        }, 500);
      }
      that.setData({
        areaid: res.data.data
      })
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    $.getName('title');
  },

})