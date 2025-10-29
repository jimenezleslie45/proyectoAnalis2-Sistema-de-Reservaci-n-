# Etapa 1: build de React (con red estable y sin conflictos)
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm cache clean --force
RUN npm install --legacy-peer-deps --no-audit --progress=false
COPY . .
RUN npm run build

# Etapa 2: servidor de producción con Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 5173
CMD ["nginx", "-g", "daemon off;"]
