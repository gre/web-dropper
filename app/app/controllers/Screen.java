package controllers;

import play.Logger;
import play.mvc.Http.*;
import play.mvc.WebSocketController;

import static play.libs.F.*;
import static play.libs.F.Matcher.*;
import static play.mvc.Http.WebSocketEvent.*;

public class Screen extends WebSocketController {

    public static class ScreenEvent {
        public String data;
        public ScreenEvent(String data) {
            this.data = data;
        }
    }
    
    final static ArchivedEventStream<ScreenEvent> connections = new ArchivedEventStream<ScreenEvent>(100);
    
    public static void open(String screen) {
        
        EventStream<ScreenEvent> eventStream = connections.eventStream();
        
        // Loop while the socket is open
        while(inbound.isOpen()) {
            Either<WebSocketEvent,ScreenEvent> e = await(Promise.waitEither(
                    inbound.nextEvent(),
                    eventStream.nextEvent()
                ));

            for(String message: TextFrame.match(e._1)) {
                connections.publish(new ScreenEvent(message));
            }
            
            for(ScreenEvent event: ClassOf(ScreenEvent.class).match(e._2)) {
                if(event.data!=null) outbound.send(event.data);
            }
            
            for(WebSocketClose closed: SocketClosed.match(e._1)) {
                disconnect();
            }
        }
    }
}
