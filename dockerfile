# Usar una imagen base de Node.js
FROM node:20.17.0

# Establecer el directorio de trabajo en el contenedor
WORKDIR /usr/src/app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar las dependencias
RUN npm install --only=development

# Copiar el resto de la aplicación
COPY . .

# Copiar el archivo .development.env al contenedor
COPY .development.env ./

# Exponer el puerto en el que corre la aplicación
EXPOSE 3030
EXPOSE 81
# Comando para correr la aplicación
CMD ["npm", "run", "start:dev"]
