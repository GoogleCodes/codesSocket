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
    sceneTypes: -1,
    timingList: [], //  定時
    delayList: [],  //  延迟
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      did: wx.getStorageSync('did')
    });
    $.getName('title');
    // this.getSceneTo();
  },

  onShow() {
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
    setTimeout(function () {
      wx.hideLoading();
    }, 500);
    $.getSocketResponse((did, res) => {
      try {
        let arr = res, arrID = res;
        if (did !== wx.getStorageSync('did')) {
          wx.hideToast();
          return false;
        }
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
        let last = '', arrays = [], options = {};
        for (let i in res) {
          last = res.splice(4, 26);
          if (last.indexOf(0) > 0) {
            let name = last;
            let doname = name.splice(1, 13);
            let byteName = name.splice(1, 3);
            let id = [];
            let str = "";
            let tmp = new Array();
            for (let y in doname) {
              if (doname[y] !== 0) {
                tmp.push(doname[y]);
              }
            }
            for (let j in tmp) {
              str += "%" + tmp[j].toString(16);
            }
            if (last[1] == 0) {
              that.setData({
                sceneTypes: 0
              });
            } else if (last[1] == 2) {
              that.setData({
                sceneTypes: 2
              });
            }
            let n = id.concat(name.splice(0, 1)).concat(doname.concat(byteName));
            console.log(n);
            options = {
              byteName: $.stringify(n),//  $.stringify(doname),
              sceneTypes: that.data.sceneTypes,
              scene_id: last[0],
              scene_name: $.utf8to16(unescape(str)),
              last: $.stringify(last.splice(1, 6)),
            };
            that.data.scenelist.push(options);
            $.ajax({
              url: 'Scene/addScene',
              method: 'POST',
              data: {
                byteName: $.stringify(n),
                sceneTypes: last[1],
                scene_id: last[0],
                scene_name: $.utf8to16(unescape(str)),
                scene_num: '123',
                last: $.stringify(last.splice(1, 6)),
              },
            }).then((res) => {
            });
            wx.setStorageSync('scene', that.data.scenelist);
          }
        }

        $.ajax({
          url: 'Scene/getScene',
          method: 'POST',
          data: {
          },
        }).then((res) => {
          that.setData({
            scenelist: res.data,
            sceneArray: last
          });
          console.log(that.data.scenelist);
        });
        
      } catch (e) { }
    })

  },

  switchScene(e) {
    let flag = e.detail.value;
    let arrayID = [];
    let current = e.target.dataset;
    arrayID.push(current.id);
    let last = $.parse(current.last);
    let name = $.parse(current.bytename);
    let toolsArrays = arrayID.concat(name.concat(last));
    let map = [], index = '';
    let arr = [], that = this, json = {};
    arr.push(0, 18, 0x50);
    let count = null;
    if (flag == true) {
      count = arr.concat(toolsArrays);
      tools.sendData('c2s_write', wx.getStorageSync('did'), {
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
      return false;
    } else if (flag == false) {
      count = arr.concat(toolsArrays);
      tools.sendData('c2s_write', wx.getStorageSync('did'), {
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