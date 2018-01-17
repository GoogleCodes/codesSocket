// pages/scene/scene.js

var tools = require('../../utils/util.js');
import { Main } from '../../utils/main.js'
let main = new Main();
// const did = wx.getStorageSync('didJSon').did;
// const did = wx.getStorageSync('did');

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
    json = {
      'data': main.getArrays(arr),
    };
    tools.sendData('c2s_write', that.data.did, json);
    setTimeout(() => {
      wx.hideLoading();
    }, 500)

    wx.onSocketMessage((res) => {
      try {
        let data = JSON.parse(res.data);
        let arr = data.data.attrs.data;
        let arrID = data.data.attrs.data;
        //  获取情景貌似ID
        let sceneID = arr.splice(4,1);
        if (sceneID == 0) {
          that.setData({
            isTrueScene: true,
          });
        } else if (sceneID == 1) {
          that.setData({
            isTrueScene: false,
          });
        }
        this.data.arrays.push(arr.splice(4, 18));
        this.setData({
          arrays: this.data.arrays,
          sceneid: sceneID
        });
        let brr = JSON.parse(res.data);
        let thatArr = brr.data.attrs.data.splice(4, 18);
        that.setData({
          sceneArray: thatArr
        });
      } catch(e) {
        
      }
    })

  },

  switchScene(e) {
    let arr = [], that = this, json = {};
    console.log(that.data.did);
    // arr.push(0, 18, 0x50, 1, 229, 188, 128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0 + 10, 1, 1);
    arr.push(0, 18, 0x50);
    let count = null;
    if (e.detail.value == true) {
      count = arr.concat(that.data.sceneArray);
      json = {
        'data': main.getArrays(count),
      };
      tools.sendData('c2s_write', that.data.did, json);
      wx.onSocketMessage((res) => {
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
    } else if (e.detail.value == false)  {
      count = arr.concat(that.data.sceneArray);
      json = {
        'data': main.getArrays(count),
      };
      tools.sendData('c2s_write', that.data.did, json);
      return;
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
          'data': main.getArrays(arr.concat(that.data.sceneid)),
        };
        tools.sendData('c2s_write', that.data.did, json);
        wx.onSocketMessage((res) => {
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