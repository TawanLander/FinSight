const bd = require("../database/config");

async function listar(idUsuario) {
    const instrucao = `
        SELECT
            id,
            nome_arquivo,
            tamanho_arquivo,
            data_hora_envio
        FROM historico_upload
        WHERE id_usuario = ?
        ORDER BY data_hora_envio DESC, id DESC;
    `;

    return await bd.executar(instrucao, [idUsuario]);
}

async function registrar(idUsuario, nomeArquivo, tamanhoArquivo) {
    const instrucao = `
        INSERT INTO historico_upload (
            id_usuario,
            nome_arquivo,
            tamanho_arquivo,
            data_hora_envio,
            status_processamento
        ) VALUES (?, ?, ?, NOW(), ?);
    `;

    return await bd.executar(instrucao, [
        idUsuario,
        nomeArquivo,
        tamanhoArquivo,
        "Processado"
    ]);
}

module.exports = {
    listar,
    registrar
};
