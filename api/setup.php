<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

$pdo = db();

$pdo->exec(<<<SQL
CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(40) NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
SQL);

$pdo->exec(<<<SQL
CREATE TABLE IF NOT EXISTS products (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id INT UNSIGNED NULL,
  name VARCHAR(180) NOT NULL,
  slug VARCHAR(190) NULL UNIQUE,
  brand VARCHAR(120) NULL,
  category VARCHAR(80) NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  compare_at_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  rating DECIMAL(3,2) NOT NULL DEFAULT 0,
  stock INT NOT NULL DEFAULT 0,
  threshold_qty INT NOT NULL DEFAULT 0,
  sku VARCHAR(80) NOT NULL UNIQUE,
  barcode VARCHAR(100) NULL,
  sales INT NOT NULL DEFAULT 0,
  image TEXT NULL,
  gallery LONGTEXT NULL,
  description TEXT NULL,
  short_description TEXT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'published',
  visibility VARCHAR(40) NOT NULL DEFAULT 'public',
  weight VARCHAR(80) NULL,
  dimensions VARCHAR(120) NULL,
  tags LONGTEXT NULL,
  specs LONGTEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
SQL);

add_column_if_missing($pdo, 'products', 'category_id', 'INT UNSIGNED NULL AFTER id');
add_column_if_missing($pdo, 'products', 'slug', 'VARCHAR(190) NULL UNIQUE AFTER name');
add_column_if_missing($pdo, 'products', 'brand', 'VARCHAR(120) NULL AFTER slug');
add_column_if_missing($pdo, 'products', 'compare_at_price', 'DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER price');
add_column_if_missing($pdo, 'products', 'cost', 'DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER compare_at_price');
add_column_if_missing($pdo, 'products', 'barcode', 'VARCHAR(100) NULL AFTER sku');
add_column_if_missing($pdo, 'products', 'gallery', 'LONGTEXT NULL AFTER image');
add_column_if_missing($pdo, 'products', 'short_description', 'TEXT NULL AFTER description');
add_column_if_missing($pdo, 'products', 'status', "VARCHAR(40) NOT NULL DEFAULT 'published' AFTER short_description");
add_column_if_missing($pdo, 'products', 'visibility', "VARCHAR(40) NOT NULL DEFAULT 'public' AFTER status");
add_column_if_missing($pdo, 'products', 'weight', 'VARCHAR(80) NULL AFTER visibility');
add_column_if_missing($pdo, 'products', 'dimensions', 'VARCHAR(120) NULL AFTER weight');
add_column_if_missing($pdo, 'products', 'tags', 'LONGTEXT NULL AFTER dimensions');
add_column_if_missing($pdo, 'products', 'specs', 'LONGTEXT NULL AFTER tags');

$pdo->exec(<<<SQL
CREATE TABLE IF NOT EXISTS categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(160) NOT NULL UNIQUE,
  description TEXT NULL,
  image TEXT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'active',
  featured TINYINT(1) NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
SQL);

$pdo->exec(<<<SQL
CREATE TABLE IF NOT EXISTS customers (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  phone VARCHAR(80) NULL,
  city VARCHAR(120) NULL,
  address TEXT NULL,
  tier VARCHAR(40) NOT NULL DEFAULT 'Bronze',
  segment VARCHAR(120) NULL,
  favorite_category VARCHAR(80) NULL,
  total_spent DECIMAL(12,2) NOT NULL DEFAULT 0,
  orders_count INT NOT NULL DEFAULT 0,
  status VARCHAR(40) NOT NULL DEFAULT 'active',
  tags LONGTEXT NULL,
  marketing_consent TINYINT(1) NOT NULL DEFAULT 1,
  notes TEXT NULL,
  acquisition VARCHAR(120) NULL,
  last_seen DATE NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
SQL);

$pdo->exec(<<<SQL
CREATE TABLE IF NOT EXISTS orders (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(80) NOT NULL UNIQUE,
  invoice_number VARCHAR(80) NULL,
  shipment_number VARCHAR(80) NULL,
  customer_id INT UNSIGNED NULL,
  customer_name VARCHAR(160) NOT NULL,
  customer_email VARCHAR(190) NULL,
  customer_phone VARCHAR(80) NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'Pending',
  payment_status VARCHAR(40) NOT NULL DEFAULT 'pending',
  payment_method VARCHAR(80) NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'SAR',
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  shipping_fee DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax DECIMAL(12,2) NOT NULL DEFAULT 0,
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  source VARCHAR(80) NOT NULL DEFAULT 'storefront',
  priority VARCHAR(40) NOT NULL DEFAULT 'normal',
  shipping_address LONGTEXT NULL,
  billing_address LONGTEXT NULL,
  shipping LONGTEXT NULL,
  fulfillment LONGTEXT NULL,
  notes LONGTEXT NULL,
  timeline LONGTEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
SQL);

$pdo->exec(<<<SQL
CREATE TABLE IF NOT EXISTS order_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NULL,
  sku VARCHAR(80) NULL,
  name VARCHAR(180) NOT NULL,
  category VARCHAR(80) NULL,
  image TEXT NULL,
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  quantity INT NOT NULL DEFAULT 1,
  discount DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5,4) NOT NULL DEFAULT 0,
  weight DECIMAL(8,2) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
SQL);

$pdo->exec(<<<SQL
CREATE TABLE IF NOT EXISTS payments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  transaction_id VARCHAR(100) NOT NULL UNIQUE,
  order_id INT UNSIGNED NULL,
  gateway VARCHAR(80) NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'pending',
  amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  currency VARCHAR(10) NOT NULL DEFAULT 'SAR',
  reference VARCHAR(120) NULL,
  payload LONGTEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
SQL);

$pdo->exec(<<<SQL
CREATE TABLE IF NOT EXISTS settings (
  section_key VARCHAR(120) PRIMARY KEY,
  value_json LONGTEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
SQL);

$pdo->exec(<<<SQL
CREATE TABLE IF NOT EXISTS stock_movements (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id INT UNSIGNED NOT NULL,
  type VARCHAR(40) NOT NULL,
  quantity INT NOT NULL,
  reason VARCHAR(190) NULL,
  warehouse VARCHAR(120) NULL,
  created_by VARCHAR(120) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
SQL);

$stmt = $pdo->prepare('INSERT IGNORE INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)');
$stmt->execute(['مدير سيلا', 'admin@sila.local', password_hash('Sila@12345', PASSWORD_DEFAULT), 'admin']);

$products = [
    ['AstraBook Pro 14', 'Laptops', 0, 0, 0, 0, 'LAP-ABP14', 0, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80'],
    ['Nexus One X', 'Phones', 0, 0, 0, 0, 'PHN-NOX', 0, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80'],
    ['Pulse Max Headphones', 'Headphones', 0, 0, 0, 0, 'AUD-PMX', 0, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80'],
    ['FrameShot Z6', 'Cameras', 0, 0, 0, 0, 'CAM-FZ6', 0, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80'],
    ['SlatePad Ultra', 'Tablets', 0, 0, 0, 0, 'TAB-SPU', 0, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=900&q=80'],
    ['MagDock Studio', 'Accessories', 0, 0, 0, 0, 'ACC-MDS', 0, 'https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=900&q=80'],
];

$stmt = $pdo->prepare(
    'INSERT IGNORE INTO products (name, category, price, rating, stock, threshold_qty, sku, sales, image, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
);

foreach ($products as $product) {
    $stmt->execute([...$product, $product[0] . ' product connected to the SILA database.']);
}

$categoryStmt = $pdo->prepare('INSERT IGNORE INTO categories (name, slug, description, image, status, featured, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)');
$categoryImages = [
    'Laptops' => 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80',
    'Phones' => 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80',
    'Headphones' => 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80',
    'Cameras' => 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80',
    'Tablets' => 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=900&q=80',
    'Accessories' => 'https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=900&q=80',
];
$sort = 1;
foreach ($categoryImages as $name => $image) {
    $categoryStmt->execute([$name, slugify($name), $name . ' category', $image, 'active', $sort <= 3 ? 1 : 0, $sort++]);
}

$customerStmt = $pdo->prepare('INSERT IGNORE INTO customers (name, email, phone, city, address, tier, segment, favorite_category, total_spent, orders_count, status, tags, marketing_consent, notes, acquisition, last_seen) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
$customers = [
    ['Omar Khalid', 'omar.khalid@commerce.example', '+966 55 1200', 'الرياض', 'شارع الملك 20', 'Gold', 'عملاء نشطون', 'Phones', 0, 0, 'active'],
    ['Maya Chen', 'maya.chen@commerce.example', '+966 55 1237', 'جدة', 'حي الصفا', 'Platinum', 'كبار العملاء', 'Laptops', 0, 0, 'active'],
    ['Lina Santos', 'lina.santos@commerce.example', '+966 55 1274', 'دبي', 'Business Bay', 'Silver', 'جدد', 'Accessories', 0, 0, 'new'],
    ['Yousef Nasser', 'yousef.nasser@commerce.example', '+966 55 1311', 'الدمام', 'حي الخليج', 'Bronze', 'عملاء معرضون للفقد', 'Cameras', 0, 0, 'at-risk'],
];
foreach ($customers as $customer) {
    $customerStmt->execute([...$customer, json_encode([$customer[5], $customer[7]], JSON_UNESCAPED_UNICODE), 1, 'Seed customer', 'زيارة مباشرة', date('Y-m-d')]);
}

$settingsStmt = $pdo->prepare('INSERT IGNORE INTO settings (section_key, value_json) VALUES (?, ?)');
$settingsStmt->execute(['store-profile', json_encode(['storeName' => 'سيلا | SILA', 'supportEmail' => 'support@sila.store', 'phone' => '+966 55 800 4400'], JSON_UNESCAPED_UNICODE)]);
$settingsStmt->execute(['billing', json_encode(['currency' => 'SAR', 'taxRate' => '0', 'orderPrefix' => 'ORD-SILA'], JSON_UNESCAPED_UNICODE)]);

$pdo->exec('UPDATE products SET price=0, compare_at_price=0, cost=0, rating=0, stock=0, threshold_qty=0, sales=0');
$pdo->exec('UPDATE customers SET total_spent=0, orders_count=0');
$pdo->exec('UPDATE orders SET subtotal=0, discount_amount=0, shipping_fee=0, tax=0, total=0');
$pdo->exec('UPDATE order_items SET unit_price=0, quantity=0, discount=0, tax_rate=0, weight=0');
$pdo->exec('UPDATE payments SET amount=0');
$pdo->exec('UPDATE stock_movements SET quantity=0');

header('Content-Type: text/plain; charset=utf-8');
echo "SILA database is ready.\n";
echo "Database: " . app_config('db.name') . "\n";
echo "Admin: admin@sila.local / Sila@12345\n";

function add_column_if_missing(PDO $pdo, string $table, string $column, string $definition): void
{
    $stmt = $pdo->prepare(
        'SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?'
    );
    $stmt->execute([$table, $column]);
    if ((int) $stmt->fetchColumn() === 0) {
        $pdo->exec("ALTER TABLE {$table} ADD COLUMN {$column} {$definition}");
    }
}

function slugify(string $value): string
{
    $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9]+/', '-', $value), '-'));
    return $slug ?: strtolower(bin2hex(random_bytes(4)));
}
