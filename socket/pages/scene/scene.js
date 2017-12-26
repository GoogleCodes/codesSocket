// pages/scene/scene.js

var tools = require('../../utils/util.js');
import { Main } from '../../utils/main.js'
let main = new Main();
const did = wx.getStorageSync('didJSon').did;

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
    sceneArray: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const that = this;
    //  查询场景
    wx.request({
      url: 'https://api.gizwits.com/app/scene',
      method: 'GET',
      header: {
        'Content-Type': 'application/json',
        'Accept': ' application/json',
        'X-Gizwits-Application-Id': 'd8b4d2f0bce943ee9ecb4abfa01a2e55',
        'X-Gizwits-User-token': 'e8dcba65c4294c499f1e9b96e702856a',
      },
      success(res) {
        console.log(res.data);
        that.setData({
          scenelist: res.data
        });
      }
    })
    this.getSceneTo();
  },

  //  获取情景
  getSceneTo() {
    wx.showLoading({
      title: '加载中。。。',
    })
    let arr = [], json = {}, that = this;
    arr.push(0x00, 0x01, 0x40);
    json = {
      'data': main.getArrays(arr),
    };
    tools.sendData('c2s_write', did, json);
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
    console.log(that.data.sceneArray);
    // arr.push(0, 18, 0x50, 1, 229, 188, 128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0 + 1, 1, 1);
    arr.push(0, 18, 0x50);
    let count = arr.concat(that.data.sceneArray)
    console.log(count);
    if (e.detail.value == true) {
      json = {
        'data': main.getArrays(count),
      };
      tools.sendData('c2s_write', did, json);
      wx.onSocketMessage((res) => {
        try {
          let data = JSON.parse(res.data);
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
        } catch (e) {
        }
      })
    } else if (e.detail.value == false)  {
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
        tools.sendData('c2s_write', did, json);
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

  //  创建情景
  creatScene() {
    const that = this;
    const json = {
      "scene_name": "宠物屋",
      "tasks": [
        {
          "task_type": "device",
          "time": 360,
          "did": "eFNagYgB6k7QyXZNkEHhND",
          "attrs": {
            'onoffAll': true,
          },
          "raw": "string"
        }
      ]
    };
    wx.request({
      url: 'https://api.gizwits.com/app/scene',
      method: "POST",
      header: {
        'content-type': 'application/json',
        'content-type': 'application/x-www-form-urlencoded',
        'X-Gizwits-Application-Id': 'd8b4d2f0bce943ee9ecb4abfa01a2e55',
        'X-Gizwits-User-token': '8e1aa123f7314fba8dd874154faa1071',
      },
      data: JSON.stringify(json),
      success(res) {
        console.log(res);
        that.setData({
          sceneid: res.data.id,
        });
      },
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
  
  },

})