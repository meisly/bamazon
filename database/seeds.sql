USE bamazonDB;

TRUNCATE products;

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES 
('fuzzy cat suit', 'costumes', 29.99, 100),
('three tier cat tree', 'pet supplies', 199.24, 15),
('feathered cat fishing pole', 'pet supplies', 2.99, 20),
('cat-ear headband', 'fashion', 4.76, 13),
('Supercat poster', 'art/decor', 18.00, 9),
('cat-eye sunglasses', 'fashion', 39.90, 12),
('tiger-striped onsie', 'fashion', 12.99, 5),
('cat butt magnets', 'art/decor', 2.99, 2),
('cat-shaped bottle opener', 'kitchen', 5.99, 500),
('cat urine', 'outdoors', 12.99, 5),
('litter box', 'pet supplies', 12.99, 50),
('cat sweater', 'fashion', 19.00, 5),
('cat', 'animal', 1234.99, 5)

