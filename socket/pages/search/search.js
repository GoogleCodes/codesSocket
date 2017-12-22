// pages/search/search.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isChonse: false,
    list: [{
      id: 0,
      tab: '卧室',
      gizwits: []
    }, {
      id: 1,
      tab: '厨房',
      gizwits: []
    }],
    equipment: [
      {
        active: 0,
        types: 1,
        name: '吊灯',
      }, {
        active: 0,
        types: 2,
        name: '照明灯',
      }, {
        active: 0,
        types: 3,
        name: '台灯',
      }, {
        active: 0,
        types: 4,
        name: '下拉窗帘',
      }, {
        active: 0,
        types: 5,
        name: '单向窗帘',
      }, {
        active: 0,
        types: 6,
        name: '双向窗帘',
      }
    ],
    spliceArray:[],
    index: 0,
    multiArray: [['卧室', '厨房'], []],
    multiIndex: [0, 0],
    index: 0,
    currentTab: 0,
    winHeight: 0,
    pickerShow: true,
    isTab: 0,
    array: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const that = this;
    wx.getSystemInfo({
      success(res) {
        that.setData({
          winHeight: res.windowHeight / 2
        });
      },
    });
  },

  bindMultiPickerChange(e) {
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    for(let i in this.data.list) {
      if (e.detail.value == this.data.list[i].id) {
        console.log(this.data.list[i].gizwits.concat(this.data.equipment));
        console.log('picker发送选择改变，携带值为', e.detail.value)
      }
    }
    this.setData({
      multiIndex: e.detail.value
    })
  },

  bindMultiPickerColumnChange(e) {
    console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
    var data = {
      objectArrays: this.data.objectArrays,
      index: this.data.index
    };
    console.log(data);
    data.multiIndex[e.detail.column] = e.detail.value;
    switch (e.detail.column) {
      case 0:
        switch (data.multiIndex[0]) {
          case 0:
            data.multiArray[1] = ['吊灯', '照明灯'];
            break;
          case 1:
            data.multiArray[1] = ['吊灯', '照明灯', '台灯'];
            break;
        }
    }
    this.setData(data);

    /*
    console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
    var data = {
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex
    };
    data.multiIndex[e.detail.column] = e.detail.value;
    switch (e.detail.column) {
      case 0:
        switch (data.multiIndex[0]) {
          case 0:
            data.multiArray[1] = ['吊灯', '照明灯'];
            break;
          case 1:
            data.multiArray[1] = ['吊灯', '照明灯', '台灯'];
            break;
        }
    }
    this.setData(data);*/
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

  bindChange(e) {
    var that = this;
    that.setData({
      currentTab: e.detail.current
    });
  },

  inputSet() {
    this.setData({
      pickerShow: false,
    });
  },

  outputSet() {
    this.setData({
      pickerShow: true,
    });
  },

  selectEquipment(e) {
    let that = this, arr = {};
    let index = e.currentTarget.dataset.key;
    if (this.data.equipment[index].active == 0) {
      this.data.equipment[index].active = 1;
      arr = e.currentTarget.dataset;
      this.data.spliceArray.push(arr);
    } else if (this.data.equipment[index].active == 1) {
      this.data.equipment[index].active = 0;
      for (let i in this.data.spliceArray) {
        if (this.data.spliceArray[i].key == index) {
          this.data.spliceArray.splice(i, 1);
        }
      }
    }
    console.log(this.data.spliceArray);
    this.setData({
      equipment: this.data.equipment,
      spliceArray: this.data.spliceArray
    });
  },

})