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
    //file(currentModel.get(), lastDate);
    dateModel.set(currentDate);
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
    history.push(data);
    historyModel.set(history);
    current.length = 0;
    currentModel.set(current);
    totalModel.set(total);
  }

  function renderDirectory() {
    var history = historyModel.get();
    var source = $('#template').html();
    var template = Handlebars.compile(source);
    document.getElementsByClassName('nav')[0].innerHTML = template(data);
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
