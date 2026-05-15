
# Proyecto Cloud - Sistema de Microservicios 

Este proyecto consiste en una arquitectura de microservicios diseñada para ser desplegada en entornos de nube (AWS). Cada directorio en la raíz representa un servicio independiente con su propia lógica y tecnología.

## 🏗️ Estructura del Proyecto

* **`front-cloud/`**: Interfaz de usuario construida con React + Vite, servida mediante Nginx (Multi-stage Build).
* **`back-cloud/`**: API principal de lógica de negocio y usuarios construida con FastAPI (Python).
* **`apiwebpay/`**: Microservicio de integración con pasarela de pagos Webpay construido en Java (Spring Boot + Maven).

---

## 🛠️ Flujo de Desarrollo Obligatorio

Para garantizar que las conexiones, redes internas de Docker y políticas de CORS funcionen exactamente igual que en producción (AWS ECS), **está estrictamente prohibido levantar los servicios a mano (`npm run dev`, `uvicorn...`, `mvn spring-boot:run`)**.

### 1. Levantamiento de Servicios
Todo el entorno debe gestionarse exclusivamente a través de **Docker Compose** desde la raíz del proyecto:

```bash
docker compose up -d

```

### 2. Aplicación de Cambios (Build)

Docker cachea las capas de las imágenes para optimizar el tiempo. Si realizas cualquier cambio en el código fuente (Python, JS, Java) o en las dependencias (`package.json`, `requirements.txt`, `pom.xml`), **debes forzar la reconstrucción de la imagen** para que los cambios se reflejen en el contenedor:

```bash
docker compose up -d --build

```

### 3. Monitoreo de Conexiones

Para verificar que los servicios se comuniquen correctamente entre sí (Frontend -> FastAPI -> Webpay):

```bash
docker compose logs -f

```

---

## 🌐 Puertos y Acceso Local

Una vez levantados los contenedores, el sistema estará disponible en las siguientes direcciones:

| Servicio | URL Local | Puerto Interno |
| --- | --- | --- |
| **Frontend (Tienda)** | [http://localhost](https://www.google.com/search?q=http://localhost) | 80 |
| **Backend (FastAPI)** | [http://localhost:8000](https://www.google.com/search?q=http://localhost:8001) | 8000 |
| **API Webpay (Java)** | [http://localhost:8080](https://www.google.com/search?q=http://localhost:8080) | 8080 |

---

## 🛑 Notas Importantes

* **CORS:** Las políticas de CORS están configuradas en los backends para aceptar peticiones desde los orígenes de Docker. Levantar fuera de contenedores causará bloqueos de red.
* **Persistencia:** Si el servicio requiere base de datos, asegúrate de no borrar los volúmenes a menos que sea estrictamente necesario (`docker compose down -v`).

