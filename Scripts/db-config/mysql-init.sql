CREATE DATABASE IF NOT EXISTS key_value_db;

CREATE USER IF NOT EXISTS 'key_value_user'@'%' IDENTIFIED BY 'key_value_password';

GRANT ALL PRIVILEGES ON key_value_db.* TO 'key_value_user'@'%';

FLUSH PRIVILEGES;