<?php
// Minimal raw-SMTP mailer (no external library/composer needed) for sending
// admin notification emails via an authenticated Gmail account (app password).
// Best-effort: callers should not let a mail failure break the request that
// triggered it — wrap calls in try/catch and ignore failures.

function send_admin_notification(string $subject, string $body): bool {
    $config = get_config();
    $mail = $config['mail'] ?? null;
    if (!$mail || empty($mail['smtp_user']) || empty($mail['smtp_pass']) || empty($mail['to'])) {
        return false;
    }

    try {
        smtp_send(
            $mail['smtp_host'] ?? 'smtp.gmail.com',
            (int)($mail['smtp_port'] ?? 587),
            $mail['smtp_user'],
            $mail['smtp_pass'],
            $mail['from'] ?? $mail['smtp_user'],
            $mail['to'],
            $subject,
            $body
        );
        return true;
    } catch (Throwable $e) {
        error_log('send_admin_notification failed: ' . $e->getMessage());
        return false;
    }
}

function smtp_send(
    string $host,
    int $port,
    string $username,
    string $password,
    string $from,
    string $to,
    string $subject,
    string $body
): void {
    $socket = fsockopen($host, $port, $errno, $errstr, 10);
    if (!$socket) {
        throw new RuntimeException("SMTP connect failed: $errstr ($errno)");
    }
    stream_set_timeout($socket, 10);

    $expect = function (string $contextLabel) use ($socket): string {
        $response = '';
        while (($line = fgets($socket, 515)) !== false) {
            $response .= $line;
            // SMTP multi-line responses use "250-" for continuation lines
            // and "250 " (space) for the final line of that code.
            if (strlen($line) < 4 || $line[3] !== '-') break;
        }
        $code = (int)substr($response, 0, 3);
        if ($code < 200 || $code >= 400) {
            throw new RuntimeException("SMTP error at $contextLabel: $response");
        }
        return $response;
    };

    $send = function (string $line) use ($socket): void {
        fwrite($socket, $line . "\r\n");
    };

    $expect('connect');

    $send('EHLO booyoungcc.local');
    $expect('EHLO');

    $send('STARTTLS');
    $expect('STARTTLS');
    if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
        throw new RuntimeException('STARTTLS negotiation failed');
    }

    $send('EHLO booyoungcc.local');
    $expect('EHLO after STARTTLS');

    $send('AUTH LOGIN');
    $expect('AUTH LOGIN');
    $send(base64_encode($username));
    $expect('AUTH username');
    $send(base64_encode($password));
    $expect('AUTH password');

    $send("MAIL FROM:<$from>");
    $expect('MAIL FROM');
    $send("RCPT TO:<$to>");
    $expect('RCPT TO');

    $send('DATA');
    $expect('DATA');

    $headers = implode("\r\n", [
        'From: ' . $from,
        'To: ' . $to,
        'Subject: =?UTF-8?B?' . base64_encode($subject) . '?=',
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: base64',
    ]);
    // Dot-stuff any line that starts with a lone "." so it isn't mistaken
    // for the end-of-DATA terminator.
    $encodedBody = chunk_split(base64_encode($body));
    $send($headers . "\r\n\r\n" . $encodedBody . "\r\n.");
    $expect('end of DATA');

    $send('QUIT');
    fclose($socket);
}
