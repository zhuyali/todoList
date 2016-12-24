'use strict'

var getCurrentTime = function() {
  var date = new Date;
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var currentTime = year + '年' + month + '月';
  return currentTime;
}

/*
 * 获取月份时间
 * { key: 'times',
 *   value: '2016年12月 2016年11月...'}
 */
var getTime = function() {
  var currentTime = getCurrentTime();
  var times = window.localStorage.getItem('times');

  if (times === null) {
    window.localStorage.setItem('times', currentTime);
  } else if (times && times.indexOf(currentTime) == -1) {
    window.localStorage.setItem('times', times + ' ' + currentTime);
  }

  return window.localStorage.getItem('times');
}

/* 获取所有todo标题
 * { key: titles,
 *   value: {key: '2016年12月',value: ['todos']}, ...}
 */
var getTitle = function() {
  var titles = window.localStorage.getItem('titles');
  if (titles === null) {
    window.localStorage.setItem('titles', '');
  }
  var titleObj = eval('(' + titles +')');
  return titleObj;
}

var renderNav = function(data) {
  var source = $('#template').html();
  var template = Handlebars.compile(source);
  document.getElementsByClassName('nav')[0].innerHTML = template(data);
}

var record = {};
var times = getTime();
var titles = getTitle();
var currentTitle = null;
var data = {times : times.split(' ')}

window.onload = function() {
  //render nav bar
  renderNav(data);

  //点击时间时，列表toggle
  $('body').delegate('.time', 'click', function(e) {
    var key = e.target.innerHTML;
    console.log(key);
    console.log(record);
    if (record[`${key}`] === true) {
      record[`${key}`] = false;
      //remove
    } else {
      record[`${key}`] = true;
      for (var item in titles[`${key}`]) {
        var ele = $('<dd></dd>').text(titles[`${key}`][item]);
        e.target.after(ele[0]);
      }
    }
  });

  //点击添加时，自动在前面添加一行，并且自动聚焦
  $('body').delegate('.add', 'click', function(e) {
    var ele = $('<input type="text"></input>').text('');
    e.target.before(ele[0]);
    ele[0].focus();
  });

  //点击标题时，对应变化todoList
  $('body').delegate('dd', 'click', function(e) {
    currentTitle = e.target.innerHTML;
  });

  //按下回车键时，默认新增一行

  //在每一行前面增加checkbox，选择后进入已完成列表

  //按下保存键时，保存当前todoList
  $(document).keydown(function(e) {
    if (e.metaKey == true && e.keyCode == 83) {
      var todoList = {
        unfinished: [],
        finished: []
      };
      $('#todoing').find('input').each(function () {
        todoList.unfinished.push(this.value);
      });
      $('#todoed').find('li').each(function () {
        todoList.finished.push(this.innerHTML);
      });

      if (currentTitle === null) {
        var date = new Date;
        currentTitle = date.getMonth() + '.' + date.getDay();
      }
      var content = JSON.stringify(todoList);
      console.log(content);
      //window.localStorage.setItem('')
      return false;
    }
  });
}
