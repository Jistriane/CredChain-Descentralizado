# API Gateway Dockerfile
FROM node:18-alpine

# Instala dependências do sistema
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git \
    curl

# Define diretório de trabalho
WORKDIR /app

# Copia package.json e package-lock.json
COPY package*.json ./

# Instala dependências
RUN npm ci --only=production

# Copia código fonte
COPY . .

# Cria usuário não-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S api -u 1001

# Muda para usuário não-root
USER api

# Expõe porta
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:4000/health || exit 1

# Comando de inicialização
CMD ["npm", "start"]
