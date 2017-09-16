var gizwitsws = null;
$(document).ready(setDefault);

function setDefault() {
  $('#apiHost').val('api.gizwits.com');
  $('#commType').val('attrs_v4');
  $('#wechatOpenId').val('kceshi1');
  $('#gizwitsAppId').val('d8b4d2f0bce943ee9ecb4abfa01a2e55'); //  d8b4d2f0bce943ee9ecb4abfa01a2e55 032c92bbb0fc4b6499a2eaed58727a3a
  newObj();
  // init();
  goLogin();
}

function newObj() {
  if (gizwitsws != null) {
    alert("对象已被初始化，如需改变参数，请刷新页面.");
    return;
  }
  var apiHost = $('#apiHost').val();
  var commType = $('#commType').val();
  var wechatOpenId = $('#wechatOpenId').val();
  var gizwitsAppId = $('#gizwitsAppId').val();
  gizwitsws = new GizwitsWS(apiHost, wechatOpenId, gizwitsAppId, commType);

  gizwitsws.onInit = onInit;
  gizwitsws.onConnected = onConnected;
  gizwitsws.onOnlineStatusChanged = onOnlineStatusChanged;
  gizwitsws.onReceivedRaw = onReceivedRaw;
  gizwitsws.onReceivedAttrs = onReceivedAttrs;
  gizwitsws.onError = onError;

  $.cookie('apiHost', apiHost);
  $.cookie('commType', commType);
  $.cookie('wechatOpenId', wechatOpenId);
  $.cookie('gizwitsAppId', gizwitsAppId);
  // showScreen("初始化对象成功!");
}

function init() {
  gizwitsws.init();
  conndids = [];
  // showScreen("已发送init指令!");
}

function connect() {
  var did = $('#did').val();
  gizwitsws.connect(did);
  showScreen("已发送connect指令!");
}

function read() {
  var did = $('#readDid').val();
  var names = $('#names').val();
  if (names == "") {
    gizwitsws.read(did, null);
  } else {
    gizwitsws.read(did, JSON.parse(names));
  };
  showScreen("已发送read指令!");
}

//	发送数据
function writeCommand() {

  var did = $('#writeDid').val();
  let attrs = $('#command').val(), switchs = $('#switch').val();
  let sliderNum = $("#slider").val();
  $("#sliderSpan").text($("#slider").val());
  let chonse = false;
  $('#switch').is(':checked') ? chonse = true : chonse = false;
  var json = {
    "onoffAll": chonse,
  };
  try {
    gizwitsws.write(did, json);
    // gizwitsws.write(did, JSON.parse(attrs));
    // showScreen("已对设备" + did + "发送write指令: " + attrs);
  } catch (e) {
    showError("数据格式错误：" + e);
  }
  // if ($('#commType').val() == "attrs_v4") {
  //   let attrs = $('#command').val(), switchs = $('#switch').val();
  //   let sliderNum = $("#slider").val();
  //   $("#sliderSpan").text($("#slider").val());
  //   let chonse = false;
  //   $('#switch').is(':checked') ? chonse = true : chonse = false;
  //   var json = {
  //     "onoffAll": chonse,
  //   };
  //   try {
  //     gizwitsws.write(did, json);
  //     // gizwitsws.write(did, JSON.parse(attrs));
  //     // showScreen("已对设备" + did + "发送write指令: " + attrs);
  //   } catch (e) {
  //     showError("数据格式错误：" + e);
  //   }
  // } else {
  //   var raw = $('#command').val();
  //   try {
  //     gizwitsws.send(did, JSON.parse(raw));
  //     // showScreen("已对设备" + did + "发送raw指令: " + raw);
  //   } catch (e) {
  //     showError("数据格式错误：" + e);
  //   }
  // }
}

function clearLog() {
  $('#log').html("");
}

//=========================================================
// callback functions
//=========================================================
function onInit(devices) {
  if (devices.length == 0) {
    showScreen("没有绑定的设备");
  } else {
    for (var i = 0; i < devices.length; i++) {
      showScreen("did=" + devices[i].did);
      showScreen("mac=" + devices[i].mac);
      // showScreen("product_key=" + devices[i].product_key);
      showScreen("is_online=" + devices[i].is_online);
      // showScreen("dev_alias=" + devices[i].dev_alias);
      // showScreen("remark=" + devices[i].remark);
      addSelectOption('#did', devices[i].did, devices[i].did);
      console.log(devices[i].did, devices[i].did);
    }
  }
}

function onConnected(did) {
  addSelectOption('#readDid', did, did);
  addSelectOption('#writeDid', did, did);
  showScreen("与设备:" + did + "连接成功!");
}

function onOnlineStatusChanged(value) {
  showScreen("设备上下线通知，did=" + value.did);
  showScreen("设备上下线通知，is_online=" + value.is_online);
}

function onReceivedRaw(value) {
  var str = "收到设备" + value.did + "的Raw: [";
  for (var i = 0; i < value.raw.length; i++) {
    str = str + value.raw[i] + ",";
  }
  str = str.substr(0, str.length - 1) + "]";
  showScreen(str);
}

function onReceivedAttrs(value) {
  var str = "收到设备" + value.did + "的Attrs: ";
  for (var key in value.attrs) {
    str = str + key + ":" + value.attrs[key] + "; ";
  }
  showScreen(str);
}

function onError(value) {
  showError(value.toString());
}

//=========================================================
// inner functions
//=========================================================
function showScreen(txt) {
  $('#log').prepend('<p>' + txt + '</p>');
}

function showError(txt) {
  $('#log').prepend('<p>' + txt + '</p>');
}

function addSelectOption(selectId, value, text) {
  if ($(selectId + ' option[value =' + value + ']').length == 0) {
    $(selectId).append("<option value=" + value + ">" + text + "</option>");
    // $(selectId).append("<p value=" + value + ">" + text + "</p>");
  }
}

function goLogin() {
  var uname = $("#username").val();
  var pword = $("#password").val();
  gizwitsws._getUserLogin(uname,pword);

};


function deleteGizw() {
  gizwitsws._getDeleteList('4hT7CZrxk9FqdCrzkz4BWS');
}

function modifyGizw() {
  gizwitsws._getModifyList('4hT7CZrxk9FqdCrzkz4BWS',' ',' ',' ');
}

function tap_ch() {
  var eleopen = false;
  eleopen = true;
  $(".page-top").css({
    'transform': 'translate(300px, 0px)'
  });

}