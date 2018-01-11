// pages/equipment/equipment.js

var tools = require('../../utils/util.js');
import { Main } from '../../utils/main.js'
let main = new Main();

const did = wx.getStorageSync('didJSon').did;

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
    id: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this;
    this.setData({
      sdid: options.sdid,
      id: options.id
    });
    console.log(this.data.id);
    wx.getSystemInfo({
      success(res) {
        that.setData({
          winTop: (res.windowHeight - 225) / 2,
        });
      },
    });
  },

  deleteGizwits() {
    let that = this;
    wx.showModal({
      title: '警告!',
      content: '您确定要删除这个设备吗?',
      success(res) {
        if (res.cancel == false && res.confirm == true) {

          wx.request({
            url: 'http://yuyin.ittun.com/public/index/dev/getregion',
            method: 'POST',
            header: {
              'content-type': 'application/json',
              'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
              uid: wx.getStorageSync('wxuser').id,
            },
            success(res) {
              wx.request({
                url: 'http://yuyin.ittun.com/public/index/dev/getdev',
                method: 'POST',
                header: {
                  'content-type': 'application/json',
                  'content-type': 'application/x-www-form-urlencoded'
                },
                data: {
                  rid: res.data.data[0].id,
                  uid: wx.getStorageSync('wxuser').id,
                },
                success(res) {
                  let data = res.data.data;
                  for (let i in data) {
                    if (that.data.id == data[i].id) {
                      wx.request({
                        url: 'http://yuyin.ittun.com/public/index/dev/deldev',
                        header: {
                          'content-type': 'application/json',
                          'content-type': 'application/x-www-form-urlencoded'
                        },
                        method: 'POST',
                        data: {
                          uid: wx.getStorageSync('wxuser').id,
                          rid: data[i].rid
                        },
                        success(res) {
                          console.log(res.data);
                          setTimeout(() => {
                            wx.switchTab({
                              url: '../index/index',
                            })
                          }, 500)
                        }
                      })
                    }
                  }

                }
              });
            }
          })
        } else if (res.cancel == true && res.confirm == false) {
          return false;
        }
      },
    })
  },

  onShow() {
    let that = this;
    this.mySon();
  },

  //  获取子设备
  mySon() {
    let arr = [];
    arr.push(0x00, 0x02, 0xA0, 0x01);
    var json = {
      'data': main.getArrays(arr),
    };
    tools.sendData('c2s_write', did, json);
  },

  gizwits(e) {
    let that = this, json = {}, arr = [], brr = [], count = null;
    let sdid = JSON.parse(that.data.sdid);
    if (this.data.currentTabs === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTabs: e.target.dataset.current
      })
    }
    switch (true) {
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

    main.getSocketResponse((data) => {
      if (data.splice(9, 1).toString() == 1) {
        wx.showToast({
          title: '控制成功!!',
        })
      } else if (data.splice(9, 1).toString() == 1) {
        wx.showToast({
          title: '控制失败!!',
        })
      }
    })

  },

  sliderchange(e) {
    let did = wx.getStorageSync('did');
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