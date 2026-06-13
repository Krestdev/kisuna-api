-- Fix Employee sequence
SELECT setval(pg_get_serial_sequence('"Employee"', 'uuid'), COALESCE((SELECT MAX(uuid) FROM "Employee"), 1), true);
