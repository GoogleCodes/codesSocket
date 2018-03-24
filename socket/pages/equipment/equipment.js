// pages/equipment/equipment.js

var tools = require('../../utils/util.js');
import { $ } from '../../utils/main.js'
// const did = wx.getStorageSync('didJSon').did;

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
    id: 0,
    blurInputText: '',
    did: '',
    rid: '',
    list: {},
    popers: true,
    weibiao: true,
    types: 0,
    layerShow: true,
    brightness: 0,
    colorTemperature: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this;
    that.setData({
      sdid: JSON.parse(options.sdid),
      id: options.id,
      did: wx.getStorageSync('did'),
      rid: options.rid
    });
    if (that.data.sdid[1] == 0) {
      that.setData({
        types: 0,
      });
    } else if (that.data.sdid[1] == 1) {
      that.setData({
        types: 1,
      });
    }
    wx.getSystemInfo({
      success(res) {
        that.setData({
          winTop: (res.windowHeight - 225) / 2,
        });
      },
    });
    this.getDev();
  },

  getDev() {
    let that = this;
    $.getName('title');
    $.ajax({
      url: 'dev/getdev',
      method: 'POST',
      data: {
        rid: that.data.rid,
        uid: wx.getStorageSync('wxuser').id,
      },
    }).then((res) => {
      for (let i in res.data) {
        if (res.data[i].id == that.data.id) {
          that.setData({
            list: res.data[i]
          });
          return true;
        }
      }
    });
  },

  deleteGizwits() {
    let that = this;
    let devices = wx.getStorageSync('devices');
    let did = wx.getStorageSync('did');
    // for (let i in devices) {
    //   if (did == devices[i].did) {
    //     if (devices[i].role !== 'owner') {
    //       wx.showModal({
    //         title: '警告',
    //         content: '您好，你不是管理者!',
    //         showCancel: false,
    //       })
    //       return false;
    //     }
    //   }
    // }
    wx.showModal({
      title: '警告!',
      content: '您确定要删除这个设备吗?',
      success(res) {
        if (res.cancel == false && res.confirm == true) {
          $.ajax({
            url: 'dev/getregion',
            method: 'POST',
            data: {
              uid: wx.getStorageSync('wxuser').id,
            },
          }).then((res) => {
            for (let y in res.data) {
              if (res.data[y].id == that.data.rid) {
                if (res.data[y].name == '全部') {
                  wx.showModal({
                    title: '警告',
                    content: '抱歉,无法删除设备!',
                    showCancel: false,
                  })
                  return false;
                }
                $.ajax({
                  url: 'dev/getdev',
                  method: 'POST',
                  data: {
                    rid: res.data[y].id,
                    uid: wx.getStorageSync('wxuser').id,
                  },
                }).then((res) => {
                  let data = res.data;
                  for (let i in data) {
                    if (that.data.id == data[i].id) {
                      $.ajax({
                        url: 'dev/deldev',
                        method: 'POST',
                        data: {
                          uid: wx.getStorageSync('wxuser').id,
                          id: data[i].id
                        },
                      }).then(function (res) {
                        $.alert(res.msg);
                        setTimeout(function () {
                          wx.switchTab({
                            url: '../index/index',
                          })
                        }, 500)
                      });
                    }
                  }
                });
              }
            }
          });
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
    let that = this;
    arr.push(0x00, 0x02, 0xA0, 0x01);
    var json = {
      'data': $.getArrays(arr),
    };
    tools.sendData('c2s_write', that.data.did, json);
  },

  gizwits(e) {
    let that = this, json = {}, arr = [], brr = [];
    let sdid = that.data.sdid;
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
        that.saveData(arr, brr);
        break;
      case e.target.dataset.current == 1:
        brr = [0xA2, 0x01, 0x01];
        arr.push(0x00, 0x08, 0xA2);
        that.saveData(arr, brr);
        break;
      case e.target.dataset.current == 2:
        //  LED
        brr = [0xA5, 0x06, 0x01];
        arr.push(0x00, 0x08, 0xA2);
        that.saveData(arr, brr);
        break;
      default:
        break;
    }
    $.getSocketResponse(function (did, data) {
      if (data.splice(9, 1).toString() == 1) {
        // $.alert('控制成功!');
      } else if (data.splice(9, 1).toString() == 1) {
        // $.alert('控制失败!');
      }
    });
  },

  saveData(arr, brr) {
    let count = arr.concat(this.data.sdid.concat(brr));
    tools.sendData('c2s_write', wx.getStorageSync('did'), {
      'data': $.getArrays(count),
    });
  },

  winGizwits(e) {
    let that = this, json = {}, arr = [], brr = [], count = '';
    let sdid = that.data.sdid;
    if (this.data.currentTabs === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTabs: e.target.dataset.current
      })
    }
    //  0X01：开始移动（上）；0x11：保存配置(上) 0X02：开始移动（下）；0x12：保存配置(下)
    switch (true) {
      case e.target.dataset.current == 0: //  下拉
        brr = [0xA3, 0x01, 0x02, 0x12];
        arr.push(0x00, 0x08, 0xA2);
        count = arr.concat(this.data.sdid.concat(brr));
        that.saveData(arr, brr);
        break;
      case e.target.dataset.current == 0: //  下拉
        brr = [0xA3, 0x01, 0x02, 0x12];
        arr.push(0x00, 0x08, 0xA2);
        count = arr.concat(this.data.sdid.concat(brr));
        that.saveData(arr, brr);
        break;
      default:
        break;
    }
    $.getSocketResponse(function (did, data) {
      if (data.splice(9, 1).toString() == 1) {
        $.alert('控制成功!');
      } else if (data.splice(9, 1).toString() == 1) {
        // $.alert('控制失败!');
      }
    });
  },

  sliderchange(e) {
    let did = wx.getStorageSync('did');
    //  获取数值
    let num = e.detail.value, arr = [], brr = [], json = {}, that = this;
    //  获取sdid
    let sdid = that.data.sdid;
    this.setData({
      brightness: num
    });
    //  控制码
    brr = [0xA5, 0x06, 0x01, that.data.brightness, that.data.colorTemperature];
    arr.push(0x00, 0x08, 0xA2)
    //  数组拷贝
    let count = arr.concat(sdid.concat(brr));
    tools.sendData('c2s_write', wx.getStorageSync('did'), {
      'data': $.getArrays(count),
    });
    $.getSocketResponse(function (did, data) {
      if (data[8] == 1) {
        wx.showToast({
          title: '控制成功!',
        })
      } else if (data[8] == 0) {
        wx.showToast({
          // title: '控制失败!',
        })
      }
    });
  },

  ledchange(e) {
    let that = this, arr = [], brr = [];
    //  获取数值
    let num = e.detail.value;
    that.setData({
      colorTemperature: e.detail.value
    });
    //  获取sdid
    let sdid = that.data.sdid;
    brr = [0xA5, 0x06, 0x01, that.data.brightness, that.data.colorTemperature];
    arr.push(0x00, 0x08, 0xA2)
    //  数组拷贝
    let count = arr.concat(sdid.concat(brr));
    tools.sendData('c2s_write', wx.getStorageSync('did'), {
      'data': $.getArrays(count),
    });
    $.getSocketResponse(function (did, data) {
      if (data[8] == 1) {
        wx.showToast({
          title: '控制成功!',
        })
      } else if (data[8] == 0) {
        wx.showToast({
          // title: '控制失败!',
        })
      }
    });
  },

  carryout() {
    let that = this;
    //  控制码
    let brr = [0xA5, 0x06, 0x01, that.data.brightness, that.data.colorTemperature];
    let arr = [0x00, 0x08, 0xA2];
    //  数组拷贝
    let sdid = that.data.sdid;
    let count = arr.concat(sdid.concat(brr));
    tools.sendData('c2s_write', wx.getStorageSync('did'), {
      'data': $.getArrays(count),
    });
    $.getSocketResponse(function (did, data) {
      if (data[8] == 1) {
        wx.showToast({
          title: '控制成功!',
          duration: 2000
        }) 
        setTimeout(() => {
          wx.switchTab({
            url: '../index/index',
          })
        }, 800);
      } else if (data[8] == 0) {
        wx.showToast({
          // title: '控制失败!',
        })
      }
    });
  },

  update() {
    let that = this;
    if (that.data.popers == true && that.data.weibiao == true) {
      that.setData({
        weibiao: false,
        popers: false,
      });
    } else if (that.data.popers == false && that.data.weibiao == false) {
      that.setData({
        weibiao: true,
        popers: true,
      });
    }
    console.log(that.data.weibiao, that.data.popers);
  },

  clearPopers() {
    this.setData({
      popers: true,
      weibiao: true,
    });
  },


  getAnalysis(name) {
    let that = this;
    let str = encodeURIComponent(name);
    let result = str.split("%");
    let arr = [];
    for (let i = 0; i < result.length; i++) {
      let a = "0x" + result[i];
      arr.push(parseInt(a))
    }
    let array = arr.slice(1);
    let arrLength = [array.length];
    let sdid = that.data.sdid
    let brr = [0x00, 0x02, 0x14];
    return brr.concat(sdid.concat(arrLength.concat(array)));
  },

  goSaveImessage() {
    let that = this;
    tools.sendData('c2s_write', wx.getStorageSync('did'), {
      'data': $.getArrays(that.getAnalysis(that.data.blurInputText)),
    });
    $.getSocketResponse(function (did, data) {
      if (data[3] == 1) {
        $.ajax({
          url: 'dev/editdev',
          method: 'POST',
          data: {
            uid: wx.getStorageSync('wxuser').id,
            id: that.data.id,
            dname: that.data.blurInputText
          }
        }).then(function (res) {
          if (res.code == 1) {
            $.alert(res.msg);
            that.setData({
              popers: true,
              weibiao: true,
            });
            that.getDev();
          }
        });
        return true;
      }
    })
  },

  blurInputDate(e) {
    let that = this;
    that.setData({
      blurInputText: e.detail.value
    });
  }

})

/**
*　　　　　　　　┏┓　　　┏┓+ +
*　　　　　　　┏┛┻━━━┛┻┓ + +
*　　　　　　　┃　　　　　　　┃ 　
*　　　　　　　┃　　　━　　　┃ ++ + + +
*　　　　　　 ████━████ ┃+
*　　　　　　　┃　　　　　　　┃ +
*　　　　　　　┃　　　┻　　　┃
*　　　　　　　┃　　　　　　　┃ + +
*　　　　　　　┗━┓　　　┏━┛
*　　　　　　　　　┃　　　┃　　　　　　　　　　　
*　　　　　　　　　┃　　　┃ + + + +
*　　　　　　　　　┃　　　┃　　　　　　　　
*　　　　　　　　　┃　　　┃ + 　　　　神兽保佑,代码无bug　　
*　　　　　　　　　┃　　　┃
*　　　　　　　　　┃　　　┃　　+　　　　　　　　　
*　　　　　　　　　┃　 　　┗━━━┓ + +
*　　　　　　　　　┃ 　　　　　　　┣┓
*　　　　　　　　　┃ 　　　　　　　┏┛
*　　　　　　　　　┗┓┓┏━┳┓┏┛ + + + +
*　　　　　　　　　　┃┫┫　┃┫┫
*　　　　　　　　　　┗┻┛　┗┻┛+ + + +
*/