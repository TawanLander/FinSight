CREATE DATABASE IF NOT EXISTS finsight;
USE finsight;

CREATE TABLE empresa (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cnpj VARCHAR(18),
    nome_fantasia VARCHAR(80),
    dt_cadastro DATE,
    UNIQUE KEY uk_empresa_cnpj (cnpj)
);

CREATE TABLE usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_empresa INT,
    nome VARCHAR(50),
    email VARCHAR(60),
    senha VARCHAR(50),
    perfil_acesso TINYINT,

    CONSTRAINT fk_usuario_empresa
        FOREIGN KEY (id_empresa)
        REFERENCES empresa(id)
) ;

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

