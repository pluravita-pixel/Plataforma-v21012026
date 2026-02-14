# 🎯 Perfiles MVP - Instrucciones de Configuración

## ✅ Lo que ya está hecho:

1. ✅ **3 Perfiles creados** con precios: 15€, 20€ y 35€
2. ✅ **Imágenes de perfil** incluidas en el código
3. ✅ **Sistema de notificación** activado para detectar compras
4. ✅ **Horarios automáticos** (7 días × 6 horas = 42 slots por oyente)

## 📋 Cómo ejecutar el script:

### Opción 1: Después del deploy en Vercel (Recomendado)

Una vez que el proyecto esté desplegado en Vercel:

1. Ve a tu proyecto en Vercel Dashboard
2. Ve a la pestaña "Settings" → "Environment Variables"
3. Verifica que `DATABASE_URL` esté configurada
4. Abre una terminal local y ejecuta:
   ```bash
   # Asegúrate de tener la DATABASE_URL en tu .env.local
   node scripts/seed-fake-oyentes.js
   ```

### Opción 2: Manualmente con SQL

Si prefieres crear los perfiles manualmente, ejecuta este SQL en tu base de datos de Supabase:

```sql
-- Ver el archivo: scripts/manual-seed.sql
```

## 🔔 Sistema de Notificaciones

Cuando alguien intente comprar una sesión de un perfil MVP, verás en los logs del servidor:

```
🔔 ═══════════════════════════════════════════════════════
🎯 ALERTA MVP: ¡Alguien ha intentado comprar una sesión!
═══════════════════════════════════════════════════════
👤 Oyente: María López García
💰 Precio: 18.15€ (IVA incluido)
📅 Fecha: 15/2/2026, 10:00:00
📧 Usuario: Juan Pérez
🆔 ID Cita: abc-123-def
🔗 Session Stripe: cs_test_...
═══════════════════════════════════════════════════════
```

### Cómo ver las notificaciones:

- **En desarrollo local**: Mira la terminal donde corre `npm run dev`
- **En Vercel**: Ve a tu proyecto → "Deployments" → Click en el deployment → "Functions" → Logs

## 📊 Perfiles creados:

### 1. María López García - 15€
- **Especialidad**: Ansiedad y Estrés
- **Email**: maria.lopez.mvp@pluravita.test
- **Idiomas**: Español, Catalán
- **Imagen**: ✅ Incluida

### 2. Carlos Martínez Ruiz - 20€
- **Especialidad**: Relaciones y Autoestima
- **Email**: carlos.martinez.mvp@pluravita.test
- **Idiomas**: Español, Inglés
- **Imagen**: ✅ Incluida

### 3. Laura Fernández Sánchez - 35€
- **Especialidad**: Bienestar Emocional
- **Email**: laura.fernandez.mvp@pluravita.test
- **Idiomas**: Español, Francés, Inglés
- **Imagen**: ✅ Incluida

## 🚀 Próximos pasos:

1. ✅ Subir a GitHub
2. ✅ Deploy en Vercel
3. ⏳ Ejecutar el script de seed (después del deploy)
4. ⏳ Probar el flujo de compra
5. ⏳ Verificar las notificaciones en los logs

## 💡 Notas importantes:

- Los perfiles tienen el sufijo `.mvp@pluravita.test` para identificarlos fácilmente
- El sistema detecta automáticamente estos emails y registra las compras
- Las imágenes están embebidas como artifacts (se mostrarán correctamente en la app)
- Cada perfil tiene 42 horarios disponibles en los próximos 7 días
