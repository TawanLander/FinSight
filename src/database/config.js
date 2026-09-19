var mysql = require("mysql2");

// CONEXÃO DO BANCO MYSQL SERVER
var mySqlConfig = {
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
};

function executar(instrucao, parametros) {

    return new Promise(function (resolve, reject) {
        var conexao = mysql.createConnection(mySqlConfig);
        conexao.connect();
        conexao.query(instrucao, parametros, function (erro, resultados) {
            conexao.end();
            if (erro) {
                return reject(erro);
            }
            console.log(resultados);
            resolve(resultados);
        });
        conexao.on('error', function (erro) {
            console.log("ERRO NO MySQL SERVER:", erro.sqlMessage);
        });
    });
}

function executarTransacao(operacoes) {

    return new Promise(function (resolve, reject) {
        var pool = mysql.createPool(mySqlConfig);

        pool.getConnection(function (erro, conexao) {
            if (erro) {
                pool.end();
                return reject(erro);
            }

            function query(instrucao, parametros) {
                return new Promise(function (resolveQuery, rejectQuery) {
                    conexao.query(instrucao, parametros, function (erro, resultados) {
                        if (erro) {
                            return rejectQuery(erro);
                        }
                        resolveQuery(resultados);
                    });
                });
            }

            function finalizar(erro, resultado) {
                conexao.release();
                pool.end();
                if (erro) {
                    return reject(erro);
                }
                resolve(resultado);
            }

            conexao.beginTransaction(function (erro) {
                if (erro) {
                    return finalizar(erro);
                }

                operacoes(query)
                    .then(function (resultado) {
                        conexao.commit(function (erro) {
                            if (erro) {
                                return conexao.rollback(function () {
                                    finalizar(erro);
                                });
                            }
                            finalizar(null, resultado);
                        });
                    })
                    .catch(function (erro) {
                        conexao.rollback(function () {
                            finalizar(erro);
                        });
                    });
            });
        });
    });
}

module.exports = {
    executar,
    executarTransacao
};