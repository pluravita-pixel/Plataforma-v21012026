# 🔧 Guía Rápida: Arreglar Variables de Entorno en Vercel

## El Problema
Tu aplicación en Vercel está fallando con el error:
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

Esto ocurre porque las variables de entorno de la base de datos están configuradas solo para **Preview**, no para **Production**.

---

## ✅ Solución Rápida (5 minutos)

### Opción 1: Interfaz de Vercel (MÁS FÁCIL)

1. **Abre esta URL en tu navegador:**
   ```
   https://vercel.com/pluravita-pixels-projects/plataforma-v21012026/settings/environment-variables
   ```

2. **Para CADA una de estas 7 variables:**
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

3. **Haz lo siguiente:**
   - Busca la variable en la lista
   - Haz clic en los **3 puntos (⋮)** → **"Edit"**
   - Marca el checkbox **"Production"** ✅
   - Haz clic en **"Save"**

4. **Después de editar todas, haz Redeploy:**
   - Ve a: https://vercel.com/pluravita-pixels-projects/plataforma-v21012026/deployments
   - Haz clic en los **3 puntos (⋮)** del primer deployment
   - Selecciona **"Redeploy"**
   - Espera 1-2 minutos

5. **Prueba tu sitio:**
   ```
   https://plataforma-v21012026.vercel.app
   ```

---

## 🎯 Checklist

Marca cada variable cuando la hayas editado:

- [ ] `DATABASE_URL` → Production ✅
- [ ] `DIRECT_URL` → Production ✅
- [ ] `NEXT_PUBLIC_SUPABASE_URL` → Production ✅
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Production ✅
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` → Production ✅
- [ ] `STRIPE_SECRET_KEY` → Production ✅
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → Production ✅
- [ ] Redeploy completado ✅
- [ ] Sitio funcionando ✅

---

## 📸 Capturas de Pantalla de Referencia

### Cómo se ve ANTES (❌ INCORRECTO):
```
DATABASE_URL
Environments: Preview
```

### Cómo debe verse DESPUÉS (✅ CORRECTO):
```
DATABASE_URL
Environments: Production, Preview, Development
```

---

## ⚠️ Importante

**NO** borres las variables, solo edítalas para agregar "Production".

Si tienes problemas, avísame en qué paso te quedaste.
