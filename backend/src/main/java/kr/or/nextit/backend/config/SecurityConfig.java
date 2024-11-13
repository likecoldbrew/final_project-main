package kr.or.nextit.backend.config;

import kr.or.nextit.backend.filter.JwtAuthenticationFilter;
import kr.or.nextit.backend.service.CustomUserDetailsService;
import kr.or.nextit.backend.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtUtil, userDetailsService);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        // CSRF 비활성화
        http.csrf(auth -> auth.disable());

        // 로그인 및 HTTP Basic 인증 비활성화
        http.formLogin(auth -> auth.disable());
        http.httpBasic(auth -> auth.disable());

        // 경로별 인가 설정
        http.authorizeHttpRequests(auth -> auth
                .requestMatchers("/static/**", "/index.html", "/manifest.json").permitAll()
                .requestMatchers("/admin/**").hasRole("ADMIN")  // 관리자 권한 필요
                .requestMatchers("/doctor/**").hasRole("DOCTOR")  // 의사 권한 필요
                .anyRequest().permitAll()  // 나머지 경로는 모두 허용
        );

        // Access Denied Handler 설정 (403 오류 시 /error로 리다이렉트)
        http.exceptionHandling(ex -> ex
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    response.sendRedirect("/error");
                })
                // 인증되지 않은 경우에 대한 처리: 401이 아니라 /error로 리다이렉트
                .authenticationEntryPoint((request, response, authException) -> {
                    response.sendRedirect("/error"); // JWT 토큰이 없으면 /error 페이지로 리다이렉트
                })
        );

        // 세션 관리: STATELESS로 설정하여 세션을 사용하지 않음
        http.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        // JWT 필터 추가 (UsernamePasswordAuthenticationFilter 이전에 추가해야 함)
        http.addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public BCryptPasswordEncoder bCryptPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }
}
