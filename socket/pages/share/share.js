// pages/share/share.js

const did = wx.getStorageSync('didJSon').did;

var tools = require('../../utils/util.js');
import { $ } from '../../utils/main.js'

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
        });
      },
    });
  },

  getShareList() {
    let that = this;
    wx.request({
      url: 'https://api.gizwits.com/app/sharing?sharing_type=0&status=0&did=jfCvTmuiaDtYz8rwAjGnnc&limit=20&skip=0',
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
              if (res.statusCode == 200) {
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
    let regMobile = /^1[3|4|5|8][0-9]\d{4,8}$/;
    // if (that.data.phoneText == '') {
    //   wx.showToast({
    //     title: '请输入手机号码！！',
    //   });
    //   return false;
    // } else if (!regMobile.test(that.data.phoneText)) {
    //   wx.showToast({
    //     title: '手机号格式错误！',
    //   })
    //   return false;
    // }
    let options = wx.getStorageSync('options');
    var head = {
      'content-type': 'application/json',
      'X-Gizwits-Application-Id': options.gizwitsAppId,
      'X-Gizwits-User-token': options.token,
    };
    let wxuser = wx.getStorageSync('wxuser');

    wx.request({
      url: 'https://api.gizwits.com/app/sharing',
      method: "POST",
      header: head,
      data: {
        "type": 1,
        "did": wx.getStorageSync('did'),
        "phone": '',
        "duration": 1
      },
      success(res) {
        if (res.data.error_code == 9081) {
          wx.showModal({
            title: '警告!',
            content: '客人或普通用户不能共享设备',
            showCancel: false,
          })
          return false;
        }
        let code = res.data.qr_content;
        code = code.substring(16, 48)
        //  创建设备分享
        wx.request({
          url: 'https://api.gizwits.com/app/sharing/code/' + code,
          method: "POST",
          header: that.data.head,
          success(result) {
            if (result.data.error_code == 9080) {
              wx.showModal({
                title: '警告!',
                content: '不能共享设备给自己',
                showCancel: false,
              })
              that.setData({
                layer_text: true,
              });
              that.getShareList();
              return false;
            }
          },
        })
        that.setData({
          layer: true,
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

})