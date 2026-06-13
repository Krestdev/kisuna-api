SELECT setval(pg_get_serial_sequence('"Employee"', 'uuid'), COALESCE(MAX(uuid), 1)) FROM "Employee";
