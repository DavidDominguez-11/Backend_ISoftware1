# Usa una imagen de Node.js
FROM node:18-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia archivos de dependencias
COPY package*.json ./

# Instala dependencias
RUN npm install

# Copia todo el código fuente
COPY . .

# Genera el cliente de Prisma
RUN npx prisma generate

# Puerto expuesto (el mismo que en server.js)
EXPOSE 3000

# Comando para iniciar el servidor directamente con wait
CMD ["sh", "-c", "sleep 10 && npx prisma db push && node src/seed.js && npm run dev"]