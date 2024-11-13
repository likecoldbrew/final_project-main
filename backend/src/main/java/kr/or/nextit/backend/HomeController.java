package kr.or.nextit.backend;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {
    @GetMapping("/")
    public String index() {
        return "forward:/main"; // static 폴더의 index.html을 반환
    }
}

