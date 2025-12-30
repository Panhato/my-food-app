chefchef_sectionbannersCREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(50),
    image LONGTEXT, 
    description TEXT
);

-- បញ្ចូលទិន្នន័យសាកល្បង ២-៣ មុខ
INSERT INTO products (title, price, category, image, description) VALUES 
('បាយឆា', 2.5, 'ឆា', 'https://via.placeholder.com/150', 'បាយឆាពិសេស'),
('សម្លកកូរ', 3.0, 'សម្ល', 'https://via.placeholder.com/150', 'រសជាតិដើម');