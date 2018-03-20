// pages/search/search.js

var tools = require('../../utils/util.js');
import { $ } from '../../utils/main.js'

let that;

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
    dname: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    that = this;
    wx.getSystemInfo({
      success(res) {
        that.setData({
          winHeight: res.windowHeight
        });
      },
    });

    let arr = [0x00, 0x02, 0xA0, 0xFF];
    tools.sendData('c2s_write', wx.getStorageSync('did'), {
      'data': $.getArrays(arr),
    });

    $.getBackDevices();
    that.setData({
      array: wx.getStorageSync('gizwits')
    });
  },

  onShow() {
    this.getRegion();
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
      let arr = [];
      for (let i in res.data) {
        if (res.data[i].pid == wx.getStorageSync('did')) {
          arr.push(res.data[i]);
          that.setData({
            list: arr,
          });
          that.abc();
        }
      }
    })
  },

  abc() {
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
        let flag = true, arr = [];
        for (let i in res.data) {
          let did = JSON.parse(res.data[i].did);
          for (let y in that.data.array) {
            if (did !== that.data.array[y].sdid) {
              console.log(did, that.data.array[y].sdid);
              console.log(12312312321);
              flag = false;
        console.log(flag);
            }
          }
        }
        that.setData({
          spliceArray: res.data
        });
      } else if (res.code == 0) {
        that.setData({
          array: wx.getStorageSync('gizwits'),
        });
      }
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
          areaid: that.data.list[i].id,
          currentTab: 0,
          index: e.detail.value,
        });
      }
    }
    $.ajax({
      url: 'dev/getdev',
      method: 'POST',
      data: {
        uid: wx.getStorageSync('wxuser').id,
        rid: that.data.areaid,
      }
    }).then((res) => {
      let map = that.data.array;
      let arrays = [], pson = [], flag = false;
      for (let y in map) {
        pson = {
          active: map[y].active,
          sdid: map[y].sdid,
          sname: map[y].sname,
        };
        arrays.push(pson);
      }
      if (res.code == 1) {
        that.setData({
          spliceArray: res.data
        });
        let gizwits = wx.getStorageSync('gizwits');
        let arr = [];
      } else if (res.code == 0) {
        that.setData({
          array: wx.getStorageSync('gizwits'),
          spliceArray: []
        });
        $.alert('暂时没有设备！');
      }
    })

  },

  bindMultiPickerColumnChange(e) {
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
                url: '../../../pages/index/index',
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
      id: e.currentTarget.dataset.id
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
          }).then(function (res) {
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
    let pub = e.currentTarget.dataset;
    let index = pub.key;
    if (that.data.areaid == -1) {
      $.alert('请选择区域!');
      return false;
    }
    let json = {
      uid: wx.getStorageSync('wxuser').id,
      did: JSON.stringify(pub.sdid),
      dname: pub.sname,
      rid: that.data.areaid,
      pid: wx.getStorageSync('did'),
      types: pub.sdid[1],
      status: 'false',
      isall: 0
    };
    if (this.data.array[index].active == 0) {
      this.data.array[index].active = 1;
      arr = {
        key: pub.key,
        sdid: pub.sdid,
        dname: pub.sname,
      };
      this.data.spliceArray.push(arr);
      $.ajax({
        url: 'dev/adddev',
        method: "POST",
        data: json,
      }).then((res) => {
        that.abc();
        that.setData({
          currentTab: 0
        });
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
      spliceArray: that.data.spliceArray
    });
    wx.setStorageSync('searchArrays', this.data.spliceArray);
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
        name: that.data.addAreaText,
        pid: wx.getStorageSync('did'),
      },
    }).then(function (res) {
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

  goPages(e) {
    let pageNames = e.currentTarget.dataset.pagename;
    wx.redirectTo({
      url: '../' + pageNames,
    })
  },

})