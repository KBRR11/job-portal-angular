# Frontend del Portal de Empleo (Angular)

Este es el frontend de la aplicación Job Portal, construido con Angular.

## Prerrequisitos

Asegúrate de tener instalado lo siguiente:

*   Node.js (versión recomendada por Angular CLI 14.x)
*   npm (administrador de paquetes de Node.js)
*   Angular CLI (versión 14.x)
    ```bash
    npm install -g @angular/cli@14
    ```

## Configuración y Ejecución Localmente

Sigue estos pasos para levantar el frontend localmente:

1.  **Navega al directorio del frontend:**
    ```bash
    cd angular-frontend
    ```

2.  **Instala las dependencias de Node.js:**
    ```bash
    npm install
    ```

3.  **Configura la URL del Backend:**
    El frontend necesita saber dónde está el backend. Por defecto, está configurado para `http://localhost:8000/api`. Si tu backend se ejecuta en una dirección diferente (por ejemplo, si lo estás ejecutando en Docker y necesitas accederlo por `http://localhost:8000/api/` o si el frontend también está en Docker y necesita `http://job_portal_backend:8000/api/`), puedes ajustar la URL en:
    *   `src/environments/environment.ts` (para desarrollo)
    *   `src/environments/environment.prod.ts` (para producción)

    Ejemplo en `src/environments/environment.ts`:
    ```typescript
    export const environment = {
      production: false,
      apiUrl: 'http://localhost:8000/api' // O 'http://job_portal_backend:8000/api' si el frontend está en Docker
    };
    ```

4.  **Inicia el servidor de desarrollo:**
    ```bash
    ng serve
    ```
    Navega a `http://localhost:4200/`. La aplicación se recargará automáticamente si cambias cualquier archivo fuente.

## Construcción

Ejecuta `ng build` para construir el proyecto. Los artefactos de construcción se almacenarán en el directorio `dist/`.

## Ejecución de pruebas unitarias

Ejecuta `ng test` para ejecutar las pruebas unitarias a través de [Karma](https://karma-runner.github.io).

## Ejecución de pruebas de extremo a extremo

Ejecuta `ng e2e` para ejecutar las pruebas de extremo a extremo a través de la plataforma de tu elección. Para usar este comando, primero debes agregar un paquete que implemente capacidades de prueba de extremo a extremo.

## Ayuda Adicional

Para obtener más ayuda sobre Angular CLI, usa `ng help` o consulta la página [Angular CLI Overview and Command Reference](https://angular.io/cli).
