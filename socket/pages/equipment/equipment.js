// pages/equipment/equipment.js

var tools = require('../../utils/util.js');
import { $ } from '../../utils/main.js'
// let $ = new Main();

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
    blurInputText: '',
    did: '',
    rid: '',
    list: {},
    popers: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this;
    this.setData({
      sdid: options.sdid,
      id: options.id,
      did: wx.getStorageSync('did'),
      rid: options.rid
    });
    wx.getSystemInfo({
      success(res) {
        that.setData({
          winTop: (res.windowHeight - 225) / 2,
        });
      },
    });

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
    }).then(function(res) {
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
          }).then(function(res) {
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
                      }).then(function(res) {
                        $.alert(res.msg);
                        setTimeout(function() {
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
    arr.push(0x00, 0x02, 0xA0, 0x01);
    var json = {
      'data': $.getArrays(arr),
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
          'data': $.getArrays(count),
        };
        tools.sendData('c2s_write', did, json);
        break;
      case e.target.dataset.current == 1:
        brr = [0xA2, 0x01, 0x01];
        arr.push(0x00, 0x08, 0xA2);
        count = arr.concat(sdid.concat(brr));
        json = {
          'data': $.getArrays(count),
        };
        tools.sendData('c2s_write', did, json);
        break;
      case e.target.dataset.current == 2:
        //  LED
        brr = [0xA5, 0x06, 0x01];
        arr.push(0x00, 0x08, 0xA2);
        count = arr.concat(sdid.concat(brr));
        json = {
          'data': $.getArrays(count),
        };
        tools.sendData('c2s_write', did, json);
        break;
      default:
        break;
    }

    $.getSocketResponse(function(data) {
      if (data.splice(9, 1).toString() == 1) {
        $.alert('控制成功!');
      } else if (data.splice(9, 1).toString() == 1) {
        $.alert('控制失败!');
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
      'data': $.getArrays(count),
    };
    //  获取did
    const storage = wx.getStorageSync("didJSon");
    tools.sendData('c2s_write', did, json);
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

  getAnalysis(name) {
    let that = this;
    let str = encodeURIComponent(name);
    // let str = encodeURIComponent(that.data.blurInputText);
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
    let arraySdid = sdid.concat(arrLength.concat(array));
    return brr.concat(arraySdid);
  },

  goSaveImessage() {
    let that = this;
    let json = {
      'data': $.getArrays(that.getAnalysis(that.data.blurInputText)),
    }
    tools.sendData('c2s_write', "WTMuHQLp5jjpS5r3TKGTno", json);

    $.getSocketResponse(function (data) {
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

  clearPopers() {
    this.setData({
      popers: true,
    });
  },

  blurInputDate(e) {
    let that = this;
    that.setData({
      blurInputText: e.detail.value
    });
    console.log(that.data.blurInputText);
    return;
    let arr = [], json = {};
    let nameLength = [1];
    let nameContent = [60];
    let did = JSON.parse(that.data.sdid);
    let count = nameLength.concat(nameContent);

    arr.push(0x00, 0x02, 0x14);

    let a = did.concat(count);
    let b = arr.concat(a);

    json = {
      'data': $.getArrays(b),
    };
    tools.sendData('c2s_write', that.data.did, json);

    let deviceName = e.detail.value;

    if (that.data.weibiao == true) {
      that.setData({
        weibiao: false,
      });
    } else if (that.data.weibiao == false) {
      that.setData({
        weibiao: true,
      });
    }

    $.getSocketResponse(function(res) {
      let data = res.splice(3, 1);
      if (data == 1) {
        $.alert('修改成功!');
        return false;
      } else if (data == 0) {
        $.alert('修改失败!');
        return false;
      }
    })

  }

})