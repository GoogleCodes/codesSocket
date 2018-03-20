// pages/scene/scene.js

var tools = require('../../utils/util.js');
import { $ } from '../../utils/main.js'

let that;

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
    sname: '',
    sceneTypes: -1,
    timingList: [], //  定時
    delayList: [],  //  延迟
    checked: false,
    indexs: 0,
    status: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getSceneTo();
    that = this;
  },

  onShow() {
    this.getSceneTo();
    // this.getScene();
  },

  getScene() {
    $.getName('title');
    wx.showLoading({
      title: '获取中...',
    })
    that.setData({
      scenelist: wx.getStorageSync('sceneArrayMap'),
    });
    wx.hideLoading();
    // $.ajax({
    //   url: 'Scene/getScene',
    //   method: 'POST',
    // }).then((res) => {
    //   wx.hideLoading();
    //   let json = {}, arr = [];
    //   if (res.data == '') {
    //     wx.showToast({
    //       title: '暫没情景模式!',
    //     })
    //     return false;
    //   } else {
    //     wx.removeStorageSync('ls');
    //     // if (wx.getStorageSync('did') == res.data[i].did) {
    //       if (wx.getStorageSync('scenelist') == '') {
    //         for (let i in res.data) {
    //           json = {
    //             scene_id: res.data[i].scene_id,
    //             byteName: JSON.parse(res.data[i].byteName),
    //             scene_name: res.data[i].scene_name,
    //             sceneTypes: res.data[i].sceneTypes,
    //             status: res.data[i].status
    //           };
    //           arr.push(json);
    //           console.log(that.data.scenelist);
    //         }
    //         wx.setStorageSync('scenelist', arr);
    //         that.setData({
    //           scenelist: arr,
    //         });
    //       } else if (wx.getStorageSync('scenelist') !== '') {
    //         let list = wx.getStorageSync('scenelist');
    //         for (let i in list) {
    //           try {
    //             wx.setStorageSync('ls', list);
    //             if (wx.getStorageSync('ls')[i].scene_id == list[i].id) {
    //               list[i].status = wx.getStorageSync('ls')[i].status;
    //               wx.hideLoading();
    //             }
    //           } catch (e) {
    //           }
    //         }
    //         that.setData({
    //           scenelist: list,
    //         });
    //       }
    //     // }
    //   }
    // });
  },

  //  获取情景
  getSceneTo() {
    wx.showLoading({
      title: '获取中。。。',
    })
    let arr = [], json = {}, that = this;

    let status; // 状态

    arr.push(0x00, 0x01, 0x40);
    tools.sendData('c2s_write', wx.getStorageSync('did'), {
      'data': $.getArrays(arr),
    });
    $.getSocketResponse((did, res) => {
      if (res[3] == 0) {
        console.log(res[3] == 0);
        wx.removeStorageSync('sceneArrayMap');
        wx.hideLoading();
        wx.showModal({
          title: '警告',
          content: '暂时没有情景模式!',
          showCancel: false,
        })
        return false;
      }
      wx.hideLoading();
      try {
        let arr = res, arrID = res;
        if (did !== wx.getStorageSync('did')) {
          wx.hideToast();
          return false;
        }
        if (arr[2] == 65) {
          //  获取情景貌似ID
          let sceneID = arr[3];
          let last = '', arrays = [], options = {}, arrayMap = [];
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
              console.log(last);
              if (last[0] == 0 || last[0] == 2) {
                that.setData({
                  status: 0
                });
                console.log(that.data.status);
              } else if (last[0] == 1 || last[0] == 3) {
                that.setData({
                  status: 1
                });
                console.log(that.data.status);
              }
              let n = name.concat(doname.concat(last));
              if (n[14] == 0 || n[14] == 1) {
                that.setData({
                  sceneTypes: 0
                });
              } else if (n[14] == 2 || n[14] == 3) {
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
                status: that.data.status,
              };
              arrayMap.push(options);
              wx.setStorageSync("sceneArrayMap", arrayMap);
              that.data.scenelist.push(options);
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
    let arr = [0, 18, 0x50], that = this, json = {};
    let count = null;
    let sceneArrayMap = wx.getStorageSync('sceneArrayMap');
    if (flag == true) {
      let by = [];
      let c = by.concat(JSON.parse(name));
      if (c[14] == 2) {
        c[14] += 1;
      } else if (c[14] == 0) {
        c[14] += 1;
      }
      count = arr.concat(c);
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

                  $.alert('控制成功');
                  return false;
                case 0:
                  $.alert('控制失败');
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
      let by = [];
      let c = by.concat(JSON.parse(name));
      if (c[14] == 3) {
        c[14] -= 1;
      } else if (c[14] == 1) {
        c[14] -= 1;
      }
      count = arr.concat(c);
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
                  // for (let n in sceneArrayMap) {
                  //   if (sceneArrayMap[n].id == id) {
                  //     sceneArrayMap[n].status = 0;
                  //     wx.setStorageSync("sceneArrayMap", sceneArrayMap);
                  //     console.log(wx.getStorageSync('sceneArrayMap'));
                  //   }
                  // }
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
                  $.alert('控制成功')
                  return false;
                case 0:
                  $.alert('控制失败');
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
    let arr = [], that = this;
    wx.showModal({
      title: '删除情景模式',
      content: '确定要删除吗?',
      success(res) {
        arr.push(0, 18, 0x60);
        tools.sendData('c2s_write', that.data.did, {
          'data': $.getArrays(arr.concat(that.data.sceneid)),
        });
        wx.onSocketMessage(function (res) {
          try {
            let data = JSON.parse(res.data);
            let count = data.data.attrs.data
            let arr = count.splice(3, 1);
            for (let i = 0; i < arr.length; i++) {
              if (arr[i] == 1) {
                $.alert('删除成功')
              } else {
                $.alert('删除失败')
              }
            }
          } catch (e) {
          }
        })
      }
    })
  },

})