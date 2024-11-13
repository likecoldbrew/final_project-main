package kr.or.nextit.backend.util;

import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class FileUtil {

    private final ResourceLoader resourceLoader;

    public Resource getFileResource(String filename) throws IOException {
        Resource resource = resourceLoader.getResource("classpath:static" + filename);
        return new UrlResource(resource.getURI());
    }
}

