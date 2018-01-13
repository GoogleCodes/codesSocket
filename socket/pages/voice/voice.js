// pages/voice/voice.js

var tools = require('../../utils/util.js');

import { Main } from '../../utils/main.js'
let main = new Main();

// const did = wx.getStorageSync('didJSon').did;
const did = wx.getStorageSync('did');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    //  正在识别指令
    voiceNow: true,
    //  识别成功
    voiceDone: true,
    voiceOpen: true,
    //  输入的指令
    voiceIMessage: '打开大厅',
    sceneName: [],
    arrays: [],
    voices: [],
    recodePath: '',
    headers: {
      'content-type': 'application/json',
      'content-type': 'application/x-www-form-urlencoded'
    }

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getScene();
  },

  startRecode(e) {
    var that = this;
    wx.startRecord({
      success(res) {
        var tempFilePath = res.tempFilePath;
        that.setData({ recodePath: tempFilePath, isSpeaking: true });
        main._Toast('录音成功', 'success');
        wx.getSavedFileList({
          success(res) {
            var voices = [];
            for (var i in res.fileList) {
              //  格式化时间
              var createTime = new Date(res.fileList[i].createTime)
              //  将音频大小B转为KB  
              var size = (res.fileList[i].size / 1024).toFixed(2);
              var voice = { 
                filePath: res.fileList[i].filePath, 
                createTime: createTime, size: size 
              };
              voices = voices.concat(voice);
            }
            that.setData({ voices: voices })
          }
        });
      },
      fail(err) {
        console.log(err.data);
      }
    });
  },

  endRecode(e) {
    var s = this;
    s.setData({ voiceNow: false });
    wx.stopRecord();
    s.setData({ isSpeaking: false });
    wx.showToast();
    try {
      setTimeout(() => {
        console.log(s.data.recodePath, "s.data.recodePath");
        wx.uploadFile({
          url: 'http://yuyin.ittun.com/public/index/dev/zhen',
          filePath: s.data.recodePath,
          method: "POST",
          name: 'silk',
          header: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT',
            'Access-Control-Allow-Headers': 'Origin, X-Requested - With, Content-Type, Accept'
          },
          formData: {
            'lan': 'zh' //s.data.arrayCharset, // 'zh',
          },
          success(res) {
            s.setData({ voiceNow: true });
            var error_text = '语音识别失败';
            console.log("返回的东西是：", JSON.parse(res.data), "options...");
            switch (true) {
              case res.data.toString() == error_text:
                main._Toast('语音识别失败!请重试!', 'success');
                break;
              case res.statusCode == 404:
                main._Toast('服务器搞飞机去了!呜呜呜~~~~', 'success');
                return;
            }
            var options = JSON.parse(res.data), result = null, sqlStr = null, json = {};
            console.log(options, "options...");
            s.setData({
              ins_y: options.time1,
              ins_l: options.time2,
            });

            for (var i in options.yuyin) {
              var sqlStr = options.yuyin[i];

              function IndexDemo(str) {
                var s = sqlStr.indexOf(str);
                return s;
              }

              s.setData({
                openMessage: sqlStr,
              });

              let tabArray = wx.getStorageSync('tabArray');
              if (IndexDemo('打开全部灯') || IndexDemo('打') || IndexDemo('打开')) {
                s.setData({
                  voiceOpen: false,
                  voiceDone: true,
                })
                //  发送数据
                tools.sendData('c2s_write', did, {
                  "onoffAll": true,
                });
                main.getSocketResponse((res) => {
                  console.log(res, 'data...');
                })
                wx.showToast({
                  title: '打开成功',
                  duration: 1500,
                })
                return false;
              } else if (IndexDemo('关闭全部灯') || IndexDemo('关') || IndexDemo('关闭')) {
                s.setData({
                  voiceOpen: true,
                  voiceDone: false,
                })
                //  发送数据
                tools.sendData('c2s_write', did, {
                  "onoffAll": false,
                });
                wx.showToast({
                  title: '关闭成功',
                  duration: 1500,
                })
                return false;
              }

              // if (typeof (sqlStr) == "string") {
              //   var myString = sqlStr.substring(0, 1);
              // }
            }
            if (data.states == 1) {
              var cEditData = s.data.editData;
              cEditData.recodeIdentity = data.identitys;
              s.setData({ editData: cEditData });
            } else {
              main._goShowModel('提示', data.message, () => { });
            }
            wx.hideToast();
          },
          fail(res) {
            s.setData({ voiceNow: true });
            //  错误提示
            main._goShowModel('提示', '录音的姿势不对!', () => { });
            wx.hideToast();
          }
        });
      }, 1000)
    } catch(e) {}
    
  },

  blurMessage(e) {
    this.setData({
      voiceIMessage: e.detail.value
    });
  },

  getScene() {
    let arr = [], json = {}, that = this;
    arr.push(0x00, 0x01, 0x40);
    json = {
      'data': main.getArrays(arr),
    };
    tools.sendData('c2s_write', did, json);
    main.getSocketResponse((data) => {
      that.data.arrays = data.splice(4, 18);
      let arraysName = that.data.arrays;
      that.setData({
        arrays: that.data.arrays
      });
      let a = arraysName.splice(1, 3);
      console.log(that.data.arrays, 'that.data.arrays');
      let sceneName = [];
      sceneName = sceneName.concat(a)
      let str = '';
      for (let i in sceneName) {
        str += String.fromCharCode(sceneName[i]);
      }
      that.setData({
        sceneName: str
      });
      console.log(that.data.sceneName);
    })

  },
  
  webScene(arrays1, arrays2) {
    let count = null, json = {};
    count = arrays1.concat(arrays2);
    json = {
      'data': main.getArrays(count),
    };
    tools.sendData('c2s_write', did, json);

    main.getSocketResponse((data) => {
      let arr = data.splice(3, 1);
      if (arr == 1) {
        wx.showToast({
          title: '操作成功!',
        })
      } else if (arr == 0) {
        wx.showToast({
          title: '操作失败!',
        })
      }
    });
  },

  saveIMessage(e) {
    let that = this, json = {};
    let arr = [], brr = [], list = [], sdid = null;
    let rid = null;

    function IndexDemo(str1, str2) {
      var s = str2.indexOf(str1);
      return s;
    }

    if (that.data.voiceIMessage == "打开" + that.data.sceneName) {

      that.data.arrays[14] = 2;
      arr.push(0, 18, 0x50);
      that.webScene(arr, that.data.arrays);

    } else if (that.data.voiceIMessage == "关闭" + that.data.sceneName) {

      that.data.arrays[14] = 0;
      arr.push(0, 18, 0x50);
      that.webScene(arr, that.data.arrays);

    }

    let tabArray = wx.getStorageSync('tabArray');
    let spliceArray = wx.getStorageSync('spliceArray');

    main.ajax({
      data: {
        url: 'dev/getregion',
        method: 'POST',
        header: {
          'content-type': 'application/json',
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: {
          uid: wx.getStorageSync('wxuser').id,
        },
      }
    }).then((res) => {
      let region = res.data.data;

      for (let i in region) {
        for (let y in tabArray) {
          if (region[i].id == tabArray[y].id) {
            rid = region[i].id;
            main.ajax({
              data: {
                url: 'dev/getdev',
                method: 'POST',
                header: {
                  'content-type': 'application/json',
                  'content-type': 'application/x-www-form-urlencoded'
                },
                data: {
                  rid: rid,
                  uid: wx.getStorageSync('wxuser').id,
                },
              }
            }).then((res) => {
              list = res.data.data;
              for (let a in list) {
                for (let b in spliceArray) {
                  if (list[a].id == spliceArray[b].id) {
                    if (IndexDemo('打开', that.data.voiceIMessage) == 0) {
                      sdid = list[i].did;
                      if (typeof sdid == 'string') {
                        sdid = JSON.parse(sdid)
                      }
                      brr = [0xA2, 0x01, 0x01];
                      arr.push(0x00, 0x08, 0xA2);
                      let count = arr.concat(sdid.concat(brr));
                      json = {
                        'data': main.getArrays(count),
                      };
                      count = "";
                      tools.sendData('c2s_write', did, json);
                    } else if (IndexDemo('关闭', that.data.voiceIMessage) == 0) {
                      console.log(2);
                    } else {
                      console.log(3);
                      return false;
                    }
                  }
                }
              }

              main.getSocketResponse((data) => {
                conosole.log(data);
              });

            });
          } else {
            return false;
          }
        }
      }
    })

    // main.ajax({
    //   data: {
    //     url: 'dev/getdev',
    //     method: 'POST',
    //     header: {
    //       'content-type': 'application/json',
    //       'content-type': 'application/x-www-form-urlencoded'
    //     },
    //     data: {
    //       rid: rid,
    //       uid: wx.getStorageSync('wxuser').id,
    //     },
    //   }
    // }).then((res) => {
    //   list = res.data.data;
    //   for (let i in list) {
    //     if (rid == list[i].rid) {
          
    //     }
    //   }
    // }) 

  }

})