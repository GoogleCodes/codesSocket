// pages/index/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentTab: 0,
    imgUrls: [
      'https://img.alicdn.com/tfs/TB1fknxexrI8KJjy0FpXXb5hVXa-760-460.png',
      'https://img.alicdn.com/tfs/TB1fKrBewLD8KJjSszeXXaGRpXa-760-460.jpg',
    ],
    list:[
      {
        id: 0,
        tab: '卧室'
      },
      {
        id: 1,
        tab: '厨房'
      },
      {
        id: 2,
        tab: '客厅'
      },
      {
        id: 3,
        tab: '卫生间'
      },
    ],
  },

  selected(e) {
    var that = this;
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
  
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
  
  },

})