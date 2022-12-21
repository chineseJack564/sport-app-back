# WebArtist Group 👨‍🎨:computer:

### :link: Link MPA en Heroku: [https://wewodweb.herokuapp.com](https://wewodweb.herokuapp.com)
### :link: Link SPA desarrollada en REACT [https://wewod.tk](https://wewod.tk)
### :link: Link Documentación API RESTful: [https://documenter.getpostman.com/view/18089698/UVC8Cm3E](https://documenter.getpostman.com/view/18089698/UVC8Cm3E)

### Credenciales de usuario administrador para SPA y MPA📋😎

- **email:** admin@uc.cl

- **password:** admin123

# Entrega 4 y final😱😱😱

*Funcionalidad extra elegida: Poder agregar foto de perfil*

## Documentación📄

Se agregó la documentación con los detalles pedidos en `docs/WeWOD.pdf`.

## Funcionalidades agregadas🦾

- Reportar rutina.
- Agregar rutina a favoritos.
- Vista de rutinas favoritas para un usuario.
- Vistas de todos los recursos para facilitar gestión al admin.
- Perfil de usuario más funcional dado que integra las funcionalidades dichas.
- Sistema de score de rutina interactivo con estrellas [1-5].
- Atributo de score promedio de rutinas.
- Capacidad de subir foto de perfil.
- Validación de formularios de FrontEnd con Formik.
- Testing en Frontend.

## Aspectos arreglados de entrega pasada🧐

- Error de `POST` user arreglado.✔
- Error al no encontrar user arreglado, ahora arroja `status 404`.✔
- `PATCH` y `DELETE` routine y `PATCH` exercise ahora son unauthorized cuando el token es incorrecto.✔
- `POST` ahora da `404 Not Found` en caso de que se aplique la request sobre un usuario no existente.✔
- `POST` save-routine agregado.✔
- `POST` report-review agregado.✔
- Consistencia de `status codes` al eliminar recursos.✔

## Detalles🤑

- Actualización inmediata de muchos recursos al hacer una acción sobre ellos.
- Si una rutina tiene más de 5 likes podrás ver una sorpresa en su tarjeta de rutina.👀

## Consideraciones

- Al ir a las páginas de index de rutinas y de ejercicios tarda un poco más en renderizarse si no estás logeado.
- Las funcionalidades pedidas relativas a la seguridad fueron implementadas en entregas pasadas.
- Aplicación resistente a inyecciones SQL.

# E3

### :muscle: Funcionalidades agregadas

Se crearon los endpoints de los modelos *user*, *routine*, *exercise*, *review* y la autentificación *auth* dentro de *user*. Todos los endpoints se documentaron en la documentación de la API.

Los detalles de cómo funcionan los endpoints están en la documentación de la API RESTful. Aquí se encuentra información como:

- status codes en API RESTful.

- Para qué sirve cada endpoint y si se necesita autentificación o no para hacer una request.

- Ejemplos de requests para cada endpoint.

Además, se aplicó testing para cada endpoint de la API con (bastante) más que 15 tests unitarios.

# E2

### :muscle: Funcionalidades agregadas

- CRUD de Reviews (que sirven como comentarios y reseñas).

- Funcionalidad del usuario administrador: Borrar reviews, usuarios y certificar y cancelar certificación usuarios.

- Usuario administrador precreado. No es posible crear un usuario administrador desde el form de registro.

- Login de usuarios completo desde la entrega anterior.

- Manejo de sesión.

- Autenticación y autorización.

- Vistas y estilos finales de la aplicación.

- Manejo de la cookie guarda id de usuario hasheado y las contraseñas están hasheadas en la base de datos. El id de usuario hasheado en la cookie se compara con el id del usuario usando una función llamada checkID, que es un helper definido en el modelo de usuarios.

### ⚠️ Consideraciones importantes para esta entrega ⚠️

- El usuario de tipo admin se ve como una tarjeta con un color de contorno distinto al resto en el index de usuarios.

- Un usuario administrador no puede editar ni eliminar a otro usuario administrador.

- Se decidió que un usuario admin no puede editar en el form de edición toda la información de un usuario (username, email, password, password, etc). Solo puede hacer cambios en usuarios a través de las opciones que le brinda el index de usuarios.

- Al contrario que el caso de los usuarios, un administrador puede editar todos los aspectos de rutinas, ejercicios y reviews.

- Cuando un administrador borra un usuario mientras ese usuario está logeado, el usuario debe borrar las cookies locales.

- El usuario dueño de una rutina no puede hacer una review de su propia rutina. El resto de los usuarios sí puede. Se pueden hacer reviews debajo del detalle de rutina.

- Los usuarios certificados tienen una etiqueta que permite saber que están certificados en su nombre de usuario. Esta etiqueta se puede ver en el perfil de usuario, en la navbar y en el index de usuarios.

- Se sigue la metodología de code reviews.

### Credenciales de usuario administrador📋😎

- **email:** admin@uc.cl

- **password:** admin123

### :heavy_check_mark: Correcciónes de entregas pasadas
- Los dropdown de los forms de edición de entidades traen los elementos anteriores preseleccionados.
- Los otros parámetros de las entidades en los forms de edición también vienen pre-escritos.
- Las tarjetas de ejercicios y de rutinas son clickeables completamente.
- El edit del usuario no trae pre-escrita la contraseña de este.
- Efecto de hover en botones de en general.
- Se arregló estilo de botones de sesión en la navbar (Ahora aparecen al final de la navbar).

# E1

### :muscle: Funcionalidades agregadas

- CRUD de usuario
- CRUD de ejercicio
- CRUD de rutina
- Manejo de sesión
- Implementación de nuevas vistas para los CRUD de los recursos principales (ejercicios, rutinas, usuario).
- Autorrellenado de campos al editar recursos
- Implementación de nuevas rutas para mejorar la navegabilidad en la aplicación
- Aplicación implementada en heroku
- Asociación entre usuario y recurso principal

### ⚠️ Consideraciones importantes para esta entrega ⚠️

- Para poder ingresar tanto a los ejercicios o las rutinas es necesario hacer click sobre el **nombre** de la tarjeta.

- Las pestañas "About us" y "Contact" de la navbar aún no han sido implementadas.

- Para crear un ejercicio o rutina es necesario estar *logueado* en la aplicación.

- Al crear un recurso, su dueño es el *current user*. En el index de cada recurso se puede ver quién creó cada recurso.

### :heavy_check_mark: Correcciónes de entregas pasadas
- Se corrige el uso del tag !important.

---------------------------------------

# Template

Template built with [koa](http://koajs.com/) for IIC2513 - Tecnologías y Aplicaciones Web, Pontificia Universidad Católica de Chile.

## Prerequisites:
* PostgreSQL
  * you will need a database with name and user/password as configured in `src/config/database.js`
* Node.js LTS (10.x or 12.x)
* [Yarn](https://yarnpkg.com)

## Project Setup

* Clone repository
* Install dependencies:
  * `yarn install` 

## Database Setup (development)

### Install postgresql
* On Mac OS X using Homebrew: `brew install postgresql`
  * Start service: check [LaunchRocket](https://github.com/jimbojsb/launchrocket) or [lunchy](https://www.moncefbelyamani.com/how-to-install-postgresql-on-a-mac-with-homebrew-and-lunchy/) for postgresql service management
* [Other platforms](https://www.postgresql.org/download/)

### Create development database

```sh
createdb iic2513template_dev
```

### Run migrations
```sh
./node_modules/.bin/sequelize db:migrate
```

## Run the app!

```sh
yarn start
```

or directly

```sh
node index.js
```

or, if you want automatic restart after any change in your files

```sh
yarn dev
```

Now go to http://localhost:3000 and start browsing :)
