const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SENHA_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

function isEmailAndPasswordValid(email, password) {
  let emailValido = EMAIL_REGEX.test(email);
  let senhaValida = SENHA_REGEX.test(password);

  return emailValido && senhaValida;
}

module.exports = {
  isEmailAndPasswordValid,
};