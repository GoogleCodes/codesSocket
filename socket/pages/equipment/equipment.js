// pages/equipment/equipment.js

var tools = require('../../utils/util.js');
import { Main } from '../../utils/main.js'
let main = new Main();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    //  windowTop
    winTop: 0,
    switchButton: true,
    currentTabs: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this;
    wx.getSystemInfo({
      success(res) {
        that.setData({
          winTop: (res.windowHeight - 225) / 2,
        });
      },
    });
    this.mySon();
  },

  //  获取子设备
  mySon() {
    let arr = [], storage = wx.getStorageSync("didJSon");;
    arr.push(0x00, 0x02, 0xA0, 0x01);
    var json = {
      'data': main.getArrays(arr),
    };
    tools.sendData('c2s_write', storage.did, json);
  },

  gizwits(e) {
    let that = this, json = {}, arr = [];
    //  获取did
    const storage = wx.getStorageSync("didJSon");
    if (this.data.currentTabs === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTabs: e.target.dataset.current
      })
    }
    switch(true) {
      case e.target.dataset.current == 0:
        arr.push(0x00, 0x01, 0x40);
        json = {
          'data': main.getArrays(arr),
        };
        tools.sendData('c2s_write', storage.did, json);
        break;
      case e.target.dataset.current == 1:
        arr.push(0x00, 0x01, 0x40);
        json = {
          'data': main.getArrays(arr),
        };
        tools.sendData('c2s_write', storage.did, json);
        break;
      case e.target.dataset.current == 2:
        arr.push(0x00, 0x01, 0x40);
        json = {
          'data': main.getArrays(arr),
        };
        tools.sendData('c2s_write', storage.did, json);
        break; 
    }
  },

  carryout() {
    
  },

  sliderchange(e) {
    let num = e.detail.value, arr = [], json = {};
    num.toString(16);
    let f = "0x" + num.toString(16);
    console.log("0x" + num.toString(16));
    //  获取did
    const storage = wx.getStorageSync("didJSon");
    // arr.push(0x00, 0x08, 0xA2, 0x01, 0x01, 0x00, 0x01, 0xA2, 0x01, f)
    //  LED
    arr.push(0x00, 0x08, 0xA2, 0x01, 0x01, 0x00, 0x01, 0xA5, 0x06, f)
    json = {
      'data': main.getArrays(arr),
    };
    tools.sendData('c2s_write', storage.did, json);
  },

})