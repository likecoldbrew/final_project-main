package kr.or.nextit.backend.service;


import kr.or.nextit.backend.mapper.ProfileMapper;
import kr.or.nextit.backend.model.Profile;
import kr.or.nextit.backend.util.FileUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class ProfileService {
    private final ProfileMapper profileMapper;
    private final FileUtil fileUtil;


    public Profile getProfileById(int doctorNo) {
        return profileMapper.getProfileById(doctorNo);
    }

    public ResponseEntity<Resource> viewProfile(Profile profile) throws IOException {
        return ResponseEntity.ok(fileUtil.getFileResource(profile.getFilePath()));
    }

    public int uploadProfile(Profile profile) {
        return profileMapper.uploadProfile(profile);
    }

    public int removeProfile(int doctorNo) {
        return profileMapper.removeProfile(doctorNo);
    }
}

