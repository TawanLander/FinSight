package school.sptech.s3.bucket.controller;

import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import school.sptech.s3.bucket.service.BucketService;
import school.sptech.s3.bucket.service.BucketService.StoredFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/bucket")
public class BucketController {
    private final BucketService bucket;

    public BucketController(BucketService bucket) {
        this.bucket = bucket;
    }

    @GetMapping
    public List<StoredFile> list(@AuthenticationPrincipal Integer userId) {
        return bucket.list(userId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<InputStreamResource> download(@AuthenticationPrincipal Integer userId,
                                                        @PathVariable UUID id) {
        var stream = bucket.download(userId, id);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .contentLength(stream.response().contentLength())
                .header(HttpHeaders.CONTENT_DISPOSITION, stream.response().contentDisposition())
                .body(new InputStreamResource(stream));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UploadResponse> upload(@AuthenticationPrincipal Integer userId,
                                                 @RequestParam("file") MultipartFile file) throws IOException {
        UUID id = bucket.upload(userId, file);
        var location = ServletUriComponentsBuilder.fromCurrentRequestUri().path("/{id}").buildAndExpand(id).toUri();
        return ResponseEntity.created(location).body(new UploadResponse(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal Integer userId, @PathVariable UUID id) {
        bucket.delete(userId, id);
        return ResponseEntity.noContent().build();
    }

    public record UploadResponse(UUID id) {}
}
