'use strict'

var record = {};

var getTime = function() {
  var date = new Date;
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var currentTime = year + '年' + month + '月';

  var times = window.localStorage.getItem('times');

  if (times === null) {
    window.localStorage.setItem('times', currentTime);
  } else if (times && times.indexOf(currentTime) == -1) {
    window.localStorage.setItem('times', times + ' ' + currentTime);
  }

  return window.localStorage.getItem('times');
}

var getTitle = function() {
  var titles = window.localStorage.getItem('titles');
  var titleObj = eval('(' + titles +')');
  return titleObj;
}

var renderNav = function(data) {
  var source = $('#template').html();
  var template = Handlebars.compile(source);
  document.getElementsByClassName('nav')[0].innerHTML = template(data);
}

var times = getTime();
var data = {times : times.split(' ')}
var titles = getTitle();

window.onload = function() {
  //render nav bar
  renderNav(data);

  $('body').delegate('.time', 'click', function(e) {
    var key = e.target.innerHTML;
    if (titles[key]) {
      var length = titles[key].length;
    }
    if (record.key === true) {
      record.key = false;
      //remove
    } else {
      record.key = true;
      for (var item in titles[key]) {
        var ele = $('<dd></dd>').text(titles[key][item]);
        e.target.after(ele[0]);
      }
    }
  });

  $('body').delegate('.add', 'click', function(e) {
    var ele = $('<input></input>').text('');
    e.target.before(ele[0]);
    ele[0].focus();
  });

  //save
  $(document).keydown(function(e) {
    if (e.metaKey == true && e.keyCode == 83) {
      var todoList = {
        unfinished: [],
        finished: []
      };
      $('#todoing').find('li').each(function () {
        todoList.unfinished.push(this.innerHTML);
      });
      $('#todoed').find('li').each(function () {
        todoList.finished.push(this.innerHTML);
      });
      var date = new Date;
      var defaultTitle = date.getMonth() + '.' + date.getDay();
      //window.localStorage.setItem('')
      return false;
    }
  });
}
