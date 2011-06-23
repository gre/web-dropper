package controllers;

import java.util.HashMap;
import java.util.Map;

import play.Logger;
import play.libs.F;
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

    final static Map<String, ArchivedEventStream<ScreenEvent>> mapStream = new HashMap<String, ArchivedEventStream<ScreenEvent>>();
    
    public static void open(String screen) {
    	ArchivedEventStream<ScreenEvent> stream = mapStream.get(screen);
    	if(stream==null) {
    		stream = new ArchivedEventStream<ScreenEvent>(100);
    		mapStream.put(screen, stream);
    	}
        EventStream<ScreenEvent> eventStream = stream.eventStream();
        
        // Loop while the socket is open
        while(inbound.isOpen()) {
            Either<WebSocketEvent,ScreenEvent> e = await(Promise.waitEither(
                    inbound.nextEvent(),
                    eventStream.nextEvent()
                ));

            for(String message: TextFrame.match(e._1)) {
                stream.publish(new ScreenEvent(message));
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
