# Checklist de Configuración AWS RDS

## ✅ Configuraciones Verificadas
- [x] Security Group permite puerto 5432 desde 0.0.0.0/0
- [x] Publicly Accessible está en "Yes"
- [x] DNS resuelve correctamente (3.130.248.45)
- [x] Traceroute llega a AWS (se pierde dentro de AWS)

## ❌ Configuraciones que DEBES VERIFICAR

### 1. **Subnet Configuration**
Ve a: **VPC → Subnets**

Para cada subnet donde está tu RDS:
```
✓ Debe estar en una subnet PÚBLICA (no privada)
✓ La subnet debe tener "Auto-assign public IPv4 address" en Yes
```

### 2. **Route Table** (MUY IMPORTANTE)
Ve a: **VPC → Route Tables**

Busca la Route Table asociada a las subnets de RDS:
```
Debe tener esta ruta:
Destination: 0.0.0.0/0
Target: igw-xxxxxxxx (Internet Gateway)

Si NO tiene esta ruta, tu RDS NO puede recibir tráfico de internet.
```

**Cómo arreglarlo:**
1. Ve a VPC → Internet Gateways
2. Crea un Internet Gateway si no existe
3. Adjúntalo a tu VPC
4. Ve a Route Tables → Edita la tabla de tus subnets
5. Agrega ruta: 0.0.0.0/0 → tu Internet Gateway

### 3. **Network ACL**
Ve a: **VPC → Network ACLs**

Verifica las reglas de entrada y salida:
```
Inbound Rules:
✓ Rule 100: ALL Traffic, Source: 0.0.0.0/0, Allow
O al menos:
✓ Rule: Custom TCP, Port: 5432, Source: 0.0.0.0/0, Allow

Outbound Rules:
✓ Rule 100: ALL Traffic, Destination: 0.0.0.0/0, Allow
```

### 4. **DB Subnet Group**
Ve a: **RDS → Subnet groups**

```
✓ Las subnets deben estar en DIFERENTES Availability Zones
✓ Todas las subnets deben ser PÚBLICAS
✓ Todas deben tener route a Internet Gateway
```

### 5. **Verificar en RDS Console**
Ve a: **RDS → Databases → database-1 → Connectivity & security**

Verifica:
```
✓ Publicly accessible: Yes
✓ VPC: vpc-06cf3e78f403357c7
✓ Subnets: Deben ser públicas
✓ Security group: sg-0cd42f606be560674 (ya verificado ✓)
✓ Endpoint: database-1.cza4ek4s8hav.us-east-2.rds.amazonaws.com
```

## 🔧 Solución Más Probable

**El problema es que las SUBNETS son PRIVADAS o la ROUTE TABLE no tiene Internet Gateway.**

### Pasos para arreglar:

1. **Opción A: Mover RDS a subnets públicas**
   - Crea nuevas subnets públicas
   - Crea un DB Subnet Group con esas subnets
   - Modifica la instancia RDS para usar el nuevo subnet group
   - Reinicia la instancia

2. **Opción B: Hacer públicas las subnets actuales**
   - Crea un Internet Gateway
   - Adjúntalo a la VPC
   - Edita la Route Table de las subnets
   - Agrega ruta 0.0.0.0/0 → Internet Gateway
   - Espera 2-3 minutos

## 🧪 Después de los cambios, prueba con:

```bash
# Desde tu terminal
cd /Users/pablovilchesvalenzuela/Desktop/RDSCLOUD/servicio2
python3 diagnose_connection.py

# O prueba el endpoint
curl http://localhost:8001/health/db
```

## 📊 Diagnóstico Actual

```
Estado: ❌ TIMEOUT
Causa: Conexión TCP bloqueada en AWS
Evidencia: Traceroute llega a AWS pero se pierde
Solución: Configurar Route Table con Internet Gateway
```
