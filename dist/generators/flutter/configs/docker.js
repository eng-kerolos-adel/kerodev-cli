// src/generators/flutter/configs/docker.ts
export function generateFlutterDockerFiles(config) {
    const dockerfile = `# Flutter Web — Multi-stage Build
FROM ghcr.io/cirruslabs/flutter:stable AS builder
WORKDIR /app
COPY pubspec.yaml pubspec.lock ./
RUN flutter pub get
COPY . .
RUN flutter build web --release

FROM nginx:alpine AS runner
COPY --from=builder /app/build/web /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
`;
    const compose = `version: '3.9'
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - '8080:80'
    restart: unless-stopped
`;
    return [dockerfile, compose];
}
//# sourceMappingURL=docker.js.map