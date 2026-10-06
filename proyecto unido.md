# Proyecto de Evaluación Técnica — S4: Super Simple Scheduling System

Evaluación práctica de desarrollo Full Stack, API REST, interfaz gráfica, persistencia, Docker y documentación.

## Objetivo

Evaluar de forma práctica, comparable y objetiva las capacidades técnicas de cada postulante. La evaluación considera no solo que la aplicación funcione, sino también la calidad del diseño, código, persistencia, despliegue, documentación, pruebas y capacidad de defender técnicamente la solución.

> **Base:** el proyecto original solicita una REST API y una interfaz gráfica para administrar estudiantes y clases, sus relaciones, búsquedas, persistencia, repositorio Git, Docker y documentación del API. Se mantienen esos elementos y se detallan criterios para que la comparación entre postulantes sea objetiva.

## 1. OBJETIVO Y ALCANCE

El postulante deberá desarrollar una solución denominada S4 – Super Simple Scheduling System. La solución deberá permitir administrar estudiantes y clases, relacionarlos, consultarlos y exponer la funcionalidad mediante una API REST y una interfaz gráfica.

La arquitectura, lenguaje, framework y motor de base de datos son de libre elección. Esta libertad forma parte de la evaluación: se observará si las decisiones tecnológicas son coherentes con el problema, el tiempo disponible y la mantenibilidad.

## 2. FUNCIONALIDADES OBLIGATORIAS

|Módulo|Funcionalidad|Criterio de aceptación|
|---|---|---|
|Estudiantes|Crear, editar y eliminar|Las operaciones funcionan y validan los datos.|
|Estudiantes|Listar estudiantes|La información se presenta correctamente.|
|Clases|Crear, editar y eliminar|Las operaciones funcionan y validan los datos.|
|Clases|Listar clases|Debe mostrar código, título y descripción.|
|Asignaciones|Relacionar estudiantes y clases|Un estudiante puede tomar múltiples clases.|
|Consultas|Estudiantes de una clase|La relación se consulta correctamente.|
|Consultas|Clases de un estudiante|La relación inversa se consulta correctamente.|
|Búsqueda|Buscar Student/Classes|Se utilizan los campos disponibles y se documenta el<br>comportamiento.|

## 3. REQUISITOS TÉCNICOS

API REST: endpoints claros, métodos HTTP apropiados, validaciones, códigos de respuesta, manejo de errores y respuestas consistentes.

Interfaz gráfica: debe permitir gestionar estudiantes, clases, asignaciones y búsquedas desde navegador, con mensajes claros de éxito y error.

Persistencia: el requerimiento original permite base de datos o mock. Para esta evaluación se recomienda una base de datos real, porque permite observar modelado, relaciones, integridad y

persistencia.

Docker: entregar Dockerfile(s) y Docker Compose para que otra persona pueda levantar la solución siguiendo el README.

Documentación: incluir README, arquitectura, instalación, configuración, endpoints, ejemplos y decisiones técnicas. Se recomienda OpenAPI/Swagger.

Calidad: incluir pruebas o evidencia de validación de funcionalidades críticas, manejo de errores y ausencia de secretos reales en el repositorio.

## 4. ENTREGABLES OBLIGATORIOS

|N°|Entregable|Estado|
|---|---|---|
|1|Repositorio Git con historial de commits|Obligatorio|
|2|Código fuente completo de API e interfaz|Obligatorio|
|3|Dockerfile(s) y Docker Compose|Obligatorio|
|4|README con instalación, configuración y ejecución|Obligatorio|
|5|Documentación del API|Obligatorio|
|6|Datos de prueba / seed / migraciones reproducibles|Obligatorio|
|7|Pruebas automatizadas o colección de pruebas|Evaluado|
|8|Documento breve de arquitectura y decisiones|Obligatorio|

## 5. CONDICIONES DE EVALUACIÓN

Todos los postulantes deben recibir el mismo requerimiento, plazo y condiciones. La evaluación debe basarse en evidencia observable del repositorio y de la demostración.

|Condición|Regla|
|---|---|
|Autoría|El postulante debe poder explicar y defender el código entregado.|
|IA y asistentes|Si la empresa permite su uso, el postulante debe declararlo y será responsable de comprender el<br>código.|
|Dependencias|Deben estar declaradas y ser reproducibles.|
|Datos de prueba|Debe incluirse información suficiente para demostrar relaciones y operaciones.|
|Seguridad|No publicar contraseñas, tokens, claves privadas ni datos sensibles.|
|Demostración|Debe ejecutar el sistema y demostrar las funciones principales.|

## 6. MATRIZ DE EVALUACIÓN – 100 PUNTOS

Cada evaluador debe asignar el puntaje con base en evidencia concreta. Se recomienda que los evaluadores califiquen individualmente antes de discutir resultados.

|Criterio|Pts.|Qué se evalúa|
|---|---|---|
|Funcionalidad y cumplimiento|25|Todas las operaciones obligatorias funcionan; relaciones y búsquedas<br>cumplen.|
|Backend / API REST|15|Endpoints, HTTP, validaciones, errores y consistencia.|
|Frontend / UX|10|Usabilidad, navegación, formularios, feedback y claridad.|
|Arquitectura y calidad de<br>código|15|Modularidad, separación de responsabilidades, legibilidad y mantenibilidad.|
|Persistencia y modelo de datos|10|Modelo, relaciones, integridad, consultas y reproducibilidad.|
|Docker y despliegue|10|Contenerización, configuración y facilidad de despliegue.|
|Pruebas y calidad|5|Pruebas, casos de error y evidencia de validación.|
|Documentación|5|README, API, instalación y decisiones técnicas.|
|Defensa técnica|5|Comprensión, explicación del código y criterio técnico.|

## 7. ESCALA DE RESULTADOS

|Rango|Lectura técnica|
|---|---|
|90–100|Dominio técnico integral demostrado.|
|80–89|Nivel técnico alto, con pocas brechas relevantes.|
|70–79|Cumple el nivel mínimo recomendado, con aspectos por mejorar.|
|60–69|Cumplimiento parcial; existen brechas importantes.|
|< 60|No alcanza el nivel mínimo recomendado para asumir el proyecto con autonomía.|

## 8. DEFENSA TÉCNICA – 30 A 45 MINUTOS

La defensa busca comprobar que el postulante comprende realmente la solución. El evaluador puede seleccionar partes del código al azar y pedir una explicación.

|Bloque|Pregunta sugerida|
|---|---|
|Arquitectura|¿Por qué elegiste esta arquitectura y cómo se comunican sus componentes?|
|Backend|Explica una operación CRUD completa y el manejo de errores.|
|Datos|¿Cómo modelaste Student–Class y qué ocurre ante eliminaciones o duplicados?|
|Frontend|¿Cómo manejas validaciones, carga y errores?|
|Docker|¿Cómo levantarías el sistema desde cero en otra máquina?|
|Seguridad|¿Dónde guardarías secretos y qué no debería publicarse en Git?|
|Calidad|¿Qué pruebas realizaste y qué caso límite encontraste?|
|Mantenimiento|¿Cómo agregarías una nueva entidad o funcionalidad sin romper el sistema?|
|Código|Explica 2–3 fragmentos seleccionados por el evaluador.|
