# Proyecto Cloud - Sistema de Microservicios

Este proyecto consiste en una arquitectura de microservicios diseñada para ser desplegada en AWS mediante un Application Load Balancer (ALB). El sistema integra un frontend en React, un backend central en FastAPI y un servicio dedicado en Spring Boot (Java).

## Entorno de Producción (AWS)

Todo el tráfico de producción está centralizado a través de nuestro balanceador de carga en AWS. Las peticiones se enrutan automáticamente al contenedor correspondiente según el prefijo de la URL.

* **URL Base (ALB):** [http://balanceador-carga-1567813537.us-east-1.elb.amazonaws.com](http://balanceador-carga-1567813537.us-east-1.elb.amazonaws.com)

---

## Patrón de Rutas y Endpoints

A continuación se detallan las rutas expuestas en producción para cada microservicio, basándose en la configuración de los controladores.

### Backend Principal (FastAPI) - Prefijo: /api

Gestiona la lógica de negocio, usuarios, productos y base de datos.

| Módulo | Método | Endpoint (Producción) | Descripción |
| --- | --- | --- | --- |
| **Usuarios** | POST | /api/usuarios/registro | Registra un nuevo usuario (hash bcrypt). |
|  | POST | /api/usuarios/login | Autentica un usuario. |
| **Productos** | GET | /api/productos/ | Lista todos los productos disponibles. |
| **Carrito** | POST | /api/carrito/agregar | Añade un producto al carrito. |
|  | GET | /api/carrito/{usuario_id} | Obtiene el carrito de un usuario. |
|  | DELETE | /api/carrito/reducir/{item_id} | Reduce en 1 la cantidad de un ítem. |
|  | DELETE | /api/carrito/eliminar/{item_id} | Elimina por completo un ítem del carrito. |
|  | DELETE | /api/carrito/vaciar/{usuario_id} | Vacía todo el carrito de un usuario. |
|  | POST | /api/carrito/pagar/{usuario_id} | Procesa el pedido validando stock. |
| **Conexión** | GET | /api/conect/conexion | Verifica estado y versión de la BD (RDS). |
|  | GET | /api/conect/tablas | Lista las tablas de la base de datos tienda. |

### Servicio de Java (Java / Spring Boot) - Prefijo: /java

Microservicio dedicado exclusivamente a la integración con el servicio de Java.

| Método | Endpoint (Producción) | Descripción |
| --- | --- | --- |
| POST | /java/create | Crea un nuevo pedido. |
| POST | /java/commit | Confirma un pedido post-redirección. |
| POST | /java/status | Consulta el estado actual de un pedido. |
| POST | /java/refund | Reembolsa o anula un pedido existente. |

---

## Estado Actual del Proyecto y To-Do

* **Backend FastAPI:** El Frontend ya está conectado e integrado correctamente con el backend de FastAPI utilizando la URL del balanceador de producción.

# PENDIENTE CRÍTICO (TO-DO)

### **PARA QUE TODO QUEDE FUNCIONANDO BIEN, EL FRONTEND DEBE CONECTARSE CON EL SERVICIO DE JAVA Y FASTAPI A TRAVÉS DE LA URL DE PRODUCCIÓN**

* **Falta por hacer:** Terminar de integrar el Frontend con el servicio de Java a través de la URL de producción ([http://balanceador-carga-1567813537.us-east-1.elb.amazonaws.com/java/](http://balanceador-carga-1567813537.us-east-1.elb.amazonaws.com/java/)...).

---

## Flujo de Trabajo y CI/CD

Para gestionar este proyecto correctamente sin romper el entorno de producción, es vital entender el flujo de despliegue y las reglas de conexión del Frontend:

### 1. El Pipeline de Despliegue (Demora esperada)

El repositorio cuenta con una acción de CI/CD automatizada. Cada vez que haces un git push, se desencadena un reinicio y actualización de los servicios en AWS.

* **Advertencia:** Los cambios no son instantáneos. Tras hacer push, los contenedores tardarán un par de minutos en reconstruirse, registrarse en el Target Group y pasar a un estado saludable (Healthy). Si pruebas de inmediato y falla, dales tiempo.

### 2. Desarrollo y Pruebas en Local (Docker)

Si prefieres iterar rápido y probar el código en tu máquina usando Docker Compose sin tener que esperar los tiempos del CI/CD de AWS:
Deberás cambiar temporalmente las URLs base en el código de tu Frontend para que apunten a los puertos locales (ej: http://localhost:8000/api y http://localhost:8080/java o mediante ruteo relativo local).
Levanta los servicios con docker compose up -d --build.

---

## Flujo de Desarrollo Obligatorio

Para garantizar que las conexiones, redes internas de Docker y políticas de CORS funcionen exactamente igual que en producción (AWS ECS), **está estrictamente prohibido levantar los servicios a mano (`npm run dev`, `uvicorn...`, `mvn spring-boot:run`)**.

### 1. Levantamiento de Servicios

Todo el entorno debe gestionarse exclusivamente a través de **Docker Compose** desde la raíz del proyecto. Esto asegura que todos los contenedores se unan a la misma red virtual interna y puedan reconocerse entre sí por sus nombres de servicio.

```bash
docker compose up -d

```

### 2. Aplicación de Cambios (Build)

Docker cachea las capas de las imágenes para optimizar el tiempo. Si realizas cualquier cambio en el código fuente (FastAPI, JS, Java) o en los archivos de dependencias (`package.json`, `requirements.txt`, `pom.xml`), **debes forzar la reconstrucción de la imagen** para que los cambios se reflejen en el contenedor en ejecución:

```bash
docker compose up -d --build

```

*Nota técnica: Si solo modificaste código de FastAPI o Java y no quieres reconstruir todo desde cero, puedes especificar el nombre del servicio al final del comando para acelerar el proceso (por ejemplo: `docker compose up -d --build api-java`).*

### 3. Monitoreo de Conexiones y Debugging

Para verificar que los servicios se comuniquen correctamente entre sí o para inspeccionar errores de inicialización en tiempo real (como fallas en la inyección de dependencias de Spring Boot o problemas de sintaxis en FastAPI):

```bash
# Ver los logs de todos los servicios en tiempo real
docker compose logs -f

# Ver los logs de un servicio específico (por ejemplo, el de Java)
docker compose logs -f api-java

```

### 4. Apagado y Limpieza del Entorno

Cuando termines de desarrollar o si necesitas reiniciar el entorno desde un estado completamente limpio eliminando la red interna virtual:

```bash
# Detiene y remueve los contenedores y la red local
docker compose down

# Detiene, remueve contenedores y limpia los volúmenes persistentes si aplica
docker compose down -v

```

---

## Puertos y Acceso Local

Una vez levantados los contenedores mediante Docker Compose, el sistema y sus respectivos componentes estarán disponibles localmente en las siguientes direcciones:

| Servicio | URL Local | Puerto Interno |
| --- | --- | --- |
| **Frontend (Tienda)** | http://localhost | 80 |
| **Backend (FastAPI)** | http://localhost:8000 | 8000 |
| **Servicio de Java** | http://localhost:8080 | 8080 |
