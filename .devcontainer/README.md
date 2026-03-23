# Development Container Configuration

This directory contains the Development Container setup for the Travelingo project. It provides a complete, containerized development environment with all necessary tools and services.

## 📁 Files

- **devcontainer.json** - Main development container configuration
- **Dockerfile** - Custom Docker image based on Ubuntu 24.04 with Java 21, Gradle, Maven, and other tools
- **docker-compose.yml** - Multi-container setup including Spring Boot backend and MySQL database
- **post-create.sh** - Automated setup script that runs after container creation

## ✨ Features

- **Java 21** - Latest LTS Java version for Spring Boot application
- **Gradle** - Build automation tool with cached dependencies
- **MySQL 8.0** - Relational database service
- **VS Code Extensions** - Pre-configured extensions for Java, REST client, Docker, and frontend development
- **Port Forwarding** - Automatic forwarding of ports 3306 (MySQL), 8080 (Backend), and 5500 (Frontend)
- **Hot Reload Support** - Live Server for frontend development

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose installed
- VS Code with the "Dev Containers" extension
- Git (for cloning the repository)

### Opening in Dev Container

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd travelingo_versions
   ```

2. **Open in VS Code:**
   ```bash
   code .
   ```

3. **Reopen in Container:**
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
   - Type "Dev Containers: Reopen in Container"
   - Select the option

4. **Wait for Setup:**
   - The container will build (~2-3 minutes first time)
   - The post-create script will automatically:
     - Build the backend Gradle project
     - Initialize the MySQL database
     - Install frontend dependencies

## 📝 Database Configuration

**MySQL Credentials:**
- **Host:** `mysql` (or `localhost:3306` from host machine)
- **User:** `travellingo`
- **Password:** `travellingo_pass`
- **Database:** `travelingo_db`
- **Root Password:** `root_password`

**Initialization:**
- Schema is loaded from `travelingo_v4_3_21/travelingo-back/src/main/resources/schema.sql`
- Sample data is loaded from `travelingo_v4_3_21/travelingo-back/src/main/resources/data-chapter1.sql`

## 💻 Running the Applications

### Start Backend (Spring Boot)

```bash
cd travelingo_v4_3_21/travelingo-back
./gradlew bootRun
```

The backend will be available at: `http://localhost:8080`

API Documentation (Swagger): `http://localhost:8080/swagger-ui.html`

### Start Frontend (Live Server)

```bash
cd travelingo_v4_3_21/travelingo-front
npx live-server
```

The frontend will be available at: `http://localhost:5500`

## 🛠️ Available Tools

- **Java 21 JDK** - `/usr/lib/jvm/java-21-openjdk-amd64`
- **Gradle** - Gradle wrapper is included in the project
- **Maven** - For alternative builds
- **Node.js & npm** - For frontend development
- **MySQL Client** - For database operations
- **Git** - Version control
- **GitHub CLI** - For GitHub operations

## 📦 Pre-installed VS Code Extensions

- **Extension Pack for Java** - Comprehensive Java development support
- **Gradle for Java** - Gradle build support
- **XML Support** - XML editing
- **YAML Support** - YAML configuration files
- **Prettier** - Code formatter
- **Live Server** - Live reload for HTML/CSS/JS
- **Docker** - Docker integration
- **REST Client** - Test API endpoints directly in VS Code

## 🔧 Common Tasks

### Building the Backend

```bash
cd travelingo_v4_3_21/travelingo-back
./gradlew clean build        # Full build with tests
./gradlew build -x test      # Build without tests
./gradlew bootRun            # Run Spring Boot server
```

### Database Operations

```bash
# Connect to MySQL from container
mysql -h mysql -u travellingo -p travelingo_db

# Execute SQL script
mysql -h mysql -u travellingo -p travelingo_db < schema.sql
```

### Frontend Development

```bash
cd travelingo_v4_3_21/travelingo-front
npm install                  # Install dependencies
npx live-server             # Start development server
npm run build               # Build for production
```

## 📋 Environment Variables

Inside the container:
- `JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64`
- `GRADLE_USER_HOME=/workspace/.gradle`
- `MYSQL_HOST=mysql`
- `MYSQL_PORT=3306`
- `MYSQL_USER=travellingo`
- `MYSQL_PASSWORD=travellingo_pass`
- `MYSQL_DATABASE=travelingo_db`

## 🐛 Troubleshooting

### MySQL Connection Issues

```bash
# Check if MySQL is running
docker ps | grep mysql

# View MySQL logs
docker logs travelingo-mysql

# Check MySQL health
mysqladmin -h mysql -u travellingo -p ping
```

### Gradle Build Issues

```bash
# Clear Gradle cache
./gradlew clean

# Rebuild with verbose output
./gradlew build --debug
```

### Port Already in Use

If ports are already bound on your machine:
1. Edit `docker-compose.yml`
2. Change the port mapping (e.g., `3307:3306` for MySQL)
3. Update connection strings accordingly

### Rebuild Container

```bash
# Remove old container and image
docker-compose down --rmi all

# Rebuild from scratch
# Then reopen in container in VS Code
```

## 📚 Project Structure

```
travelingo_v4_3_21/
├── travelingo-back/       # Spring Boot backend
│   ├── src/
│   │   ├── main/java/     # Java source code
│   │   └── resources/     # SQL scripts, properties
│   └── build.gradle       # Gradle configuration
└── travelingo-front/      # Frontend (HTML/CSS/JS)
    ├── index.html
    ├── learning.html
    ├── travel-setup.html
    └── styles.css
```

## 🔗 Useful Resources

- [VS Code Dev Containers Documentation](https://code.visualstudio.com/docs/remote/containers)
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Docker Documentation](https://docs.docker.com/)
- [Gradle Documentation](https://gradle.org/releases/)

## 📝 Notes

- Gradle dependencies are cached in a Docker volume for faster builds
- MySQL data persists in a Docker volume
- The container runs as the `vscode` user for security
- All ports are automatically forwarded to your host machine

---

For questions or issues, refer to the main project README or contact the development team.
