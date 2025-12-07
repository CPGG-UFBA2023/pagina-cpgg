UPDATE admin_users 
SET email = 'bianca.andrade@ufba.br', updated_at = now()
WHERE role = 'ti' AND email = 'bianca.andrade@gmail.com';