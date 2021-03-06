// pages/voice/voice.js

var tools = require('../../utils/util.js');

let c = require('../../utils/common/common.js');

import { $ } from '../../utils/main.js'

var chatListData = [];

let that;

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
    recodePath: '',
    did: '',
    semlist: [],
    array: ['国语', '粤语'],
    index: 0,
    arrayCharset: 'zh',
    scenelist: [],
    input: "用户输入指令...",
    chatList: [],
    scrolltop: 0,
    winHeight: 0,
  },

  onLoad(options) {
    that = this;
    this.setData({
      did: wx.getStorageSync('did')
    });
    if (wx.getStorageSync('Language') == '') {
      wx.setStorageSync('Language', 'zh');
    }
    $.ajax({
      url: 'dev/semlist',
      method: "POST",
    }).then((res) => {
      let arr = [];
      for (let i in res.data) {
        for (let y in res.data[i]) {
          arr.push(res.data[i][y]);
        }
      }
      that.setData({
        semlist: arr,
      });
    });
  },

  onShow() {
    $.getName('title');
    that.setData({
      chatList: wx.getStorageSync('chatList')
    });
    wx.getSystemInfo({
      success(res) {
        that.setData({
          winHeight: res.windowHeight - 150,
        });
      },
    });
    this.getSceneTo();
  },

  getSceneTo() {
    let arr = [], json = {}, that = this;
    let status; // 状态
    if (wx.getStorageSync('sceneArrayMap') !== '') {
      that.setData({
        scenelist: wx.getStorageSync('sceneArrayMap'),
      });
      return false;
    }
    arr.push(0x00, 0x01, 0x40);
    tools.sendData('c2s_write', wx.getStorageSync('did'), {
      'data': $.getArrays(arr),
    });
    $.getSocketResponse((did, res) => {
      if (wx.getStorageSync('did') == did) {
        try {
          let arr = res, arrID = res;
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
                let n = name.concat(doname.concat(last));
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
              }
            }
          }
        } catch (e) {
        }
      }
    });
  },

  startRecode(e) {
    wx.startRecord({
      success(res) {
        var tempFilePath = res.tempFilePath;
        that.setData({ recodePath: tempFilePath, isSpeaking: true });
        $._Toast('录音成功', 'success');
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
    var s = this, sdid = '';
    let semlist = s.data.semlist;
    s.setData({
      voiceNow: false,
      voiceDone: true,
    });
    wx.stopRecord();

    function socketGo(array1, array2) {
      let count = array2.concat(sdid.concat(array1));
      $.sendData(count);
    }

    function ajax(dname, status) {
      $.ajax({
        url: 'dev/editvideo',
        method: 'POST',
        data: {
          dname: dname,
          status: status
        },
      }).then((res) => {
      })
    }

    try {
      setTimeout(() => {
        wx.uploadFile({
          url: c.uploadFileUrl,
          filePath: s.data.recodePath,
          method: "POST",
          name: 'silk',
          header: c.header,
          formData: {
            'lan': wx.getStorageSync('Language'),
          },
          success(res) {
            console.log(res);
            let array1 = [0xA1, 0x01, 0x01];
            let array2 = [0x00, 0x08, 0xA2];
            s.setData({ voiceNow: true });
            if (res.statusCode == 500) {
              wx.showToast({
                title: '服务器错误',
              })
            } else if (res.statusCode == 400) {
              // wx.showToast({
              //   title: '请求错误!',
              // })
              // that.addChat("识别错误", 'l');
            } else if (res.statusCode == 200) {
              // that.addChat("", 'l');
            }
            var error_text = '语音识别失败';
            var options = JSON.parse(res.data), result = null, sqlStr = null, json = {};
            console.log("返回的东西是：", options);
            s.setData({
              ins_y: options.time1,
              ins_l: options.time2,
            });

            let tabArray = wx.getStorageSync('tabArray');
            let spliceArray = wx.getStorageSync('spliceArray');
            let sceneArrayMap = wx.getStorageSync('sceneArrayMap');

            switch (true) {
              case res.data.toString() == error_text:
                $.alert('语音识别失败!请重试!');
                return false;
              case res.statusCode == 404:
                $.alert('服务器搞飞机去了!呜呜呜~~~~');
                return false;
            }

            function senceGo(arr) {
              tools.sendData('c2s_write', wx.getStorageSync('did'), {
                'data': $.getArrays(arr),
              });
            }
            var sqlStr = null;
            for (var i in options.yuyin) {
              sqlStr = options.yuyin[i].replace("，", "");
              that.addChat(sqlStr, 'r');
              $.ajax({
                url: 'dev/findsem',
                method: "POST",
                data: {
                  sem: sqlStr
                },
              }).then((res) => {
                if (res.code == 1) {
                  switch (true) {
                    case res.data.word == "打开":
                    case res.data.word == "开":
                    case res.data.word == "开启":
                    case res.data.word == "着":
                    case res.data.word == "亮":
                    case res.data.word == "光":
                      for (let l in s.data.scenelist) {
                        if ($.IndexDemo(s.data.scenelist[l].scene_name + "情景", sqlStr) == 0 ||
                          $.IndexDemo(s.data.scenelist[l].scene_name + "情景", sqlStr) > 0 ||
                          $.IndexDemo(s.data.scenelist[l].scene_name + "情境", sqlStr) == 0 ||
                          $.IndexDemo(s.data.scenelist[l].scene_name + "情境", sqlStr) > 0) {
                          let byte = $.parse(s.data.scenelist[l].byteName);
                          that.setData({
                            voiceNow: false,
                          })
                          if (byte[14] == 2) {
                            byte[14] += 1;
                          } else if (byte[14] == 0) {
                            byte[14] += 1;
                          }
                          that.setData({
                            input: s.data.voiceIMessage
                          });
                          try {
                            let brr = [0, 18, 0x50];
                            let count = brr.concat(byte);
                            setTimeout(function (res) {
                              tools.sendData('c2s_write', wx.getStorageSync('did'), {
                                'data': $.getArrays(count),
                              });
                              $.getSocketResponse(function (did, data) {
                                that.setData({
                                  voiceNow: true,
                                })
                                if (data[3] == 0) {
                                  that.addChat("打开失败", 'l');
                                  return false;
                                } else if (data[3] == 1) {
                                  that.addChat("打开成功", 'l');
                                  return false;
                                }
                              });

                            }, 1000);
                          } catch (e) { }
                        }
                      }

                      $.getRegion(sqlStr, (id, name) => {
                        $.ajax({
                          url: 'dev/getdev',
                          method: 'POST',
                          data: {
                            rid: id,
                            uid: wx.getStorageSync('wxuser').id,
                          },
                        }).then((res) => {
                          let region = res.data;
                          wx.setStorageSync('region', region);
                          let device = wx.getStorageSync('region');
                          for (let i in region) {
                            sdid = JSON.parse(region[i].did);
                            let count = name + region[i].dname;
                            for (let y in device) {
                              if (device[y].id == region[i].id) {
                                if (sqlStr == name + region[i].dname + "亮一点" || sqlStr == name + region[i].dname + "光一点" || sqlStr == name + region[i].dname + "亮点" || sqlStr == name + region[i].dname + "光点") {
                                  let array1 = [0xA6, 0x01, 0x01, 0x64, 0x00];
                                  let array2 = [0x00, 0x08, 0xA2];
                                  socketGo(array1, array2);
                                  that.setData({
                                    voiceNow: false,
                                  })
                                  $.getSocketResponse((did, data) => {
                                    that.setData({
                                      voiceNow: true,
                                    })
                                    that.addChat("已调成亮度为较光", 'l');
                                  });
                                  break;
                                }
                                if ($.IndexDemo(count, sqlStr) == 0 || $.IndexDemo(count, sqlStr) > 0) {
                                  array1 = [0xA1, 0x01, 0x01];
                                  array2 = [0x00, 0x08, 0xA2];
                                  that.socketGo(sdid, array1, array2);
                                  that.setData({
                                    voiceNow: false,
                                  })
                                  $.getSocketResponse((did, data) => {
                                    $.ajax({
                                      url: 'dev/updatevideo',
                                      method: 'POST',
                                      data: {
                                        dname: device[y].dname,
                                        rid: device[y].rid,
                                        id: device[y].id,
                                        status: "true"
                                      },
                                    }).then(function (res) {
                                    })
                                    that.setData({
                                      voiceNow: true,
                                    })
                                    that.addChat("打开成功", 'l');
                                  });
                                  break;
                                }
                              }
                            }
                          }
                        });
                      });
                      break;

                    case res.data.word == "关闭":
                    case res.data.word == "关":
                    case res.data.word == "暗":
                    case res.data.word == "关闭测试情景":

                      for (let l in s.data.scenelist) {
                        if ($.IndexDemo(s.data.scenelist[l].scene_name + "情景", sqlStr) == 0 ||
                          $.IndexDemo(s.data.scenelist[l].scene_name + "情景", sqlStr) > 0 ||
                          $.IndexDemo(s.data.scenelist[l].scene_name + "情境", sqlStr) == 0 ||
                          $.IndexDemo(s.data.scenelist[l].scene_name + "情境", sqlStr) > 0) {
                          let byte = $.parse(s.data.scenelist[l].byteName);
                          that.setData({
                            voiceNow: true,
                          })
                          if (byte[14] == 3) {
                            byte[14] -= 1;
                          } else if (byte[14] == 1) {
                            byte[14] -= 1;
                          }
                          that.setData({
                            input: s.data.voiceIMessage
                          });
                          try {
                            let brr = [0, 18, 0x50];
                            let count = brr.concat(byte);
                            setTimeout((res) => {
                              senceGo(count);
                              $.getSocketResponse((did, data) => {
                                if (data[3] == 1) {
                                  that.addChat("关闭成功", 'l');
                                  return false;
                                }
                              });
                            }, 1000);
                          } catch (e) { }
                        }
                      }

                      $.getRegion(sqlStr, (id, name) => {
                        $.ajax({
                          url: 'dev/getdev',
                          method: 'POST',
                          data: {
                            rid: id,
                            uid: wx.getStorageSync('wxuser').id,
                          },
                        }).then((res) => {
                          let region = res.data;
                          wx.setStorageSync('region', region);
                          let device = wx.getStorageSync('region');
                          for (let i in region) {
                            sdid = JSON.parse(region[i].did);
                            let count = name + region[i].dname;
                            for (let y in device) {
                              if (device[y].id == region[i].id) {
                                if (sqlStr == name + region[i].dname + "暗一点" || sqlStr == name + region[i].dname + "暗点") {
                                  array1 = [0xA6, 0x01, 0x00, 0x10, 0x00];
                                  array2 = [0x00, 0x08, 0xA2];
                                  count = array2.concat(sdid.concat(array1));
                                  tools.sendData('c2s_write', wx.getStorageSync('did'), {
                                    'data': $.getArrays(array2.concat(sdid.concat(array1))),
                                  });
                                  that.setData({
                                    voiceNow: false,
                                  })
                                  $.getSocketResponse((did, data) => {
                                    that.setData({
                                      voiceNow: true,
                                    })
                                    that.addChat("已调成亮度为较暗", 'l');
                                  });
                                  break;
                                }
                                if ($.IndexDemo(count, sqlStr) == 0 || $.IndexDemo(count, sqlStr) > 0) {
                                  array1 = [0xA1, 0x01, 0x00];
                                  array2 = [0x00, 0x08, 0xA2];
                                  count = array2.concat(sdid.concat(array1));
                                  tools.sendData('c2s_write', wx.getStorageSync('did'), {
                                    'data': $.getArrays(array2.concat(sdid.concat(array1))),
                                  });
                                  $.ajax({
                                    url: 'dev/updatevideo',
                                    method: 'POST',
                                    data: {
                                      dname: device[i].dname,
                                      id: device[i].id,
                                      rid: device[i].rid,
                                      status: "false"
                                    },
                                  }).then((res) => {
                                    $.alert('关闭成功!');
                                  })
                                  $.getSocketResponse((did, data) => {
                                    s.setData({
                                      voiceNow: true,
                                    });
                                    that.addChat("关闭成功", 'l');
                                  })
                                  break;
                                }
                              }
                            }
                          }
                        });
                      });
                      break;
                    default:
                      that.addChat("识别错误", 'l');
                  }
                } else if (res.code == 0) {
                  wx.showModal({
                    title: '警告!',
                    content: '还没有这条语义,请到后台增加!',
                    showCancel: false,
                  })
                  that.addChat("还没有这条语义,请到后台增加!", 'l');
                }
              });
            }

          },
          fail(res) {
            s.setData({
              voiceNow: true,
              voiceDone: true,
              voiceOpen: true
            });
            //  错误提示
            wx.showModal({
              title: '提示',
              content: '录音的姿势不对!',
              showCancel: false,
            })
            wx.hideToast();
          }
        });
      }, 1000)
    } catch (e) { }

  },

  blurMessage(e) {
    that.setData({
      voiceIMessage: e.detail.value
    });
  },

  getScene() {
    let arr = [], json = {};
    arr.push(0x00, 0x01, 0x40);
    tools.sendData('c2s_write', that.data.did, {
      'data': $.getArrays(arr),
    });
    $.getSocketResponse(function (did, data) {
      that.data.arrays = data.splice(4, 18);
      let arraysName = that.data.arrays;
      that.setData({
        arrays: that.data.arrays
      });
      let a = arraysName.splice(1, 3);
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

  webScene(arrays1, arrays2) {
    let count = null, json = {};
    count = arrays1.concat(arrays2);
    tools.sendData('c2s_write', that.data.did, {
      'data': $.getArrays(count),
    });
    $.getSocketResponse(function (did, data) {
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

  socketGo(sdid, array1, array2) {
    let count = '';
    count = array2.concat(sdid.concat(array1));
    $.sendData(count);
  },

  saveIMessage(e) {
    let word = e.detail.value.ask_word ? e.detail.value.ask_word : e.detail.value;
    let json = {};
    let arr = [], brr = [], list = [], sdid = null;
    let rid = null;
    let con = word; //  that.data.voiceIMessage;

    if (con == '') {
      wx.showToast({
        title: '请输入指令!',
        duration: 2000
      })
      return false;
    }

    let array1 = [0xA1, 0x01, 0x01];
    let array2 = [0x00, 0x08, 0xA2];
    let count = '';
    let numbers = 1;

    function socketGo(array1, array2) {
      count = array2.concat(sdid.concat(array1));
      $.sendData(count);
    }

    let tabArray = wx.getStorageSync('tabArray');
    let spliceArray = wx.getStorageSync('spliceArray');

    let semlist = that.data.semlist;
    let sceneArrayMap = wx.getStorageSync('sceneArrayMap');

    $.ajax({
      url: 'dev/findsem',
      method: "POST",
      data: {
        sem: con
      },
    }).then((res) => {
      if (res.code == 1) {
        switch (true) {
          case res.data.word == "打开":
          case res.data.word == "开":
          case res.data.word == "开启":
          case res.data.word == "着":
          case res.data.word == "光":
          case res.data.word == "亮":
            that.addChat(con, 'r');
            for (let l in that.data.scenelist) {
              if ($.IndexDemo(that.data.scenelist[l].scene_name + "情景", con) == 0 ||
                $.IndexDemo(that.data.scenelist[l].scene_name + "情景", con) > 0 ||
                $.IndexDemo(that.data.scenelist[l].scene_name + "情境", con) == 0 ||
                $.IndexDemo(that.data.scenelist[l].scene_name + "情境", con) > 0) {
                let byte = $.parse(that.data.scenelist[l].byteName);
                that.setData({
                  voiceNow: false,
                })
                if (byte[14] == 2) {
                  byte[14] += 1;
                } else if (byte[14] == 0) {
                  byte[14] += 1;
                }
                try {
                  let brr = [0, 18, 0x50];
                  let count = brr.concat(byte);
                  that.setData({
                    input: that.data.voiceIMessage
                  });
                  setTimeout((res) => {
                    tools.sendData('c2s_write', wx.getStorageSync('did'), {
                      'data': $.getArrays(count),
                    });
                    $.getSocketResponse((did, data) => {
                      that.setData({
                        voiceNow: true,
                      })
                      if (data[3] == 0) {
                        that.addChat("识别失败", 'l');
                        return false;
                      } else if (data[3] == 1) {
                        that.addChat("打开成功", 'l');
                        return false;
                      }
                    });
                  }, 1000);
                  return false;
                } catch (e) { }
              }
            }

            $.getRegion(con, (id, name) => {
              $.ajax({
                url: 'dev/getdev',
                method: 'POST',
                data: {
                  rid: id,
                  uid: wx.getStorageSync('wxuser').id,
                },
              }).then((res) => {
                let region = res.data;
                wx.setStorageSync('region', region);
                let device = wx.getStorageSync('region');
                for (let i in region) {
                  let count = name + region[i].dname;
                  sdid = JSON.parse(region[i].did);
                  for (let y in device) {
                    if (device[y].id == region[i].id) {
                      if (con == name + region[i].dname + "亮一点" || 
                      con == name + region[i].dname + "光一点" || 
                      con == name + region[i].dname + "亮点" || 
                      con == name + region[i].dname + "光点") {
                        let array1 = [0xA6, 0x01, 0x01, 0x64, 0x00];
                        let array2 = [0x00, 0x08, 0xA2];
                        that.socketGo(sdid, array1, array2);
                        that.setData({
                          voiceNow: false,
                        })
                        $.getSocketResponse((did, data) => {
                          that.setData({
                            voiceNow: true,
                          })
                          that.addChat("已调成亮度为较亮", 'l');
                        });
                        break;
                      }
                      if ($.IndexDemo(count, con) == 0 || $.IndexDemo(count, con) > 0) {
                        console.log(123123);
                        array1 = [0xA1, 0x01, 0x01];
                        array2 = [0x00, 0x08, 0xA2];
                        that.socketGo(sdid, array1, array2);
                        that.setData({
                          voiceNow: false,
                        })
                        $.getSocketResponse((did, data) => {
                          $.ajax({
                            url: 'dev/updatevideo',
                            method: 'POST',
                            data: {
                              dname: device[y].dname,
                              rid: device[y].rid,
                              id: device[y].id,
                              status: "true"
                            },
                          }).then(function (res) {
                          })
                          that.setData({
                            voiceNow: true,
                          })
                          that.addChat("打开成功", 'l');
                        });
                        break;
                      }
                    }
                  }

                }
              });
            });
            break;
          case res.data.word == "关闭":
          case res.data.word == "关":
          case res.data.word == "暗":
          case res.data.word == "关闭测试情景":
            that.addChat(con, 'r');
            for (let l in that.data.scenelist) {
              if ($.IndexDemo(that.data.scenelist[l].scene_name + "情景", con) == 0 ||
                $.IndexDemo(that.data.scenelist[l].scene_name + "情景", con) > 0 ||
                $.IndexDemo(that.data.scenelist[l].scene_name + "情境", con) == 0 ||
                $.IndexDemo(that.data.scenelist[l].scene_name + "情境", con) > 0) {

                let byte = $.parse(that.data.scenelist[l].byteName);
                that.setData({
                  voiceNow: false,
                })
                if (byte[14] == 3) {
                  byte[14] -= 1;
                } else if (byte[14] == 1) {
                  byte[14] -= 1;
                }
                that.setData({
                  input: that.data.voiceIMessage
                });
                try {
                  let brr = [0, 18, 0x50];
                  let count = brr.concat(byte);
                  setTimeout((res) => {
                    tools.sendData('c2s_write', wx.getStorageSync('did'), {
                      'data': $.getArrays(count),
                    });
                    $.getSocketResponse((did, data) => {
                      that.setData({
                        voiceNow: true,
                      })
                      if (data[3] == 1) {
                        that.addChat("关闭成功", 'l');
                        return false;
                      }
                    });
                  }, 1000);
                  return false;
                } catch (e) { }
              }
            }

            $.getRegion(con, (id, name) => {
              $.ajax({
                url: 'dev/getdev',
                method: 'POST',
                data: {
                  rid: id,
                  uid: wx.getStorageSync('wxuser').id,
                },
              }).then((res) => {
                let region = res.data;
                wx.setStorageSync('region', region);
                let device = wx.getStorageSync('region');
                for (let i in region) {
                  let close = "关闭" + name + region[i].dname;
                  let count = name + region[i].dname;
                  sdid = JSON.parse(region[i].did);
                  for (let y in device) {
                    if (device[y].id == region[i].id) {
                      if (con == name + region[i].dname + "暗一点" || con == name + region[i].dname + "暗点") {
                        console.log(1231231223);
                        let array3 = [0xA6, 0x01, 0x00, 0x10, 0x00];
                        let array4 = [0x00, 0x08, 0xA2];
                        socketGo(array3, array4);
                        that.setData({
                          voiceNow: false,
                          voiceDone: true
                        })
                        $.getSocketResponse((did, data) => {
                          that.setData({
                            voiceNow: true,
                          })
                          that.addChat("已调成亮度为较暗", 'l');
                        });
                        break;
                      }
                      if ($.IndexDemo(count, con) == 0 || $.IndexDemo(count, con) > 0) {
                        array1 = [0xA1, 0x01, 0x00];
                        array2 = [0x00, 0x08, 0xA2];
                        that.socketGo(sdid, array1, array2);
                        that.setData({
                          voiceNow: false,
                        })
                        $.getSocketResponse((did, data) => {
                          $.ajax({
                            url: 'dev/updatevideo',
                            method: 'POST',
                            data: {
                              dname: device[y].dname,
                              rid: device[y].rid,
                              id: device[y].id,
                              status: "false"
                            },
                          }).then(function (res) {
                            console.log(res);
                          })
                          that.setData({
                            voiceNow: true,
                          })
                        });
                        that.addChat("关闭成功", 'l');
                        break;
                      }
                    }
                  }
                }
              });
            });
            break;
        }
      } else if (res.code == 0) {
        wx.showModal({
          title: '警告!',
          content: '还没有这条语义,请到后台增加!',
          showCancel: false,
        })
      }
    });

    that.setData({
      voiceIMessage: ""
    });

  },

  bindPickerChange(e) {
    that.setData({
      index: e.detail.value
    });
    if (that.data.index == 0) {
      that.setData({
        arrayCharset: 'zh', //  国语
      });
    } else if (that.data.index == 1) {
      that.setData({
        arrayCharset: 'ct',// 粤语
      });
    }
  },

  addChat(word, orientation) {
    let ch = {
      'text': word,
      'time': new Date().getTime(),
      'orientation': orientation
    };
    chatListData.push(ch);
    wx.setStorageSync('chatList', chatListData);
    var charlenght = chatListData.length;
    that.setData({
      chatList: chatListData,
      scrolltop: "roll" + charlenght
    });
  },

})