package kr.or.nextit.backend.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtBuilder;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secretKey; // 비밀 키

    @Value("${jwt.expiration}")
    private long expirationTime; // 유효 기간

    /**
     * JWT 토큰을 생성합니다.
     * @param userId 사용자 ID
     * @return 생성된 JWT 토큰
     */
    public String generateToken(String userId, String role) {
        long nowMillis = System.currentTimeMillis();
        Date now = new Date(nowMillis);
        Date expirationDate = new Date(nowMillis + expirationTime);

        JwtBuilder builder = Jwts.builder()
                .setSubject(userId)
                .claim("role", role)  // role 정보 추가
                .setIssuedAt(now)
                .setExpiration(expirationDate)
                .signWith(SignatureAlgorithm.HS256, secretKey);

        return builder.compact();
    }

    /**선영 새로 만든거
     *
     *
     *
     * @param token
     * @return
     */
    public String extractUsername(String token) {
        Claims claims = Jwts.parser()
                .setSigningKey(secretKey)
                .parseClaimsJws(token)
                .getBody();
        return claims.getSubject(); // 사용자 이름 반환
    }

    public String extractRole(String token) {
        try {
            Claims claims = Jwts.parser()
                    .setSigningKey(secretKey)
                    .parseClaimsJws(token)
                    .getBody();
            String role = claims.get("role", String.class);
            if (role == null) {
                System.out.println("역할 정보가 토큰에 없습니다.");
                return null;
            }
            System.out.println("추출된 역할: ROLE_" + role); // 디버깅 코드 추가
            return "ROLE_" + role; // ROLE_ 접두사 자동 추가
        } catch (Exception e) {
            System.out.println("역할 추출 중 오류 발생: " + e.getMessage()); // 디버깅 코드 추가
            return null; // 예외 발생 시 null 반환
        }
    }

    /**
     * JWT 토큰의 유효성을 검사합니다.
     * @param token JWT 토큰
     * @return 유효한 경우 true, 그렇지 않은 경우 false
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .setSigningKey(secretKey)
                    .parseClaimsJws(token);
            return true; // 유효한 토큰일 경우
        } catch (ExpiredJwtException e) {
            // 만료된 토큰 처리
            System.out.println("토큰이 만료되었습니다.");
            return false;
        } catch (MalformedJwtException e) {
            // 형식이 잘못된 토큰 처리
            System.out.println("형식이 잘못된 토큰입니다.");
            return false;
        } catch (Exception e) {
            return false; // 유효하지 않은 토큰일 경우
        }
    }

    /**
     * JWT 토큰에서 사용자 ID를 가져옵니다.
     * @param token JWT 토큰
     * @return 사용자 ID
     */
    public String getUserIdFromToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .setSigningKey(secretKey)
                    .parseClaimsJws(token)
                    .getBody();
            return claims.getSubject(); // 사용자 ID 반환
        } catch (Exception e) {
            // 로그를 남기거나 예외를 던지기
            return null; // 또는 적절한 예외 처리를 수행
        }
    }
}
