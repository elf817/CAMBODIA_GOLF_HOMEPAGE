<?php
// Copy this file to config.php (same folder) and fill in real values.
// config.php is gitignored — never commit real credentials.

return [
    'db' => [
        'host' => '127.0.0.1',
        'name' => 'booyoungcc',
        'user' => 'root',
        'pass' => '',
        'charset' => 'utf8mb4',
    ],

    // Origins allowed to make credentialed cross-origin requests.
    // In production the Next.js static site and this PHP backend are
    // uploaded to the same domain, so this list only matters for local
    // development where `next dev` (port 3000) and Apache are different origins.
    'allowed_origins' => [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
    ],
    // Dev-only: also allow any origin on this port (e.g. testing from
    // another device via http://<lan-or-public-ip>:3000). Remove/unset
    // this in a production config.
    'dev_frontend_port' => 3000,

    'uploads_dir' => __DIR__ . '/uploads',
    // Public URL prefix the browser uses to fetch uploaded files.
    'uploads_url' => '/backend/uploads',

    // Sends a notification email to the admin whenever a new inquiry is
    // posted. Uses an authenticated Gmail SMTP connection (app password,
    // not the account's normal login password — see Google Account >
    // Security > App passwords, requires 2-step verification to be on).
    // Leave smtp_user/smtp_pass empty to disable notifications entirely.
    'mail' => [
        'smtp_host' => 'smtp.gmail.com',
        'smtp_port' => 587,
        'smtp_user' => '',
        'smtp_pass' => '',
        'from' => '',
        'to' => '',
    ],
];
