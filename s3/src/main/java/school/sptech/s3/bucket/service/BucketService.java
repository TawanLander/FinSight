package school.sptech.s3.bucket.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class BucketService {
    private final S3Client s3;
    private final String bucket;

    public BucketService(S3Client s3, @Value("${S3_BUCKET}") String bucket) {
        if (bucket.isBlank()) {
            throw new IllegalArgumentException("S3_BUCKET must be configured");
        }
        this.s3 = s3;
        this.bucket = bucket;
    }

    public UUID upload(Integer userId, MultipartFile file) throws IOException {
        UUID id = UUID.randomUUID();
        String filename = file.getOriginalFilename();
        if (filename != null) {
            filename = filename.replace('\\', '/');
            filename = filename.substring(filename.lastIndexOf('/') + 1).replaceAll("\\p{Cntrl}", "");
        }
        if (filename == null || filename.isBlank()) {
            filename = id.toString();
        }
        String disposition = ContentDisposition.attachment()
                .filename(filename, StandardCharsets.UTF_8)
                .build().toString();

        try (var stream = file.getInputStream()) {
            s3.putObject(request -> request.bucket(bucket)
                            .key(prefix(userId) + id)
                            .contentDisposition(disposition)
                            .contentType("application/octet-stream"),
                    RequestBody.fromInputStream(stream, file.getSize()));
        }
        return id;
    }

    public List<StoredFile> list(Integer userId) {
        String prefix = prefix(userId);
        return s3.listObjectsV2Paginator(request -> request.bucket(bucket).prefix(prefix))
                .contents().stream()
                .filter(object -> !object.key().endsWith("/"))
                .map(object -> new StoredFile(object.key().substring(prefix.length()),
                        object.size(), object.lastModified()))
                .toList();
    }

    public ResponseInputStream<GetObjectResponse> download(Integer userId, UUID id) {
        try {
            return s3.getObject(request -> request.bucket(bucket).key(prefix(userId) + id));
        } catch (NoSuchKeyException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Arquivo não encontrado", e);
        }
    }

    public void delete(Integer userId, UUID id) {
        s3.deleteObject(request -> request.bucket(bucket).key(prefix(userId) + id));
    }

    private static String prefix(Integer userId) {
        return userId + "/arquivos/";
    }

    public record StoredFile(String id, long size, Instant lastModified) {}
}
