# pw-manager-back
Frontend for [Password Manager](https://github.com/sebastianknell/pw-manager).

# Password Manager

## Descripción

Este proyecto es un **Password Manager** que permite a los usuarios registrarse, iniciar sesión y almacenar contraseñas de manera segura. Utiliza técnicas avanzadas de autenticación como **Zero Knowledge Proofs (ZKP)** y **Secure Remote Password (SRP)** junto con JWT para asegurar el acceso a los datos del usuario.

## Tecnologías Utilizadas

- **Node.js** con **Express** para el servidor backend.
- **Prisma** como ORM para interactuar con la base de datos.
- **Secure Remote Password (SRP)** para el manejo seguro de contraseñas.
- **Zero Knowledge Proofs (ZKP)** para autenticación sin revelar contraseñas.
- **JWT** para autenticación y autorización.
- **Artillery** para pruebas de carga.
- **crypto-js** para funciones de cifrado.

## Endpoints

### Registro de Usuario

- **URL:** `/register`
- **Método:** `POST`
- **Cuerpo de la Solicitud:**

    ```json
    {
        "username": "string",
        "salt": "string",
        "verifier": "string"
    }
    ```

- **Descripción:** Registra un nuevo usuario en la base de datos. Utiliza **Zero Knowledge Proofs** para asegurar que las credenciales del usuario no se revelen durante el proceso de registro.

### Generar Ephemeral

- **URL:** `/generate`
- **Método:** `POST`
- **Cuerpo de la Solicitud:**

    ```json
    {
        "username": "string",
        "ephemeral": "string"
    }
    ```

- **Descripción:** Genera un valor ephemeral del servidor para el usuario, necesario para el proceso de autenticación basado en SRP y ZKP.

### Inicio de Sesión

- **URL:** `/login`
- **Método:** `POST`
- **Cuerpo de la Solicitud:**

    ```json
    {
        "username": "string",
        "proof": "string"
    }
    ```

- **Descripción:** Inicia sesión y genera un token JWT. Utiliza **Zero Knowledge Proofs** para verificar la autenticidad del usuario sin revelar su contraseña.

### Obtener Contraseñas

- **URL:** `/getpasswords`
- **Método:** `GET`
- **Encabezados:**

    ```json
    {
        "Authorization": "Bearer <TOKEN>"
    }
    ```

- **Descripción:** Obtiene los datos de contraseñas almacenados para el usuario autenticado.

### Guardar Contraseñas

- **URL:** `/savepasswords`
- **Método:** `POST`
- **Encabezados:**

    ```json
    {
        "Authorization": "Bearer <TOKEN>"
    }
    ```

- **Cuerpo de la Solicitud:**

    ```json
    {
        "passwordData": "string",
        "encryptionIV": "string",
        "tag": "string"
    }
    ```

- **Descripción:** Guarda los datos de contraseñas para el usuario autenticado.

## Pruebas de Carga

Para realizar pruebas de carga, utiliza **Artillery**. Primero, instala Artillery globalmente si aún no lo has hecho:

```bash
npm install -g artillery
```

Luego, ejecuta las pruebas con el siguiente comando:

```bash
npm run load-test.yaml
```

Para visualizar un reporte de los resultados del test que creamos, usamos:

```bash
artillery run --output results.json test/load-test.yaml
artillery report --output report.html results.json
xdg-open report.html
```

Esto simulará usuarios que interactúan con el sistema, ayudando a evaluar el rendimiento y la escalabilidad del servidor.

