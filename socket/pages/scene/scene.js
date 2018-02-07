// pages/scene/scene.js

var tools = require('../../utils/util.js');
import { $ } from '../../utils/main.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    sceneid: 0,
    scenelist: [],
    arrays: [],
    sceneids: [],
    isTrueScene: true,
    sceneArray: [],
    did: "",
    sname: '',
    list: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      did: wx.getStorageSync('did')
    });
    this.getSceneTo();
  },

  //  获取情景
  getSceneTo() {
    wx.showLoading({
      title: '获取中。。。',
    })
    let arr = [], json = {}, that = this;
    arr.push(0x00, 0x01, 0x40);
    tools.sendData('c2s_write', that.data.did, {
      'data': $.getArrays(arr),
    });
    setTimeout(function() {
      wx.hideLoading();
    }, 500);
    $.getSocketResponse(function (did, res) {
      let last = '', json = {};
      try {
        let arr = res, arrID = res;
        if (did !== wx.getStorageSync('did')) {
          return false;
        } else {
          let arrays = [];
          //  获取情景貌似ID
          let sceneID = arr[4];
          if (sceneID == 0) {
            that.setData({
              isTrueScene: true,
            });
          } else if (sceneID !== 0) {
            that.setData({
              isTrueScene: false,
            });
          }
          for (let i in res) {
            last = res.splice(4, 26);
            if (last[0] !== 0) {
              json = {
                a: last
              };
              arrays.push(json);
            }
          }
          let byte = [], option = {};
          let str = '';
          for (let y in arrays) {
            let by = arrays[y].a.splice(1, 6);
            for (let j in by) {
              str += '%' + by[j].toString(16);
            }
          }
          console.log(str);
          // that.setData({
          //   sceneArray: res.splice(3, 18)
          // });
          let pson = '';
          for (let i in byte) {
            let b = byte[i];
            for (let f in b) {
              console.log(b[f]);
              str += '%' + b[f].toString(16);
              pson = {
                id: sceneID,
                name: $.utf8to16(unescape(str)),
              };
            }
            that.data.list.push(pson);
          }
          that.setData({
            list: that.data.list,
            sname: $.utf8to16(unescape(str))
          });
          console.log(that.data.list);
        }
      } catch(e) {}
    })
  },

  switchScene(e) {
    let flag = e.detail.value;
    let arr = [], that = this, json = {};
    // arr.push(0, 18, 0x50, 1, 229, 188, 128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0 + 10, 1, 1);
    arr.push(0, 18, 0x50);
    let count = null;
    if (flag == true) {
      count = arr.concat(that.data.sceneArray);
      tools.sendData('c2s_write', that.data.did, {
        'data': $.getArrays(count),
      });
      wx.onSocketMessage(function (res) {
        try {
          let data = JSON.parse(res.data);
          if (data.cmd == 's2c_noti') {
            let count = data.data.attrs.data
            let arr = count.splice(3, 1);
            for (let i = 0; i < arr.length; i++) {
              if (arr[i] == 1) {
                wx.showToast({
                  title: '控制成功',
                })
              } else {
                wx.showToast({
                  title: '控制失败',
                })
              }
            }
          }
        } catch (e) {
        }
      })
    } else if (flag == false) {
      count = arr.concat(that.data.sceneArray);
      json = {
        'data': $.getArrays(count),
      };
      tools.sendData('c2s_write', that.data.did, json);
      return false;
    }
  },

  switchDeleteScene(e) {
    let arr = [], json = {}, that = this;
    wx.showModal({
      title: '删除情景模式',
      content: '确定要删除吗?',
      success(res) {
        arr.push(0, 18, 0x60);
        json = {
          'data': $.getArrays(arr.concat(that.data.sceneid)),
        };
        tools.sendData('c2s_write', that.data.did, json);
        wx.onSocketMessage(function (res) {
          try {
            let data = JSON.parse(res.data);
            let count = data.data.attrs.data
            let arr = count.splice(3, 1);
            for (let i = 0; i < arr.length; i++) {
              if (arr[i] == 1) {
                wx.showToast({
                  title: '删除成功',
                })
              } else {
                wx.showToast({
                  title: '删除失败',
                })
              }
            }
          } catch (e) {
          }
        })
      }
    })
  },

})