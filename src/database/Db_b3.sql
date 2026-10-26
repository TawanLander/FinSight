CREATE DATABASE IF NOT EXISTS finsight;
USE finsight;

CREATE TABLE empresa (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(80),
    cnpj CHAR(14),
    codigo CHAR(8),
    dt_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_empresa_cnpj (cnpj),
    UNIQUE KEY uk_empresa_codigo (codigo)
);

CREATE TABLE usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_empresa INT,
    nome VARCHAR(50),
    email VARCHAR(255),
    senha VARCHAR(255),
    acesso ENUM('leitor', 'editor', 'gestor', 'dono') DEFAULT 'leitor',
    dt_nascimento DATE,
    celular VARCHAR(20),
    cpf VARCHAR(14),
    rg VARCHAR(14),
    estado_civil VARCHAR(20),
    genero VARCHAR(30),

    UNIQUE KEY uk_usuario_email(email),

    CONSTRAINT fk_usuario_empresa
        FOREIGN KEY (id_empresa)
        REFERENCES empresa(id)
);

CREATE TABLE token (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT,
    token VARCHAR(1000),
    data_expiracao DATETIME,

    CONSTRAINT fk_token_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id)
);

CREATE TABLE preferencias_usuario (
    id_usuario INT PRIMARY KEY,
    tema_preferencia TINYINT(1),
    notifica_email TINYINT(1),
    notifica_painel TINYINT(1),
    alerta_sonoro TINYINT(1),

    CONSTRAINT fk_preferencias_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id)
);

CREATE TABLE convite_empresa (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_empresa INT,
    email_convidado VARCHAR(60),
    token_convite VARCHAR(255),
    data_expiracao DATETIME,
    status_convite VARCHAR(25),

    CONSTRAINT fk_convite_empresa
        FOREIGN KEY (id_empresa)
        REFERENCES empresa(id)
);

CREATE TABLE historico_upload (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT,
    id_empresa INT,
    nome_arquivo VARCHAR(150),
    tamanho_arquivo BIGINT,
    data_hora_envio DATETIME,
    status_processamento VARCHAR(50),
    motivo_falha VARCHAR(200),

    CONSTRAINT fk_historico_upload_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id),

    CONSTRAINT fk_historico_upload_empresa
        FOREIGN KEY (id_empresa)
        REFERENCES empresa(id)
);

CREATE TABLE logs_auditoria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT,
    acao_realizada VARCHAR(255),
    dt_hora DATETIME,

    CONSTRAINT fk_logs_auditoria_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id)
);

CREATE TABLE tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticker VARCHAR(10) UNIQUE
);

CREATE TABLE cotacao_historico (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_tickets INT,
    data_fechamento DATE,
    preco_max DECIMAL(15,4),
    preco_min DECIMAL(15,4),
    preco_adj_close DECIMAL(15,4),

    CONSTRAINT fk_cotacao_historico_ticket
        FOREIGN KEY (id_tickets)
        REFERENCES tickets(id)
);