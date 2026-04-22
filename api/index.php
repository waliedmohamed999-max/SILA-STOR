<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

send_cors_headers();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

start_api_session();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$path = rawurldecode(parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/');
$scriptName = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? ''));
$path = preg_replace('#^' . preg_quote($scriptName, '#') . '#', '', $path);
$path = preg_replace('#^/index\.php#', '', $path);
$segments = array_values(array_filter(explode('/', trim($path, '/'))));
$resource = $segments[0] ?? '';
$id = $segments[1] ?? null;

try {
    route_request($method, $resource, $id, $segments);
} catch (PDOException $exception) {
    json_response(['message' => 'Database error: ' . $exception->getMessage()], 500);
} catch (Throwable $exception) {
    json_response(['message' => 'Server error: ' . $exception->getMessage()], 500);
}

function route_request(string $method, string $resource, ?string $id, array $segments): void
{
    if ($method === 'GET' && $resource === 'health') {
        db()->query('SELECT 1');
        json_response(['ok' => true, 'database' => app_config('db.name')]);
    }

    if ($resource === 'auth') {
        route_auth($method, $id);
    }

    if ($resource === 'checkout' && ($segments[1] ?? '') === 'orders' && $method === 'POST') {
        json_response(['data' => create_order(read_json_body(), 'storefront')], 201);
    }

    if ($resource === 'categories') {
        route_categories($method, $id);
    }

    if ($resource === 'products') {
        route_products($method, $id);
    }

    if ($resource === 'customers') {
        require_admin();
        route_customers($method, $id);
    }

    if ($resource === 'orders') {
        require_admin();
        route_orders($method, $id, $segments);
    }

    if ($resource === 'payments') {
        require_admin();
        route_payments($method, $id);
    }

    if ($resource === 'settings') {
        require_admin();
        route_settings($method, $id);
    }

    json_response(['message' => 'Endpoint not found.'], 404);
}

function route_auth(string $method, ?string $action): void
{
    if ($method === 'GET' && $action === 'me') {
        $user = current_user();
        if (!$user) json_response(['user' => null], 401);
        json_response(['user' => public_user($user)]);
    }

    if ($method === 'POST' && $action === 'login') {
        $body = read_json_body();
        $email = strtolower(trim((string) ($body['email'] ?? '')));
        $password = (string) ($body['password'] ?? '');
        $stmt = db()->prepare('SELECT id, name, email, password_hash, role, created_at FROM users WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password_hash'])) {
            json_response(['message' => 'بيانات الدخول غير صحيحة.'], 422);
        }

        session_regenerate_id(true);
        $_SESSION['user_id'] = (int) $user['id'];
        json_response(['user' => public_user($user)]);
    }

    if ($method === 'POST' && $action === 'register') {
        $body = read_json_body();
        $name = trim((string) ($body['name'] ?? ''));
        $email = strtolower(trim((string) ($body['email'] ?? '')));
        $password = (string) ($body['password'] ?? '');

        if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 8) {
            json_response(['message' => 'اكتب الاسم والبريد وكلمة مرور لا تقل عن 8 أحرف.'], 422);
        }

        $stmt = db()->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
        if ($stmt->fetch()) json_response(['message' => 'هذا البريد مسجل بالفعل.'], 409);

        $stmt = db()->prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)');
        $stmt->execute([$name, $email, password_hash($password, PASSWORD_DEFAULT), 'admin']);
        $_SESSION['user_id'] = (int) db()->lastInsertId();
        json_response(['user' => public_user(current_user())], 201);
    }

    if ($method === 'POST' && $action === 'logout') {
        $_SESSION = [];
        session_destroy();
        json_response(['ok' => true]);
    }

    json_response(['message' => 'Auth endpoint not found.'], 404);
}

function route_categories(string $method, ?string $id): void
{
    if ($method === 'GET' && !$id) {
        $rows = db()->query('SELECT * FROM categories ORDER BY sort_order, id')->fetchAll();
        json_response(['data' => array_map('category_payload', $rows)]);
    }

    require_admin();

    if ($method === 'POST' && !$id) {
        $body = read_json_body();
        $stmt = db()->prepare('INSERT INTO categories (name, slug, description, image, status, featured, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)');
        $stmt->execute([
            trim((string) ($body['name'] ?? '')),
            $body['slug'] ?? slugify((string) ($body['name'] ?? 'category')),
            $body['description'] ?? '',
            $body['image'] ?? '',
            $body['status'] ?? 'active',
            truthy($body['featured'] ?? false),
            (int) ($body['sortOrder'] ?? 0),
        ]);
        json_response(['data' => find_category((int) db()->lastInsertId())], 201);
    }

    if (in_array($method, ['PUT', 'PATCH'], true) && $id) {
        $body = read_json_body();
        $current = find_category_row((int) $id);
        if (!$current) json_response(['message' => 'Category not found.'], 404);
        $stmt = db()->prepare('UPDATE categories SET name=?, slug=?, description=?, image=?, status=?, featured=?, sort_order=? WHERE id=?');
        $stmt->execute([
            $body['name'] ?? $current['name'],
            $body['slug'] ?? $current['slug'],
            $body['description'] ?? $current['description'],
            $body['image'] ?? $current['image'],
            $body['status'] ?? $current['status'],
            array_key_exists('featured', $body) ? truthy($body['featured']) : (int) $current['featured'],
            (int) ($body['sortOrder'] ?? $current['sort_order']),
            (int) $id,
        ]);
        json_response(['data' => find_category((int) $id)]);
    }

    if ($method === 'DELETE' && $id) {
        db()->prepare('DELETE FROM categories WHERE id=?')->execute([(int) $id]);
        json_response(['ok' => true]);
    }

    json_response(['message' => 'Category endpoint not found.'], 404);
}

function route_products(string $method, ?string $id): void
{
    if ($method === 'GET' && !$id) {
        $rows = db()->query('SELECT * FROM products ORDER BY id DESC')->fetchAll();
        json_response(['data' => array_map('product_payload', $rows)]);
    }

    if ($method === 'GET' && $id) {
        $product = find_product((int) $id);
        if (!$product) json_response(['message' => 'Product not found.'], 404);
        json_response(['data' => $product]);
    }

    require_admin();

    if ($method === 'POST' && !$id) {
        $body = read_json_body();
        $stmt = db()->prepare('INSERT INTO products (name, slug, brand, category, price, compare_at_price, cost, rating, stock, threshold_qty, sku, barcode, sales, image, gallery, description, short_description, status, visibility, weight, dimensions, tags, specs) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        $stmt->execute(product_values($body));
        json_response(['data' => find_product((int) db()->lastInsertId())], 201);
    }

    if (in_array($method, ['PUT', 'PATCH'], true) && $id) {
        $current = find_product_row((int) $id);
        if (!$current) json_response(['message' => 'Product not found.'], 404);
        $body = array_replace(product_payload($current), read_json_body());
        $stmt = db()->prepare('UPDATE products SET name=?, slug=?, brand=?, category=?, price=?, compare_at_price=?, cost=?, rating=?, stock=?, threshold_qty=?, sku=?, barcode=?, sales=?, image=?, gallery=?, description=?, short_description=?, status=?, visibility=?, weight=?, dimensions=?, tags=?, specs=? WHERE id=?');
        $stmt->execute([...product_values($body), (int) $id]);
        json_response(['data' => find_product((int) $id)]);
    }

    if ($method === 'DELETE' && $id) {
        db()->prepare('DELETE FROM products WHERE id=?')->execute([(int) $id]);
        json_response(['ok' => true]);
    }

    json_response(['message' => 'Product endpoint not found.'], 404);
}

function route_customers(string $method, ?string $id): void
{
    if ($method === 'GET' && !$id) {
        $rows = db()->query('SELECT * FROM customers ORDER BY id DESC')->fetchAll();
        json_response(['data' => array_map('customer_payload', $rows)]);
    }

    if ($method === 'GET' && $id) {
        $customer = find_customer((int) $id);
        if (!$customer) json_response(['message' => 'Customer not found.'], 404);
        json_response(['data' => $customer]);
    }

    if ($method === 'POST' && !$id) {
        $body = read_json_body();
        $stmt = db()->prepare('INSERT INTO customers (name, email, phone, city, address, tier, segment, favorite_category, total_spent, orders_count, status, tags, marketing_consent, notes, acquisition, last_seen) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        $stmt->execute(customer_values($body));
        json_response(['data' => find_customer((int) db()->lastInsertId())], 201);
    }

    if (in_array($method, ['PUT', 'PATCH'], true) && $id) {
        $current = find_customer_row((int) $id);
        if (!$current) json_response(['message' => 'Customer not found.'], 404);
        $body = array_replace(customer_payload($current), read_json_body());
        $stmt = db()->prepare('UPDATE customers SET name=?, email=?, phone=?, city=?, address=?, tier=?, segment=?, favorite_category=?, total_spent=?, orders_count=?, status=?, tags=?, marketing_consent=?, notes=?, acquisition=?, last_seen=? WHERE id=?');
        $stmt->execute([...customer_values($body), (int) $id]);
        json_response(['data' => find_customer((int) $id)]);
    }

    if ($method === 'DELETE' && $id) {
        db()->prepare('DELETE FROM customers WHERE id=?')->execute([(int) $id]);
        json_response(['ok' => true]);
    }

    json_response(['message' => 'Customer endpoint not found.'], 404);
}

function route_orders(string $method, ?string $id, array $segments): void
{
    if ($method === 'GET' && !$id) {
        $rows = db()->query('SELECT * FROM orders ORDER BY created_at DESC, id DESC')->fetchAll();
        json_response(['data' => array_map('order_payload', $rows)]);
    }

    if ($method === 'GET' && $id) {
        $order = find_order((int) $id);
        if (!$order) json_response(['message' => 'Order not found.'], 404);
        json_response(['data' => $order]);
    }

    if ($method === 'POST' && !$id) {
        json_response(['data' => create_order(read_json_body(), 'admin')], 201);
    }

    if ($method === 'PATCH' && $id && ($segments[2] ?? '') === 'status') {
        $body = read_json_body();
        $status = (string) ($body['status'] ?? 'Processing');
        db()->prepare('UPDATE orders SET status=?, payment_status=IF(? = "Cancelled", "void", payment_status) WHERE id=? OR order_number=?')->execute([$status, $status, (int) $id, $id]);
        json_response(['data' => find_order_by_any($id)]);
    }

    if (in_array($method, ['PUT', 'PATCH'], true) && $id) {
        $body = read_json_body();
        $order = find_order_row_by_any($id);
        if (!$order) json_response(['message' => 'Order not found.'], 404);
        $stmt = db()->prepare('UPDATE orders SET status=?, payment_status=?, payment_method=?, priority=?, shipping_address=?, billing_address=?, shipping=?, fulfillment=?, notes=?, timeline=? WHERE id=?');
        $stmt->execute([
            $body['status'] ?? $order['status'],
            $body['paymentStatus'] ?? $order['payment_status'],
            $body['payment'] ?? $body['paymentMethod'] ?? $order['payment_method'],
            $body['priority'] ?? $order['priority'],
            encode_json($body['shippingAddress'] ?? decode_json($order['shipping_address'])),
            encode_json($body['billingAddress'] ?? decode_json($order['billing_address'])),
            encode_json($body['shipping'] ?? decode_json($order['shipping'])),
            encode_json($body['fulfillment'] ?? decode_json($order['fulfillment'])),
            encode_json($body['notes'] ?? decode_json($order['notes'])),
            encode_json($body['timeline'] ?? decode_json($order['timeline'])),
            (int) $order['id'],
        ]);
        json_response(['data' => find_order((int) $order['id'])]);
    }

    json_response(['message' => 'Order endpoint not found.'], 404);
}

function route_payments(string $method, ?string $id): void
{
    if ($method === 'GET' && !$id) {
        $rows = db()->query('SELECT * FROM payments ORDER BY created_at DESC')->fetchAll();
        json_response(['data' => array_map('payment_payload', $rows)]);
    }

    if ($method === 'POST' && !$id) {
        $body = read_json_body();
        $transactionId = $body['transactionId'] ?? 'TXN-' . time() . random_int(100, 999);
        $stmt = db()->prepare('INSERT INTO payments (transaction_id, order_id, gateway, status, amount, currency, reference, payload) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        $stmt->execute([
            $transactionId,
            $body['orderId'] ?? null,
            $body['gateway'] ?? 'manual',
            $body['status'] ?? 'pending',
            (float) ($body['amount'] ?? 0),
            $body['currency'] ?? 'SAR',
            $body['reference'] ?? $transactionId,
            encode_json($body),
        ]);
        json_response(['data' => payment_payload(find_payment_row((int) db()->lastInsertId()))], 201);
    }

    json_response(['message' => 'Payment endpoint not found.'], 404);
}

function route_settings(string $method, ?string $section): void
{
    if ($method === 'GET' && !$section) {
        $rows = db()->query('SELECT section_key, value_json FROM settings')->fetchAll();
        $settings = [];
        foreach ($rows as $row) {
            $settings[$row['section_key']] = decode_json($row['value_json']);
        }
        json_response(['data' => $settings]);
    }

    if ($method === 'GET' && $section) {
        $stmt = db()->prepare('SELECT value_json FROM settings WHERE section_key=?');
        $stmt->execute([$section]);
        $value = $stmt->fetchColumn();
        json_response(['data' => $value ? decode_json((string) $value) : null]);
    }

    if (in_array($method, ['PUT', 'PATCH'], true) && $section) {
        $body = read_json_body();
        $stmt = db()->prepare('INSERT INTO settings (section_key, value_json) VALUES (?, ?) ON DUPLICATE KEY UPDATE value_json=VALUES(value_json)');
        $stmt->execute([$section, encode_json($body)]);
        json_response(['data' => $body]);
    }

    json_response(['message' => 'Settings endpoint not found.'], 404);
}

function create_order(array $body, string $source): array
{
    $pdo = db();
    $pdo->beginTransaction();
    try {
        $items = $body['lineItems'] ?? $body['items'] ?? [];
        if (!is_array($items) || count($items) === 0) {
            json_response(['message' => 'Order must include at least one item.'], 422);
        }

        $customer = normalize_customer_from_order($body);
        $customerId = upsert_customer_from_order($customer);
        $totals = calculate_totals($items, $body);
        $orderNumber = $body['id'] ?? $body['orderNumber'] ?? ('ORD-SILA-' . date('Ymd') . '-' . random_int(1000, 9999));
        $invoiceNumber = $body['invoiceNumber'] ?? ('INV-' . date('Ym') . '-' . random_int(1000, 9999));
        $shipmentNumber = $body['shipmentNumber'] ?? ('SHP-' . date('Ym') . '-' . random_int(1000, 9999));

        $stmt = $pdo->prepare('INSERT INTO orders (order_number, invoice_number, shipment_number, customer_id, customer_name, customer_email, customer_phone, status, payment_status, payment_method, currency, subtotal, discount_amount, shipping_fee, tax, total, source, priority, shipping_address, billing_address, shipping, fulfillment, notes, timeline) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        $stmt->execute([
            $orderNumber,
            $invoiceNumber,
            $shipmentNumber,
            $customerId,
            $customer['name'],
            $customer['email'],
            $customer['phone'],
            $body['status'] ?? 'Pending',
            $body['paymentStatus'] ?? 'pending',
            $body['payment'] ?? $body['paymentMethod'] ?? null,
            $body['currency'] ?? 'SAR',
            $totals['subtotal'],
            $totals['discount'],
            $totals['shippingFee'],
            $totals['tax'],
            $totals['total'],
            $source,
            $body['priority'] ?? 'normal',
            encode_json($body['shippingAddress'] ?? $customer['address']),
            encode_json($body['billingAddress'] ?? ['sameAsShipping' => true]),
            encode_json($body['shipping'] ?? default_shipping_payload($shipmentNumber)),
            encode_json($body['fulfillment'] ?? default_fulfillment_payload()),
            encode_json($body['notes'] ?? ['customer' => $body['note'] ?? '', 'internal' => '']),
            encode_json($body['timeline'] ?? default_timeline()),
        ]);
        $orderId = (int) $pdo->lastInsertId();

        $itemStmt = $pdo->prepare('INSERT INTO order_items (order_id, product_id, sku, name, category, image, unit_price, quantity, discount, tax_rate, weight) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        $stockStmt = $pdo->prepare('UPDATE products SET stock = GREATEST(0, stock - ?), sales = sales + ? WHERE id = ?');
        foreach ($items as $item) {
            $productId = $item['productId'] ?? $item['id'] ?? null;
            $quantity = max(1, (int) ($item['quantity'] ?? 1));
            $unitPrice = (float) ($item['unitPrice'] ?? $item['price'] ?? 0);
            $itemStmt->execute([
                $orderId,
                $productId,
                $item['sku'] ?? null,
                $item['name'] ?? 'Product',
                $item['category'] ?? null,
                $item['image'] ?? null,
                $unitPrice,
                $quantity,
                (float) ($item['discount'] ?? 0),
                (float) ($item['taxRate'] ?? 0),
                isset($item['weight']) ? (float) $item['weight'] : null,
            ]);
            if ($productId) {
                $stockStmt->execute([$quantity, $quantity, (int) $productId]);
            }
        }

        $pdo->commit();
        return find_order($orderId);
    } catch (Throwable $exception) {
        $pdo->rollBack();
        throw $exception;
    }
}

function require_admin(): void
{
    if (!current_user()) {
        json_response(['message' => 'Authentication required.'], 401);
    }
}

function product_values(array $body): array
{
    $name = trim((string) ($body['name'] ?? ''));
    return [
        $name,
        $body['slug'] ?? slugify($name),
        $body['brand'] ?? ($name ? explode(' ', $name)[0] : ''),
        $body['category'] ?? 'Accessories',
        (float) ($body['price'] ?? 0),
        (float) ($body['compareAtPrice'] ?? $body['compare_at_price'] ?? 0),
        (float) ($body['cost'] ?? 0),
        (float) ($body['rating'] ?? 0),
        (int) ($body['stock'] ?? 0),
        (int) ($body['threshold'] ?? $body['threshold_qty'] ?? 0),
        $body['sku'] ?? ('SKU-' . random_int(10000, 99999)),
        $body['barcode'] ?? null,
        (int) ($body['sales'] ?? 0),
        $body['image'] ?? '',
        encode_json($body['gallery'] ?? []),
        $body['description'] ?? '',
        $body['shortDescription'] ?? $body['short_description'] ?? '',
        $body['status'] ?? 'published',
        $body['visibility'] ?? 'public',
        $body['weight'] ?? null,
        $body['dimensions'] ?? null,
        encode_json($body['tags'] ?? []),
        encode_json($body['specs'] ?? []),
    ];
}

function customer_values(array $body): array
{
    return [
        trim((string) ($body['name'] ?? '')),
        strtolower(trim((string) ($body['email'] ?? ''))),
        $body['phone'] ?? '',
        $body['city'] ?? '',
        $body['address'] ?? '',
        $body['tier'] ?? 'Bronze',
        $body['segment'] ?? 'جدد',
        $body['favoriteCategory'] ?? $body['favorite_category'] ?? '',
        (float) ($body['totalSpent'] ?? $body['total_spent'] ?? 0),
        (int) ($body['orders'] ?? $body['orders_count'] ?? 0),
        $body['status'] ?? 'active',
        encode_json($body['tags'] ?? []),
        truthy($body['marketingConsent'] ?? $body['marketing_consent'] ?? true),
        $body['notes'] ?? '',
        $body['acquisition'] ?? '',
        $body['lastSeen'] ?? $body['last_seen'] ?? date('Y-m-d'),
    ];
}

function product_payload(array $row): array
{
    return [
        'id' => (int) $row['id'],
        'name' => $row['name'],
        'slug' => $row['slug'],
        'brand' => $row['brand'],
        'category' => $row['category'],
        'price' => (float) $row['price'],
        'compareAtPrice' => (float) $row['compare_at_price'],
        'cost' => (float) $row['cost'],
        'rating' => (float) $row['rating'],
        'stock' => (int) $row['stock'],
        'threshold' => (int) $row['threshold_qty'],
        'sku' => $row['sku'],
        'barcode' => $row['barcode'],
        'sales' => (int) $row['sales'],
        'image' => $row['image'],
        'gallery' => decode_json($row['gallery']),
        'description' => $row['description'],
        'shortDescription' => $row['short_description'],
        'status' => $row['status'],
        'visibility' => $row['visibility'],
        'weight' => $row['weight'],
        'dimensions' => $row['dimensions'],
        'tags' => decode_json($row['tags']),
        'specs' => decode_json($row['specs']),
    ];
}

function category_payload(array $row): array
{
    return [
        'id' => (int) $row['id'],
        'name' => $row['name'],
        'slug' => $row['slug'],
        'description' => $row['description'],
        'image' => $row['image'],
        'status' => $row['status'],
        'featured' => (bool) $row['featured'],
        'sortOrder' => (int) $row['sort_order'],
    ];
}

function customer_payload(array $row): array
{
    return [
        'id' => (int) $row['id'],
        'name' => $row['name'],
        'email' => $row['email'],
        'phone' => $row['phone'],
        'city' => $row['city'],
        'address' => $row['address'],
        'tier' => $row['tier'],
        'segment' => $row['segment'],
        'favoriteCategory' => $row['favorite_category'],
        'totalSpent' => (float) $row['total_spent'],
        'orders' => (int) $row['orders_count'],
        'status' => $row['status'],
        'tags' => decode_json($row['tags']),
        'marketingConsent' => (bool) $row['marketing_consent'],
        'notes' => $row['notes'],
        'acquisition' => $row['acquisition'],
        'lastSeen' => $row['last_seen'],
    ];
}

function order_payload(array $row): array
{
    $items = order_items((int) $row['id']);
    $shipping = decode_json($row['shipping']) ?: [];
    return [
        'id' => $row['order_number'],
        'numericId' => (int) $row['id'],
        'invoiceNumber' => $row['invoice_number'],
        'shipmentNumber' => $row['shipment_number'],
        'customer' => $row['customer_name'],
        'customerId' => $row['customer_id'],
        'date' => substr((string) $row['created_at'], 0, 10),
        'createdAt' => $row['created_at'],
        'items' => array_sum(array_column($items, 'quantity')),
        'total' => (float) $row['total'],
        'subtotal' => (float) $row['subtotal'],
        'itemDiscount' => 0,
        'couponDiscount' => (float) $row['discount_amount'],
        'shippingFee' => (float) $row['shipping_fee'],
        'tax' => (float) $row['tax'],
        'currency' => $row['currency'],
        'payment' => $row['payment_method'],
        'paymentStatus' => $row['payment_status'],
        'status' => $row['status'],
        'priority' => $row['priority'],
        'source' => $row['source'],
        'products' => array_column($items, 'name'),
        'lineItems' => $items,
        'customerInfo' => ['name' => $row['customer_name'], 'email' => $row['customer_email'], 'phone' => $row['customer_phone'], 'tier' => 'Bronze'],
        'shippingAddress' => decode_json($row['shipping_address']) ?: [],
        'billingAddress' => decode_json($row['billing_address']) ?: [],
        'shipping' => $shipping,
        'fulfillment' => decode_json($row['fulfillment']) ?: default_fulfillment_payload(),
        'notes' => decode_json($row['notes']) ?: ['customer' => '', 'internal' => ''],
        'timeline' => decode_json($row['timeline']) ?: default_timeline(),
    ];
}

function order_items(int $orderId): array
{
    $stmt = db()->prepare('SELECT * FROM order_items WHERE order_id=? ORDER BY id');
    $stmt->execute([$orderId]);
    return array_map(fn ($row) => [
        'id' => (string) $row['id'],
        'productId' => $row['product_id'] ? (int) $row['product_id'] : null,
        'sku' => $row['sku'],
        'name' => $row['name'],
        'category' => $row['category'],
        'image' => $row['image'],
        'unitPrice' => (float) $row['unit_price'],
        'price' => (float) $row['unit_price'],
        'quantity' => (int) $row['quantity'],
        'discount' => (float) $row['discount'],
        'taxRate' => (float) $row['tax_rate'],
        'weight' => $row['weight'] ? (float) $row['weight'] : null,
    ], $stmt->fetchAll());
}

function payment_payload(array $row): array
{
    return [
        'id' => $row['transaction_id'],
        'transactionId' => $row['transaction_id'],
        'orderId' => $row['order_id'],
        'gateway' => $row['gateway'],
        'status' => $row['status'],
        'amount' => (float) $row['amount'],
        'currency' => $row['currency'],
        'reference' => $row['reference'],
        'payload' => decode_json($row['payload']),
        'createdAt' => $row['created_at'],
    ];
}

function find_product(int $id): ?array { $row = find_product_row($id); return $row ? product_payload($row) : null; }
function find_product_row(int $id): ?array { $stmt = db()->prepare('SELECT * FROM products WHERE id=?'); $stmt->execute([$id]); return $stmt->fetch() ?: null; }
function find_category(int $id): ?array { $row = find_category_row($id); return $row ? category_payload($row) : null; }
function find_category_row(int $id): ?array { $stmt = db()->prepare('SELECT * FROM categories WHERE id=?'); $stmt->execute([$id]); return $stmt->fetch() ?: null; }
function find_customer(int $id): ?array { $row = find_customer_row($id); return $row ? customer_payload($row) : null; }
function find_customer_row(int $id): ?array { $stmt = db()->prepare('SELECT * FROM customers WHERE id=?'); $stmt->execute([$id]); return $stmt->fetch() ?: null; }
function find_order(int $id): ?array { $row = find_order_row_by_any((string) $id); return $row ? order_payload($row) : null; }
function find_order_by_any(string $id): ?array { $row = find_order_row_by_any($id); return $row ? order_payload($row) : null; }
function find_order_row_by_any(string $id): ?array { $stmt = db()->prepare('SELECT * FROM orders WHERE id=? OR order_number=? LIMIT 1'); $stmt->execute([(int) $id, $id]); return $stmt->fetch() ?: null; }
function find_payment_row(int $id): ?array { $stmt = db()->prepare('SELECT * FROM payments WHERE id=?'); $stmt->execute([$id]); return $stmt->fetch() ?: null; }

function normalize_customer_from_order(array $body): array
{
    $customer = $body['customer'] ?? $body['customerInfo'] ?? [];
    $first = trim((string) ($customer['firstName'] ?? $body['firstName'] ?? ''));
    $last = trim((string) ($customer['lastName'] ?? $body['lastName'] ?? ''));
    $name = trim((string) ($customer['name'] ?? ($first . ' ' . $last) ?: $body['customerName'] ?? 'Guest Customer'));
    $address = $body['shippingAddress'] ?? $customer;
    return [
        'name' => $name,
        'email' => strtolower(trim((string) ($customer['email'] ?? $body['email'] ?? 'guest-' . time() . '@sila.local'))),
        'phone' => (string) ($customer['phone'] ?? $body['phone'] ?? ''),
        'address' => $address,
        'city' => $address['city'] ?? $customer['city'] ?? '',
    ];
}

function upsert_customer_from_order(array $customer): int
{
    $stmt = db()->prepare('SELECT id FROM customers WHERE email=? LIMIT 1');
    $stmt->execute([$customer['email']]);
    $id = $stmt->fetchColumn();
    if ($id) {
        db()->prepare('UPDATE customers SET name=?, phone=?, city=?, address=?, orders_count=orders_count+1 WHERE id=?')->execute([
            $customer['name'], $customer['phone'], $customer['city'], encode_json($customer['address']), (int) $id,
        ]);
        return (int) $id;
    }
    $stmt = db()->prepare('INSERT INTO customers (name, email, phone, city, address, orders_count, status, segment, last_seen) VALUES (?, ?, ?, ?, ?, 1, "active", "جدد", ?)');
    $stmt->execute([$customer['name'], $customer['email'], $customer['phone'], $customer['city'], encode_json($customer['address']), date('Y-m-d')]);
    return (int) db()->lastInsertId();
}

function calculate_totals(array $items, array $body): array
{
    $subtotal = 0.0;
    foreach ($items as $item) {
        $subtotal += (float) ($item['unitPrice'] ?? $item['price'] ?? 0) * max(1, (int) ($item['quantity'] ?? 1));
    }
    $discount = (float) ($body['discountAmount'] ?? $body['couponDiscount'] ?? 0);
    $shipping = (float) ($body['shippingCost'] ?? $body['shippingFee'] ?? 0);
    $tax = (float) ($body['taxAmount'] ?? $body['tax'] ?? 0);
    $total = (float) ($body['total'] ?? max(0, $subtotal - $discount + $shipping + $tax));
    return ['subtotal' => $subtotal, 'discount' => $discount, 'shippingFee' => $shipping, 'tax' => $tax, 'total' => $total];
}

function default_shipping_payload(string $shipmentNumber): array
{
    return ['provider' => 'SILA Express', 'service' => 'Standard', 'trackingNumber' => $shipmentNumber, 'trackingUrl' => '', 'warehouse' => 'Main'];
}

function default_fulfillment_payload(): array
{
    return ['picker' => '', 'packer' => '', 'packingStatus' => 'Pending', 'qualityCheck' => false, 'giftWrap' => false, 'fragile' => false];
}

function default_timeline(): array
{
    return [['key' => 'created', 'label' => 'تم إنشاء الطلب', 'at' => date('c'), 'done' => true]];
}

function encode_json($value): string
{
    return json_encode($value ?? [], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
}

function decode_json($value)
{
    if (!$value) return [];
    $decoded = json_decode((string) $value, true);
    return is_array($decoded) ? $decoded : [];
}

function truthy($value): int
{
    return filter_var($value, FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
}

function slugify(string $value): string
{
    $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9]+/', '-', $value), '-'));
    return $slug ?: 'item-' . random_int(1000, 9999);
}
