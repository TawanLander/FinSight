#!/usr/bin/env bash
set -Eeuo pipefail

trap 'echo "ERRO na linha $LINENO: $BASH_COMMAND" >&2' ERR

# ==========================================================
# DEPLOY AUTOMATIZADO DO FINSIGHT (EC2 do zero)
# ==========================================================
# Uso básico:
#   sudo ./deploy-finsight.sh
#
# Opções (todas opcionais, passadas antes do script):
#   sudo BRANCH=main ./deploy-finsight.sh
#   sudo EMAIL_USUARIO='voce@gmail.com' EMAIL_SENHA='abcd efgh ijkl mnop' \
#        ./deploy-finsight.sh
#   sudo REQUIRE_EBS=true ./deploy-finsight.sh
# ==========================================================

# ==========================================
# CONFIGURAÇÕES
# ==========================================

REPO_URL="${REPO_URL:-https://github.com/TawanLander/FinSight.git}"
BRANCH="${BRANCH:-dev}"

# true  = aborta se não houver disco extra para os dados do MySQL
# false = usa o disco raiz (os dados somem se a instância for destruída)
REQUIRE_EBS="${REQUIRE_EBS:-false}"

# Credenciais de e-mail informadas na linha de comando (guardadas antes de
# o .env ser carregado)
CLI_EMAIL_USUARIO="${EMAIL_USUARIO:-}"
CLI_EMAIL_SENHA="${EMAIL_SENHA:-}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="${1:-$SCRIPT_DIR/FinSight}"

DB_DIR="$SCRIPT_DIR/finsight-database"
DB_INIT_DIR="$DB_DIR/init"

DB_CONTAINER="ctr-banco"
APP_CONTAINER="ctr-finsight"

DB_IMAGE="img-banco:1"
APP_IMAGE="img-finsight:1"

NETWORK="finsight-network"

EBS_DIR="/dados/mysql-data"
DB_DATA_DIR="$EBS_DIR/mysql"

ENV_FILE="$PROJECT_DIR/.env"

# ==========================================
# VERIFICAÇÃO DE PERMISSÃO
# ==========================================

if [[ "$EUID" -ne 0 ]]; then
    echo "Execute com sudo: sudo $0"
    exit 1
fi

# ==========================================
# PREPARAÇÃO DO SERVIDOR (EC2 NOVA)
# ==========================================

install_dependencies() {
    local need=false cmd

    for cmd in git docker openssl curl; do
        command -v "$cmd" >/dev/null 2>&1 || need=true
    done

    [[ "$need" == false ]] && return 0

    echo "Instalando dependências (git, docker, openssl)..."

    # shellcheck disable=SC1091
    source /etc/os-release

    case "${ID:-}" in
        ubuntu|debian)
            export DEBIAN_FRONTEND=noninteractive
            apt-get update -y
            apt-get install -y git openssl curl ca-certificates docker.io
            ;;
        amzn)
            # No Amazon Linux 2023 o pacote "curl" conflita com "curl-minimal"
            # (já instalado), por isso ele não é pedido aqui.
            if command -v dnf >/dev/null 2>&1; then
                dnf install -y git openssl docker
            else
                yum install -y git openssl docker
            fi
            ;;
        *)
            echo "ERRO: Sistema '${ID:-desconhecido}' não suportado para instalação"
            echo "      automática. Instale git, docker e openssl manualmente."
            exit 1
            ;;
    esac
}

start_docker() {
    if ! docker info >/dev/null 2>&1; then
        systemctl enable --now docker
        sleep 3
    fi

    if ! docker info >/dev/null 2>&1; then
        echo "ERRO: O serviço do Docker não está em execução."
        exit 1
    fi
}

# Instâncias pequenas (1 GB) travam no npm install / MySQL sem swap
setup_swap() {
    local mem_mb
    mem_mb="$(awk '/MemTotal/ {print int($2/1024)}' /proc/meminfo)"

    if [[ "$mem_mb" -lt 2000 && -z "$(swapon --show --noheadings)" ]]; then
        echo "Pouca memória (${mem_mb} MB). Criando swap de 2 GB..."
        if [[ ! -f /swapfile ]]; then
            dd if=/dev/zero of=/swapfile bs=1M count=2048 status=none
            chmod 600 /swapfile
            mkswap /swapfile >/dev/null
        fi
        swapon /swapfile
        grep -q '^/swapfile' /etc/fstab \
            || echo '/swapfile none swap sw 0 0' >> /etc/fstab
    fi
}

# Procura um disco extra: sem partições e sem ponto de montagem
find_extra_disk() {
    local dev

    while read -r dev; do
        [[ -n "$(lsblk -no MOUNTPOINT "$dev" | tr -d '[:space:]')" ]] && continue
        [[ "$(lsblk -n "$dev" | wc -l)" -gt 1 ]] && continue
        echo "$dev"
        return 0
    done < <(lsblk -dnpo NAME,TYPE | awk '$2=="disk" {print $1}')

    return 1
}

setup_data_disk() {
    local dev fstype uuid

    mkdir -p "$EBS_DIR"

    if mountpoint -q "$EBS_DIR"; then
        echo "Disco de dados já montado em $EBS_DIR."
        return 0
    fi

    dev="$(find_extra_disk || true)"

    if [[ -z "$dev" ]]; then
        if [[ "$REQUIRE_EBS" == true ]]; then
            echo "ERRO: Nenhum disco EBS extra encontrado (REQUIRE_EBS=true)."
            exit 1
        fi
        echo "AVISO: Nenhum disco EBS extra encontrado."
        echo "       Os dados do MySQL ficarão no disco raiz: $EBS_DIR"
        return 0
    fi

    fstype="$(blkid -s TYPE -o value "$dev" 2>/dev/null || true)"

    if [[ -z "$fstype" ]]; then
        echo "Formatando $dev como ext4..."
        mkfs.ext4 -q -L finsight-data "$dev"
        fstype="ext4"
    else
        echo "$dev já possui sistema de arquivos ($fstype). Mantendo os dados."
    fi

    uuid="$(blkid -s UUID -o value "$dev")"

    grep -q "$uuid" /etc/fstab \
        || echo "UUID=$uuid $EBS_DIR $fstype defaults,nofail 0 2" >> /etc/fstab

    mount "$EBS_DIR"
    echo "Disco $dev montado em $EBS_DIR."
}

install_dependencies
start_docker
setup_swap
setup_data_disk

echo "=========================================="
echo "       DEPLOY AUTOMATIZADO FINSIGHT"
echo "=========================================="

# ==========================================
# FUNÇÕES AUXILIARES
# ==========================================

# Atualiza ou adiciona uma variável no .env (seguro para qualquer valor)
set_env() {
    local key="$1"
    local value="$2"
    local tmp

    tmp="$(mktemp)"
    grep -v "^${key}=" "$ENV_FILE" > "$tmp" || true
    printf '%s=%s\n' "$key" "$value" >> "$tmp"
    cat "$tmp" > "$ENV_FILE"   # preserva dono e permissões do arquivo
    rm -f "$tmp"
}

# Coloca o valor entre aspas simples, escapando aspas internas
quote_env() {
    local v="$1" q="'"
    printf "'%s'" "${v//$q/$q\\$q$q}"
}

load_env() {
    set -a
    # shellcheck disable=SC1090
    source "$ENV_FILE"
    set +a
}

# ==========================================
# BAIXAR / ATUALIZAR PROJETO DO GITHUB
# ==========================================

echo ""
echo "Sincronizando projeto ($REPO_URL, branch $BRANCH)..."

if [[ -d "$PROJECT_DIR/.git" ]]; then
    git -C "$PROJECT_DIR" remote set-url origin "$REPO_URL"
    git -C "$PROJECT_DIR" fetch --prune origin
elif [[ -e "$PROJECT_DIR" ]]; then
    echo "ERRO: $PROJECT_DIR existe, mas não é um repositório Git."
    echo "      Remova-o ou informe outro diretório."
    exit 1
else
    git clone "$REPO_URL" "$PROJECT_DIR"
fi

if ! git -C "$PROJECT_DIR" rev-parse --verify --quiet "origin/$BRANCH" >/dev/null; then
    echo "ERRO: Branch '$BRANCH' não existe no repositório."
    exit 1
fi

# -f descarta alterações locais em arquivos versionados; o .env (ignorado
# pelo Git) é preservado.
git -C "$PROJECT_DIR" checkout -f -B "$BRANCH" "origin/$BRANCH"

echo "Projeto atualizado: $(git -C "$PROJECT_DIR" log -1 --format='%h %s')"

if [[ ! -f "$PROJECT_DIR/package.json" ||
      ! -f "$PROJECT_DIR/package-lock.json" ]]; then
    echo "ERRO: package.json ou package-lock.json não encontrado no repositório."
    exit 1
fi

# ==========================================
# LOCALIZAR SCRIPT SQL E DETECTAR NOME DO BANCO
# ==========================================

rm -rf "$DB_INIT_DIR"
mkdir -p "$DB_INIT_DIR"

SQL_DEST="$DB_INIT_DIR/001-initialdb.sql"

mapfile -t SQL_FILES < <(
    find "$PROJECT_DIR/src/database" \
        -maxdepth 1 \
        -type f \
        -iname "*.sql" \
        -print 2>/dev/null | sort || true
)

if [[ "${#SQL_FILES[@]}" -ne 1 ]]; then
    echo "ERRO: Esperado exatamente um arquivo SQL em src/database."
    echo "Arquivos encontrados: ${#SQL_FILES[@]}"
    printf '%s\n' "${SQL_FILES[@]}"
    exit 1
fi

cp -f "${SQL_FILES[0]}" "$SQL_DEST"
sed -i 's/\r$//' "$SQL_DEST"
echo "Script SQL copiado: ${SQL_FILES[0]}"

# O SQL cria o próprio banco? (CREATE DATABASE/SCHEMA)
SQL_CREATES_DB=false
if grep -qiE '^[[:space:]]*create[[:space:]]+(database|schema)' "$SQL_DEST"; then
    SQL_CREATES_DB=true
fi

# Nome do banco usado no SQL (CREATE DATABASE ou USE)
SQL_DB_NAME="$(
    sed -nE 's/^[[:space:]]*create[[:space:]]+(database|schema)[[:space:]]+(if[[:space:]]+not[[:space:]]+exists[[:space:]]+)?`?([A-Za-z0-9_$]+)`?.*/\3/Ip' "$SQL_DEST" \
        | head -n1 || true
)"

if [[ -z "$SQL_DB_NAME" ]]; then
    SQL_DB_NAME="$(
        sed -nE 's/^[[:space:]]*use[[:space:]]+`?([A-Za-z0-9_$]+)`?.*/\1/Ip' "$SQL_DEST" \
            | head -n1 || true
    )"
fi

# ==========================================
# PREPARAR .ENV
# ==========================================

if [[ ! -f "$ENV_FILE" ]]; then
    if [[ -f "$PROJECT_DIR/.env.example" ]]; then
        cp "$PROJECT_DIR/.env.example" "$ENV_FILE"
        echo ".env criado a partir do .env.example"
    else
        : > "$ENV_FILE"
        echo ".env criado vazio (.env.example não encontrado)"
    fi
fi

chmod 600 "$ENV_FILE"

# Remove CRLF (arquivos editados no Windows)
sed -i 's/\r$//' "$ENV_FILE"

load_env

# ==========================================
# PREENCHER VALORES (substitui vazios e placeholders do .env.example)
# ==========================================

# Segredos JWT
if [[ -z "${JWT_SECRET:-}" || "$JWT_SECRET" == "seuJWT" ||
      "$JWT_SECRET" == uma-chave-secreta* ]]; then
    set_env "JWT_SECRET" "$(openssl rand -hex 32)"
fi

if [[ -z "${JWT_REFRESH_SECRET:-}" || "$JWT_REFRESH_SECRET" == "seuJWT" ||
      "$JWT_REFRESH_SECRET" == uma-chave-secreta* ]]; then
    set_env "JWT_REFRESH_SECRET" "$(openssl rand -hex 32)"
fi

# Banco: usuário e senha da aplicação
if [[ -z "${DB_USER:-}" || "$DB_USER" == "seu_usuario" ]]; then
    set_env "DB_USER" "finsight_app"
fi

if [[ -z "${DB_PASSWORD:-}" || "$DB_PASSWORD" == "sua_senha" ]]; then
    set_env "DB_PASSWORD" "$(openssl rand -hex 24)"
fi

if [[ -z "${MYSQL_ROOT_PASSWORD:-}" ]]; then
    set_env "MYSQL_ROOT_PASSWORD" "$(openssl rand -hex 24)"
fi

# Nome do banco: o mesmo que o SQL cria/usa (senão a aplicação não o encontra)
if [[ -n "$SQL_DB_NAME" ]]; then
    set_env "DB_DATABASE" "$SQL_DB_NAME"
elif [[ -z "${DB_DATABASE:-}" ]]; then
    set_env "DB_DATABASE" "finsight"
fi

# Porta da aplicação: precisa ser numérica (o exemplo traz "portaDoServidorWeb")
if [[ ! "${APP_PORT:-}" =~ ^[0-9]+$ ]]; then
    set_env "APP_PORT" "8080"
fi

# Rede Docker: o host do banco é o nome do container
set_env "DB_HOST" "$DB_CONTAINER"
set_env "DB_PORT" "3306"

# Dentro do container a aplicação precisa escutar em todas as interfaces
set_env "APP_HOST" "0.0.0.0"

# E-mail
if [[ -z "${EMAIL_HOST:-}" ]]; then set_env "EMAIL_HOST" "smtp.gmail.com"; fi
if [[ -z "${EMAIL_PORT:-}" ]]; then set_env "EMAIL_PORT" "465"; fi

if [[ -n "$CLI_EMAIL_USUARIO" ]]; then
    set_env "EMAIL_USUARIO" "$(quote_env "$CLI_EMAIL_USUARIO")"
fi

if [[ -n "$CLI_EMAIL_SENHA" ]]; then
    set_env "EMAIL_SENHA" "$(quote_env "$CLI_EMAIL_SENHA")"
fi

# Recarrega o .env já atualizado
load_env

DB_DATABASE="$DB_DATABASE"
DB_USER="$DB_USER"
DB_PASSWORD="$DB_PASSWORD"
APP_PORT="$APP_PORT"
MYSQL_ROOT_PASSWORD="$MYSQL_ROOT_PASSWORD"

if [[ "$DB_USER" == "root" ]]; then
    echo "ERRO: Utilize um usuário específico para a aplicação (DB_USER)."
    exit 1
fi

EMAIL_OK=true
if [[ "${EMAIL_USUARIO:-}" != *@* || -z "${EMAIL_SENHA:-}" ||
      "${EMAIL_SENHA:-}" == *"sua senha"* ]]; then
    EMAIL_OK=false
fi

# ==========================================
# ARQUIVO DE VARIÁVEIS PARA O CONTAINER DA APLICAÇÃO
# ==========================================
# O "docker --env-file" NÃO remove aspas (EMAIL_SENHA='abc' chegaria com as
# aspas na aplicação). Por isso gera-se um arquivo temporário com os valores
# já interpretados pelo bash. A senha root do MySQL não vai para a aplicação.

DOCKER_ENV_FILE="$(mktemp)"
chmod 600 "$DOCKER_ENV_FILE"
trap 'rm -f "$DOCKER_ENV_FILE"' EXIT

while IFS= read -r line; do
    if [[ "$line" =~ ^[[:space:]]*([A-Za-z_][A-Za-z0-9_]*)= ]]; then
        key="${BASH_REMATCH[1]}"
        [[ "$key" == "MYSQL_ROOT_PASSWORD" ]] && continue
        printf '%s=%s\n' "$key" "${!key-}" >> "$DOCKER_ENV_FILE"
    fi
done < "$ENV_FILE"

# ==========================================
# SCRIPT DE CRIAÇÃO DO USUÁRIO DA APLICAÇÃO (roda após o SQL)
# ==========================================

cat > "$DB_INIT_DIR/002-app-user.sh" <<'EOF'
#!/bin/bash
set -e

mysql -uroot -p"${MYSQL_ROOT_PASSWORD}" <<SQL
CREATE USER IF NOT EXISTS '${APP_DB_USER}'@'%' IDENTIFIED BY '${APP_DB_PASSWORD}';
GRANT ALL PRIVILEGES ON \`${APP_DB_NAME}\`.* TO '${APP_DB_USER}'@'%';
FLUSH PRIVILEGES;
SQL
EOF

chmod +x "$DB_INIT_DIR/002-app-user.sh"

# ==========================================
# DOCKERFILE DO BANCO
# ==========================================

cat > "$DB_DIR/Dockerfile" <<'EOF'
FROM mysql:8.0

COPY init/ /docker-entrypoint-initdb.d/

EXPOSE 3306
EOF

# ==========================================
# DOCKERFILE DA APLICAÇÃO
# ==========================================

cat > "$PROJECT_DIR/Dockerfile" <<'EOF'
FROM node:22

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev || npm install --omit=dev

COPY . .

EXPOSE 8080

CMD ["npm", "start"]
EOF

# ==========================================
# DOCKERIGNORE DA APLICAÇÃO
# ==========================================

cat > "$PROJECT_DIR/.dockerignore" <<'EOF'
.git
.gitignore
.env
.env.*
node_modules
**/node_modules
*.log
npm-debug.log*
.DS_Store
Thumbs.db
.vscode
.idea
coverage
.nyc_output
Dockerfile
.dockerignore
EOF

# ==========================================
# PREPARAR ARMAZENAMENTO DO MYSQL
# ==========================================

mkdir -p "$DB_DATA_DIR"

# Banco vazio = primeira inicialização (o SQL inicial será executado)
FRESH_DB=false
if [[ -z "$(ls -A "$DB_DATA_DIR")" ]]; then
    FRESH_DB=true
fi

# ==========================================
# CRIAR REDE DOCKER
# ==========================================

if ! docker network inspect "$NETWORK" >/dev/null 2>&1; then
    docker network create "$NETWORK"
fi

# ==========================================
# CONSTRUIR IMAGENS
# ==========================================

echo ""
echo "Construindo imagem MySQL..."
docker build -t "$DB_IMAGE" "$DB_DIR"

echo ""
echo "Construindo imagem FinSight..."
docker build -t "$APP_IMAGE" "$PROJECT_DIR"

# ==========================================
# RECRIAR CONTAINER DO BANCO
# ==========================================

echo ""
echo "Iniciando banco de dados..."

docker rm -f "$DB_CONTAINER" >/dev/null 2>&1 || true

DB_RUN_ENV=(
    -e MYSQL_ROOT_PASSWORD="$MYSQL_ROOT_PASSWORD"
    -e APP_DB_NAME="$DB_DATABASE"
    -e APP_DB_USER="$DB_USER"
    -e APP_DB_PASSWORD="$DB_PASSWORD"
)

# Se o SQL não cria o banco, o MySQL o cria automaticamente
if [[ "$SQL_CREATES_DB" != true ]]; then
    DB_RUN_ENV+=(-e MYSQL_DATABASE="$DB_DATABASE")
fi

docker run -d \
    --name "$DB_CONTAINER" \
    --network "$NETWORK" \
    --restart unless-stopped \
    "${DB_RUN_ENV[@]}" \
    -v "$DB_DATA_DIR:/var/lib/mysql" \
    "$DB_IMAGE"

# Em caso de falha na primeira inicialização, limpa os dados parciais para
# que a próxima execução inicialize o banco do zero
db_fail() {
    echo "ERRO: $1"
    docker logs --tail 80 "$DB_CONTAINER" || true

    if [[ "$FRESH_DB" == true ]]; then
        docker rm -f "$DB_CONTAINER" >/dev/null 2>&1 || true
        find "$DB_DATA_DIR" -mindepth 1 -delete
        echo ""
        echo "Os dados parciais do MySQL foram removidos."
        echo "Corrija o problema indicado acima e execute o script novamente."
    else
        echo ""
        echo "O diretório $DB_DATA_DIR já continha dados de uma execução anterior."
        echo "Se for um banco de teste, apague-o com:"
        echo "  sudo rm -rf ${DB_DATA_DIR:?}/* && sudo $0"
    fi

    exit 1
}

# ==========================================
# AGUARDAR MYSQL
# ==========================================

echo ""
echo "Aguardando inicialização do MySQL..."

MYSQL_READY=false

for _ in $(seq 1 90); do

    # MYSQL_PWD evita expor a senha na linha de comando
    if docker exec -e MYSQL_PWD="$MYSQL_ROOT_PASSWORD" "$DB_CONTAINER" \
        mysqladmin ping -h 127.0.0.1 -uroot --silent >/dev/null 2>&1; then
        MYSQL_READY=true
        break
    fi

    sleep 2
done

if [[ "$MYSQL_READY" != true ]]; then
    db_fail "MySQL não iniciou corretamente."
fi

# Confirma que o usuário da aplicação consegue acessar o banco
if ! docker exec -e MYSQL_PWD="$DB_PASSWORD" "$DB_CONTAINER" \
    mysql -h127.0.0.1 -u"$DB_USER" -e "USE \`$DB_DATABASE\`" >/dev/null 2>&1; then
    db_fail "O usuário '$DB_USER' não consegue acessar o banco '$DB_DATABASE'."
fi

echo "MySQL inicializado!"

# ==========================================
# RECRIAR CONTAINER DA APLICAÇÃO
# ==========================================

echo ""
echo "Iniciando aplicação FinSight..."

docker rm -f "$APP_CONTAINER" >/dev/null 2>&1 || true

docker run -d \
    --name "$APP_CONTAINER" \
    --network "$NETWORK" \
    --restart unless-stopped \
    --env-file "$DOCKER_ENV_FILE" \
    -p "0.0.0.0:${APP_PORT}:${APP_PORT}" \
    "$APP_IMAGE"

sleep 6

APP_RUNNING="$(docker inspect -f '{{.State.Running}}' "$APP_CONTAINER")"
APP_RESTARTS="$(docker inspect -f '{{.RestartCount}}' "$APP_CONTAINER")"

if [[ "$APP_RUNNING" != true || "$APP_RESTARTS" -gt 0 ]]; then
    echo "ERRO: A aplicação não iniciou corretamente. Últimos logs:"
    docker logs --tail 60 "$APP_CONTAINER" || true
    exit 1
fi

# ==========================================
# RESULTADO
# ==========================================

PUBLIC_IP=""
if command -v curl >/dev/null 2>&1; then
    IMDS_TOKEN="$(curl -s -m 2 -X PUT http://169.254.169.254/latest/api/token \
        -H 'X-aws-ec2-metadata-token-ttl-seconds: 60' || true)"
    PUBLIC_IP="$(curl -s -m 2 -H "X-aws-ec2-metadata-token: $IMDS_TOKEN" \
        http://169.254.169.254/latest/meta-data/public-ipv4 || true)"
fi
PUBLIC_IP="${PUBLIC_IP:-IP_PUBLICO_DA_EC2}"

echo ""
echo "=========================================="
echo "          DEPLOY FINALIZADO"
echo "=========================================="

echo ""
echo "IMAGENS:"
docker image ls "$APP_IMAGE"
docker image ls "$DB_IMAGE"

echo ""
echo "CONTAINERS:"
docker ps --filter "name=ctr-"

echo ""
echo "REDE:"
docker network inspect "$NETWORK" \
    --format '{{range .Containers}}{{.Name}} {{end}}'
echo ""

echo ""
echo "SITE:"
echo "http://${PUBLIC_IP}:${APP_PORT}"
echo "(libere a porta ${APP_PORT} no Security Group da EC2)"

echo ""
echo "BANCO:"
echo "Host interno: $DB_CONTAINER"
echo "Porta interna: 3306"
echo "Database: $DB_DATABASE"
echo "Usuário: $DB_USER"
echo "Credenciais completas (inclui senha root do MySQL): $ENV_FILE"

if [[ "$EMAIL_OK" != true ]]; then
    echo ""
    echo "AVISO: e-mail NÃO configurado (EMAIL_USUARIO / EMAIL_SENHA)."
    echo "       O envio de e-mails não funcionará. Para configurar, execute:"
    echo "       sudo EMAIL_USUARIO='voce@gmail.com' EMAIL_SENHA='sua senha de app' $0"
fi

echo ""
echo "Para acompanhar os logs:"
echo "sudo docker logs -f $APP_CONTAINER"
echo "sudo docker logs -f $DB_CONTAINER"

echo ""
echo "DEPLOY CONCLUÍDO!"
