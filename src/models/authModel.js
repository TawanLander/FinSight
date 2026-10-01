const db = require('../database/config');

async function findByEmail(email) {
    const rows = await db.executar('SELECT * FROM usuario WHERE email = ?', [email]);
    if (!rows || rows.length === 0) {
        return false;
    }
    return rows[0];
}

async function create(user) {
    const { name, email, password, enterprise_id, access_profile = null } = user;
    const result = await db.executar(
        'INSERT INTO usuario (nome, email, senha, id_empresa, perfil_acesso) VALUES (?, ?, ?, ?, ?)',
        [name, email, password, enterprise_id, access_profile]
    );
    return { id: result.insertId, name, email, enterprise_id };
}

async function updatePassword(email, newPassword) {
    const result = await db.executar('UPDATE usuario SET senha = ? WHERE email = ?', [newPassword, email]);
    return result.affectedRows > 0;
}

async function verifyToken(token) {
    const rows = await db.executar('SELECT * FROM token WHERE token = ?', [token]);
    if (rows.length === 0) {
        return false;
    }
    if (rows[0].data_expiracao < new Date()) {
        await db.executar('DELETE FROM token WHERE token = ?', [token]);
        return false;
    }
    return rows[0];
}

async function saveToken(token, userId, expiresAt) {
    const result = await db.executar(
        'INSERT INTO token (token, id_usuario, data_expiracao) VALUES (?, ?, ?)',
        [token, userId, expiresAt]
    );
    return result.affectedRows === 1;
}

async function rotateToken(oldToken, newToken, userId, expiresAt) {
    const result = await db.executar(
        `UPDATE token
         SET token = ?, data_expiracao = ?
         WHERE token = ? AND id_usuario = ? AND data_expiracao > ?`,
        [newToken, expiresAt, oldToken, userId, new Date()]
    );
    return result.affectedRows === 1;
}

async function deleteToken(token) {
    const result = await db.executar('DELETE FROM token WHERE token = ?', [token]);
    return result.affectedRows > 0;
}

async function resetPasswordAndSessions(userId, hashedPassword) {
    try {
        await db.executarTransacao(async function (query) {
            var resultado = await query('UPDATE usuario SET senha = ? WHERE id = ?', [hashedPassword, userId]);
            if (resultado.affectedRows !== 1) {
                throw new Error('Usuário não encontrado');
            }

            await query('DELETE FROM token WHERE id_usuario = ?', [userId]);
        });
        return true;
    } catch (error) {
        console.error('Erro ao redefinir password:', error);
        return false;
    }
}

async function findById(id) {
    const rows = await db.executar('SELECT * FROM usuario WHERE id = ?', [id]);
    if (!rows || rows.length === 0) {
        return false;
    }
    return rows[0];
}

module.exports = {
    findByEmail,
    findById,
    create,
    updatePassword,
    verifyToken,
    saveToken,
    rotateToken,
    deleteToken,
    resetPasswordAndSessions
};