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

# Puerto expuesto (el mismo que en server.js)
EXPOSE 4000

# Comando para iniciar el servidor
CMD ["node", "src/server.js"]