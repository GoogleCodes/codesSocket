// pages/voice/voice.js

var tools = require('../../utils/util.js');

import { Main } from '../../utils/main.js'
let main = new Main();

const did = wx.getStorageSync('didJSon').did;

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
    voiceIMessage: '',
    sceneName: [],
    arrays: [],
    voices: [],
    recodePath: ''
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
          console.log("返回的东西是：", res.data.toString() == error_text, res.data.toString());
          switch (true) {
            case res.data.toString() == error_text:
              main._Toast('语音识别失败!请重试!', 'success');
              break;
            case res.statusCode == 404:
              main._Toast('服务器搞飞机去了!呜呜呜~~~~', 'success');
              return;
          }
          var options = JSON.parse(res.data), result = null, sqlStr = null, json = {};
          s.setData({
            ins_y: options.time1,
            ins_l: options.time2,
          });
          for (var i in options.yuyin) {
            var sqlStr = options.yuyin[i];
            s.setData({
              openMessage: sqlStr,
            });
            if (typeof (sqlStr) == "string") {
              var myString = sqlStr.substring(0, 1);
            }
            switch (true) {
              case myString == "开" || myString == '打':
                s.setData({ switchButton: true });
                json = {
                  "onoffAll": s.data.switchButton,
                };
                s.setData({
                  voiceOpen: false,
                })
                //  发送数据
                tools.sendData('c2s_write', did, json);
                main._Toast('打开成功!', 'success');
                break;
              case myString == "关" || myString == s.data.language:
                s.setData({ switchButton: false });
                json = {
                  "onoffAll": s.data.switchButton,
                };
                //  发送数据
                tools.sendData('c2s_write', did, json);
                main._Toast('关闭成功!', 'success');
                break;
              default:
                break;
            }
          }
          var str = res.data;
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
  },

  blurMessage(e) {
    console.log(e.detail.value);
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
      that.data.arrays = attrs.splice(4, 18);
      that.setData({
        arrays: that.data.arrays
      });
      let a = that.data.arrays.splice(1, 3);
      let sceneName = [];
      sceneName = sceneName.concat(a)
      let str = '';
      for (let i in sceneName) {
        str += String.fromCharCode(sceneName[i]);
      }
      that.setData({
        sceneName: str
      });
    })

  },
  
  saveIMessage(e) {
    let that = this, json = {};
    let arr = [], brr = [], list = [], sdid = null;
    let rid = null;

    if (that.data.voiceIMessage == that.data.sceneName) {
      arr.push(0, 18, 0x50);
      let count = null;
      count = arr.concat(that.data.arrays);
      json = {
        'data': main.getArrays(count),
      };
      tools.sendData('c2s_write', did, json);

      main.getSocketResponse((data) => {
        let arr = data.splice(3,1);
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

    };

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
        let region = res.data.data;
        for (let i in region) {
          if (that.data.voiceIMessage == region[i].name) {
            rid = region[i].id;
          }
        }
        wx.request({
          url: 'http://yuyin.ittun.com/public/index/dev/getdev',
          method: 'POST',
          header: {
            'content-type': 'application/json',
            'content-type': 'application/x-www-form-urlencoded'
          },
          data: {
            rid: rid,
            uid: wx.getStorageSync('wxuser').id,
          },
          success(res) {
            list = res.data.data;
            for (let i in list) {
              if (rid == list[i].rid) {
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

                main.getSocketResponse((data) => {
                  conosole.log(data);
                });

              }
            }
          }
        });
      }
    })
    // if (this.data.voiceIMessage == "打开灯") {
    //   json = {
    //     "onoffAll": true,
    //   };
    //   that.setData({
    //     voiceOpen: false,
    //     voiceDone: true,
    //   })
    //   //  发送数据
    //   tools.sendData('c2s_write', did, json);
    //   wx.showToast({
    //     title: '打开成功！',
    //   })
    // } else if (this.data.voiceIMessage == "关闭灯") {
    //   json = {
    //     "onoffAll": false,
    //   };
    //   that.setData({
    //     voiceOpen: true,
    //     voiceDone: false,
    //   })
    //   wx.showToast({
    //     title: '关闭成功！',
    //   })
    //   //  发送数据
    //   tools.sendData('c2s_write', did, json);
    // }
  }

})