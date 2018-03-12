// pages/windows/windows.js

var tools = require('../../utils/util.js');
import { $ } from '../../utils/main.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    windowTop: 0,
    winTop: 0,
    layerShow: true,
    currentTabs: -1,
    switchButton: true,
    popers: true,
    weibiao: true,
    winTop: 0,
    blurInputText: '',
    rid: 0,
    did: 0,
    sdid: 0,
    id: 0,
    list: {},
    currentTirection: -1,
    tirTypes: -1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this;
    this.setData({
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
          windowTop: (res.windowHeight - 225) / 2,
        });
      },
    });
    console.log(that.data.id, wx.getStorageSync('wxuser').id);
    this.getDev(that.data.rid, wx.getStorageSync('wxuser').id);
  },

  getDev(rid, uid) {
    let that = this;
    $.ajax({
      url: 'dev/getdev',
      method: 'POST',
      data: {
        rid: rid,
        uid: uid,
      },
    }).then(function (res) {
      for (let i in res.data) {
        console.log(res.data[i].id == that.data.id);
        if (res.data[i].id == that.data.id) {
          that.setData({
            list: res.data[i]
          });
          return true;
        }
      }
    });
  },

  setting() {
    this.setData({
      layerShow: false,
    });
  },

  gizwits(e) {
    let that = this, json = {}, arr = [], brr = [];
    let sdid = that.data.sdid;
    let current = e.currentTarget.dataset.current;
    if (this.data.currentTabs === current) {
      return false;
    } else {
      that.setData({
        currentTabs: current
      })
    }

    switch (true) {
      case e.target.dataset.current == 0:
        brr = [0xA2, 0x01, 0x01];
        arr.push(0x00, 0x08, 0xA2);
        that.saveData(arr, brr);
        console.log(1);
        break;
      case e.target.dataset.current == 1:
        brr = [0xA2, 0x01, 0x01];
        arr.push(0x00, 0x08, 0xA2);
        // that.saveData(arr, brr);
        console.log(2);
        break;
      case e.target.dataset.current == 2:
        brr = [0xA5, 0x06, 0x01];
        arr.push(0x00, 0x08, 0xA2);
        that.saveData(arr, brr);
        console.log(3);
        break;
      default:
        break;
    }
    $.getSocketResponse(function (did, data) {
      if (data.splice(9, 1).toString() == 1) {
        $.alert('控制成功!');
      } else if (data.splice(9, 1).toString() == 1) {
        $.alert('控制失败!');
      }
    });
  },

  saveData(arr, brr) {
    let count = arr.concat(this.data.sdid.concat(brr));
    console.log(count);
    tools.sendData('c2s_write', wx.getStorageSync('did'), {
      'data': $.getArrays(count),
    });
  },

  Triection(e) {
    let that = this, arr = [], brr = [];
    let current = e.currentTarget.dataset.current;
    if (this.data.currentTirection === current) {
      return false;
    } else {
      that.setData({
        currentTirection: current
      })
    }

    if (that.data.currentTirection == 0) {
      brr = [0xA3, 0x01, 0x01];
      arr.push(0x00, 0x08, 0xA2);
      that.saveData(arr, brr);
      that.setData({
        tirTypes: 0,
      });
    } else if (that.data.currentTirection == 1) {
      brr = [0xA3, 0x01, 0x02];
      arr.push(0x00, 0x08, 0xA2);
      that.saveData(arr, brr);
      that.setData({
        tirTypes: 1,
      });
    }
  },

  updateDeviceName() {
    let that = this;
    if (that.data.weibiao == true) {
      that.setData({
        weibiao: false,
        popers: false,
      });
    } else if (that.data.weibiao == false) {
      that.setData({
        weibiao: true,
        popers: true,
      });
    }
  },

  clearPopers() {
    this.setData({
      popers: true,
      weibiao: true,
    });
  },

  goGizwits() {
    let that = this;
    that.setData({ switchButton: true });
    //  获取did
    const DID = wx.getStorageSync("didJSon");
    var json = {
      'onoffAll': that.data.switchButton,
    };
    //  发送数据
    tools.sendData('c2s_write', DID.did, json);
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
    let sdid = [1, 1, 0, 2];
    let brr = [0x00, 0x02, 0x14];
    return brr.concat(sdid.concat(arrLength.concat(array)));
  },

  goSaveImessage() {
    let that = this;
    console.log(that.data.blurInputText);
    let json = {
      'data': $.getArrays(that.getAnalysis(that.data.blurInputText)),
    }
    tools.sendData('c2s_write', that.data.did, json);

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
          $.alert(res.msg);
          that.setData({
            popers: true,
          });
          setTimeout(function () {
            wx.switchTab({
              url: '../index/index',
            })
          }, 1000)
        });
      } else {
        wx.showModal({
          title: '警告！',
          content: '修改名称失败!',
        })
      }
    })
  },

  blurInputDate(e) {
    let that = this;
    that.setData({
      blurInputText: e.detail.value
    });
  },

  carryout() {
    this.setData({
      layerShow: false,
    });
  },

  sliderchange(e) {
    let num = e.detail.value, arr = [], json = {}, that = this;
    let sdid = this.data.sdid;
    let brr = [0xA2, 0x01, num];
    //  控制码
    arr.push(0x00, 0x08, 0xA2)
    let count = arr.concat(sdid.concat(brr));
    console.log(count);
    tools.sendData('c2s_write', wx.getStorageSync('did'), {
      'data': $.getArrays(count),
    });
    let did = wx.getStorageSync('did');
    $.getSocketResponse(function(did, data) {
      if (data[8] == 1) {
        wx.showToast({
          title: '控制成功!',
        })
      } else if (data[8] == 0)  {
        wx.showToast({
          title: '控制失败!',
        })
      }
    });
  },

  updateDeviceName() {
    let that = this;
    if (that.data.weibiao == true) {
      that.setData({
        weibiao: false,
        popers: false,
      });
    } else if (that.data.weibiao == false) {
      that.setData({
        weibiao: true,
        popers: true,
      });
    }
  },

  deleteGizwits() {
    let that = this;
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
          }).then(function (res) {
            for (let y in res.data) {
              if (res.data[y].id == that.data.rid) {
                console.log(res.data[y].id);

                $.ajax({
                  url: 'dev/getdev',
                  method: 'POST',
                  data: {
                    rid: res.data[y].id,
                    uid: wx.getStorageSync('wxuser').id,
                  },
                }).then(function (res) {
                  let data = res.data;
                  for (let i in data) {
                    console.log(that.data.id, data[i].id);
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

  saveToolsData() {
    let arr = [], brr = [], that = this;
    if (this.data.tirTypes == 0) {
      brr = [0xA3, 0x01, 0x011];
      arr.push(0x00, 0x08, 0xA2);
      that.saveData(arr, brr);
    } else if (this.data.tirTypes == 1) {
      brr = [0xA3, 0x01, 0x012];
      arr.push(0x00, 0x08, 0xA2);
      that.saveData(arr, brr);
    }
    wx.showModal({
      title: '提示!',
      content: '保存成功!',
      showCancel: false,
    })
    this.setData({
      layerShow: true,
    });
  }

})