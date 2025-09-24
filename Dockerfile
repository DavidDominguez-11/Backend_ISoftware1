# Usa una imagen de Node.js
FROM node:18-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia archivos de dependencias
COPY package*.json ./

# Instala dependencias
RUN npm ci --only=production

# Copia el esquema de Prisma
COPY prisma ./prisma/

# Genera el cliente de Prisma
RUN npx prisma generate

# Copia todo el código fuente
COPY . .

# Puerto expuesto (el mismo que en server.js)
EXPOSE 4000

# Crea el script de inicio
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'echo "Waiting for database..."' >> /app/start.sh && \
    echo 'sleep 5' >> /app/start.sh && \
    echo 'echo "Running Prisma migrations..."' >> /app/start.sh && \
    echo 'npx prisma db push --accept-data-loss' >> /app/start.sh && \
    echo 'echo "Seeding database..."' >> /app/start.sh && \
    echo 'node src/seed.js || echo "Seeding failed or already done"' >> /app/start.sh && \
    echo 'echo "Starting application..."' >> /app/start.sh && \
    echo 'npm start' >> /app/start.sh && \
    chmod +x /app/start.sh

# Comando para iniciar el servidor
CMD ["/app/start.sh"]