(function(){

$(document).ready(function(){
  
  var socket = new WebSocket(ROUTES.WSopen);
  
  var transformToText = function(o) {
    with(o) {
      return "translate("+pos.x+"px,"+pos.y+"px) scale("+scale.x+","+scale.y+") rotate("+rotate+"deg)";
    }
  }
  
  var Box = function(id) {
    var self = this;
    self.id = id;
    self.node = $('#'+id);
    self.transform = {
      pos: { x: 0, y: 0 },
      scale: { x: 1, y: 1 },
      rotate: 0
    };
    
    self.updateBoxTransform = function(o) {
      self.transform = o.transform;
      self.node.css('transform', transformToText(o.transform));
    }
    
    self.send = function(o) {
      o.boxId = self.id;
      var str = JSON.stringify(o);
      socket.send(str);
    }
    
    self.sendTransform = function(boxId, t) {
      self.send({ transform: t });
    }
    
    self.getCenterPosition = function() {
      return [ self.node.width()/2, self.node.height()/2 ];
    }
    
    self.getScalePosition = function() {
      var n = self.node.find('a.scale');
      var offset = n.offset();
      var pos = [ offset.left+n.width()/2, offset.top+n.height()/2 ];
      return pos;
    }
    
    self.getRotatePosition = function() {
      var n = self.node.find('a.rotate');
      var offset = n.offset();
      var pos = [ offset.left+n.width()/2, offset.top+n.height()/2 ];
      return pos;
    }
    
    self.onMouseDown = function(e) {
      self.targetMouseDown = $(e.target);
      self.startTransform = $.extend({}, self.transform);
      self.startPosition = [ e.clientX, e.clientY ];
      self.lastPosition = [ e.clientX, e.clientY ];
      self.startCenter = self.getCenterPosition();
      self.startScalePosition = self.getScalePosition();
      self.startRotatePosition = self.getRotatePosition();
    }
    
    self.onDrag = function(e) {
      var x, y;
      var dragx = e.clientX - self.lastPosition[0];
      var dragy = e.clientY - self.lastPosition[1];
      self.lastPosition = [ e.clientX, e.clientY ];
      if(self.targetMouseDown.is('a.rotate')) {
        var center = self.getCenterPosition();
        x = self.startRotatePosition[0]-center[0];
        y = self.startRotatePosition[1]-center[1];
        var angR = Math.atan2(y,x);
        x = (e.clientX - self.transform.pos.x)-self.startCenter[0];
        y = (e.clientY - self.transform.pos.y)-self.startCenter[1];
        var angC = Math.atan2(y,x);
        self.transform.rotate = 180*(angC-angR)/Math.PI;
      }
      else if(self.targetMouseDown.is('a.scale')) {
        var center = self.getCenterPosition();
        var x = ((e.clientX-self.transform.pos.x)-self.startCenter[0])
        /(self.startScalePosition[0]-center[0]);
        var y = ((e.clientY-self.transform.pos.y)-self.startCenter[1])
        /(self.startScalePosition[1]-center[1]);
        self.transform.scale.x = x;
        self.transform.scale.y = y;
      }
      else {
        self.transform.pos.x += dragx;
        self.transform.pos.y += dragy;
      }
      currentBox.sendTransform("box", self.transform); // todo : don't spam too much!
    }
    
    self.node.append('<a class="scale" />').append('<a class="rotate" />');
  }
  
  var boxes = _.map($('.box'), function(node){
    return new Box($(node).attr('id'));
  });
  
  var findBoxById = function(id) {
    return _.detect(boxes, function(b){ return b.id == id });
  }
  var findBoxByNode = function(node) {
    return _.detect(boxes, function(b){ return b.node[0] == node[0] });
  }
  
  var box = $('#box');
  
  socket.onmessage = function(e) {
    if(!e.data) return;
    var o = JSON.parse(e.data);
    var box = findBoxById(o.boxId);
    if(!box) return;
    if(o.transform) box.updateBoxTransform(o);
  }
  
  var currentBox = null;
  var last = null; // [ x , y ]
  var mode = null; // move , rotate , scale
  
  
  $(document).bind('mousedown', function(e){
    var target = $(e.target);
    var node = target.is('.box') ? target : target.parents('.box:last');
    if(node.is('.box')) {
      e.preventDefault();
      currentBox = findBoxByNode(node);
      currentBox.onMouseDown(e);
    }
  });
  $(document).bind('mousemove', function(e){
    e.preventDefault();
    if(currentBox) currentBox.onDrag(e);
  });
  $(document).bind('mouseup', function(e){
    e.preventDefault();
    if(currentBox) currentBox.onDrag(e);
    currentBox = null;
  });

});

}());
