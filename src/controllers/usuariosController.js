const usuariosModel = require("../models/usuariosModel");

function userList(req, res) {

  usuariosModel.userList()
    .then(function (resultado) {
      res.status(200).json(resultado);
    })
    .catch(function (err) {
      console.log("Erro ao listar os users: ", err.sqlMessage);
      res.status(500).json(err.sqlMessage);
    });

}

function userPut(req, res) {
    const id = req.params.id;
    const nome = req.body.nome;
    const email = req.body.email;
    const perfil = req.body.perfil;

    if (id == undefined) {
        res.status(400).send("O ID do usuário está undefined!");
    } else if (nome == undefined) {
        res.status(400).send("O nome está undefined!");
    } else if (email == undefined) {
        res.status(400).send("O email está undefined!");
    } else if (perfil == undefined) {
        res.status(400).send("O perfil está undefined!");
    } else {
        usuariosModel.userPut(id, nome, email, perfil)
            .then(function (resultado) {
                res.status(200).json(resultado);
            })
            .catch(function (err) {
                console.log("Erro ao tentar atualizar o user: ", err.sqlMessage);
                res.status(500).json(err.sqlMessage);
            })
    }
}

// function userPatch(req, res) {
//     const id = req.params.id;
//     const nome = req.body.nome;
//     const email = req.body.email;
//     const perfil = req.body.perfil;
//     const senha = req.body.perfil;

//     if (id == undefined) {
//         res.status(400).send("O ID do usuário está undefined!");
//     } else if (nome == undefined) {
//         res.status(400).send("O nome está undefined!");
//     } else if (email == undefined) {
//         res.status(400).send("O email está undefined!");
//     } else if (perfil == undefined) {
//         res.status(400).send("O perfil está undefined!");
//     } else if (senha == undefined) {

//     } else {
//         usuariosModel.userPut(id, nome, email, perfil)
//             .then(function (resultado) {
//                 res.status(200).json(resultado);
//             })
//             .catch(function (err) {
//                 console.log("Erro ao tentar atualizar o user: ", sqlMessage);
//                 res.status(500).json(err.sqlMessage);
//             })
//     }
// }

function userDelete(req, res) {
    const id = req.params.id;

    if (id == undefined) {
        res.status(400).send("O id do user ta undefined");
    } else {
        usuariosModel.userDelete(id).then(function (resultado) {
            res.status(200).json(resultado);
        })
        .catch (function (err) {
            console.log("Erro ao deletar o user: ", err.sqlMessage);
            res.status(500).json(err.sqlMessage);
        })
    }
}

module.exports = {
  list: userList,
  put: userPut,
//   patch: userPatch,
  delete: userDelete
};