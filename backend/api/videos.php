<?php
require_once __DIR__ . '/../bootstrap.php';

$action = $_GET['action'] ?? $_POST['action'] ?? '';

switch ($action) {
    case 'list':
        list_videos();
        break;
    case 'create':
        require_method('POST');
        require_admin();
        create_video();
        break;
    case 'delete':
        require_method('POST');
        require_admin();
        delete_video();
        break;
    default:
        json_error('알 수 없는 요청입니다.', 400);
}

function list_videos(): void {
    $stmt = get_pdo()->query('SELECT id, title, youtube_id, created_at FROM videos ORDER BY created_at ASC');
    $rows = $stmt->fetchAll();
    json_ok(array_map(function ($r) {
        return [
            'id' => (int)$r['id'],
            'title' => $r['title'],
            'youtubeId' => $r['youtube_id'],
            'createdAt' => format_date($r['created_at']),
        ];
    }, $rows));
}

function create_video(): void {
    $title = trim((string)body_param('title', ''));
    $youtubeId = trim((string)body_param('youtubeId', ''));

    if ($title === '' || $youtubeId === '') {
        json_error('필수 항목을 입력해 주세요.', 400);
    }
    if (!preg_match('/^[A-Za-z0-9_-]{6,20}$/', $youtubeId)) {
        json_error('유효한 유튜브 영상 ID가 아닙니다.', 400);
    }

    $pdo = get_pdo();
    $stmt = $pdo->prepare('INSERT INTO videos (title, youtube_id) VALUES (?, ?)');
    $stmt->execute([$title, $youtubeId]);

    json_ok(['id' => (int)$pdo->lastInsertId()]);
}

function delete_video(): void {
    $id = (int)body_param('id', 0);
    if (!$id) {
        json_error('잘못된 요청입니다.', 400);
    }

    $stmt = get_pdo()->prepare('DELETE FROM videos WHERE id = ?');
    $stmt->execute([$id]);

    json_ok(['id' => $id]);
}
