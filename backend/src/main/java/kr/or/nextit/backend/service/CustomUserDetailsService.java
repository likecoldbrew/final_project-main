package kr.or.nextit.backend.service;

import kr.or.nextit.backend.model.User;
import kr.or.nextit.backend.repository.UserRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String userId) throws UsernameNotFoundException {
        User user = userRepository.findByUserId(userId); // 사용자 ID로 조회
        if (user == null) {
            throw new UsernameNotFoundException("User not found");
        }

        // 사용자 역할을 권한으로 설정
        List<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_" + user.getRole())); // "ROLE_"을 추가하여 권한 설정

        System.out.println("설정된 권한 목록: " + authorities);

        return new org.springframework.security.core.userdetails.User(
                user.getUserId(),
                user.getUserPass(),
                authorities // 권한 목록 추가
        );
    }
}
