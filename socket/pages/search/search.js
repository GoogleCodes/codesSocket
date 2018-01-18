// pages/search/search.js

var tools = require('../../utils/util.js');
import { Main } from '../../utils/main.js'
let $ = new Main();

const did = wx.getStorageSync('didJSon').did;

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
    equipmentArray: [],
    headers: {
      'content-type': 'application/json',
      'content-type': 'application/x-www-form-urlencoded'
    },
    did: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

    this.setData({
      did: wx.getStorageSync('did')
    });

    let that = this;
    wx.getSystemInfo({
      success(res) {
        that.setData({
          winHeight: res.windowHeight / 2
        });
      },
    });


    let arr = [];
    arr.push(0x00, 0x02, 0xA0, 0xFF);
    var json = {
      'data': $.getArrays(arr),
    };
    tools.sendData('c2s_write', that.data.did, json);

    $.getSocketResponse((data) => {
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

    $.ajax({
      url: 'dev/getregion',
      method: 'POST',
      data: {
        uid: wx.getStorageSync('wxuser').id,
      },
    }).then((res) => {
      that.setData({
        list: res.data,
      });
      that.setData({
        areaid: that.data.list[0].id
      });
      $.ajax({
        url: 'dev/getdev',
        method: 'POST',
        header: that.data.headers,
        data: {
          uid: wx.getStorageSync('wxuser').id,
          rid: that.data.areaid,
        }
      }).then((res) => {
        if (res.code == 1) {
          that.setData({
            spliceArray: res.data
          });
        }
      })
    })

  },

  addArea(e) {
    const that = this;
    if (e.detail.value == '') {
      $.alert('请输入内容!');
      return;
    }
    that.setData({
      addAreaText: e.detail.value
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

    $.ajax({
      url: 'dev/getdev',
      method: 'POST',
      data: {
        uid: wx.getStorageSync('wxuser').id,
        rid: that.data.areaid,
      }
    }).then((res) => {
      if (res.code == 1) {
        that.setData({
          spliceArray: res.data
        });
        console.log(that.data.spliceArray);
        $.getSocketResponse((k) => {
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
        })
      } else if (res.code == 0) {
        that.setData({
          spliceArray: []
        });
        $.alert('暂时没有设备！');
      }
    })

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
        currentTab: e.target.dataset.current,
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

  deleteGroup() {
    let that = this;
    if (that.data.areaid == -1) {
      $.alert('请选择区域!');
      return false;
    }
    wx.showModal({
      title: '警告!',
      content: '是否要删除当前选择的区域！',
      success(res) {
        if (res.cancel == false && res.confirm == true) {
          $.ajax({
            url: 'dev/delregion',
            method: 'POST',
            data: {
              id: that.data.areaid,
              uid: wx.getStorageSync('wxuser').id,
            },
          }).then((res) => {
            $.alert('已经成功删除!');
            setTimeout(() => {
              wx.switchTab({
                url: '../index/index',
              })
            }, 500);
          })
        } else if (res.cancel == true && res.confirm == false) {
          return false;
        }
      },
    })
  },

  deleteDevice(e) {
    let json = {
      uid: wx.getStorageSync('wxuser').id,
      did: e.currentTarget.dataset.did
    };
    wx.showModal({
      title: '警告',
      content: '确定要删除当前选中的设备吗?',
      success(res) {
        if (res.cancel == false && res.confirm == true) {
          $.ajax({
            url: 'dev/deldev',
            method: "POST",
            data: json,
          }).then((res) => {
            wx.showToast({
              title: res.msg,
              duration: 2000
            })
            wx.switchTab({
              url: '../index/index',
            })
          })
        } else if (res.cancel == true && res.confirm == false) {
          return false;
        }
      }
    })
    
  },

  selectEquipment(e) {
    let that = this, arr = {};
    let index = e.currentTarget.dataset.key;
    if (that.data.areaid == -1) {
      $.alert('请选择区域!');
      return false;
    }
    let json = {
      uid: wx.getStorageSync('wxuser').id,
      did: JSON.stringify(e.currentTarget.dataset.sdid),
      dname: JSON.stringify(e.currentTarget.dataset.sdid),
      rid: that.data.areaid,
      pid: wx.getStorageSync('did')
    };
    if (this.data.array[index].active == 0) {
      this.data.array[index].active = 1;
      arr = {
        key: e.currentTarget.dataset.key,
        sdid: e.currentTarget.dataset.sdid,
      };
      this.data.spliceArray.push(arr);
      
      $.ajax({
        url: 'dev/adddev',
        method: "POST",
        data: json,
      }).then((res) => {
        wx.showToast({
          title: res.data.msg,
        })
        that.setData({
          currentTab: 0
        });
        $.goPages('../index/index');
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
      $.alert('请输入内容!');
      return;
    }
    $.ajax({
      url: 'dev/addregion',
      method: "POST",
      data: {
        uid: wx.getStorageSync('wxuser').id,
        name: this.data.addAreaText,
        pid: wx.getStorageSync('did'),
      },
    }).then((res) => {
      that.setData({
        areaid: res.data.data
      })
      $.goPages('../index/index');
    })
    $.alert('请求成功!');
    this.setData({
      pickerShow: true
    });
    this.onLoad();
  },

  getRegion() {
    let that = this;

    $.ajax({
      url: 'dev/getregion',
      method: 'POST',
      data: {
        uid: wx.getStorageSync('wxuser').id,
      },
    }).then((res) => {
      that.setData({
        list: res.data,
      });
    })
    
  },

  onShow() {
    this.getRegion();
  },

})