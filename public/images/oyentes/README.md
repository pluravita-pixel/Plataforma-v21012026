# Imágenes de Perfiles de Oyentes MVP

## 📸 Instrucciones para añadir fotos de perfil

Para completar los perfiles de prueba, necesitas añadir 3 fotos de perfil profesionales:

### Perfiles creados:
1. **María López García** (15€) - Mujer, 30-35 años, especialista en ansiedad
2. **Carlos Martínez Ruiz** (20€) - Hombre, 28-32 años, especialista en relaciones
3. **Laura Fernández Sánchez** (35€) - Mujer, 40-45 años, especialista en bienestar emocional

### Dónde conseguir las fotos:

#### Opción 1: Unsplash (Recomendado)
Busca fotos profesionales de headshots en [Unsplash](https://unsplash.com/s/photos/professional-headshot):
- Busca: "professional headshot", "therapist portrait", "professional portrait"
- Descarga imágenes de alta calidad
- Asegúrate de que miran a la cámara y tienen fondo neutro

#### Opción 2: This Person Does Not Exist
Usa [thispersondoesnotexist.com](https://thispersondoesnotexist.com/) para generar rostros realistas con IA:
- Refresca la página hasta encontrar una foto adecuada
- Descarga la imagen
- Repite para cada perfil

### Cómo añadir las fotos:

1. **Guarda las imágenes** en esta carpeta con estos nombres:
   ```
   /public/images/oyentes/
   ├── maria-lopez.jpg
   ├── carlos-martinez.jpg
   └── laura-fernandez.jpg
   ```

2. **Actualiza la base de datos** ejecutando:
   ```bash
   npm run seed:oyentes
   ```

   O manualmente con SQL:
   ```sql
   UPDATE oyentes 
   SET image = '/images/oyentes/maria-lopez.jpg' 
   WHERE email = 'maria.lopez.mvp@pluravita.test';

   UPDATE oyentes 
   SET image = '/images/oyentes/carlos-martinez.jpg' 
   WHERE email = 'carlos.martinez.mvp@pluravita.test';

   UPDATE oyentes 
   SET image = '/images/oyentes/laura-fernandez.jpg' 
   WHERE email = 'laura.fernandez.mvp@pluravita.test';
   ```

### Características ideales de las fotos:
- ✅ Fondo neutro (blanco, gris, beige)
- ✅ Mirando directamente a la cámara
- ✅ Expresión amable y profesional
- ✅ Buena iluminación
- ✅ Formato cuadrado o vertical
- ✅ Alta resolución (mínimo 400x400px)

### Nota importante:
Las fotos actuales son placeholders de Unsplash. Reemplázalas con imágenes más apropiadas para tu proyecto.
