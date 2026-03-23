FROM mcr.microsoft.com/devcontainers/base:ubuntu-24.04

# Install Java 21 and build tools
RUN apt-get update && apt-get install -y \
    openjdk-21-jdk \
    gradle \
    maven \
    mysql-client \
    curl \
    wget \
    git \
    npm \
    nodejs \
    build-essential \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set JAVA_HOME
ENV JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
ENV PATH=$JAVA_HOME/bin:$PATH

# Verify installations
RUN java -version && \
    gradle --version && \
    npm --version

# Create gradle cache directory
RUN mkdir -p /workspace/.gradle && \
    chmod -R 777 /workspace/.gradle
