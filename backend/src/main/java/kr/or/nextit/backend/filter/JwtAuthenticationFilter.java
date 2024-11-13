package kr.or.nextit.backend.filter;

import kr.or.nextit.backend.util.JwtUtil;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.io.IOException;
import java.util.List;
import java.util.Set;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;
    private final Set<String> openPaths = Set.of("/main"); // 인증을 건너뛸 경로

    public JwtAuthenticationFilter(JwtUtil jwtUtil, UserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String requestPath = request.getRequestURI();

        // 1. 인증을 건너뛰어야 하는 경로인지 확인
        if (openPaths.contains(requestPath)) {
            filterChain.doFilter(request, response); // 인증을 건너뛰고 필터 체인을 계속 진행
            return;
        }

        String authorizationHeader = request.getHeader("Authorization");
        String jwt = null;
        String userId = null;
        String role = null;

        // 2. Authorization 헤더 확인
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
        }
        // 3. Cookie에서 token 확인
        else if (request.getCookies() != null) {
            for (var cookie : request.getCookies()) {
                if ("token".equals(cookie.getName())) {
                    jwt = cookie.getValue();
                    break;
                }
            }
        }

        // 4. JWT가 추출된 경우에만 userId 및 role 추출
        if (jwt != null) {
            userId = jwtUtil.getUserIdFromToken(jwt);
            role = jwtUtil.extractRole(jwt);

            // 디버깅 로그
            System.out.println("Authorization 또는 Cookie에서 추출된 JWT: " + jwt);
            System.out.println("요청 경로: " + requestPath);
            System.out.println("추출된 사용자 ID: " + userId);
            System.out.println("추출된 역할: " + role);
        } else {
            System.out.println("Authorization 헤더 또는 Cookie에서 JWT가 제공되지 않았습니다.");
        }

        // 이후 로직은 그대로 유지
        if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            if (jwtUtil.validateToken(jwt)) {
                SimpleGrantedAuthority authority = new SimpleGrantedAuthority(role);
                User user = new User(userId, "", List.of(authority));

                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        user, null, user.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                System.out.println("JWT 인증 후 설정된 권한: " + user.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(authentication);
                System.out.println("JWT 인증 완료: 사용자 ID " + userId + ", 역할 " + role);
            } else {
                System.out.println("유효하지 않거나 만료된 토큰입니다.");
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("Invalid or expired token");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}
