# Reto 06 · Denuncias ambientales

**Institución:** Ministerio de Ambiente y Recursos Naturales
**Trámite fuente:** Trámite de Denuncias Ambientales
**El cambio que buscamos:** de una denuncia a un seguimiento real

## El reto en una frase

Una persona que ya denunció puede consultar en qué estado va su caso y si el MARN se pasó del plazo que publica.

## Estado actual del trámite: digital

El MARN recibe denuncias por cuatro canales: en línea, presencial, teléfono al 1560 y WhatsApp, y correo. El canal en línea es **SICODA**, y funciona hoy.

Lo que ya hace:

- Recibe la denuncia sin necesidad de crear cuenta, y permite que sea anónima
- Captura datos del denunciante y del denunciado, departamento, municipio, dirección del hecho
- Clasifica en seis tipos: aire, ruido, suelo, agua, visual y otros
- **Genera un número de denuncia y lo envía por correo al denunciante**

La ficha oficial dice **costo Q0** y **plazo de respuesta de 60 días**, y detalla once pasos. Del paso cuatro en adelante todo ocurre adentro de la institución. Después de recibir su número, la persona desaparece del proceso.

> ### Nota sobre el alcance
> Este proyecto reconstruye y moderniza el registro y seguimiento de denuncias
> ambientales de SICODA como prototipo para MARN. El MVP incluye denuncia
> identificada o anónima, categoría, descripción, ubicación GPS, evidencia
> multimedia, código de seguimiento único, consulta pública sanitizada, panel
> administrativo para listar y actualizar estados, y agrupación geográfica
> básica de denuncias cercanas de la misma categoría.

## Quién lo vive y por qué importa

Le pasa a comunidades, organizaciones, empresas y personas que denuncian un daño ambiental. Denunciar es un acto de confianza, y hoy esa confianza se rompe en el silencio de los sesenta días. Sin seguimiento, la persona no sabe si su denuncia se clasificó, si fue competencia del MARN, si alguien salió a inspeccionar. Y sin esa señal, la próxima vez no denuncia.

## Cómo se ve cuando funciona

La persona entra con su número de denuncia. Ve en qué etapa está su caso, con la fecha de cada cambio. Ve cuántos días han pasado y cuántos faltan de los sesenta que el ministerio publica. Si el plazo ya se venció, la pantalla lo dice con claridad. No ve nombres de funcionarios ni documentos internos, solo el estado.

## Mapeá el trámite antes de diseñar

Recorran SICODA antes de abrir una pantalla. Para cada paso anoten qué hace la persona, qué pasa del otro lado, dónde se traba y qué oportunidad hay. Prototipen el punto donde el bloqueo es más grande y la solución cabe en el tiempo disponible.

Tres cosas para averiguar en la fuente: los estados reales del proceso, qué información pide el formulario hoy, y cómo se cuentan los sesenta días.

## Escalera de profundización

**Punto de partida.** Con un número de denuncia se consulta el estado. Funcionando y publicado.

**N1. Plazo visible.** Que la consulta muestre los días transcurridos contra los sesenta publicados y avise cuando se venció.

**N2. Interfaz limpia y accesible.** La plantilla base del sistema actual quedó sin limpiar y arrastra contenido de demostración ajeno al trámite. Que su versión se use con teclado, tenga etiquetas claras y se lea bajo el sol.

**N3. Que hable el idioma que pregunta.** El formulario actual pregunta cuál de 22 idiomas mayas habla la persona, y luego le responde solo en español. Que la consulta exista en un idioma maya, con traducción revisada por una persona hablante.

## Qué no incluye este reto

No se conecta con sistemas del MARN. No asigna inspectores ni resuelve denuncias. No sustituye los canales oficiales.

## Fuentes

- Catálogo Nacional de Trámites, fichas de Denuncias Ambientales del MARN
- SICODA, sistema de denuncias del MARN
- Dirección de Cumplimiento Legal, MARN
