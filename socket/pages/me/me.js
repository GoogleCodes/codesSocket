// pages/me/me.js

import { Main } from '../../utils/main.js'
let main = new Main();

Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
  
  },

  _shareGizwits() {
    let that = this, code = "adc1b95729864eecb02cd614cd305abc";
    wx.scanCode({
      success(res) {
        //  创建设备分享
        main.sendRrquest('sharing/code/' + code, 'POST', '', that.data.head).then((result) => {
          console.log(result);
        }, (err) => { });
      },
    })

    // //  创建设备分享
    main.sendRrquest('sharing/code/' + code, 'POST', '', that.data.head).then((result) => {
      console.log(result);
    }, (err) => {
      console.log(err);
    });

    // var options = {
    //   "type": 0,
    //   "did": that.data.options.did,
    //   "uid": wx.getStorageSync('options').uid,
    // };
    // tools.sendRrquest('sharing', 'POST', options, that.data.head).then(function (result) {
    //   console.log(result);
    // }, function (err) {
    //   console.log(err);
    // });

    //  查询分享设备
    // var sharing_type = 1, status = 0;
    // tools.sendRrquest('sharing?sharing_type=' + sharing_type + '&status=' + status + '', 'GET', '', that.data.head).then(function (result) {
    //   console.log(result.data);
    // }, function (err) {
    //   console.log(err);
    // });
  },

})