// pages/equipment/equipment.js

var tools = require('../../utils/util.js');
import { Main } from '../../utils/main.js'
let main = new Main();
let did = wx.getStorageSync('did');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    //  windowTop
    winTop: 0,
    switchButton: true,
    currentTabs: -1,
    sdid: [],
    weibiao: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this;
    this.setData({
      sdid: options.sdid
    });
    
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
    let arr = [], storage = wx.getStorageSync("didJSon");
    arr.push(0x00, 0x02, 0xA0, 0x01);
    var json = {
      'data': main.getArrays(arr),
    };
    tools.sendData('c2s_write', did, json);
  },

  gizwits(e) {
    let that = this, json = {}, arr = [], brr = [], count = null;
    let sdid = JSON.parse(that.data.sdid);
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
        brr = [0xA2, 0x01, 0x01];
        arr.push(0x00, 0x08, 0xA2);
        count = arr.concat(sdid.concat(brr));
        json = {
          'data': main.getArrays(count),
        };
        tools.sendData('c2s_write', did, json);
        break;
      case e.target.dataset.current == 1:
        brr = [0xA2, 0x01, 0x01];
        arr.push(0x00, 0x08, 0xA2);
        count = arr.concat(sdid.concat(brr));
        json = {
          'data': main.getArrays(count),
        };
        tools.sendData('c2s_write', did, json);
        break;
      case e.target.dataset.current == 2:
        //  LED
        brr = [0xA5, 0x06, 0x01];
        arr.push(0x00, 0x08, 0xA2);
        count = arr.concat(sdid.concat(brr));
        json = {
          'data': main.getArrays(count),
        };
        tools.sendData('c2s_write', did, json);
        break;
      default:
        break;
    }
    wx.onSocketMessage((res) => {
      try {
        let data = JSON.parse(res.data).data.attrs.data;
        if (data.splice(9, 1).toString() == 1) {
          console.log(1);
          wx.showToast({
            title: '控制成功!!',
          })
        } else if (data.splice(9, 1).toString() == 1) {
          console.log(2);
          wx.showToast({
            title: '控制失败!!',
          })
        }
      } catch(e) {
        
      }
    })
  },

  carryout() {
    
  },

  sliderchange(e) {
    let num = e.detail.value, arr = [], json = {};
    let sdid = JSON.parse(this.data.sdid);
    let brr = [0xA5, 0x06, num];
    //  控制码
    arr.push(0x00, 0x08, 0xA2)
    let count = arr.concat(sdid.concat(brr));
    json = {
      'data': main.getArrays(count),
    };
    //  获取did
    const storage = wx.getStorageSync("didJSon");
    tools.sendData('c2s_write', did, json);
  },

  updateDeviceName() {
    if (this.data.weibiao == true) {
      this.setData({
        weibiao: false,
      });
    } else if (this.data.weibiao == false) {
      this.setData({
        weibiao: true,
      });
    }
  }

})