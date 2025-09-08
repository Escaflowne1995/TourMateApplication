-- Sample Data for Cebu Tourist App Admin Panel
-- This file contains test data for development and demonstration

-- ========================================
-- ADMIN USERS
-- ========================================

-- Insert default admin users (passwords are hashed in production)
INSERT INTO admin_users (id, email, password_hash, name, role, is_active) VALUES 
(
    uuid_generate_v4(),
    'admin@cebutourist.com',
    crypt('admin123', gen_salt('bf')), -- In production, use proper password hashing
    'Super Administrator',
    'super_admin',
    true
),
(
    uuid_generate_v4(),
    'manager@cebutourist.com',
    crypt('manager123', gen_salt('bf')),
    'Content Manager',
    'admin',
    true
)
ON CONFLICT (email) DO NOTHING;

-- ========================================
-- SAMPLE USER PROFILES
-- ========================================

INSERT INTO profiles (id, email, name, full_name, phone, address, gender, location, country, registration_date, is_active) VALUES 
(
    uuid_generate_v4(),
    'john.doe@email.com',
    'John Doe',
    'John Patrick Doe',
    '+63 912 345 6789',
    'Lahug, Cebu City',
    'male',
    'Cebu City',
    'Philippines',
    NOW() - INTERVAL '30 days',
    true
),
(
    uuid_generate_v4(),
    'maria.santos@email.com',
    'Maria Santos',
    'Maria Isabella Santos',
    '+63 917 123 4567',
    'Banilad, Cebu City',
    'female',
    'Cebu City',
    'Philippines',
    NOW() - INTERVAL '20 days',
    true
),
(
    uuid_generate_v4(),
    'carlos.reyes@email.com',
    'Carlos Reyes',
    'Carlos Miguel Reyes',
    '+63 905 987 6543',
    'Talamban, Cebu City',
    'male',
    'Cebu City',
    'Philippines',
    NOW() - INTERVAL '45 days',
    false
)
ON CONFLICT (email) DO NOTHING;

-- ========================================
-- SAMPLE DESTINATIONS
-- ========================================

INSERT INTO destinations (
    id, name, description, location, category, coordinates, entrance_fee, 
    opening_hours, amenities, accessibility_features, best_time_to_visit, 
    estimated_duration, difficulty_level, is_active, featured
) VALUES 
(
    uuid_generate_v4(),
    'Temple of Leah',
    'A beautiful Roman-inspired temple built as a symbol of undying love. The temple offers stunning views of Cebu City and houses a collection of art and antiques.',
    'Busay, Cebu City',
    'Cultural Sites',
    '{"latitude": 10.3677, "longitude": 123.9345}'::jsonb,
    'PHP 100',
    '6:00 AM - 11:00 PM',
    ARRAY['Parking', 'Restrooms', 'Gift Shop', 'Restaurant'],
    ARRAY['Wheelchair Accessible', 'Elevator'],
    'Early morning or late afternoon',
    '2-3 hours',
    'Easy',
    true,
    true
),
(
    uuid_generate_v4(),
    'Kawasan Falls',
    'A stunning multi-tiered waterfall perfect for swimming and canyoneering adventures. The turquoise blue waters and lush surroundings make it a must-visit destination.',
    'Badian, Cebu',
    'Natural Attractions',
    '{"latitude": 9.8139, "longitude": 123.3745}'::jsonb,
    'PHP 30',
    '6:00 AM - 5:00 PM',
    ARRAY['Parking', 'Restrooms', 'Food Stalls', 'Changing Rooms'],
    ARRAY['Stairs Required'],
    'Dry season (December to May)',
    '4-6 hours',
    'Moderate',
    true,
    true
),
(
    uuid_generate_v4(),
    'Magellan''s Cross',
    'Historical landmark marking the spot where Ferdinand Magellan planted the cross that introduced Christianity to the Philippines in 1521.',
    'Cebu City',
    'Historical Sites',
    '{"latitude": 10.2936, "longitude": 123.9015}'::jsonb,
    'Free',
    '8:00 AM - 7:00 PM',
    ARRAY['Nearby Parking', 'Souvenir Shops'],
    ARRAY['Ground Level Access'],
    'Any time',
    '30 minutes',
    'Easy',
    true,
    false
),
(
    uuid_generate_v4(),
    'Sirao Flower Garden',
    'A colorful flower garden featuring various species of flowers in a cool mountain setting. Known as the "Little Amsterdam" of Cebu.',
    'Sirao, Cebu City',
    'Gardens',
    '{"latitude": 10.3456, "longitude": 123.9234}'::jsonb,
    'PHP 60',
    '6:00 AM - 6:00 PM',
    ARRAY['Parking', 'Restrooms', 'Flower Shop', 'Viewing Deck'],
    ARRAY['Paved Pathways'],
    'Early morning for best lighting',
    '1-2 hours',
    'Easy',
    true,
    true
);

-- ========================================
-- SAMPLE DELICACIES
-- ========================================

INSERT INTO delicacies (
    id, name, description, category, restaurant, restaurant_location, price, 
    price_range, ingredients, allergens, spice_level, cooking_method, 
    is_vegetarian, is_vegan, is_gluten_free, is_halal, availability, 
    best_time_to_eat, cultural_significance, is_active, featured
) VALUES 
(
    uuid_generate_v4(),
    'Lechon',
    'The most famous Cebu delicacy - roasted whole pig with crispy skin and tender meat, seasoned with local herbs and spices.',
    'Main Dishes',
    'Zubuchon',
    'IT Park, Cebu City',
    'PHP 150-300 per serving',
    '{"min": 150, "max": 300, "currency": "PHP"}'::jsonb,
    ARRAY['Whole pig', 'Lemongrass', 'Salt', 'Garlic', 'Bay leaves'],
    ARRAY['None commonly reported'],
    'Mild',
    'Roasted',
    false,
    false,
    true,
    false,
    'Year-round',
    'Lunch, Dinner',
    'Traditional centerpiece for celebrations and festivals',
    true,
    true
),
(
    uuid_generate_v4(),
    'Siomai sa Tisa',
    'Cebu-style steamed dumplings filled with ground pork and shrimp, served with special sauce and chili oil.',
    'Appetizers',
    'Tisa Siomai House',
    'Tisa, Cebu City',
    'PHP 5-8 per piece',
    '{"min": 5, "max": 8, "currency": "PHP"}'::jsonb,
    ARRAY['Ground pork', 'Shrimp', 'Wonton wrapper', 'Green onions', 'Sesame oil'],
    ARRAY['Shellfish', 'Gluten'],
    'Mild to Medium',
    'Steamed',
    false,
    false,
    false,
    false,
    'Year-round',
    'Afternoon snack, Dinner',
    'Popular street food and affordable meal option',
    true,
    false
),
(
    uuid_generate_v4(),
    'Puso (Hanging Rice)',
    'Traditional rice wrapped and cooked in coconut leaves, creating a diamond-shaped portable rice serving.',
    'Main Dishes',
    'Various local vendors',
    'Throughout Cebu',
    'PHP 10-15 per piece',
    '{"min": 10, "max": 15, "currency": "PHP"}'::jsonb,
    ARRAY['Jasmine rice', 'Coconut leaves', 'Water', 'Salt'],
    ARRAY['None'],
    'None',
    'Boiled',
    true,
    true,
    true,
    true,
    'Year-round',
    'Lunch, Dinner',
    'Traditional way to serve rice, symbol of Cebuano culture',
    true,
    true
),
(
    uuid_generate_v4(),
    'Ngohiong',
    'Cebuano version of spring rolls filled with ground pork, shrimp, and vegetables, served with sweet and sour sauce.',
    'Appetizers',
    'Larsian BBQ',
    'Fuente Circle, Cebu City',
    'PHP 20-35 per piece',
    '{"min": 20, "max": 35, "currency": "PHP"}'::jsonb,
    ARRAY['Ground pork', 'Shrimp', 'Carrots', 'Bean sprouts', 'Spring roll wrapper'],
    ARRAY['Shellfish', 'Gluten'],
    'Mild',
    'Deep fried',
    false,
    false,
    false,
    false,
    'Year-round',
    'Lunch, Dinner, Late night snack',
    'Popular street food, especially at night markets',
    true,
    false
);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Sample data inserted successfully!';
    RAISE NOTICE '';
    RAISE NOTICE 'Admin users created:';
    RAISE NOTICE '- admin@cebutourist.com (Super Admin)';
    RAISE NOTICE '- manager@cebutourist.com (Manager)';
    RAISE NOTICE '';
    RAISE NOTICE 'Sample data includes:';
    RAISE NOTICE '- 3 user profiles';
    RAISE NOTICE '- 4 tourist destinations';
    RAISE NOTICE '- 4 local delicacies';
    RAISE NOTICE '========================================';
END $$;
