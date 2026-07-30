FROM alpine:3.20
ARG PB_VERSION=0.22.34
RUN apk add --no-cache ca-certificates unzip wget \
  && wget -O /tmp/pb.zip "https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip" \
  && unzip /tmp/pb.zip -d /app \
  && chmod +x /app/pocketbase \
  && rm /tmp/pb.zip
WORKDIR /app
EXPOSE 8080
CMD ["/app/pocketbase", "serve", "--http=0.0.0.0:8080", "--dir=/pb_data"]
