package kr.or.nextit.backend.mapper;

import kr.or.nextit.backend.model.Profile;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface ProfileMapper {
    List<Profile> getAllProfiles();

    Profile getProfileById(int doctorNo);

    int uploadProfile(Profile profile);

    int removeProfile(int doctorNo);
}