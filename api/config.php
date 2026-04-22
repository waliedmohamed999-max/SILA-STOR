<?php

return [
    'db' => [
        'host' => getenv('SILA_DB_HOST') ?: '127.0.0.1',
        'port' => getenv('SILA_DB_PORT') ?: '3306',
        'name' => getenv('SILA_DB_NAME') ?: 'sila',
        'user' => getenv('SILA_DB_USER') ?: 'root',
        'pass' => getenv('SILA_DB_PASS') ?: '',
        'charset' => 'utf8mb4',
    ],
    'cors' => [
        'allowed_origins' => array_filter(array_map('trim', explode(',', getenv('SILA_ALLOWED_ORIGINS') ?: 'http://localhost:5173,http://127.0.0.1:5173,http://localhost'))),
    ],
];
