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
    sceneArray: [],
    did: "",
    sname: '',
    sceneTypes: -1,
    timingList: [], //  定時
    delayList: [],  //  延迟
    checked: false,
    indexs: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      did: wx.getStorageSync('did')
    });
    $.getName('title');
    this.getSceneTo();
    this.getScene();
  },

  onShow() {
    let that = this;
    this.getScene();
  },

  getScene() {
    let that = this;
    wx.showLoading({
      title: '获取中...',
    })
    // let status = '';
    // $.getSocketResponse((did, res) => {
    //   let a = res.splice(4, 765);
    //   let last = '';
    //   for (let i in a) {
    //     if (a[16] !== 0) {
    //       last = a.splice(0, 17 + (a[16] * 9));
    //     } else if (a[16] == 0) {
    //       last = a.splice(0, 17);
    //     }
    //     if (last.indexOf(0) > 0) {
    //       console.log(last[14] == 0 || last[14] == 2)
    //       if (last[14] == 0 && last[14] == 2) {
    //         status = "0";
    //       } else if (last[0] == 2 && last[14] == 3) {
    //         status = "1";
    //       }
    //     }
    //   }
    // })
    $.ajax({
      url: 'Scene/getScene',
      method: 'POST',
    }).then((res) => {
      let json = {}, arr = [];
      for (let i in res.data) {
        if (wx.getStorageSync('did') == res.data[i].did) {
          json = {
            scene_id: res.data[i].scene_id,
            byteName: JSON.parse(res.data[i].byteName),
            scene_name: res.data[i].scene_name,
            sceneTypes: res.data[i].sceneTypes,
            status: res.data[i].status
          };
          arr.push(json);
          that.setData({
            scenelist: arr,
          });
          wx.hideLoading();
        }
      }
    });
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
        if (arr[2] == 65) {
          //  获取情景貌似ID
          let sceneID = arr[3];
          let last = '', arrays = [], options = {};
          let a = res.splice(4, 765);
          for (let i in a) {
            if (a[16] !== 0) {
              last = a.splice(0, 17 + (a[16] * 9));
            } else if (a[16] == 0) {
              last = a.splice(0, 17);
            }
            if (last.indexOf(0) > 0) {
              let name = last.splice(0, 14);
              let doname = name.splice(1, 13);
              // let byteName = name.splice(1, 3);
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
              let status; // 状态
              if (last[0] == 0 && last[0] == 2) {
                status = 0;
              } else if (last[0] == 1 && last[0] == 3) {
                status = 1;
              }
              let n = name.concat(doname.concat(last));
              if (n[14] == 0 || n[14] == "0") {
                that.setData({
                  sceneTypes: 0
                });
              } else if (n[14] == 2 || n[14] == "2") {
                that.setData({
                  sceneTypes: 2
                });
              }
              options = {
                byteName: $.stringify(n),
                sceneTypes: that.data.sceneTypes,
                scene_id: n[0],
                scene_name: $.utf8to16(unescape(str)),
                scene_num: '123',
                last: $.stringify(last.splice(1, 6)),
                did: wx.getStorageSync('did'),
                status: status,
              };
              that.data.scenelist.push(options);
              console.log($.utf8to16(unescape(str)));
              // $.ajax({
              //   url: 'Scene/addScene',
              //   method: 'POST',
              //   data: options,
              // }).then((res) => {
              // });
            }
          }
          that.getScene();
        }
      } catch (e) { }
    })
  },

  switchScene(e) {
    let flag = e.detail.value;
    let current = e.target.dataset;
    let name = current.bytename;
    let scenename = e.currentTarget.dataset.scenename;
    let id = e.currentTarget.dataset.id;
    let map = [], index = '';
    let arr = [], that = this, json = {};
    arr.push(0, 18, 0x50);
    let count = null;
    if (flag == true) {
      if (name[14] == 2) {
        name[14] += 1;
      } else if (name[14] == 0) {
        name[14] += 1;
      }
      count = arr.concat(name);
      tools.sendData('c2s_write', wx.getStorageSync('did'), {
        'data': $.getArrays(count),
      });
      $.getSocketResponse((did, res) => {
        try {
          if (wx.getStorageSync('did') == did) {
            if (res[2] == 81) {
              switch (res[3]) {
                case 1:
                  $.ajax({
                    url: '/Scene/updateScene',
                    method: 'POST',
                    data: {
                      scene_name: scenename,
                      status: 1
                    },
                    success(res) {
                    }
                  });
                  wx.showToast({
                    title: '控制成功',
                  })
                  return false;
                case 0:
                  wx.showToast({
                    title: '控制失败',
                  })
                  return false;
                default:
                  break;
              }
            }
          }
        } catch (e) { }
      });
      return false;
    } else if (flag == false) {
      if (name[14] == 3) {
        name[14] -= 1;
      } else if (name[14] == 1) {
        name[14] -= 1;
      }
      count = arr.concat(name);
      tools.sendData('c2s_write', wx.getStorageSync('did'), {
        'data': $.getArrays(count),
      });
      $.getSocketResponse((did, res) => {
        try {
          if (wx.getStorageSync('did') == did) {
            if (res[2] == 81) {
              console.log(res);
              switch (res[3]) {
                case 1:
                  $.ajax({
                    url: '/Scene/updateScene',
                    method: 'POST',
                    data: {
                      scene_name: scenename,
                      status: 0
                    },
                    success(res) {
                    }
                  });
                  wx.showToast({
                    title: '控制成功',
                  })
                  return false;
                case 0:
                  wx.showToast({
                    title: '控制失败',
                  })
                  return false;
                default:
                  break;
              }
            }
          }
        } catch (e) { }
      });
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