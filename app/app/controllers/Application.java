package controllers;

import play.*;
import play.data.validation.*;
import play.mvc.*;

import java.util.*;

public class Application extends Controller {

    public static void index() {
        render();
    }
    
    public static void screen(
            @Required @MinSize(3) @MaxSize(50) @Match(value="[0-9a-zA-Z]+", message="Must be only alphanumeric characters.")
            String screen ) {
        if(Validation.hasErrors()) {
            validation.keep();
            index();
        }
        render(screen);
    }

}