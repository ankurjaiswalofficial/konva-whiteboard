import Konva from 'konva';
var width = window.innerWidth;
var height = window.innerHeight - 25;

var stage = new Konva.Stage({
  container: 'container',
  width: width,
  height: height,
});

var layer = new Konva.Layer();
stage.add(layer);

var canvas = document.createElement('canvas');
canvas.width = stage.width();
canvas.height = stage.height();

var image = new Konva.Image({
  image: canvas,
  x: 0,
  y: 0,
});
layer.add(image);
stage.draw();

var context = canvas.getContext('2d');
context.strokeStyle = '#ffffff';
context.lineJoin = 'round';
context.lineCap = 'round';
context.lineWidth = 3;

var isPaint = false;
var lastPointerPosition;
var mode = 'brush';

var history = [];
var historyPointer = -1;

function saveToHistory() {
  historyPointer++;
  if (historyPointer < history.length) {
    history.length = historyPointer;
  }
  history.push(canvas.toDataURL());
}

image.on('mousedown touchstart', function () {
  isPaint = true;
  lastPointerPosition = stage.getPointerPosition();
  saveToHistory();
});

stage.on('mouseup touchend', function () {
  isPaint = false;
});

stage.on('mousemove touchmove', function () {
  if (!isPaint) {
    return;
  }
  context.beginPath();

  var localPos = {
    x: lastPointerPosition.x - image.x(),
    y: lastPointerPosition.y - image.y(),
  };
  context.moveTo(localPos.x, localPos.y);
  var pos = stage.getPointerPosition();
  localPos = {
    x: pos.x - image.x(),
    y: pos.y - image.y(),
  };

  context.lineTo(localPos.x, localPos.y);
  context.closePath();
  context.stroke();
  lastPointerPosition = pos;
  layer.batchDraw();
});

var select = document.getElementById('tool');
select.addEventListener('change', function () {
  mode = select.value;

  if (mode == 'undo') {
    if (historyPointer > 0) {
      historyPointer--;
      var img = new window.Image();
      img.onload = function () {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0);
        layer.batchDraw();
      };
      img.src = history[historyPointer];
    }
  } else if (mode == 'redo') {
    if (historyPointer < history.length - 1) {
      historyPointer++;
      var img = new window.Image();
      img.onload = function () {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0);
        layer.batchDraw();
      };
      img.src = history[historyPointer];
    }
  }
});

select.addEventListener('change', function () {
  mode = select.value;

  if (mode == 'save') {
    console.log(JSON.stringify({ image: canvas.toDataURL(), date: Date.now() }));
  }
});
