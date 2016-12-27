'use strict';

function Model(id) {
  this.id = id;
  this.data = null;
  this.init();
}

Model.prototype.init = function() {
  this.data = JSON.parse(window.localStorage.getItem(this.id));
};

Model.prototype.get = function() {
  return this.data;
};

Model.prototype.set = function(data) {
  this.data = data;
  window.localStorage.setItem(this.id, JSON.stringify(data));
};

var dateModel = new Model('date');
var totalModel = new Model('total');
var currentModel = new Model('current');
var historyModel = new Model('history');
var records = {};

$(document).ready(function () {

  function renderInit() {
    var lastDate = null;
    if (dateModel.get()) {
      lastDate = new Date(dateModel.get());
    }
    var currentDate = new Date;

    if (lastDate) {
      var lastYear = lastDate.getFullYear();
      var currentYear = currentDate.getFullYear();
      var lastWeek = getYearWeek(lastYear, lastDate.getMonth(), lastDate.getDate());
      var currentWeek = getYearWeek(currentYear, currentDate.getMonth(), currentDate.getDate());

      if (!totalModel.get()) {
        totalModel.set([]);
      }
      if (!currentModel.get()) {
        currentModel.set([]);
      }
      if (!historyModel.get()) {
        historyModel.set([]);
      }

      var history = historyModel.get();
      var current = currentModel.get();

      if (currentYear !== lastYear ) {
        file(current, lastDate);
      } else {
        if (currentWeek !== lastWeek) {
          file(current, lastDate);
        }
      }
    }
    dateModel.set(currentDate);
    renderDirectory();
    renderReverse(totalModel, 'totalItem', $('#totalList'));
    renderReverse(currentModel, 'currentItem', $('#currentList'));
  }
  renderInit();

  function file(items, time) {
    var data = {
      times: time,
      items: []
    };
    var total = totalModel.get();
    var current = currentModel.get();
    var history = historyModel.get();

    items.forEach(function (item, index) {
      if (item.finished) {
        data.items.push(item);
      } else {
        total.push(item.value);
      }
    });

    if (data.items.length) {
      history.push(data);
      historyModel.set(history);
    }
    current.length = 0;
    currentModel.set(current);
    totalModel.set(total);
  }

  function renderDirectory() {
    var history = historyModel.get();
    var navTime = [];
    if (history) {
      history.forEach(function (data) {
        var time = new Date(data.times).getFullYear() + '年' + (new Date(data.times).getMonth() + 1) + '月';
        if (navTime.indexOf(time) === -1) {
          navTime.push(time);
        }
      });
      var data = {times: navTime};
      var source = $('#timeTemplate').html();
      var template = Handlebars.compile(source);
      $('.nav')[0].innerHTML = template(data);
    }
    for (var i = 0; i < $('.time').length; i++) {
      $('.time')[i].after($('<script class="itemTemplate" type="text/x-handlebars-template" index="' + i + '">{{#each titles}}<dd>{{this}}</dd>{{/each}}</script>')[0]);
    }
  }

  function renderReverse(model, className, ele) {
    if (!model.get()) {
      model.set([]);
    }
    var data = model.get().slice(0);
    ele.html('');
    data.reverse().forEach(function(item, index) {
      ele.append('<li class="' + className + '" data-index="' + (data.length - index - 1) + '">' +(JSON.stringify(model) === JSON.stringify(currentModel)? '<input class="checkbox" type="checkbox"' + (item.finished ? 'checked' : '') + (item.disabled ? 'disabled' : '') + ' data-index="' + (data.length - index - 1) + '">' + item.value : '' + item) + '</li>')
    });
  }

  function getYearWeek(year, month, date) {
    var date = new Date(year, parseInt(month) - 1, date);
    var startDate = new Date(year, 0, 1);
    var temp = Math.round((date.valueOf() - startDate.valueOf()) / 86400000);
    return Math.ceil((temp + ((startDate.getDay() + 1) - 1)) / 7);
  };

  $('body').delegate('.time', 'click', function(e) {
    var index = $(this)[0].innerHTML;
    var titles = [];
    var navTime = $(this).html();
    if (records[index + '']) {
      records[index + ''] = false;
      var parent = $(this)[0].parentNode;
      var childs = parent.childNodes;
      for(var i = 2; i < childs.length - 2; i++) {
        parent.removeChild(childs[i])
      }
    } else {
      var history = historyModel.get();
      history.forEach(function(item) {
        var time = new Date(item.times);
        if (time.getFullYear() === parseInt(navTime.substr(0, navTime.indexOf('年'))) && time.getMonth() + 1 === parseInt(navTime.substr(navTime.indexOf('年') + 1, navTime.indexOf('月')))) {
          titles.push(time.getFullYear() + '.' + (time.getMonth() + 1) + '.' + time.getDate());
        }
      });
      records[index + ''] = true;
      var data = {titles: titles};
      for(var i = 0; i < $('.time').length; i++) {
        if ($('.time')[i].innerHTML === $(this)[0].innerHTML) {
          for(var j = 0; j < $('.itemTemplate').length; j++) {
            if (parseInt($('.itemTemplate')[j].getAttribute('index')) === i) {
              var source = $('.itemTemplate')[j].innerHTML;
              var template = Handlebars.compile(source);
              var ele = $(template(data));
              $(this)[0].after(ele[0]);
            }
          }
        }
      }
    }
    e.stopPropagation();
  });

  $('body').delegate('dd', 'click', function(e) {
    var history = historyModel.get();
    var items = [];
    var title = $(this)[0].innerHTML;
    history.forEach(function(item) {
      var time = new Date(item.times);
      if (time.getFullYear() + '.' + (time.getMonth() + 1) + '.' + time.getDate() === title) {
        items = item.items;
        return false;
      }
    });
    var data = {items: items};
    var source = $('#template').html();
    var template = Handlebars.compile(source);
    $('#currentList')[0].innerHTML = template(data);
    e.stopPropagation();
  });

  $('body').delegate('#submit', 'click', function(e) {
    var input = $('#input').val().trim();
    $('#input').val('');
    if (input.length) {
      var total = totalModel.get();
      total.push(input);
      totalModel.set(total);
      renderReverse(totalModel, 'totalItem', $('#totalList'));
    }
  });

  $('body').delegate('.nav', 'click', function(e) {
    renderReverse(currentModel, 'currentItem', $('#currentList'));
  });

  $('body').delegate('.totalItem', 'click', function(e) {
    var node = $(e.target);
    var currentItem = {
      finished: false,
      disabled: false,
      value: node.html()
    }
    var total = totalModel.get();
    total.splice(parseInt(node.data('index')), 1);
    totalModel.set(total);
    renderReverse(totalModel, 'totalItem', $('#totalList'));

    var current = currentModel.get();
    current.push(currentItem);
    currentModel.set(current);
    renderReverse(currentModel, 'currentItem', $('#currentList'));
  });

  $('body').delegate('.checkbox', 'change', function(e) {
    var node = $(e.target);
    var current = currentModel.get();

    current[node.data('index')].finished = !!node.attr('checked');
    currentModel.set(current);
    renderReverse(currentModel, 'currentItem', $('#currentList'));
  });
});
