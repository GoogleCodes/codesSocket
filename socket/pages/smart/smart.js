// smart.js

var myUtils = require('../../utils/util.js');
var gizwitsws = require('../../utils/gizwits_ws_0.3.0.min.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    messages: '',
    array: ['custom', 'attrs_v4'],
    apiHost: 'api.gizwits.com',
    commType: 'attrs_v4', //  attrs_v4 || custom
    wechatOpenId: 'kceshi1',
    gizwitsAppId: '032c92bbb0fc4b6499a2eaed58727a3a',
    token: '',
    uid: '',
    did: '',
    port: 0,
    port_s: 0,
    ws_port: 0, //  端口
    wss_port: 0, //  端口
    recodePath: '',  //  录音路径
    host: '', //  websocket 请求地址
    keepalive: 180,
    autoSub: false,
    socketOpen: false,  //  socket 开关
    url: 'wss://sandbox.gizwits.com:8880/ws/app/v1',  //  websocket 请求地址
    switchButton: false,  //  开关
  },

  /**
     * 显示内容
     */
  showMessage: function (message) {
    var that = this;
    that.setData({
      messages: message,
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that._getUserToken();
  },
  /**
   * 开始录音
   */
  startRecode: function () {
    var that = this;
    console.log("start");
    wx.startRecord({
      success: function (res) {
        console.log(res);
        var tempFilePath = res.tempFilePath;
        that.setData({ recodePath: tempFilePath, isRecode: true });
        console.log(tempFilePath + "----");
      },
      fail: function (res) {
        console.log("fail");
        console.log(res.data);
        //录音失败
      }
    });
  },

  /**
   * 结束录音
   */
  endRecode: function () {
    var s = this;
    console.log("end" + "----");
    wx.stopRecord();
    s.setData({ isRecode: false });

    wx.showToast();
    setTimeout(function () {
      var urls = 'http://yuyin.ittun.com/public/index/index/fanyi';
      console.log(s.data.recodePath + "----");
      wx.uploadFile({
        url: urls,
        filePath: s.data.recodePath,
        method: "GET",
        name: 'abc',
        header: ('Access-Control-Allow-Origin: *'),
        header: ("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept"),
        header: ('Access-Control-Allow-Methods: GET, POST, PUT'),
        success: function (res) {
          var str = res.data;
          var data = JSON.parse(str);
          if (data.states == 1) {
            var cEditData = s.data.editData;
            cEditData.recodeIdentity = data.identitys;
            s.setData({ editData: cEditData });
          }
          else {
            wx.showModal({
              title: '提示',
              content: data.message,
              showCancel: false,
              success: function (res) {

              }
            });
          }
          wx.hideToast();
        },
        fail: function (res) {
          console.log(res);
          wx.showModal({
            title: '提示',
            content: "网络请求失败，请确保网络是否正常",
            showCancel: false,
            success: function (res) {

            }
          });
          wx.hideToast();
        }
      });
    }, 1000)
  },

  chooseImages: function () {
    wx.chooseImage({
      count: 1,
      header: ('Access-Control-Allow-Origin: *'),
      header: ("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept"),
      header: ('Access-Control-Allow-Methods: GET, POST, PUT'),
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      name: 'abc',
      success: function (res) {
        var tempFilePaths = res.tempFilePaths
        wx.uploadFile({
          url: 'http://yuyin.ittun.com/public/index/index/fanyi',
          filePath: tempFilePaths[0],
          name: 'abc',
          formData: {
            'user': 'test'
          },
          success: function (res) {
            var data = res.data
            console.log(res);
          }
        })
      }
    })
  },

  chooseVideo: function () {
    wx.chooseVideo({
      //相机和相册
      sourceType: ['album', 'camera'],
      //录制视频最大时长
      maxDuration: 60,
      //摄像头
      camera: ['front', 'back'],
      //这里返回的是tempFilePaths并不是tempFilePath
      success: function (res) {
        var tempFilePaths = res.tempFilePaths
        console.log(res.tempFilePaths[0])
        wx.uploadFile({
          url: 'http://yuyin.ittun.com/public/index/index/fanyi',
          filePath: res.tempFilePaths[0],
          name: 'abcdsfd',
          success: function (res) {
            var data = res.data
            console.log(res);
          }
        })
      },
      fail: function (e) {
        console.log(e)
      }
    });
  },

  /**
   * 下拉列表
   */
  bindPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index: e.detail.value
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  _getUserToken: function () {
    var that = this;
    wx.request({
      url: "https://" + that.data.apiHost + "/app/users",
      method: 'POST',
      header: {
        'content-type': 'application/json',
        "X-Gizwits-Application-Id": that.data.gizwitsAppId
      },
      data: {
        lang: "en",
        phone_id: that.data.wechatOpenId,
      },
      success: function (result) {
        that.setData({
          token: result.data.token,
          uid: result.data.uid,
        });
        var limit = 20;
        var skip = 0;
        that._getBindingList(limit, skip)
      },
      fail: function (evt) {
        console.log(evt);
      }
    })
  },

  _getBindingList: function (limit, skip) {
    var that = this;
    console.log(that.data.uid, that.data.token);
    var query = "?show_disabled=0&limit=" + limit + "&skip=" + skip;
    wx.request({
      url: "https://api.gizwits.com/app/bindings" + query,
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'X-Gizwits-Application-Id': '032c92bbb0fc4b6499a2eaed58727a3a',
        'X-Gizwits-User-token': 'b62cd7f3561a43e3a5497704745a7e1d'
      },
      success: function (result) {
        for (var i in result.data.devices) {
          var device = result.data.devices[i];
          //  获取数据
          that.setData({
            did: device.did,  //  did
            host: device.host,  //  websocket 请求地址
          });
        }
      },
      fail: function (evt) {

      }
    })
  },

  _getWebSocketConn() {
    var that = this;
    this.showMessage("已发送read指令!");
  },

  _login: function () {
    var that = this, json = [];
    wx.connectSocket({
      url: that.data.url,
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        wx.onSocketOpen(function (res) {
          json = {
            cmd: "login_req",
            data: {
              appid: '032c92bbb0fc4b6499a2eaed58727a3a',
              uid: '45c691417def43db967c875f039dc53b',
              token: 'fdf464b155b14be9a93d506a986b3742',
              p0_type: 'attrs_v4',
              heartbeat_interval: 180,
              auto_subscribe: true
            }
          }
          that._sendJson(json);
          wx.onSocketMessage(function (res) {
            var data = JSON.parse(res.data);
            if (data.data.success == true) {
              //  链接socket
              json = {
                cmd: "subscribe_req",
                data: [
                  { 
                    did: '59NAHkTJ2m3CBnu5koAAPi',
                    passcode: 123456
                  },
                ]
              };
              that._sendJson(json);

              //  读取数据
              var rJson = {
                cmd: "c2s_read",
                data: {
                  did: '59NAHkTJ2m3CBnu5koAAPi'
                }
              };
              that._sendJson(rJson);

              wx.onSocketMessage(function(res){
                var str = JSON.parse(res.data);
                if (str.cmd === 's2c_noti') {
                  //  发送数据
                  var _sendJson = {
                    cmd: "c2s_write",
                    data: {
                      did: '59NAHkTJ2m3CBnu5koAAPi',
                      attrs: {
                        "lang": true
                      }
                    }
                  };
                  that._sendJson(_sendJson);
                }
              });
            }
          })
        })
      },
      fail: function (err) {
        console.log(err);
      },
      complete: function() {
        console.log(that.data.token);
      }
    })
  },

  chonseSocket: function(e) {
    console.log(e.detail.value);
    var that = this, json = [];
    console.log(that.data.token, that.data.uid, that.data.did);
    wx.connectSocket({
      url: that.data.url,
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        wx.onSocketOpen(function (res) {
          json = {
            cmd: "login_req",
            data: {
              appid: that.data.gizwitsAppId,
              uid: that.data.uid,
              token: that.data.token,
              p0_type: 'attrs_v4',
              heartbeat_interval: that.data.keepalive,
              auto_subscribe: true
            }
          }
          that._sendJson(json);
          wx.onSocketMessage(function (res) {
            var data = JSON.parse(res.data);
            if (data.data.success == true) {
              //  链接socket
              json = {
                cmd: "subscribe_req",
                data: [
                  {
                    did: that.data.did,
                    passcode: 123456
                  },
                ]
              };
              that._sendJson(json);
              //  读取数据
              that.getJSON('c2s_read', that.data.did);
              //  获取服务器返回的信息
              wx.onSocketMessage(function (res) {
                console.log(res);
                var str = JSON.parse(res.data), _sendJson = {};
                console.log(str);
                if (str.cmd === 's2c_noti') {
                  if (e.detail.value == true) {
                    that.setData({ switchButton: true});
                    //  发送数据
                    var option = {
                      did: that.data.did,
                      attrs: {
                        'lang': that.data.switchButton
                      },
                    };
                    that.sendJSON('c2s_write', that.data.did, that.data.switchButton);
                  } else {
                    that.setData({ switchButton: false });
                    //  发送数据
                    var option = {
                      did: that.data.did,
                      attrs: {
                        'lang': that.data.switchButton
                      },
                    };
                    that.someData('c2s_write', option);
                    // that.sendJSON('c2s_write', that.data.did, that.data.switchButton);
                  }
                }
              });
            }
          })
        })
      },
    });
  },

  someData: function (cmd, data) {
    var that = this;
    var json = {
      cmd: cmd,
      data: data,
    };
  },

  getJSON: function (cmd, dids) {
    var that = this;
    //  读取数据
    var json = {
      cmd: cmd,
      data: {
        did: dids
      }
    };
    that._sendJson(json);
  },

  sendJSON: function (cmd, dids, form) {
    var that = this;
    var json = {
      cmd: cmd,
      data: {
        did: dids,
        attrs: {
          "lang": form,
        },
      },
    };
    that._sendJson(json);
  },
  
  /**
  * 发送数据
  */
  _sendJson: function (json) {
    console.log(json);
    var that = this;
    wx.sendSocketMessage({
      //  对象转换字符串
      data: JSON.stringify(json),
      success: function (res) {
        console.log(res);
      },
      fail: function (err) {
        console.log(err);
      },
      complete: function () {

      }
    })
  },

  orderSign: function (e) {
    var that = this;
    // var countdown = 5 * 24 * 3600;
    // // 立即显示还剩五天
    // console.log("还剩余5天0小时0分0秒");
    // // 倒计时
    // var countdownTimer = setInterval(function () {
    //   // 倒计时到零时，停止倒计时
    //   if (countdown <= 0) {
    //     var fId = e.detail.formId;
    //     console.log(e.detail.formId);
    //     var fObj = e.detail.value;
    //     var l = 'https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=' + 'AbLD6HObyWI7JjAfO_bHEdJ47Lmd8fmFrpZmtx5dNnGVCLiLSVHOR2xAXDv6eftq7qyh-_wfkptPWBOsCoSBmJEUVR5tuzy-8QQMKTTinloQVOcAJAAFY';
    //     var d = {
    //       touser: "orlTr0FLJctfgvRE7-mCfRjlEXQc",
    //       template_id: 'lDTHk4E5k9xVGa_vB-ZUKYhwi6pY6gbVkN5jiUzwh_s',//这个是1、申请的模板消息id，  
    //       page: '/pages/smart/smart',
    //       form_id: fId,
    //       value: {//测试完发现竟然value或者data都能成功收到模板消息发送成功通知，是bug还是故意？？【鄙视、鄙视、鄙视...】 下面的keyword*是你1、设置的模板消息的关键词变量  
    //         "keyword1": {
    //           "value": fObj.product,
    //           "color": "#4a4a4a"
    //         },
    //         "keyword2": {
    //           "value": fObj.detail,
    //           "color": "#9b9b9b"
    //         }
    //       },
    //       emphasis_keyword: 'keyword1.DATA'
    //     }
    //     wx.request({
    //       url: l,
    //       data: d,
    //       method: 'POST',
    //       success: function (res) {
    //         console.log("push msg");
    //         console.log(res);
    //         that.setData({ switchButton: true });
    //       },
    //       fail: function (err) {
    //         // fail  
    //         console.log("push err")
    //         console.log(err);
    //       }
    //     });
    //     return clearInterval(countdownTimer);
    //   }
    //   countdown -= 1;
    //   var rest = countdown;
    //   // 天
    //   var days = parseInt(rest / (24 * 3600), 10);
    //   rest -= days * 24 * 3600;
    //   // 时
    //   var hours = parseInt(rest / 3600, 10);
    //   rest -= hours * 3600;
    //   // 分
    //   var minutes = parseInt(rest / 60, 10);
    //   rest -= minutes * 60;
    //   // 秒
    //   var seconds = parseInt(rest, 10);
    //   console.log("还剩余" + days + "天" + hours + "小时" + minutes + "分" + seconds + "秒");
    // }, 1e3);


    var num = 10;
    var start = setInterval(function () {
      num--;
      console.log(num);
      if (num == 0) {
        var fId = e.detail.formId;
        console.log(e.detail.formId);
        var fObj = e.detail.value;
        var l = 'https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=' + 'DpeFQafkptWIRHYQbSA2ZB9POTPXB3wk0-0U68_VQzGI4pKn99STMvhTNUZOdwjqVuKZp6p0gl9eqBp4s141iH5iy4KNbJPPwsBtD5HQptSzu0vI0EMqfhr9FlzVbbX8LEHcAEAFYB';
        var d = {
          touser: "orlTr0FLJctfgvRE7-mCfRjlEXQc",
          template_id: 'lDTHk4E5k9xVGa_vB-ZUKYhwi6pY6gbVkN5jiUzwh_s',//这个是1、申请的模板消息id，  
          page: '/pages/smart/smart',
          form_id: fId,
          value: {//测试完发现竟然value或者data都能成功收到模板消息发送成功通知，是bug还是故意？？【鄙视、鄙视、鄙视...】 下面的keyword*是你1、设置的模板消息的关键词变量  
            "keyword1": {
              "value": 'fObj.product',
              "color": "#4a4a4a"
            },
            "keyword2": {
              "value": 'fObj.detail',
              "color": "#9b9b9b"
            }
          },
          emphasis_keyword: 'keyword1.DATA'
        }
        wx.request({
          url: l,
          data: d,
          method: 'POST',
          success: function (res) {
            console.log("push msg");
            console.log(res);
            that.setData({ switchButton: true });
          },
          fail: function (err) {
            // fail  
            console.log("push err")
            console.log(err);
          }
        });
        clearInterval(start);
      }
    }, 1000);
    
  }

})