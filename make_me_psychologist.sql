-- Para probar el panel de psicólogo, ejecuta esto en tu base de datos
-- Reemplaza 'TU_EMAIL_AQUI' por tu correo registrado

UPDATE public.users 
SET role = 'psychologist' 
WHERE email = 'TU_EMAIL_AQUI';

-- Y crea el registro de psicólogo correspondiente
INSERT INTO public.psychologists (user_id, full_name, specialty, price)
SELECT id, full_name, 'Psicología General', '60€'
FROM public.users
WHERE email = 'TU_EMAIL_AQUI'
ON CONFLICT DO NOTHING;
