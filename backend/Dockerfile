# Build the application
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
# Copy the maven wrapper and pom.xml
COPY .mvn/ .mvn
COPY mvnw pom.xml ./
# Give execution rights to the maven wrapper
RUN chmod +x mvnw
# Download dependencies
RUN ./mvnw dependency:go-offline
# Copy the source code and build
COPY src ./src
RUN ./mvnw clean package -DskipTests

# Run the application
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]