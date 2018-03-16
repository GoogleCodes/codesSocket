// pages/login/login.js

var tools = require('../../utils/util.js');
let com = require('../../utils/common/common.js');
import { $ } from '../../utils/main.js'


Page({
  /**
   * 页面的初始数据
   */
  data: {
    uname: '13630017088', // 13250672958 || 13630017088 || 13232800159
    pword: '654321', // 123456789 || 654321 || 123456
    wechatOpenId: 'kceshi1',
    gizwitsAppId: '',
    token: '',
    loadHidden: true,
    uid: '',
    json: {
      'attrs': 'attrs_v4',
      'custom': 'custom'
    },
  },

  loginForm(e) {
    var that = this;
    let fId = e.detail.formId, fObj = e.detail.value;
    switch (true) {
      case e.detail.value.uname == '':
        tools.showModel('提示', '用户账号为空!');
        return false;
      case e.detail.value.pword == '':
        tools.showModel('提示', '用户密码为空!');
        return false;
      default:
        break;
    }
    that.setData({
      uname: e.detail.value.uname,
      pword: e.detail.value.pword,
      loadHidden: false,
    });
    var json = {
      lang: "en",
      username: that.data.uname,
      password: that.data.pword,
      formID: fId,
      fromObject: fObj,
    };

    wx.setStorageSync('userInformation', json);
    that.getUser(that.data.uname);
    tools.sendRrquest('login', 'POST', json, {
      'content-type': 'application/json',
      'X-Gizwits-Application-Id': that.data.gizwitsAppId = com.gizwitsAppId,
    }).then(function(result) {
       //  如果账号或者密码错误 提示错误
      if (result.data.error_code == 9020) {
        tools.showModel('提示','账号或者密码错误', function(res) {
          that.setData({ loadHidden: true, });
        });
        return false;
      } else {
        //  登录成功后向后台发送一条消息记录
        that.setData({ loadHidden: true, });
        var options = {
          uid: result.data.uid,
          token: result.data.token,
          gizwitsAppId: that.data.gizwitsAppId
        };
        wx.setStorageSync('options', options);

        that._getBindingList(20, 0);

        that.setData({
          uid: result.data.uid,
          token: result.data.token,
        });
        wx.switchTab({
          url: '../index/index',
        })
      }
    });
  },

  _getBindingList(limit, skip) {
    var that = this;
    let options = wx.getStorageSync('options');
    let query = "?show_disabled=0&limit=" + limit + "&skip=" + skip;
    let json = {}, arr = [], pson = {};
    if (options !== "") {
      tools.sendRrquest('bindings' + query, 'GET', '', {
        'content-type': 'application/json',
        'X-Gizwits-Application-Id': options.gizwitsAppId,
        'X-Gizwits-User-token': options.token,
      }).then((result) => {
        wx.setStorageSync('devices', result.data.devices);
        for (var i in result.data.devices) {
          var device = result.data.devices[i];
          json = {
            did: device.did,
          };
          arr.push(json);
          if (result.data.devices[i].is_online == true) {
            //  获取数据
            pson = {
              'did': device.did,  //  did
              'host': device.host,  //  websocket 请求地址
              'ws_port': device.ws_port, //  端口
              'wss_port': device.wss_port, //  端口
            };
            wx.setStorageSync('didJSon', json);
          }
        }
      }, function(err) { });
    }

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    var that = this;
    //  获取用户信息
    var userInfom = wx.getStorageSync('userInformation');
    if (userInfom.username == undefined) {
      return false;
    }
    that.setData({
      uname: userInfom.username,
      pword: userInfom.password,
    });
    that.getUser(that.data.uname);
    that._getBindingList(20, 0);
    if (userInfom !== '') {
      wx.switchTab({ url: '../index/index', })
    }
  },

  _login(host, port) {
    let that = this, json = {};
    //  获取options缓存数据
    var options = wx.getStorageSync('options');
    wx.showLoading({ title: '' })
    //  创建Socket
    wx.connectSocket({
      url: 'wss://' + host + ':' + port + '/ws/app/v1',
    });
    //  监听 WebSocket 连接事件
    wx.onSocketOpen((res) => {
      json = {
        cmd: "login_req",
        data: {
          appid: options.gizwitsAppId,
          uid: options.uid,
          token: options.token,
          p0_type: that.data.json.attrs,
          heartbeat_interval: 180,
          auto_subscribe: true
        }
      };
      that._startPing();
      that._sendJson(json);
    });
  },

  getUser(tel) {
    try {
      $.ajax({
        url: 'member/getUser',
        method: "POST",
        data: {
          tel: tel
        },
      }).then(function (res) {
        wx.setStorageSync('wxuser', res.data);
      });
    } catch(e) {}
  },

  /**
  * 发送数据
  */
  _sendJson(json) {
    var that = this;
    wx.sendSocketMessage({
      //  对象转换字符串
      data: JSON.stringify(json),
    })
  },

  //  心跳开始
  _startPing() {
    var that = this;
    var heartbeatInterval = that.data._heartbeatInterval * 1000;
    that.data._heartbeatTimerId = setInterval(function() {
      var options = {
        cmd: "ping"
      };
      that._sendJson(options);
    }, heartbeatInterval);
  },

})