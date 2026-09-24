const db = require('../database/config');

async function findByEmail(email) {
    const rows = await db.executar('SELECT * FROM users WHERE email = ?', [email]);
    if (!rows || rows.length === 0) {
        return false;
    }
    return rows[0];
}

async function create(user) {
    const { nome, email, senha } = user;
    const result = await db.executar('INSERT INTO users (nome, email, senha) VALUES (?, ?, ?)', [nome, email, senha]);
    return { id: result.insertId, nome, email };
}

async function updatePassword(email, newPassword) {
    const result = await db.executar('UPDATE users SET senha = ? WHERE email = ?', [newPassword, email]);
    return result.affectedRows > 0;
}

async function verifyToken(token) {
    const rows = await db.executar('SELECT * FROM tokens WHERE refresh_token = ?', [token]);
    if (rows.length === 0) {
        return false;
    }
    if(rows[0].expires_at < new Date()) {
        await db.executar('DELETE FROM tokens WHERE refresh_token = ?', [token]);
        return false;
    }
    return rows[0];
}

async function saveToken(token, userId, expiresAt) {
    const result = await db.executar(
        'INSERT INTO tokens (refresh_token, user_id, expires_at) VALUES (?, ?, ?)',
        [token, userId, expiresAt]
    );
    return result.affectedRows === 1;
}

async function rotateToken(oldToken, newToken, userId, expiresAt) {
    const result = await db.executar(
        `UPDATE tokens
         SET refresh_token = ?, expires_at = ?
         WHERE refresh_token = ? AND user_id = ? AND expires_at > ?`,
        [newToken, expiresAt, oldToken, userId, new Date()]
    );
    return result.affectedRows === 1;
}

async function deleteToken(token) {
    const result = await db.executar('DELETE FROM tokens WHERE refresh_token = ?', [token]);
    return result.affectedRows > 0;
}

async function resetPasswordAndSessions(userId, hashedPassword) {
    try {
        await db.executarTransacao(async function (query) {
            var resultado = await query('UPDATE users SET senha = ? WHERE id = ?', [hashedPassword, userId]);
            if (resultado.affectedRows !== 1) {
                throw new Error('Usuário não encontrado');
            }

            await query('DELETE FROM tokens WHERE user_id = ?', [userId]);
        });
        return true;
    } catch (error) {
        console.error('Erro ao redefinir senha:', error);
        return false;
    }
}

module.exports = {
    findByEmail,
    create,
    updatePassword,
    verifyToken,
    saveToken,
    rotateToken,
    deleteToken,
    resetPasswordAndSessions
};