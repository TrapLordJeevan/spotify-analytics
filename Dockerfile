FROM node:20-alpine
WORKDIR /app

# Install deps
COPY package.json package-lock.json ./
RUN npm ci

# Copy source
COPY . .

# Next dev needs to listen on all interfaces
EXPOSE 3000
ENV NODE_ENV=development

# Run dev server on 0.0.0.0:3000
CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0", "-p", "3000"]
