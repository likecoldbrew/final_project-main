package kr.or.nextit.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // 모든 경로에 대해 CORS 설정
                .allowedOrigins("http://localhost:3000") 
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // 허용할 HTTP 메서드
                .allowedHeaders("*")
                .allowCredentials(true) // 인증 정보를 허용할지 여부
                .maxAge(3600); // CORS 응답 캐시 시간 (초 단위)
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/admin").setViewName("forward:/index.html");
        registry.addViewController("/doctor").setViewName("forward:/index.html");
    }
    
        @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // "/uploads/**"로 시작하는 요청을 실제 파일이 저장된 경로로 매핑
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:backend/src/main/resources/static/uploads/");
    }
}
