// pages/voice/voice.js

var tools = require('../../utils/util.js');

import { Main } from '../../utils/main.js'
let main = new Main();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    //  正在识别指令
    voiceNow: true,
    //  识别成功
    voiceDone: true,
    //  输入的指令
    voiceIMessage: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
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
              var voice = { filePath: res.fileList[i].filePath, createTime: createTime, size: size };
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
      wx.uploadFile({
        url: 'https://www.chlorop.com.cn/yuyin/public/index/index/zhen',
        filePath: s.data.recodePath,
        method: "POST",
        name: 'abc',
        header: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Origin, X-Requested - With, Content-Type, Accept'
        },
        formData: {
          'lan': s.data.arrayCharset, // 'zh',
        },
        header: ('Access-Control-Allow-Methods: GET, POST, PUT'),
        success(res) {
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
          for (var i in options) {
            var sqlStr = options[i].toString();
            s.setData({
              openMessage: sqlStr,
            });
            if (typeof (sqlStr) == "string") {
              var myString = sqlStr.substring(0, 1);
            }
            switch (true) {
              case myString == "开" || myString == '打' || myString == s.data.language:
                s.setData({ switchButton: true });
                json = {
                  "onoffAll": s.data.switchButton,
                };
                //  发送数据
                tools.sendData('c2s_write', s.data.did, json);
                main._Toast('打开成功!', 'success');
                break;
              case myString == "关" || myString == s.data.language:
                s.setData({ switchButton: false });
                json = {
                  "onoffAll": s.data.switchButton,
                };
                //  发送数据
                tools.sendData('c2s_write', s.data.did, json);
                main._Toast('关闭成功!', 'success');
                break;
              default:
                break;
            }
            s.setData({
              voiceDone: false,
            })
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

  saveIMessage(e) {
    console.log(e);
  }

})