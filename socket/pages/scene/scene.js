// pages/scene/scene.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sceneid: 0,
    scenelist: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const that = this;
    //  查询场景
    wx.request({
      url: 'https://api.gizwits.com/app/scene',
      method: 'GET',
      header: {
        'Content-Type': 'application/json',
        'Accept': ' application/json',
        'X-Gizwits-Application-Id': 'd8b4d2f0bce943ee9ecb4abfa01a2e55',
        'X-Gizwits-User-token': 'e8dcba65c4294c499f1e9b96e702856a',
      },
      success(res) {
        console.log(res.data);
        that.setData({
          scenelist: res.data
        });
      }
    })


  },

  //  创建情景
  creatScene() {
    const that = this;
    const json = {
      "scene_name": "宠物屋",
      "tasks": [
        {
          "task_type": "device",
          "time": 360,
          "did": "eFNagYgB6k7QyXZNkEHhND",
          "attrs": {
            'onoffAll': true,
          },
          "raw": "string"
        }
      ]
    };
    wx.request({
      url: 'https://api.gizwits.com/app/scene',
      method: "POST",
      header: {
        'content-type': 'application/json',
        'content-type': 'application/x-www-form-urlencoded',
        'X-Gizwits-Application-Id': 'd8b4d2f0bce943ee9ecb4abfa01a2e55',
        'X-Gizwits-User-token': '8e1aa123f7314fba8dd874154faa1071',
      },
      data: JSON.stringify(json),
      success(res) {
        console.log(res);
        that.setData({
          sceneid: res.data.id,
        });
      },
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
  
  },

})