// pages/voice/voice.js

var tools = require('../../utils/util.js');

import { $ } from '../../utils/main.js'

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
    voiceIMessage: '打开房间智能灯',
    sceneName: [],
    arrays: [],
    voices: [],
    recodePath: '',
    headers: {
      'content-type': 'application/json',
      'content-type': 'application/x-www-form-urlencoded'
    },
    did: '',
    uploadFileUrl: 'http://yuyin.ittun.com/public/index/dev/zhen',
    saveDisabled: false,
    semlist: [],

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this;
    this.setData({
      did: wx.getStorageSync('did')
    });
    $.ajax({
      url: 'dev/semlist',
      method: "POST",
    }).then((res) => {
      that.setData({
        semlist: res.data,
      });

    });
    // this.getScene();
  },

  startRecode(e) {
    var that = this;
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
    s.setData({ voiceNow: false });
    wx.stopRecord();
    s.setData({ isSpeaking: false });
    wx.showToast();

    function socketGo(array1, array2) {
      let count = array2.concat(sdid.concat(array1));
      json = {
        'data': $.getArrays(count),
      };
      tools.sendData('c2s_write', that.data.did, json);
      $.getSocketResponse(function (did, data) {
        console.log(data);
      })
    }

    function ajax(dname, status) {
      $.ajax({
        url: 'dev/editvideo',
        method: 'POST',
        data: {
          dname: dname,
          status: status
        },
      }).then(function (res) {
        console.log(res)
      })
    }

    try {
      setTimeout(function () {
        wx.uploadFile({
          url: s.data.uploadFileUrl,
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
            let array1 = [0xA1, 0x01, 0x01];
            let array2 = [0x00, 0x08, 0xA2];
            s.setData({ voiceNow: true });
            var error_text = '语音识别失败';
            console.log("返回的东西是：", JSON.parse(res.data), "options...");
            var options = JSON.parse(res.data), result = null, sqlStr = null, json = {};

            s.setData({
              ins_y: options.time1,
              ins_l: options.time2,
            });

            function IndexDemo(str1, str2) {
              var s = str2.indexOf(str1);
              return s;
            }

            let tabArray = wx.getStorageSync('tabArray');
            let spliceArray = wx.getStorageSync('spliceArray');

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

            for (var i in options.yuyin) {
              var sqlStr = options.yuyin[i];
              if (IndexDemo("打开情景", sqlStr) == 0 || IndexDemo("打开情景", sqlStr) > 0) {
                console.log(IndexDemo("打开情景", sqlStr));
                let arr = [0x00, 0x01, 0x40];
                senceGo(arr);
                $.getSocketResponse(function (did, data) {
                  try {
                    let arrays = [];
                    let list = arrays.concat(data.splice(4, 18));
                    let brr = [0, 18, 0x50];
                    let count = brr.concat(list);
                    for (let g in count) {
                      if (g == 20) {
                        count[g] = count[g] + 1
                      }
                    }
                    setTimeout(function (res) {
                      tools.sendData('c2s_write', wx.getStorageSync('did'), {
                        'data': $.getArrays(count),
                      });
                      $.getSocketResponse(function (did, data) {
                        if (data[3] == 0) {
                          return false;
                        } else if (data[3] == 1) {
                          wx.showModal({
                            title: '恭喜！',
                            content: '控制成功!',
                            showCancel: false,
                          })
                        }
                      });
                    }, 1000);
                  } catch (e) { }
                })
              } else if (IndexDemo("关闭情景", sqlStr) == 0 || IndexDemo("关闭情景", sqlStr) > 0) {
                console.log(IndexDemo("关闭情景", sqlStr), "关闭！");
                let arr = [0x00, 0x01, 0x40];
                senceGo(arr);
                $.getSocketResponse(function (did, data) {
                  try {
                    let arrays = [];
                    let list = arrays.concat(data.splice(4, 18));
                    let brr = [0, 18, 0x50];
                    let count = brr.concat(list);
                    for (let g in count) {
                      if (g == 20) {
                        count[g] = count[g] + 1
                      }
                    }
                    setTimeout(function (res) {
                      tools.sendData('c2s_write', wx.getStorageSync('did'), {
                        'data': $.getArrays(count),
                      });
                      $.getSocketResponse(function (did, data) {
                        if (data[3] == 0) {
                          return false;
                        } else if (data[3] == 1) {
                          wx.showModal({
                            title: '恭喜！',
                            content: '控制成功!',
                            showCancel: false,
                          })
                        }
                      });
                    }, 1000);
                  } catch (e) { }
                })
              }

              function getRegion(content, callback) {
                $.ajax({
                  url: 'dev/getregion',
                  method: 'POST',
                  data: {
                    uid: wx.getStorageSync('wxuser').id,
                  },
                }).then(function (res) {
                  for (let i in res.data) {
                    if (IndexDemo(res.data[i].name, content) > 0 || IndexDemo(res.data[i].name, content) == 0) {
                      let rid = res.data[i].id
                      callback(rid, res.data[i].name)
                    }
                  }
                });
              }
              for (let k in semlist) {
                if (semlist[k].word == con) {

                  getRegion(sqlStr, function (id, name) {
                    $.ajax({
                      url: 'dev/getdev',
                      method: 'POST',
                      data: {
                        rid: id,
                        uid: wx.getStorageSync('wxuser').id,
                      },
                    }).then(function (res) {
                      let getdev = res.data, count = '';
                      for (let i in getdev) {
                        if (getdev[i].rid == id) {
                          sdid = JSON.parse(getdev[i].did);
                          let open = '打开' + name + getdev[i].dname;
                          let close = '关闭' + name + getdev[i].dname;
                          if (IndexDemo(open, sqlStr) == 0 || IndexDemo(open, sqlStr) > 0) {
                            array1 = [0xA1, 0x01, 0x01];
                            array2 = [0x00, 0x08, 0xA2];
                            $.ajax({
                              url: 'dev/updatevideo',
                              method: 'POST',
                              data: {
                                dname: getdev[i].dname,
                                id: getdev[i].id,
                                rid: getdev[i].rid,
                                status: "true"
                              },
                            }).then(function (res) {
                              $.alert('打开成功!');
                            })
                            s.setData({
                              openMessage: sqlStr,
                            });
                            // s.setData({
                            //   voiceOpen: false,
                            //   voiceDone: true,
                            // })
                            count = array2.concat(sdid.concat(array1));
                            tools.sendData('c2s_write', wx.getStorageSync('did'), {
                              'data': $.getArrays(array2.concat(sdid.concat(array1))),
                            });
                            $.getSocketResponse(function (did, data) {
                              console.log(data);
                            })
                            // socketGo(array1, array2);
                            return false;
                          } else if (IndexDemo(close, sqlStr) == 0 || IndexDemo(close, sqlStr) > 0) {
                            console.log(2);
                            array1 = [0xA1, 0x01, 0x00];
                            array2 = [0x00, 0x08, 0xA2];
                            $.ajax({
                              url: 'dev/updatevideo',
                              method: 'POST',
                              data: {
                                dname: getdev[i].dname,
                                id: getdev[i].id,
                                rid: getdev[i].rid,
                                status: "false"
                              },
                            }).then(function (res) {
                              $.alert('关闭成功!');
                            })
                            // s.setData({
                            //   voiceOpen: true,
                            //   voiceDone: false,
                            // })
                            count = array2.concat(sdid.concat(array1));
                            tools.sendData('c2s_write', wx.getStorageSync('did'), {
                              'data': $.getArrays(array2.concat(sdid.concat(array1))),
                            });
                            $.getSocketResponse(function (did, data) {
                              console.log(data);
                            })
                            // socketGo(array1, array2);
                            $.getSocketResponse(function (did, data) {
                              console.log(data);
                            })
                            return false;
                          }
                        }
                      }
                    });
                  })

                }
              }

              if (typeof (sqlStr) == "string") {
                var myString = sqlStr.substring(0, 1);
              }

            }
            // if (data.states == 1) {
            //   var cEditData = s.data.editData;
            //   cEditData.recodeIdentity = data.identitys;
            //   s.setData({ editData: cEditData });
            // } else {
            //   $._goShowModel('提示', data.message, function() { });
            // }
            // wx.hideToast();
          },
          fail(res) {
            s.setData({ voiceNow: true });
            //  错误提示
            $._goShowModel('提示', '录音的姿势不对!', function () { });
            wx.hideToast();
          }
        });
      }, 1000)
    } catch (e) { }

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
      'data': $.getArrays(arr),
    };
    tools.sendData('c2s_write', that.data.did, json);
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
    json = {
      'data': $.getArrays(count),
    };
    tools.sendData('c2s_write', that.data.did, json);
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

  saveIMessage(e) {
    let that = this, json = {};
    let arr = [], brr = [], list = [], sdid = null;
    let rid = null;
    let con = that.data.voiceIMessage;

    function IndexDemo(str1, str2) {
      var s = str2.indexOf(str1);
      return s;
    }

    let array1 = [0xA1, 0x01, 0x01];
    let array2 = [0x00, 0x08, 0xA2];
    let count = '';

    function socketGo(array1, array2) {
      count = array2.concat(sdid.concat(array1));
      tools.sendData('c2s_write', wx.getStorageSync('did'), {
        'data': $.getArrays(count),
      });
    }

    let tabArray = wx.getStorageSync('tabArray');
    let spliceArray = wx.getStorageSync('spliceArray');

    let semlist = that.data.semlist;
    console.log(semlist);

    if (IndexDemo("执行打开情景", con) == 0 || IndexDemo("执行打开情景", con) > 0) {
      let arr = [0x00, 0x01, 0x40];
      tools.sendData('c2s_write', wx.getStorageSync('did'), {
        'data': $.getArrays(arr),
      });
      $.getSocketResponse(function (did, data) {
        try {
          let arrays = [];
          let list = arrays.concat(data.splice(4, 18));
          let brr = [0, 18, 0x50];
          let count = brr.concat(list);
          for (let i in count) {
            if (i == 20) {
              count[i] = count[i] + 1
            }
          }
          setTimeout(function (res) {
            tools.sendData('c2s_write', wx.getStorageSync('did'), {
              'data': $.getArrays(count),
            });
            $.getSocketResponse(function (did, data) {
              if (data[3] == 0) {
                return false;
              } else if (data[3] == 1) {
                wx.showModal({
                  title: '恭喜！',
                  content: '控制成功!',
                  showCancel: false,
                })
                return false;
              }
            });
          }, 1000);
          return false;
        } catch (e) { }
      })
    } else if (IndexDemo("执行关闭情景", con) == 0 || IndexDemo("执行关闭情景", con) > 0) {
      let arr = [0x00, 0x01, 0x40];
      tools.sendData('c2s_write', wx.getStorageSync('did'), {
        'data': $.getArrays(arr),
      });
      $.getSocketResponse(function (did, data) {
        try {
          let arrays = [];
          let list = arrays.concat(data.splice(4, 18));
          let brr = [0, 18, 0x50];
          let count = brr.concat(list);
          for (let i in count) {
            if (i == 20) {
              count[i] = count[i] - 1
              if (count[i] == -1) {
                count[i] = 0;
              }
            }
          }
          setTimeout(function (res) {
            tools.sendData('c2s_write', wx.getStorageSync('did'), {
              'data': $.getArrays(count),
            });
            $.getSocketResponse(function (did, data) {
              if (data[3] == 0) {
                return false;
              } else if (data[3] == 1) {
                wx.showModal({
                  title: '恭喜！',
                  content: '控制成功!',
                  showCancel: false,
                })
                return false;
              }
            });
          }, 1000);
          return false;
        } catch (e) { }
      })
    }

    function getRegion(content, callback) {
      $.ajax({
        url: 'dev/getregion',
        method: 'POST',
        data: {
          uid: wx.getStorageSync('wxuser').id,
        },
      }).then((res) => {
        for (let i in res.data) {
          if (res.data[i].pid == wx.getStorageSync('did')) {
            if (IndexDemo(res.data[i].name, content) == 0 || IndexDemo(res.data[i].name, content) > 0) {
              console.log(123);
              let rid = res.data[i].id;
              callback(rid, res.data[i].name)
            }
          }
        }
      });
    }

    // let getregionList = wx.getStorageSync('tabArray');

    for (let i in semlist) {
      if (semlist[i].word == con) {
        getRegion(con, function (id, name) {
          $.ajax({
            url: 'dev/getdev',
            method: 'POST',
            data: {
              rid: id,
              uid: wx.getStorageSync('wxuser').id,
            },
          }).then(function (res) {
            let region = res.data;
            wx.setStorageSync('region', region);
            let device = wx.getStorageSync('region');
            for (let i in region) {
              let open = "打开" + name + region[i].dname;
              let close = "关闭" + name + region[i].dname;
              let allOpen = '打开' + name, allClose = '关闭' + name;
              sdid = JSON.parse(region[i].did);
              for (let y in device) {
                if (device[y].id == region[i].id) {
                  if (IndexDemo(open, con) == 0 || IndexDemo(open, con) > 0) {
                    array1 = [0xA1, 0x01, 0x01];
                    array2 = [0x00, 0x08, 0xA2];

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
                      // $.alert('打开成功!');
                      that.setData({
                        saveDisabled: true,
                      });
                    })
                    that.setData({
                      openMessage: that.data.voiceIMessage,
                    });
                    // that.setData({
                    //   voiceOpen: false,
                    //   voiceDone: true,
                    // })
                    socketGo(array1, array2);
                    // setTimeout(function() {
                    //   that.setData({
                    //     saveDisabled: false,
                    //   });
                    // }, 5000)
                    that.onShow();
                    return false;
                  } else if (IndexDemo(close, con) == 0 || IndexDemo(close, con) > 0) {
                    array1 = [0xA1, 0x01, 0x00];
                    array2 = [0x00, 0x08, 0xA2];
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
                      // $.alert('关闭成功!');
                      that.setData({
                        saveDisabled: true,
                      });
                    })
                    that.setData({
                      openMessage: that.data.voiceIMessage,
                    });
                    // that.setData({
                    //   voiceOpen: false,
                    //   voiceDone: true,
                    // })
                    socketGo(array1, array2);
                    // setTimeout(function () {
                    //   that.setData({
                    //     saveDisabled: false,
                    //   });
                    // }, 5000)
                    return false;
                  }
                }
              }
            }
          });
        });

        // if (con == '打开房间智能灯') {
        //   console.log(1);
        // } else if (con == '关闭房间智能灯') {
        //   console.log(2);
        // }
      }
    }
    
  }

})