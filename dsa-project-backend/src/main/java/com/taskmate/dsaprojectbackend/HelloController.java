package com.taskmate.dsaprojectbackend;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController // Tells Spring that this class will handle web requests
public class HelloController {

    @GetMapping("/api/RollNo") // Listens for GET requests to http://localhost:8080/api/hello
    public int RollNO() {
        return 73;}
    @GetMapping("/api/hello") // Listens for GET requests to http://localhost:8080/api/hello
    public String SayHello() {
        return "This is Hello from Aditya Sharma";
    }

}