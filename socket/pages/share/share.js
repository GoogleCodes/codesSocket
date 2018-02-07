// pages/share/share.js

const did = wx.getStorageSync('didJSon').did;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    cancel: true,
    top: 0,
    layer: true,
    did: "",
    head: {
      'Content-Type': 'application/json',
      'Accept': ' application/json',
      'X-Gizwits-Application-Id': wx.getStorageSync('options').gizwitsAppId,
      'X-Gizwits-User-token': wx.getStorageSync('options').token,
    },
    devices: wx.getStorageSync('devices'),
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this;
    wx.getSystemInfo({
      success(res) {
        that.setData({
          winTop: (res.windowHeight - 330) / 2,
        });
      },
    });
  },

  longChose(e) {
    let that = this;
    for (let i in that.data.devices) {
      // console.log(that.data.devices[i].did == e.currentTarget.dataset.did, that.data.devices[i].did, e.currentTarget.dataset.did);
      if (that.data.devices[i].did == e.currentTarget.dataset.did) {
        switch (true) {
          case that.data.cancel == false:
            that.setData({
              cancel: true,
            });
            that.setData({ did: '' });
            break;
          case that.data.cancel == true:
            this.setData({
              cancel: false,
            });
            that.setData({
              did: e.currentTarget.dataset.did
            });
            break;
          default:
            break;
        }
        console.log(that.data.did);
      }
    }
  },

  clickChonse() {
    this.setData({
      cancel: true,
    });
  },

  addShare() {
    let that = this;
    if (that.data.did == '') {      
      wx.showToast({
        title: '请选择分享设备',
        mask: true,
        duration: 3000,
      })
      return false;
    }
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
        "did": that.data.did,
        "phone": wxuser.tel,
      },
      success(res) {
        if (res.data.error_code == 9081) {
          wx.showModal({
            title: '警告!',
            content: '客人或普通用户不能共享设备',
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
                content: '不能共享设备给自己'
              })
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
  }

})