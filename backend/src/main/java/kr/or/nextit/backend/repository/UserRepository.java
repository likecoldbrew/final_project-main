package kr.or.nextit.backend.repository;
import kr.or.nextit.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByUserId(String userId); // 사용자 ID 존재 여부 확인
    User findByUserId(String userId);
}