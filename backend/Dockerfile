# =============================================
# Stage 1 : Build avec Maven
# =============================================
FROM maven:3.9-eclipse-temurin-17-alpine AS builder
WORKDIR /app

# Copier pom.xml séparément pour tirer parti du cache Maven
COPY pom.xml .
RUN --mount=type=cache,target=/root/.m2 \
    mvn dependency:go-offline 2>/dev/null || true

# Copier les sources et builder
COPY src ./src
RUN --mount=type=cache,target=/root/.m2 \
    mvn clean package -DskipTests

# =============================================
# Stage 2 : Image runtime légère
# =============================================
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Utilisateur non-root (bonne pratique sécurité)
RUN addgroup -S plantverde && adduser -S plantverde -G plantverde
USER plantverde

# Copier le JAR buildé
COPY --from=builder /app/target/*.jar app.jar

# Répertoire uploads
RUN mkdir -p /app/uploads

EXPOSE 8080

# Options JVM optimisées pour conteneur
ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
