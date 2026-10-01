CREATE TABLE enterprise (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    cnpj CHAR(14) NOT NULL UNIQUE,
    email VARCHAR(100),
    telefone VARCHAR(20),
    users_id INT NOT NULL
);

CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    enterprise_id INT NOT NULL,
    CONSTRAINT fk_usuarios_enterprise
        FOREIGN KEY (enterprise_id) REFERENCES enterprise(id)
);

CREATE TABLE tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    refresh_token VARCHAR(255) NOT NULL UNIQUE,
    user_id INT NOT NULL,
    expires_at DATETIME NOT NULL,
    CONSTRAINT fk_tokens_usuarios
        FOREIGN KEY (user_id) REFERENCES usuarios(id)
        ON DELETE CASCADE
);