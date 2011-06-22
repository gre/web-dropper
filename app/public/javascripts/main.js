(function(){

$(document).ready(function(){
  
  var box = $('#box');
  var down = null; // [ x , y ]
  var last = null; // [ x , y ]
  
  var socket = new WebSocket(ROUTES.WSopen);

  var sendBoxPosition = function(pos) {
    socket.send("pos:"+pos[0]+","+pos[1]);
  }
  
  var updateBoxPosition = function(x, y) {
    box.css('left', x+'px');
    box.css('top', y+'px');
  }

  socket.onmessage = function(e) {
    var pos = /pos:([0-9]+),([0-9]+)/.exec(e.data);
    if(pos && pos.length==3) {
      updateBoxPosition(pos[1], pos[2]);
    }
  }
  
  var onDrag = function(e, mustSendBoxPosition) {
    var dx = e.clientX - last[0];
    var dy = e.clientY - last[1];
    last = [ e.clientX, e.clientY ];
    var pos = box.offset();
    var boxPos = [ (pos.left + dx), (pos.top + dy) ];
    sendBoxPosition(boxPos); // todo : don't spam too much!
  }
  
  box.bind('mousedown', function(e){
    e.preventDefault();
    down = [ e.clientX, e.clientY ];
    last = [ e.clientX, e.clientY ];
  });
  box.bind('mousemove', function(e){
    e.preventDefault();
    if(down!=null)
      onDrag(e);
  });
  box.bind('mouseup', function(e){
    e.preventDefault();
    onDrag(e, true);
    down = null;
  });

});

}());
