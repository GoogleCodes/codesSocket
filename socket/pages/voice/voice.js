// pages/voice/voice.js

var tools = require('../../utils/util.js');

import { Main } from '../../utils/main.js'
let $ = new Main();

// const did = wx.getStorageSync('didJSon').did;

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
    voiceIMessage: '打开厨房智能灯',
    sceneName: [],
    arrays: [],
    voices: [],
    recodePath: '',
    headers: {
      'content-type': 'application/json',
      'content-type': 'application/x-www-form-urlencoded'
    },
    did: '',
    uploadFileUrl: 'http://yuyin.ittun.com/public/index/dev/zhen'

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      did: wx.getStorageSync('did')
    });
    this.getScene();


    let tabArray = wx.getStorageSync('tabArray');
    let spliceArray = wx.getStorageSync('spliceArray');

    let sqlStr = '打开led灯, ';

    function IndexDemo(str1, str2) {
      var s = str2.indexOf(str1);
      return s;
    }

    // console.log(typeof sqlStr);
    // let a = sqlStr.replace(/,/g, '');
    // console.log(a.trim(),'-------------');

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
    var s = this;
    s.setData({ voiceNow: false });
    wx.stopRecord();
    s.setData({ isSpeaking: false });
    wx.showToast();

    function socketGo(array1, array2) {
      count = array2.concat(sdid.concat(array1));
      json = {
        'data': $.getArrays(count),
      };
      tools.sendData('c2s_write', that.data.did, json);
      $.getSocketResponse((data) => {
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
      }).then((res) => {
        console.log(res)
      })
    }

    try {
      setTimeout(() => {
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

            for (var i in options.yuyin) {
              var sqlStr = options.yuyin[i];

              function getRegion(content, callback) {
                $.ajax({
                  url: 'dev/getregion',
                  method: 'POST',
                  data: {
                    uid: wx.getStorageSync('wxuser').id,
                  },
                }).then((res) => {
                  for (let i in res.data) {
                    if (IndexDemo(res.data[i].name, content) > 0 || IndexDemo(res.data[i].name, content) == 0) {
                      let rid = res.data[i].id
                      callback(rid, res.data[i].name)
                    }
                  }
                });
              }

              getRegion(sqlStr, (id, name) => {
                $.ajax({
                  url: 'dev/getdev',
                  method: 'POST',
                  data: {
                    rid: id,
                    uid: wx.getStorageSync('wxuser').id,
                  },
                }).then((res) => {
                  let getdev = res.data;
                  for (let i in getdev) {
                    if (getdev[i].rid == id) {
                      let close = '关闭' + name + getdev[i].dname;
                      let open = '打开' + name + getdev[i].dname;
                      switch (true) {
                        case IndexDemo(open, sqlStr) == 0 || IndexDemo(open, sqlStr) > 0:
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
                          }).then((res) => {
                            $.alert('打开成功!');
                          })

                          s.setData({
                            openMessage: sqlStr,
                          });
                          s.setData({
                            voiceOpen: false,
                            voiceDone: true,
                          })
                          socketGo(array1, array2);
                          break;
                        case IndexDemo(close, sqlStr) == 0 || IndexDemo(close, sqlStr) > 0:
                          console.log(close, IndexDemo(close, sqlStr));
                          array1 = [0xA1, 0x01, 0x00];
                          array2 = [0x00, 0x08, 0xA2];
                          $.ajax({
                            url: 'dev/updatevideo',
                            method: 'POST',
                            data: {
                              dname: spliceArray[i].dname,
                              id: getdev[i].id,
                              rid: getdev[i].rid,
                              status: "false"
                            },
                          }).then((res) => {
                            $.alert('关闭成功!');
                          })

                          s.setData({
                            voiceOpen: true,
                            voiceDone: false,
                          })
                          socketGo(array1, array2);
                          break;
                        case IndexDemo('打开全部', sqlStr) == 0:
                          $.ajax({
                            url: 'dev/alleditdev',
                            method: 'POST',
                            data: {
                              status: 'true',
                            },
                          }).then((res) => {
                            $.alert('打开成功!');
                          });
                          s.setData({
                            openMessage: sqlStr,
                          });
                          s.setData({
                            voiceOpen: false,
                            voiceDone: true,
                          })
                          //  发送数据
                          tools.sendData('c2s_write', that.data.id, {
                            "onoffAll": true,
                          });
                          $.ajax({
                            url: 'dev/alleditdev',
                            method: 'POST',
                            data: {
                              status: 'true'
                            },
                          }).then((res) => {
                            $.alert('打开成功!');
                          });
                          // $.getSocketResponse((res) => {
                          //   console.log(res, 'data...');
                          // })
                          return false;
                        case IndexDemo('关闭全部', sqlStr) == 0:
                          $.ajax({
                            url: 'dev/alleditdev',
                            method: 'POST',
                            data: {
                              status: 'false'
                            },
                          }).then((res) => {
                            $.alert('关闭成功!');
                          });
                          s.setData({
                            voiceOpen: true,
                            voiceDone: false,
                          })
                          //  发送数据
                          tools.sendData('c2s_write', that.data.did, {
                            "onoffAll": false,
                          });

                          return false;
                      }
                    }

                  }
                });


              })

              // for (let i in spliceArray) {
              //   let close = '关闭' + spliceArray[i].dname;
              //   let open = '打开' + spliceArray[i].dname;

              //   switch (true) {
              //     case IndexDemo(open, sqlStr) == 0 || IndexDemo(open, sqlStr) > 0:
              //       console.log(open, IndexDemo(open, sqlStr));
              //       array1 = [0xA1, 0x01, 0x01];
              //       array2 = [0x00, 0x08, 0xA2];
              //       $.ajax({
              //         url: 'dev/editvideo',
              //         method: 'POST',
              //         data: {
              //           dname: spliceArray[i].dname,
              //           status: "true"
              //         },
              //       }).then((res) => {
              //         $.alert('打开成功!');
              //       })

              //       s.setData({
              //         openMessage: sqlStr,
              //       });
              //       s.setData({
              //         voiceOpen: false,
              //         voiceDone: true,
              //       })
              //       socketGo(array1, array2);
              //       break;
              //     case IndexDemo(close, sqlStr) == 0 || IndexDemo(close, sqlStr) > 0:
              //       console.log(close, IndexDemo(close, sqlStr));
              //       array1 = [0xA1, 0x01, 0x00];
              //       array2 = [0x00, 0x08, 0xA2];

              //       $.ajax({
              //         url: 'dev/editvideo',
              //         method: 'POST',
              //         data: {
              //           dname: spliceArray[i].dname,
              //           status: "false"
              //         },
              //       }).then((res) => {
              //         $.alert('关闭成功!');
              //       })

              //       s.setData({
              //         voiceOpen: true,
              //         voiceDone: false,
              //       })
              //       socketGo(array1, array2);
              //       break;
              //     case IndexDemo('打开全部', sqlStr) == 0:
              //       $.ajax({
              //         url: 'dev/alleditdev',
              //         method: 'POST',
              //         data: {
              //           status: 'true'
              //         },
              //       }).then((res) => {
              //         $.alert('打开成功!');
              //       });
              //       s.setData({
              //         openMessage: sqlStr,
              //       });
              //       s.setData({
              //         voiceOpen: false,
              //         voiceDone: true,
              //       })
              //       //  发送数据
              //       tools.sendData('c2s_write', that.data.id, {
              //         "onoffAll": true,
              //       });
              //       $.ajax({
              //         url: 'dev/alleditdev',
              //         method: 'POST',
              //         data: {
              //           status: 'true'
              //         },
              //       }).then((res) => {
              //         $.alert('打开成功!');
              //       });
              //       // $.getSocketResponse((res) => {
              //       //   console.log(res, 'data...');
              //       // })
              //       return false;
              //     case IndexDemo('关闭全部', sqlStr) == 0:
              //       $.ajax({
              //         url: 'dev/alleditdev',
              //         method: 'POST',
              //         data: {
              //           status: 'false'
              //         },
              //       }).then((res) => {
              //         $.alert('关闭成功!');
              //       });
              //       s.setData({
              //         voiceOpen: true,
              //         voiceDone: false,
              //       })
              //       //  发送数据
              //       tools.sendData('c2s_write', that.data.did, {
              //         "onoffAll": false,
              //       });

              //       return false;
              //     case IndexDemo(spliceArray[i].name, sqlStr):
              //       return false;
              //     default:
              //       $.alert("请重试！");
              //       return false;
              //   }
              // }

              if (typeof (sqlStr) == "string") {
                var myString = sqlStr.substring(0, 1);
              }

            }
            if (data.states == 1) {
              var cEditData = s.data.editData;
              cEditData.recodeIdentity = data.identitys;
              s.setData({ editData: cEditData });
            } else {
              $._goShowModel('提示', data.message, () => { });
            }
            wx.hideToast();
          },
          fail(res) {
            s.setData({ voiceNow: true });
            //  错误提示
            $._goShowModel('提示', '录音的姿势不对!', () => { });
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
    $.getSocketResponse((data) => {
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
    $.getSocketResponse((data) => {
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

    let array1 = [0xA1, 0x01, 0x01];
    let array2 = [0x00, 0x08, 0xA2];
    let count = '';
    function socketGo(array1, array2) {
      count = array2.concat(sdid.concat(array1));
      json = {
        'data': $.getArrays(count),
      };
      tools.sendData('c2s_write', that.data.did, json);
      $.getSocketResponse((data) => {
        console.log(data);
      })
    }

    let tabArray = wx.getStorageSync('tabArray');
    let spliceArray = wx.getStorageSync('spliceArray');

    function getRegion(content, callback) {
      $.ajax({
        url: 'dev/getregion',
        method: 'POST',
        data: {
          uid: wx.getStorageSync('wxuser').id,
        },
      }).then((res) => {
        for (let i in res.data) {
          if (IndexDemo(res.data[i].name, content) > 0) {
            let rid = res.data[i].id
            callback(rid, res.data[i].name)
          }
        }
      });
    }

    let con = that.data.voiceIMessage;
    getRegion(con, (id, name) => {
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
          let open = "打开" + name + region[i].dname;
          let close = "关闭" + name + region[i].dname;
          let allOpen = '打开' + name;
          let allClose = '关闭' + name;
          sdid = JSON.parse(region[i].did);


          for (let y in device) {
            if (device[y].id == region[i].id) {
              switch (true) {
                case IndexDemo(open, con) == 0 || IndexDemo(open, con) > 0:
                  console.log(IndexDemo(open, con));
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
                  }).then((res) => {
                    $.alert('打开成功!');
                  })
                  that.setData({
                    openMessage: that.data.voiceIMessage,
                  });
                  that.setData({
                    voiceOpen: false,
                    voiceDone: true,
                  })
                  socketGo(array1, array2);
                  break;
                // case IndexDemo(con, close) == 0 || IndexDemo(con, close) > 0:
                //   array1 = [0xA1, 0x01, 0x00];
                //   array2 = [0x00, 0x08, 0xA2];
                //   $.ajax({
                //     url: 'dev/updatevideo',
                //     method: 'POST',
                //     data: {
                //       dname: device[y].dname,
                //       rid: device[y].rid,
                //       id: device[y].id,
                //       status: "false"
                //     },
                //   }).then((res) => {
                //     $.alert('关闭成功!');
                //   })

                //   that.setData({
                //     openMessage: that.data.voiceIMessage,
                //   });
                //   that.setData({
                //     voiceOpen: false,
                //     voiceDone: true,
                //   })
                //   socketGo(array1, array2);
                //   break;
                // case IndexDemo(allOpen, con) == 0:
                //   //  发送数据
                //   tools.sendData('c2s_write', that.data.did, {
                //     "onoffAll": true,
                //   });
                //   that.setData({
                //     voiceOpen: false,
                //     voiceDone: true,
                //   });
                //   $.ajax({
                //     url: 'dev/alleditdev',
                //     method: 'POST',
                //     data: {
                //       status: 'true'
                //     },
                //   }).then((res) => {
                //     $.alert('打开成功!');
                //   });
                //   return true;
                // case IndexDemo(allClose, con) == 0:
                //   //  发送数据
                //   tools.sendData('c2s_write', that.data.did, {
                //     "onoffAll": false,
                //   });
                //   that.setData({
                //     voiceOpen: true,
                //     voiceDone: false,
                //   });
                //   $.ajax({
                //     url: 'dev/alleditdev',
                //     method: 'POST',
                //     data: {
                //       status: 'false'
                //     },
                //   }).then((res) => {
                //     $.alert('关闭成功!');
                //   });
                //   return true;
                default:
                  $.alert('文字识别错误!');
                  return false;
              }
            }
          }
        }
      });
    });

    // $.ajax({
    //   url: 'dev/getregion',
    //   method: 'POST',
    //   data: {
    //     uid: wx.getStorageSync('wxuser').id,
    //   },
    // }).then((res) => {
    //   let region = res.data;
    //   for (let i in region) {
    //     for (let y in tabArray) {
    //       if (region[i].id == tabArray[y].id) {
    //         console.log(region[i].id == tabArray[y].id, region[i].id, tabArray[y].id);
    //         rid = region[i].id;
    //       //   $.ajax({
    //       //     url: 'dev/getdev',
    //       //     method: 'POST',
    //       //     data: {
    //       //       rid: rid,
    //       //       uid: wx.getStorageSync('wxuser').id,
    //       //     },
    //       //   }).then((res) => {
    //       //     list = res.data;
    //       //     for (let a in list) {
    //       //       for (let b in spliceArray) {
    //       //         if (list[a].id == spliceArray[b].id) {
    //       //           sdid = JSON.parse(spliceArray[b].did);
    //       //           let close = '关闭' + region[i].name + spliceArray[b].dname;
    //       //           let open = '打开' + region[i].name + spliceArray[b].dname;
    //       //           let allOpen = '打开' + region[i].name;
    //       //           let allClose = '关闭' + region[i].name;

    //       //           // switch (true) {
    //       //           //   default:
    //       //           //     $.alert('文字识别错误!');
    //       //           //     return false;
    //       //           // }
    //       //         }
    //       //       }
    //       //       // for (let j in spliceArray) {
    //       //       //   console.log(spliceArray[j]);
    //       //       //   console.log(IndexDemo(open, that.data.voiceIMessage));
    //       //       //   return;
    //       //       //   switch (true) {
    //       //       //   }
    //       //       // }
    //       //     }



    //       //   });
    //       } else {
    //         return false;
    //       }
    //     }
    //   }
    // })

  }

})