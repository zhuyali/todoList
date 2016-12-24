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

var totalModel = new Model('total');
var currentModel = new Model('current');
var historyModel = new Model('history');

$(document).ready(function () {

  function renderReverse(model, className, ele) {
    if (!model.get()) {
      model.set([]);
    }
    var data = model.get().slice(0);
    ele.html('');
    data.reverse().forEach(function(item, index) {
      ele.append('<li class="' + className + '" data-index="' + (data.length - index - 1) + '">' +(JSON.stringify(model) === JSON.stringify(currentModel)? '<input class="checkbox" type="checkbox"' + (item.finished ? 'checked' : '') + ' data-index="' + (data.length - index - 1) + '">' + item.value : '' + item) + '</li>')
    });
  }

  function renderInit() {
    renderReverse(totalModel, 'totalItem', $('#totalList'));
    renderReverse(currentModel, 'currentItem', $('#currentList'));
  };
  renderInit();

  $('body').delegate('#submit', 'click', function(e) {
    var input = $('#input').val().trim();
    $('#input').val('');
    if (input.length) {
      if (!totalModel.get()) {
        totalModel.set([]);
      }
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
      value: node.html()
    }
    var total = totalModel.get();
    total.splice(parseInt(node.data('index')), 1);
    totalModel.set(total);
    renderReverse(totalModel, 'totalItem', $('#totalList'));

    if (!currentModel.get()) {
      currentModel.set([]);
    }
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
