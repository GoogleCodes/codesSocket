// pages/search/search.js

var tools = require('../../utils/util.js');
import { Main } from '../../utils/main.js'
let main = new Main();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isChonse: false,
    spliceArray: [],
    index: 0,
    multiArray: [['卧室', '厨房'], []],
    multiIndex: [0, 0],
    index: 0,
    currentTab: 0,
    winHeight: 0,
    pickerShow: true,
    isTab: 0,
    array: [],
    areaid: -1,
    //  增加区域
    addAreaText: '',
    //  设备总数
    equipmentArray: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this;
    wx.getSystemInfo({
      success(res) {
        that.setData({
          winHeight: res.windowHeight / 2 + 100
        });
      },
    });

    let arr = [];
    arr.push(0x00, 0x02, 0xA0, 0xFF);
    var json = {
      'data': main.getArrays(arr),
    };
    tools.sendData('c2s_write', wx.getStorageSync('didJSon').did, json);

    main.getSocketResponse((data) => {
      let k = data;
      let last = null, brr = [], json = {};
      for (let i in k) {
        last = k.splice(4, 21);
        if (last.indexOf(1) == 0) {
          json = {
            sdid: last.splice(0, 4),
            active: 0,
          };
          brr.push(json);
          brr.concat(that.data.array);
          that.setData({
            array: brr
          });
          wx.setStorageSync('gizwits', that.data.array);
        }
      }
    })

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
        that.setData({
          list: res.data.data,
        });
      }
    })

  },

  addArea(e) {
    const that = this;
    if (e.detail.value == '') {
      wx.showToast({
        title: '请输入内容',
      })
      return;
    }
    that.setData({
      addAreaText: e.detail.value
    });

  },

  bindMultiPickerChange(e) {
    let that = this;
    for(let i in that.data.list) {
      if (e.detail.value == i) {
        that.setData({
          areaid: that.data.list[i].id
        });
      }
    }
    this.setData({
      index: e.detail.value,
    })
    wx.request({
      url: 'http://yuyin.ittun.com/public/index/dev/getdev',
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        uid: wx.getStorageSync('wxuser').id,
        rid: that.data.areaid,
      },
      success(res) {
        if(res.data.code == 1) {
          that.setData({
            spliceArray: res.data.data
          });
          wx.onSocketMessage((res) => {
            try {
              let jsonData = JSON.parse(res.data);
              let k = jsonData.data.attrs.data;
              let last = null, brr = [], json = {};
              for (let i in k) {
                last = k.splice(4, 21);
                if (last.indexOf(1) == 0) {
                  json = {
                    sdid: last.splice(0, 4),
                    active: 0,
                  };
                  brr.push(json);
                  brr.concat(that.data.array);
                  that.setData({
                    array: brr,
                  });
                  wx.setStorageSync('gizwits', that.data.array);
                }
              }
            } catch (e) { }
          })
        } else if(res.data.code == 0) {
          that.setData({
            spliceArray: []
          });
          wx.showToast({
            title: res.data.msg,
          })
        }
      }
    });
  },

  bindMultiPickerColumnChange(e) {
    console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
    var data = {
      objectArrays: this.data.objectArrays,
      index: this.data.index
    };
    data.multiIndex[e.detail.column] = e.detail.value;
    switch (e.detail.column) {
      case 0:
        switch (data.multiIndex[0]) {
          case 0:
            data.multiArray[1] = ['吊灯', '照明灯'];
            break;
          case 1:
            data.multiArray[1] = ['吊灯', '照明灯', '台灯'];
            break;
        }
    }
    this.setData(data);

    /*
    console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
    var data = {
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex
    };
    data.multiIndex[e.detail.column] = e.detail.value;
    switch (e.detail.column) {
      case 0:
        switch (data.multiIndex[0]) {
          case 0:
            data.multiArray[1] = ['吊灯', '照明灯'];
            break;
          case 1:
            data.multiArray[1] = ['吊灯', '照明灯', '台灯'];
            break;
        }
    }
    this.setData(data);*/
  },

  selected(e) {
    var that = this;
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current
      })
    }
  },

  bindChange(e) {
    var that = this;
    that.setData({
      currentTab: e.detail.current
    });
  },

  inputSet() {
    this.setData({
      pickerShow: false,
    });
  },

  outputSet() {
    this.setData({
      pickerShow: true,
    });
  },

  selectEquipment(e) {
    let that = this, arr = {};
    let index = e.currentTarget.dataset.key;
    if(that.data.areaid == -1) {
      wx.showToast({
        title: '请选择区域!',
      })
      return false;
    }
    let json = {
      uid: wx.getStorageSync('wxuser').id,
      did: JSON.stringify(e.currentTarget.dataset.sdid),
      dname: JSON.stringify(e.currentTarget.dataset.sdid),
      rid: that.data.areaid,
    };
    if (this.data.array[index].active == 0) {
      this.data.array[index].active = 1;
      arr = {
        key: e.currentTarget.dataset.key,
        sdid: e.currentTarget.dataset.sdid,
      };
      this.data.spliceArray.push(arr);
      
      wx.request({
        url: 'http://yuyin.ittun.com/public/index/dev/adddev',
        method: "POST",
        header: {
          'content-type': 'application/json',
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: json,
        success(res) {
          wx.showToast({
            title: res.data.msg,
          })
        }
      })

    } else if (this.data.array[index].active == 1) {
      this.data.array[index].active = 0;
      for (let i in this.data.spliceArray) {
        if (this.data.spliceArray[i].key == index) {
          this.data.spliceArray.splice(i, 1);
        }
      }
    }
    this.setData({
      array: this.data.array,
      spliceArray: this.data.spliceArray
    });
    wx.setStorageSync('spliceArray', this.data.spliceArray);
  },

  saveIMessage() {
    let that = this;
    if (this.data.addAreaText == "") {
      wx.showToast({
        title: '请输入内容',
      })
      return;
    }
    wx.request({
      url: 'http://yuyin.ittun.com/public/index/dev/addregion',
      method: "POST",
      header: {
        'content-type': 'application/json',
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        uid: wx.getStorageSync('wxuser').id,
        name: this.data.addAreaText
      },
      success(res) {
        that.setData({
          areaid: res.data.data
        })
      }
    })
    wx.showToast({
      title: '请求成功',
    })
    this.setData({
      pickerShow: true
    });
    this.onLoad();
  },

  getRegion() {
    let that = this;
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
        that.setData({
          list: res.data.data,
        });
        console.log(that.data.list);
      }
    })
  },

  onShow() {
    this.getRegion();
  },

})