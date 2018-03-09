// pages/voice/voice.js

var tools = require('../../utils/util.js');
let c = require('../../utils/common/common.js');

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
    voiceIMessage: '关闭测试情景',
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
    input: "用户输入指令..."
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
      let arr = [];
      for (let i in res.data) {
        for (let y in res.data[i]) {
          arr.push(res.data[i][y]);
        }
      }
      that.setData({
        semlist: arr
      });
    });
    if (wx.getStorageSync('Language') == '') {
      wx.setStorageSync('Language', 'zh');
    }

    $.ajax({
      url: 'Scene/getScene',
      method: 'POST',
      data: {
      },
    }).then((res) => {
      that.setData({
        scenelist: res.data,
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
    wx.showToast();

    function socketGo(array1, array2) {
      let count = array2.concat(sdid.concat(array1));
      $.sendData(count);
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
          url: c.uploadFileUrl,
          filePath: s.data.recodePath,
          method: "POST",
          name: 'silk',
          header: c.header,
          formData: {
            'lan': wx.getStorageSync('Language'),
          },
          success(res) {
            let array1 = [0xA1, 0x01, 0x01];
            let array2 = [0x00, 0x08, 0xA2];
            s.setData({ voiceNow: true });
            var error_text = '语音识别失败';
            var options = JSON.parse(res.data), result = null, sqlStr = null, json = {};
            console.log("返回的东西是：", options);

            s.setData({
              ins_y: options.time1,
              ins_l: options.time2,
            });

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
              var sqlStr = null;
              sqlStr = options.yuyin[i].replace("，", "");
              for (let l in scenelist) {
                if ($.IndexDemo("打开" + that.data.scenelist[l].scene_name + "情景", con) == 0 || $.IndexDemo("打开" + that.data.scenelist[l].scene_name + "情景", con) > 0) {
                  let byte = $.parse(that.data.scenelist[l].byteName);
                  if (byte[14] == 2) {
                    byte[14] += 1;
                  } else if (byte[14] == 0) {
                    byte[14] += 1;
                  }
                  that.setData({
                    input: that.data.voiceIMessage
                  });
                  try {
                    let brr = [0, 18, 0x50];
                    let count = brr.concat(byte);
                    setTimeout(function (res) {
                      senceGo(count);
                      $.getSocketResponse(function (did, data) {
                        if (data[3] == 0) {
                          that.setData({
                            voiceOpen: false,
                            openMessage: '打开失败!'
                          });
                          return false;
                        } else if (data[3] == 1) {
                          that.setData({
                            voiceOpen: false,
                            openMessage: '打开成功!'
                          });
                          return false;
                        }
                      });
                    }, 1000);
                  } catch (e) { }
                } else if ($.IndexDemo("关闭" + that.data.scenelist[l].scene_name + "情景", sqlStr) == 0 || $.IndexDemo("关闭" + that.data.scenelist[l].scene_name + "情景", sqlStr) > 0) {
                  let byte = $.parse(that.data.scenelist[l].byteName);
                  if (byte[14] == 2) {
                    byte[14] += 1;
                  } else if (byte[14] == 0) {
                    byte[14] += 1;
                  }
                  that.setData({
                    input: that.data.voiceIMessage
                  });
                  try {
                    let brr = [0, 18, 0x50];
                    let count = brr.concat(byte);
                    setTimeout(function (res) {
                      senceGo(count);
                      $.getSocketResponse(function (did, data) {
                         if (data[3] == 1) {
                          that.setData({
                            voiceOpen: false,
                            openMessage: '关闭成功!'
                          });
                          return false;
                        }
                      });
                    }, 1000);
                  } catch (e) { }
                }
              }
              let semlist = s.data.semlist;

              for (let k in semlist) {
                if (semlist[k].word == sqlStr) {

                  $.getRegion(sqlStr, function (id, name) {
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
                          if ($.IndexDemo(open, sqlStr) == 0 || $.IndexDemo(open, sqlStr) > 0) {
                            array1 = [0xA1, 0x01, 0x01];
                            array2 = [0x00, 0x08, 0xA2];
                            // socketGo(array1, array2);
                            count = array2.concat(sdid.concat(array1));
                            tools.sendData('c2s_write', wx.getStorageSync('did'), {
                              'data': $.getArrays(array2.concat(sdid.concat(array1))),
                            });
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

                            $.getSocketResponse(function (did, data) {
                              s.setData({
                                openMessage: sqlStr,
                                voiceOpen: false,
                              });
                            })
                            return false;
                          } else if ($.IndexDemo(close, sqlStr) == 0 || $.IndexDemo(close, sqlStr) > 0) {
                            array1 = [0xA1, 0x01, 0x00];
                            array2 = [0x00, 0x08, 0xA2];
                            // socketGo(array1, array2);
                            count = array2.concat(sdid.concat(array1));
                            tools.sendData('c2s_write', wx.getStorageSync('did'), {
                              'data': $.getArrays(array2.concat(sdid.concat(array1))),
                            });
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

                            $.getSocketResponse(function (did, data) {
                              s.setData({
                                openMessage: sqlStr,
                                voiceOpen: false,
                              });
                            })
                            return false;
                          }
                        }
                      }
                    });
                  })

                }
              }

              for (let i in semlist) {
                if (semlist[i].word !== con) {
                  wx.showModal({
                    title: '警告!',
                    content: '暂时没有这条语义!',
                    showCancel: false,
                  })
                  return false;
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

  saveIMessage(e) {
    let that = this, json = {};
    let arr = [], brr = [], list = [], sdid = null;
    let rid = null;
    let con = that.data.voiceIMessage;

    let array1 = [0xA1, 0x01, 0x01];
    let array2 = [0x00, 0x08, 0xA2];
    let count = '';

    function socketGo(array1, array2) {
      count = array2.concat(sdid.concat(array1));
      $.sendData(count);
    }

    let tabArray = wx.getStorageSync('tabArray');
    let spliceArray = wx.getStorageSync('spliceArray');

    let semlist = that.data.semlist;


    for (let l in that.data.scenelist) {
      if ($.IndexDemo("打开" + that.data.scenelist[l].scene_name + "情景", con) == 0 || $.IndexDemo("打开" + that.data.scenelist[l].scene_name + "情景", con) > 0) {
        let byte = $.parse(that.data.scenelist[l].byteName);
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
          setTimeout(function (res) {
            tools.sendData('c2s_write', wx.getStorageSync('did'), {
              'data': $.getArrays(count),
            });
            $.getSocketResponse(function (did, data) {
              if (data[3] == 0) {
                that.setData({
                  voiceOpen: false,
                  openMessage: '打开失败!'
                });
                return false;
              } else if (data[3] == 1) {
                that.setData({
                  voiceOpen: false,
                  openMessage: '打开成功!'
                });
                return false;
              }
            });
          }, 1000);
          return false;
        } catch (e) { }
      } else if ($.IndexDemo("关闭" + that.data.scenelist[l].scene_name + "情景", con) == 0
        || $.IndexDemo("关闭" + that.data.scenelist[l].scene_name + "情景", con) > 0) {
        let byte = $.parse(that.data.scenelist[l].byteName);
        if (name[14] == 3) {
          name[14] -= 1;
        } else if (name[14] == 1) {
          name[14] -= 1;
        }
        that.setData({
          input: that.data.voiceIMessage
        });
        try {
          let brr = [0, 18, 0x50];
          let count = brr.concat(byte);
          setTimeout(function (res) {
            tools.sendData('c2s_write', wx.getStorageSync('did'), {
              'data': $.getArrays(count),
            });
            $.getSocketResponse(function (did, data) {
              if (data[3] == 1) {
                that.setData({
                  voiceOpen: false,
                  openMessage: '关闭成功!'
                });
                return false;
              }
            });
          }, 1000);
          return false;
        } catch (e) { }
      }
    }

    for (let i in that.data.semlist) {
      if (that.data.semlist[i].word == con) {
        $.getRegion(con, function (id, name) {
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
                  if ($.IndexDemo(open, con) == 0 || $.IndexDemo(open, con) > 0) {
                    array1 = [0xA1, 0x01, 0x01];
                    array2 = [0x00, 0x08, 0xA2];
                    socketGo(array1, array2);
                    that.setData({
                      voiceNow: false,
                    })
                    $.getSocketResponse((did, data) => {
                      that.setData({
                        voiceNow: true,
                      })

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
                      })
                      that.setData({
                        openMessage: that.data.voiceIMessage,
                        voiceOpen: false,
                      });

                    });

                    that.onShow();
                    return false;
                  } else if ($.IndexDemo(close, con) == 0 || $.IndexDemo(close, con) > 0) {
                    array1 = [0xA1, 0x01, 0x00];
                    array2 = [0x00, 0x08, 0xA2];
                    socketGo(array1, array2);
                    that.setData({
                      voiceNow: false,
                    })
                    $.getSocketResponse((did, data) => {
                      that.setData({
                        voiceNow: true,
                      })

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
                      })
                      that.setData({
                        openMessage: that.data.voiceIMessage,
                        voiceOpen: false,
                      });

                    });
                    return false;
                  }
                }
              }
            }
          });
        });
        return false;
      }
    }
    // for (let i in semlist) {
    //   if (semlist[i].word !== con) {
    //     wx.showModal({
    //       title: '警告!',
    //       content: '暂时没有这条语义!',
    //       showCancel: false,
    //     })
    //     return false;
    //   }
    // }
  },

  bindPickerChange(e) {
    var that = this;
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

})