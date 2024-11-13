package kr.or.nextit.backend.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.www.BasicAuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component  // 스프링 빈
public class MyBasicAuthEntryPoint extends BasicAuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        response.addHeader("WWW-Authenticate", "Basic realm=\"" + getRealmName() + "\"");
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.getWriter().println("HTTP Status 401 - " + authException.getMessage());
    }

    @Override
    public void afterPropertiesSet() {
        setRealmName("nextit");  // 인증 영역(Realm) 이름 설정
        super.afterPropertiesSet();
    }
}
