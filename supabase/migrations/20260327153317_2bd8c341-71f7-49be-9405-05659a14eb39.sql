
-- Remove LAGEP
DELETE FROM public.laboratories WHERE acronym = 'LAGEP';

-- Remove "Dr." and "Dr. " from chief_name
UPDATE public.laboratories SET chief_name = REPLACE(REPLACE(chief_name, 'Prof. Dr. ', 'Prof. '), 'Dr. ', '') WHERE chief_name LIKE '%Dr.%';
