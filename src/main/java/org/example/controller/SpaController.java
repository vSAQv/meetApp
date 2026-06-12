package org.example.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {

    // Явно указываем все маршруты React-приложения
    @GetMapping({
            "/",
            "/login",
            "/register",
            "/verify",
            "/swipe",
            "/matches",
            "/profile",
            "/chat/**"
    })
    public String redirect() {
        return "forward:/index.html";
    }
}