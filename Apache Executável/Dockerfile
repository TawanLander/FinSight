FROM amazoncorretto:21
WORKDIR /app
COPY app.jar app.jar
COPY dados/ dados/
COPY .env .env
ENTRYPOINT [ "java", "-jar", "app.jar" ]