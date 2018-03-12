// pages/share/share.js

const did = wx.getStorageSync('didJSon').did;

var tools = require('../../utils/util.js');

import { $ } from '../../utils/main.js'

var QR = require("../../utils/qrcode.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    cancel: true,
    top: 0,
    layer: true,
    layer_text: true,
    did: "",
    phoneText: '',
    Htop: '',
    activeIndex: -1,
    head: {
      'Content-Type': 'application/json',
      'Accept': ' application/json',
      'X-Gizwits-Application-Id': wx.getStorageSync('options').gizwitsAppId,
      'X-Gizwits-User-token': wx.getStorageSync('options').token,
    },
    devices: [],
    canvasHidden: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this;
    wx.showLoading({
      title: '',
    })
    this.getShareList();
    wx.getSystemInfo({
      success(res) {
        that.setData({
          Htop: (res.windowHeight - 250) / 2,
          winTop: (res.windowHeight - 310) / 2,
        });
      },
    });
  },

  getShareList() {
    let that = this;
    wx.request({
      url: 'https://api.gizwits.com/app/sharing?sharing_type=1&status=1&limit=20&skip=0',
      header: {
        'content-type': 'application/json',
        'X-Gizwits-Application-Id': wx.getStorageSync('options').gizwitsAppId,
        'X-Gizwits-User-token': wx.getStorageSync('options').token,
      },
      method: 'GET',
      success(res) {
        wx.hideLoading();
        that.setData({
          devices: res.data.objects,
        });
      }
    })
  },

  cancelLayer() {
    this.setData({
      layer_text: true,
    });
  },

  openLayer() {
    this.setData({
      layer_text: false,
    });
  },

  active(e) {
    let that = this;
    that.setData({
      activeIndex: e.currentTarget.dataset.id,
      did: e.currentTarget.dataset.did
    });
  },

  clickChonse() {
    this.setData({
      cancel: true,
    });
  },

  shareCancel(e) {
    let that = this;
    wx.showModal({
      title: '警告',
      content: '确定要取消分享吗?',
      success(res) {
        if (res.confirm == true) {
          wx.request({
            url: 'https://api.gizwits.com/app/sharing/' + e.currentTarget.dataset.id,
            header: {
              'content-type': 'application/json',
              'X-Gizwits-Application-Id': wx.getStorageSync('options').gizwitsAppId,
              'X-Gizwits-User-token': wx.getStorageSync('options').token,
            },
            method: 'DELETE',
            success(res) {
              if (res.data.error_code == 9093) {
                wx.showModal({
                  title: '警告',
                  content: '许可被拒绝，你不是所有者！',
                  showCancel: false,
                })
                return false;
              } else if (res.statusCode == 200) {
                wx.showToast({
                  title: '取消成功!',
                })
              }
            }
          })
          return false;
        } else if (res.cancel == false) {
          return false;
        }
      }
    })
  },

  addShare() {
    let that = this;
    var size = that.setCanvasSize();
    let options = wx.getStorageSync('options');
    var head = {
      'content-type': 'application/json',
      'X-Gizwits-Application-Id': options.gizwitsAppId,
      'X-Gizwits-User-token': options.token,
    };
    let wxuser = wx.getStorageSync('wxuser');
    wx.showToast({
      title: '生成中...',
      icon: 'loading',
      duration: 2000
    });
    wx.request({
      url: 'https://api.gizwits.com/app/sharing',
      method: "POST",
      header: head,
      data: {
        "type": 1,
        "did": wx.getStorageSync('did'),
        "duration": 15
      },
      success(res) {
        wx.hideToast();
        if (res.data.error_code == 9081) {
          wx.showModal({
            title: '警告!',
            content: '客人或普通用户不能共享设备!',
            showCancel: false,
          })
          return false;
        } else if (res.data.error_code == 9015) {
          wx.showModal({
            title: '警告!',
            content: '请选择主设备!',
            showCancel: false,
          })
          return false;
        }
        let code = res.data.qr_content;
        code = code.substring(16, 48);
        that.createQrCode("code", "mycanvas", size.w, size.h);
        that.setData({
          layer: false,
        });
      }
    })

  },

  cancenLayer() {
    this.setData({
      layer: true,
    });
  },

  blurText(e) {
    this.setData({
      phoneText: e.detail.value
    });
  },

  //适配不同屏幕大小的canvas
  setCanvasSize() {
    var size = {};
    try {
      var res = wx.getSystemInfoSync();
      var scale = 1100 / 686;//不同屏幕下canvas的适配比例；设计稿是750宽
      var width = 230; //  res.windowWidth / scale;
      var height = 230;//canvas画布为正方形
      size.w = width;
      size.h = height;
    } catch (e) {
      console.log("获取设备信息失败" + e);
    }
    return size;
  },
  createQrCode(url, canvasId, cavW, cavH) {
    //调用插件中的draw方法，绘制二维码图片
    QR.api.draw(url, canvasId, cavW, cavH);
    setTimeout(() => { this.canvasToTempImage(); }, 1000);
  },

  //获取临时缓存照片路径，存入data中
  canvasToTempImage: function () {
    var that = this;
    wx.canvasToTempFilePath({
      canvasId: 'mycanvas',
      success: function (res) {
        var tempFilePath = res.tempFilePath;
        console.log(tempFilePath);
        that.setData({
          imagePath: tempFilePath,
          // canvasHidden:true
        });
      },
      fail: function (res) {
        console.log(res);
      }
    });
  },

  //点击图片进行预览，长按保存分享图片
  previewImg: function (e) {
    var img = this.data.imagePath;
    console.log(img);
    wx.previewImage({
      current: img, // 当前显示图片的http链接
      urls: [img] // 需要预览的图片http链接列表
    })
  },

})