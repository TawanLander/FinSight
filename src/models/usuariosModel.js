const db = require("../database/config");

function logar(email, senha){
    return db.executar(`
        select * 
        from usuarios
        where email = '${email}' and
        senha = '${senha}'    
    `);
}

module.exports = {
    logar
}