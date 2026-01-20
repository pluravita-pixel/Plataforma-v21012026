-- Para probar el panel de administrador, ejecuta esto en tu base de datos
-- Reemplaza 'TU_EMAIL_AQUI' por tu correo registrado

UPDATE public.users 
SET role = 'admin' 
WHERE email = 'TU_EMAIL_AQUI';
