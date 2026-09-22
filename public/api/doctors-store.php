<?php
/**
 * Лікарі: зберігання, редагування й публікація.
 *
 * Сайт НЕ читає базу напряму. При кожному збереженні з панелі тут
 * перегенеровується статичний doctors.json, і сайт завантажує тільки його:
 *   — відвідувачі не навантажують базу;
 *   — Cloudflare кешує файл;
 *   — якщо панель чи база зламаються, сайт показує останню робочу версію.
 *
 * Файл і фото лежать поза /var/www/html: деплой робить rm -rf
 * вебкореня, і все завантажене через панель зникало б при кожному пуші.
 */

require_once __DIR__ . '/attr-store.php';

const DOCTORS_LANGS = ['uk', 'ru', 'en'];
const DOCTORS_CITIES = ['kharkiv', 'kyiv'];

function doctors_public_dir() {
  return rtrim(attr_env('DOCTORS_PUBLIC_DIR', '/var/lib/isaenko/public'), '/');
}

function doctors_uploads_dir() {
  return rtrim(attr_env('UPLOADS_DIR', '/var/lib/isaenko/uploads'), '/');
}

function doctors_db() {
  $pdo = attr_db();

  // Лікар — один документ JSON. Поля в нього вкладені на трьох мовах
  // плюс масив цін; розкладати це по таблицях заради 25 записів
  // лише ускладнило б і збереження, і генерацію doctors.json.
  $pdo->exec("
    CREATE TABLE IF NOT EXISTS doctors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      position INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      data TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  ");

  $count = (int) $pdo->query('SELECT COUNT(*) FROM doctors')->fetchColumn();

  if ($count === 0) doctors_seed($pdo);

  return $pdo;
}

/** Перше заповнення з результату скрипта перенесення. */
function doctors_seed($pdo) {
  $file = __DIR__ . '/seed/doctors.seed.json';

  if (!is_readable($file)) return;

  $items = json_decode(file_get_contents($file), true);

  if (!is_array($items)) return;

  $stmt = $pdo->prepare('INSERT INTO doctors (slug, position, data) VALUES (?, ?, ?)');

  foreach ($items as $item) {
    $slug = $item['slug'] ?? '';
    if ($slug === '') continue;

    $position = (int) ($item['position'] ?? 0);
    unset($item['position']);

    $stmt->execute([$slug, $position, json_encode($item, JSON_UNESCAPED_UNICODE)]);
  }
}

/**
 * Імʼя зберігається частинами, але в старих записах є лише рядок.
 * Усі 25 перенесених імен — рівно три слова в одному порядку на всіх
 * мовах (прізвище, імʼя, по батькові), тож розкладаємо за пробілами.
 */
function doctors_split_name($name) {
  $parts = preg_split('/\s+/u', trim((string) $name), 3) ?: [];

  return [
    'lastName' => $parts[0] ?? '',
    'firstName' => $parts[1] ?? '',
    'middleName' => $parts[2] ?? '',
  ];
}

/** Для сайту частини склеюються назад: він і далі читає одне поле name. */
function doctors_join_name($texts) {
  return trim(implode(' ', array_filter([
    $texts['lastName'] ?? '',
    $texts['firstName'] ?? '',
    $texts['middleName'] ?? '',
  ], 'strlen')));
}

function doctors_row_to_array($row) {
  $data = json_decode($row['data'], true) ?: [];

  foreach (DOCTORS_LANGS as $lang) {
    $texts = $data['i18n'][$lang] ?? [];

    if (!isset($texts['lastName']) && !empty($texts['name'])) {
      $data['i18n'][$lang] = array_merge($texts, doctors_split_name($texts['name']));
    }
  }

  $data['id'] = (int) $row['id'];
  $data['slug'] = $row['slug'];
  $data['position'] = (int) $row['position'];
  $data['is_active'] = (int) $row['is_active'];
  $data['updated_at'] = $row['updated_at'];

  return $data;
}

function doctors_list($withInactive = true) {
  $sql = 'SELECT * FROM doctors';
  if (!$withInactive) $sql .= ' WHERE is_active = 1';
  $sql .= ' ORDER BY position, id';

  return array_map('doctors_row_to_array', doctors_db()->query($sql)->fetchAll(PDO::FETCH_ASSOC));
}

function doctors_find($id) {
  $stmt = doctors_db()->prepare('SELECT * FROM doctors WHERE id = ?');
  $stmt->execute([(int) $id]);
  $row = $stmt->fetch(PDO::FETCH_ASSOC);

  return $row ? doctors_row_to_array($row) : null;
}

/** Slug: латиниця, цифри, дефіс. Потрапляє в URL і в звʼязки з напрямами. */
function doctors_valid_slug($slug) {
  return (bool) preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', (string) $slug);
}

function doctors_clean_text($value, $limit = 2000) {
  return mb_substr(trim((string) $value), 0, $limit);
}

/**
 * Нормалізація документа лікаря. Приймаємо лише відомі поля:
 * усе, що прийшло з форми понад це, відкидається.
 */
function doctors_normalize($input) {
  $doctor = [
    'image' => doctors_clean_text($input['image'] ?? '', 300),
    'cities' => [],
    'online' => !empty($input['online']),
    'experience' => doctors_clean_text($input['experience'] ?? '', 20),
    'isFounder' => !empty($input['isFounder']),
    'showInTeam' => !isset($input['showInTeam']) || !empty($input['showInTeam']),
    'hasHover' => !isset($input['hasHover']) || !empty($input['hasHover']),
    'showOnHomeMobile' => !empty($input['showOnHomeMobile']),
    'directions' => [],
    'prices' => [],
    'i18n' => [],
  ];

  foreach ((array) ($input['cities'] ?? []) as $city) {
    // Порожній рядок — позначка «тільки онлайн», лишаємо як є.
    if ($city === '' || in_array($city, DOCTORS_CITIES, true)) {
      $doctor['cities'][] = $city;
    }
  }

  foreach ((array) ($input['directions'] ?? []) as $direction) {
    if (preg_match('/^[a-z]+$/', (string) $direction)) {
      $doctor['directions'][] = (string) $direction;
    }
  }

  $doctor['directions'] = array_values(array_unique($doctor['directions']));

  foreach (DOCTORS_LANGS as $lang) {
    $source = $input['i18n'][$lang] ?? [];

    $parts = [
      'lastName' => doctors_clean_text($source['lastName'] ?? '', 60),
      'firstName' => doctors_clean_text($source['firstName'] ?? '', 60),
      'middleName' => doctors_clean_text($source['middleName'] ?? '', 60),
    ];

    $doctor['i18n'][$lang] = $parts + [
      'name' => doctors_join_name($parts),
      'experienceText' => doctors_clean_text($source['experienceText'] ?? '', 60),
      'position' => doctors_clean_text($source['position'] ?? '', 500),
      'description' => doctors_clean_text($source['description'] ?? ''),
      'homePosition' => doctors_clean_text($source['homePosition'] ?? '', 300),
      'homeAbout' => doctors_clean_text($source['homeAbout'] ?? '', 1000),
    ];
  }

  foreach ((array) ($input['prices'] ?? []) as $price) {
    $row = ['price' => doctors_clean_text($price['price'] ?? '', 40), 'i18n' => []];

    foreach (DOCTORS_LANGS as $lang) {
      $row['i18n'][$lang] = [
        'service' => doctors_clean_text($price['i18n'][$lang]['service'] ?? '', 200),
        'duration' => doctors_clean_text($price['i18n'][$lang]['duration'] ?? '', 60),
      ];
    }

    // Порожній рядок ціни (жодного тексту й суми) — не зберігаємо.
    $hasText = $row['price'] !== '';
    foreach (DOCTORS_LANGS as $lang) {
      if ($row['i18n'][$lang]['service'] !== '') $hasText = true;
    }

    if ($hasText) $doctor['prices'][] = $row;
  }

  return $doctor;
}

/** Перевірка перед збереженням. Повертає текст помилки або null. */
function doctors_validate($slug, $doctor) {
  if (!doctors_valid_slug($slug)) {
    return 'Ідентифікатор: латиниця в нижньому регістрі, цифри й дефіс (напр. ivanenko-olena)';
  }

  // Прізвище й імʼя — на всіх мовах, інакше на ru чи en версії сайту
  // картка вийде без підпису. По батькові не обовʼязкове: у лікаря
  // з-за кордону його може не бути.
  foreach (DOCTORS_LANGS as $lang) {
    $texts = $doctor['i18n'][$lang];

    if ($texts['lastName'] === '' || $texts['firstName'] === '') {
      return 'Заповніть прізвище й імʼя на всіх трьох мовах (не вистачає: '
        . strtoupper($lang) . ')';
    }
  }

  return null;
}

function doctors_save($input) {
  $pdo = doctors_db();

  $id = (int) ($input['id'] ?? 0);
  $slug = trim((string) ($input['slug'] ?? ''));
  $doctor = doctors_normalize($input);

  $error = doctors_validate($slug, $doctor);
  if ($error) return ['error' => $error];

  $json = json_encode($doctor, JSON_UNESCAPED_UNICODE);

  try {
    if ($id) {
      $stmt = $pdo->prepare("
        UPDATE doctors SET slug = ?, data = ?, updated_at = datetime('now') WHERE id = ?
      ");
      $stmt->execute([$slug, $json, $id]);
    } else {
      $position = (int) $pdo->query('SELECT COALESCE(MAX(position), 0) + 1 FROM doctors')
        ->fetchColumn();

      $stmt = $pdo->prepare('INSERT INTO doctors (slug, position, data) VALUES (?, ?, ?)');
      $stmt->execute([$slug, $position, $json]);
      $id = (int) $pdo->lastInsertId();
    }
  } catch (PDOException $e) {
    if (strpos($e->getMessage(), 'UNIQUE') !== false) {
      return ['error' => 'Лікар із таким ідентифікатором уже є'];
    }

    error_log('[doctors] ' . $e->getMessage());

    return ['error' => 'Не вдалося зберегти'];
  }

  $published = doctors_publish();

  return ['ok' => true, 'id' => $id, 'published' => $published];
}

/** Приховати або показати. Не видаляємо: історію й фото зберігаємо. */
function doctors_set_active($id, $active) {
  $stmt = doctors_db()->prepare("
    UPDATE doctors SET is_active = ?, updated_at = datetime('now') WHERE id = ?
  ");
  $stmt->execute([(int) (bool) $active, (int) $id]);

  doctors_publish();

  return $stmt->rowCount() > 0;
}

/** Новий порядок — масив id зверху вниз. */
function doctors_reorder($ids) {
  $pdo = doctors_db();
  $pdo->beginTransaction();

  $stmt = $pdo->prepare('UPDATE doctors SET position = ? WHERE id = ?');

  foreach (array_values((array) $ids) as $index => $id) {
    $stmt->execute([$index + 1, (int) $id]);
  }

  $pdo->commit();

  doctors_publish();

  return true;
}

/**
 * Генерація doctors.json для сайту. Пишемо в тимчасовий файл і
 * перейменовуємо: rename атомарний, тож сайт ніколи не прочитає
 * напівзаписаний файл посеред збереження.
 */
function doctors_publish() {
  $dir = doctors_public_dir();

  if (!is_dir($dir)) @mkdir($dir, 0775, true);

  $doctors = array_map(function ($doctor) {
    // Службові поля панелі на сайт не потрібні.
    unset($doctor['id'], $doctor['is_active'], $doctor['updated_at']);
    return $doctor;
  }, doctors_list(false));

  $payload = json_encode([
    'version' => time(),
    'doctors' => $doctors,
  ], JSON_UNESCAPED_UNICODE);

  $target = $dir . '/doctors.json';
  $temp = $target . '.' . getmypid() . '.tmp';

  if (@file_put_contents($temp, $payload) === false) {
    error_log('[doctors] не вдалося записати ' . $temp);
    return false;
  }

  if (!@rename($temp, $target)) {
    @unlink($temp);
    error_log('[doctors] не вдалося перейменувати в ' . $target);
    return false;
  }

  return true;
}

/**
 * Завантаження фото. Перевіряємо справжній тип за вмістом, а не за
 * розширенням: перейменований .php під виглядом .jpg не пройде.
 */
function doctors_upload_photo($file, $slug) {
  if (empty($file['tmp_name']) || $file['error'] !== UPLOAD_ERR_OK) {
    return ['error' => 'Файл не отримано'];
  }

  if ($file['size'] > 8 * 1024 * 1024) {
    return ['error' => 'Файл завеликий: максимум 8 МБ'];
  }

  $info = @getimagesize($file['tmp_name']);
  $allowed = [IMAGETYPE_JPEG => 'jpg', IMAGETYPE_PNG => 'png', IMAGETYPE_WEBP => 'webp'];

  if (!$info || !isset($allowed[$info[2]])) {
    return ['error' => 'Підходять лише JPG, PNG або WEBP'];
  }

  $dir = doctors_uploads_dir() . '/doctors';
  if (!is_dir($dir)) @mkdir($dir, 0775, true);

  $slug = doctors_valid_slug($slug) ? $slug : 'doctor';

  // Хеш у назві: після заміни фото адреса змінюється, і Cloudflare
  // та браузер не покажуть старе з кешу.
  $hash = substr(sha1_file($file['tmp_name']), 0, 8);

  // Якщо є GD з підтримкою WEBP — стискаємо й зменшуємо: фото з телефона
  // бувають по 5 МБ, а на сайті картка займає кількасот пікселів.
  if (function_exists('imagewebp') && function_exists('imagecreatefromstring')) {
    $image = @imagecreatefromstring(file_get_contents($file['tmp_name']));

    if ($image) {
      $width = imagesx($image);
      $height = imagesy($image);
      $max = 1200;

      if ($width > $max || $height > $max) {
        $ratio = min($max / $width, $max / $height);
        $resized = imagecreatetruecolor((int) ($width * $ratio), (int) ($height * $ratio));

        imagealphablending($resized, false);
        imagesavealpha($resized, true);
        imagecopyresampled(
          $resized, $image, 0, 0, 0, 0,
          (int) ($width * $ratio), (int) ($height * $ratio), $width, $height
        );

        imagedestroy($image);
        $image = $resized;
      }

      $name = $slug . '-' . $hash . '.webp';

      if (imagewebp($image, $dir . '/' . $name, 82)) {
        imagedestroy($image);
        return ['ok' => true, 'url' => '/uploads/doctors/' . $name];
      }

      imagedestroy($image);
    }
  }

  // Без GD — зберігаємо оригінал як є, тип уже перевірений.
  $name = $slug . '-' . $hash . '.' . $allowed[$info[2]];

  if (!move_uploaded_file($file['tmp_name'], $dir . '/' . $name)) {
    return ['error' => 'Не вдалося зберегти файл'];
  }

  return ['ok' => true, 'url' => '/uploads/doctors/' . $name];
}
