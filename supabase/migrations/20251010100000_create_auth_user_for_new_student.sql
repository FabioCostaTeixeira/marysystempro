CREATE OR REPLACE FUNCTION public.handle_new_student_create_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_token,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_sent_at,
    confirmed_at
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    new.id, -- Use the student's ID as the auth user's ID
    'authenticated',
    'authenticated',
    new.email,
    crypt('12345', gen_salt('bf')),
    now(),
    '',
    NULL,
    NULL,
    '{"provider":"email","providers":["email"]}',
    '{"is_first_login": true}',
    now(),
    now(),
    '',
    '',
    NULL,
    now()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new student is added
CREATE TRIGGER on_new_student_create_auth_user
AFTER INSERT ON public.alunos
FOR EACH ROW
EXECUTE PROCEDURE public.handle_new_student_create_auth_user();
