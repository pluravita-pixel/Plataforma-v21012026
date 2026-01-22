# Sistema de Pre-Registro de Psicólogos

## 📋 Descripción General

Este sistema permite que los administradores añadan psicólogos a la plataforma **antes** de que estos se registren. Cuando el psicólogo se registre posteriormente con su email, el sistema automáticamente:

1. ✅ Detecta que ya existe un registro con ese email
2. ✅ Preserva el rol de "psychologist" asignado por el admin
3. ✅ Sincroniza el ID de Supabase Auth con el registro existente
4. ✅ Redirige al dashboard de psicólogo automáticamente

## 🔄 Flujo de Trabajo

### Paso 1: Admin añade un psicólogo
```
Admin Dashboard → Añadir Psicólogo → Introduce nombre y email
```

**Lo que sucede internamente:**
- Se verifica si el email ya existe en la base de datos
- **Si existe:** Se actualiza el rol a "psychologist" y se crea/actualiza el perfil de psicólogo
- **Si NO existe:** Se crea un registro "pendiente" con:
  - Email del psicólogo
  - Nombre proporcionado
  - Rol: "psychologist"
  - Estado: Esperando registro

### Paso 2: Psicólogo se registra
```
Página de Registro → Introduce email (el mismo que el admin añadió) + contraseña
```

**Lo que sucede internamente:**
1. Supabase Auth crea el usuario de autenticación
2. El sistema detecta que ya existe un registro con ese email
3. Se sincroniza el ID de Supabase Auth con el registro existente
4. Se preserva el rol "psychologist"
5. Se actualiza el perfil del psicólogo con el nuevo ID
6. Se redirige automáticamente a `/psychologist/dashboard`

## 🗄️ Cambios en la Base de Datos

### Schema Updates (schema.ts)
Se agregó `onUpdate: "cascade"` a todas las foreign keys que referencian `users.id`:

```typescript
// Antes
userId: uuid("user_id").references(() => users.id).notNull()

// Después
userId: uuid("user_id").references(() => users.id, { onUpdate: "cascade" }).notNull()
```

**Tablas afectadas:**
- ✅ `psychologists.user_id`
- ✅ `appointments.patient_id`
- ✅ `support_tickets.user_id`
- ✅ `session_files.uploader_id`

### Migración SQL
Ejecutar el archivo: `add_cascade_to_foreign_keys.sql`

Este archivo:
1. Elimina las constraints existentes
2. Las recrea con `ON UPDATE CASCADE`
3. Verifica que los cambios se aplicaron correctamente

## 🔧 Archivos Modificados

### 1. `src/app/actions/admin.ts`
**Función:** `createPsychologistProfile()`

**Cambios:**
- ✅ Verifica si el usuario ya existe antes de crear uno nuevo
- ✅ Si existe, actualiza el rol a "psychologist"
- ✅ Si no existe, crea un registro "pendiente"
- ✅ Maneja correctamente la creación/actualización del perfil de psicólogo
- ✅ Retorna mensajes descriptivos según el caso

### 2. `src/app/actions/auth.ts`
**Función:** `register()`

**Cambios:**
- ✅ Detecta usuarios pre-registrados por email
- ✅ Preserva el rol asignado (psychologist/admin/patient)
- ✅ Sincroniza el ID de Supabase Auth con el registro existente
- ✅ Actualiza el nombre completo si se proporciona durante el registro
- ✅ Actualiza también el perfil de psicólogo si aplica
- ✅ Redirige al dashboard correcto según el rol

### 3. `src/db/schema.ts`
**Cambios:**
- ✅ Agregado `onUpdate: "cascade"` a todas las foreign keys relevantes

## 🧪 Cómo Probar

### Escenario 1: Psicólogo nuevo (no existe en DB)
1. Como admin, añade un psicólogo con email: `nuevo@test.com`
2. El psicólogo se registra con email: `nuevo@test.com`
3. **Resultado esperado:** 
   - ✅ Redirigido a `/psychologist/dashboard`
   - ✅ Rol: "psychologist"
   - ✅ Perfil de psicólogo creado

### Escenario 2: Psicólogo ya registrado
1. Como admin, añade un psicólogo con email de alguien que ya está registrado
2. **Resultado esperado:**
   - ✅ Se actualiza el rol del usuario existente a "psychologist"
   - ✅ Se crea/actualiza el perfil de psicólogo
   - ✅ Mensaje: "Psicólogo actualizado correctamente"

### Escenario 3: Usuario se registra después de ser añadido
1. Admin añade psicólogo: `pendiente@test.com`
2. Usuario se registra con: `pendiente@test.com`
3. **Resultado esperado:**
   - ✅ ID sincronizado automáticamente
   - ✅ Rol preservado: "psychologist"
   - ✅ Redirigido a dashboard de psicólogo

## ⚠️ Consideraciones Importantes

### 1. Sincronización de IDs
Cuando un usuario pre-registrado se registra, el sistema:
- Actualiza el `id` en la tabla `users` con el ID de Supabase Auth
- Gracias a `ON UPDATE CASCADE`, todas las referencias se actualizan automáticamente:
  - `psychologists.user_id`
  - `appointments.patient_id`
  - `support_tickets.user_id`
  - `session_files.uploader_id`

### 2. Manejo de Errores
Si la migración de ID falla:
- Se registra el error en consola
- El usuario puede continuar, pero puede haber inconsistencias
- **Solución:** Revisar los logs y corregir manualmente si es necesario

### 3. Nombres Duplicados
Si el admin proporciona un nombre y el usuario proporciona otro durante el registro:
- Se usa el nombre proporcionado durante el registro
- Si el usuario no proporciona nombre, se mantiene el del admin

## 🚀 Próximos Pasos Recomendados

1. **Sistema de Invitaciones por Email**
   - Enviar email automático cuando el admin añade un psicólogo
   - Incluir link de registro con token único
   - Pre-llenar el email en el formulario de registro

2. **Dashboard de Admin Mejorado**
   - Mostrar estado de psicólogos (Pendiente/Activo)
   - Permitir reenviar invitaciones
   - Mostrar fecha de último login

3. **Validaciones Adicionales**
   - Verificar formato de email
   - Prevenir duplicados exactos
   - Confirmar antes de cambiar roles

## 📝 Notas Técnicas

- **Drizzle ORM:** Se usa para las operaciones de DB en `admin.ts`
- **SQL Directo:** Se usa en `auth.ts` para operaciones críticas de sincronización
- **Supabase Auth:** Maneja la autenticación, pero los roles se gestionan en nuestra DB
- **Foreign Keys:** Configuradas con `CASCADE` para mantener integridad referencial

## 🔗 Archivos Relacionados

- `src/app/actions/admin.ts` - Lógica de administración
- `src/app/actions/auth.ts` - Lógica de autenticación y registro
- `src/db/schema.ts` - Esquema de base de datos
- `add_cascade_to_foreign_keys.sql` - Migración SQL
