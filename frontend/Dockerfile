FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package.json package-lock.json* ./
RUN npm install

# Copy source
COPY . .

# Build with API URL pointing to backend on port 8000
# In Docker the browser connects to host's localhost, so this still works
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ─── Production stage: nginx ────────────────────────────────────────────────
FROM nginx:1.27-alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
