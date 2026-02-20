export const PACKAGES = [
    {
        id: 'wedding-anthurium',
        name: 'Wedding & Debut Anthurium',
        type: 'wedding',
        basePrice: 850, // Per head
        minPax: 100,
        description: 'premium wedding package including elegant styling and comprehensive amenities.',
        inclusions: [
            'Elegant Backdrop & Floral Arrangement',
            'Presidential Table Set-Up',
            'Tiffany Chairs with Motif Ribbon',
            '3-Layer Fondant Cake',
            'Professional Emcee & Bridal Car',
            'Bottle of Wine for Toasting'
        ],
        menuStructure: {
            starters: 2, // Soup + Appetizer
            mains: 4,    // Beef/Pork, Chicken, Fish, Pasta/Veg (flexible interpretation of the set)
            sides: 1,    // Rice/Salad
            desserts: 1,
            drinks: 1
        }
    },
    {
        id: 'corporate-standard',
        name: 'Corporate Standard',
        type: 'corporate',
        basePrice: 650,
        minPax: 30,
        description: 'Professional catering for seminars, conferences, and corporate events.',
        inclusions: [
            'Buffet Service Setup',
            'Uniformed Waiters',
            'Round Tables with Linens',
            'Purified Drinking Water',
            'Ice for Drinks'
        ],
        menuStructure: {
            starters: 1,
            mains: 3,
            sides: 1,
            desserts: 1,
            drinks: 1
        }
    },
    {
        id: 'social-party',
        name: 'Social Celebration',
        type: 'social',
        basePrice: 550,
        minPax: 50,
        description: 'Perfect for birthdays, reunions, and casual gatherings.',
        inclusions: [
            'Basic Balloon Decor',
            'Buffet Setup',
            'Cake Table',
            'Sound System Basic'
        ],
        menuStructure: {
            starters: 1,
            mains: 2,
            sides: 1,
            desserts: 1,
            drinks: 1
        }
    }
];

export const DISHES = {
    starters: [
        { id: 'sup1', name: 'Bacon and Mushroom Soup', priceAdj: 0, image: 'https://images.unsplash.com/photo-1629853346988-cb949bc5392d?auto=format&fit=crop&q=80&w=400', isBestSeller: true, description: 'Creamy mushroom soup topped with crispy bacon bits.' },
        { id: 'sup2', name: 'Corn Chowder Soup', priceAdj: 0, image: 'https://images.unsplash.com/photo-1629853346988-cb949bc5392d?auto=format&fit=crop&q=80&w=400', isBestSeller: false, description: 'Hearty corn soup with vegetables.' },
        { id: 'app1', name: 'Assorted Canapés', priceAdj: 0, image: 'https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&q=80&w=400', isBestSeller: true, description: 'French bread with Crab Sticks, Tuna, and Egg spread.' },
        { id: 'app2', name: 'Honey Beef Pita', priceAdj: 20, image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&q=80&w=400', isBestSeller: false, description: 'Savory sweet beef served on mini pita bread.' },
        { id: 'sal1', name: 'Garden Fresh Salad', priceAdj: 0, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400', isBestSeller: false, description: 'Fresh lettuce, tomato, carrots, cucumber, pineapple with Thousand Island dressing.' }
    ],
    mains: [
        // Beef
        { id: 'main1', name: 'Beef Sirloin w/ Thick Mushroom Sauce', priceAdj: 50, image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&q=80&w=400', isBestSeller: true, description: 'Tender sirloin slices in rich mushroom gravy.' },
        { id: 'main2', name: 'Braised Beef with Red Wine', priceAdj: 60, image: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?auto=format&fit=crop&q=80&w=400', isBestSeller: false, description: 'Slow-cooked beef infused with red wine sauce.' },
        { id: 'main3', name: 'Roast Beef', priceAdj: 100, image: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&q=80&w=400', isBestSeller: true, description: 'Premium roast beef with gravy (Carving Station).' },
        { id: 'main15', name: 'Beef Garlic Salpicao', priceAdj: 60, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=400', isBestSeller: false, description: 'Garlicky beef cubes sautéed in olive oil.' },
        { id: 'main16', name: 'Beef Tenderloin with Olives', priceAdj: 80, image: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&q=80&w=400', isBestSeller: false, description: 'Succulent tenderloin steak tailored with olives.' },

        // Pork
        { id: 'main4', name: 'Honey Cured Pork Belly', priceAdj: 0, image: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&q=80&w=400', isBestSeller: true, description: 'Sweet and savory cured pork belly slices.' },
        { id: 'main5', name: 'Mild Spicy Pork Belly', priceAdj: 0, image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80&w=400', isBestSeller: false, description: 'Pork belly with a kick of spice.' },
        { id: 'main17', name: 'Pork Tonkatsu', priceAdj: 0, image: 'https://images.unsplash.com/photo-1604259597308-4e9941e9fc13?auto=format&fit=crop&q=80&w=400', isBestSeller: false, description: 'Breaded deep-fried pork cutlet.' },
        { id: 'main18', name: 'Pork Belly with Hickory Sauce', priceAdj: 0, image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=400', isBestSeller: false, description: 'Smoky hickory BBQ flavored pork belly.' },

        // Chicken
        { id: 'main6', name: 'Grilled Chicken w/ Mango Chutney', priceAdj: 0, image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&q=80&w=400', isBestSeller: true, description: 'Grilled chicken topped with sweet mango chutney.' },
        { id: 'main7', name: 'Chicken Teriyaki', priceAdj: 0, image: 'https://images.unsplash.com/photo-1552590635-27c2c2128abf?auto=format&fit=crop&q=80&w=400', isBestSeller: true, description: 'Grilled chicken glaze with sesame seeds.' },
        { id: 'main8', name: 'Garlic Parmesan Chicken', priceAdj: 0, image: 'https://images.unsplash.com/photo-1604908555234-2c49cbf2c8ce?auto=format&fit=crop&q=80&w=400', isBestSeller: false, description: 'Chicken fillets with rich cheese sauce.' },
        { id: 'main9', name: 'Classic Fried Chicken', priceAdj: 0, image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=400', isBestSeller: true, description: 'Golden crispy fried chicken.' },
        { id: 'main19', name: 'Grilled Chicken w/ Pesto Sauce', priceAdj: 0, image: 'https://images.unsplash.com/photo-1600850056064-a8b380df8395?auto=format&fit=crop&q=80&w=400', isBestSeller: false, description: 'Grilled chicken covered in herbaceous pesto.' },
        { id: 'main20', name: 'Roasted Chicken Fillet w/ Italian Herbs', priceAdj: 0, image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&q=80&w=400', isBestSeller: false, description: 'Oven-roasted chicken with aromatic italian seasoning.' },

        // Seafood
        { id: 'main10', name: 'Grilled Fish with Lemon Butter', priceAdj: 0, image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a3a2720?auto=format&fit=crop&q=80&w=400', isBestSeller: false, description: 'Lightly grilled fish with zesty lemon butter sauce.' },
        { id: 'main11', name: 'Pan Fried Fish w/ Baked Tomato', priceAdj: 0, image: 'https://images.unsplash.com/photo-1467003909585-2f8a7270028d?auto=format&fit=crop&q=80&w=400', isBestSeller: false, description: 'Fish fillet topped with baked tomato and onions.' },
        { id: 'main12', name: 'Sweet & Sour Fish w/ Tofu', priceAdj: 0, image: 'https://images.unsplash.com/photo-1551608771-8889a764720e?auto=format&fit=crop&q=80&w=400', isBestSeller: false, description: 'Fish fillet with tofu in sweet and sour sauce.' },
        { id: 'main21', name: 'Fish Tempura w/ Sweet Corn Salsa', priceAdj: 0, image: 'https://images.unsplash.com/photo-1615141982880-19ed7e6656fa?auto=format&fit=crop&q=80&w=400', isBestSeller: false, description: 'Crispy battered fish served with refreshing corn salsa.' },

        // Pasta
        { id: 'main13', name: 'Baked Beef Pasta Pomodoro', priceAdj: 0, image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&q=80&w=400', isBestSeller: true, description: 'Baked pasta with rich tomato beef sauce.' },
        { id: 'main14', name: 'Shrimp Aglio Olio', priceAdj: 20, image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=400', isBestSeller: true, description: 'Oil-based pasta with shrimp and garlic.' }
    ],
    sides: [
        { id: 'side1', name: 'Steamed Rice', priceAdj: 0, image: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&q=80&w=400', isBestSeller: false, description: 'Plain steamed white rice.' },
        { id: 'side2', name: 'Buttered Marble Potato & Beans', priceAdj: 0, image: 'https://images.unsplash.com/photo-1628046830588-f54261899175?auto=format&fit=crop&q=80&w=400', isBestSeller: false, description: 'Sautéed marble potatoes and french beans.' },
        { id: 'side3', name: 'Broccoli & Mushroom Casserole', priceAdj: 20, image: 'https://images.unsplash.com/photo-1627915934522-83c9b7e7135e?auto=format&fit=crop&q=80&w=400', isBestSeller: true, description: 'Baked broccoli and mushrooms in cream sauce.' },
        { id: 'side4', name: 'Four Seasons Vegetables', priceAdj: 0, image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&q=80&w=400', isBestSeller: false, description: 'Mixed vegetables stir-fry.' },
        { id: 'side5', name: 'Mandarin Vegetables w/ Shitake', priceAdj: 0, image: 'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?auto=format&fit=crop&q=80&w=400', isBestSeller: false, description: 'Vegetable stir-fry with shitake mushrooms.' },
        { id: 'side6', name: 'Corn & Carrots in Pepper Sauce', priceAdj: 0, image: 'https://images.unsplash.com/photo-1551529563-9dd60914f3ff?auto=format&fit=crop&q=80&w=400', isBestSeller: false, description: 'Sweet corn and carrots in pepper oyster sauce.' },
        { id: 'side7', name: 'Cheesy Buttered Potato Marble', priceAdj: 0, image: 'https://images.unsplash.com/photo-1600551711229-2e70e309540b?auto=format&fit=crop&q=80&w=400', isBestSeller: false, description: 'Potatoes coated in cheese and butter.' },
        { id: 'side8', name: 'Cheesy Buttered Corn & Potato', priceAdj: 0, image: 'https://images.unsplash.com/photo-1600551711229-2e70e309540b?auto=format&fit=crop&q=80&w=400', isBestSeller: false, description: 'Corn and marble potatoes in cheese butter.' }
    ],
    desserts: [
        { id: 'des1', name: 'Coffee Jello', priceAdj: 0, image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=400', isBestSeller: true, description: 'Coffee flavored jelly dessert.' },
        { id: 'des2', name: 'Creamy Buko Lychee', priceAdj: 20, image: 'https://images.unsplash.com/photo-1624362772714-93dc44fd3c2c?auto=format&fit=crop&q=80&w=400', isBestSeller: true, description: 'Young coconut and lychee in cream.' },
        { id: 'des3', name: 'Mango Tapioca', priceAdj: 0, image: 'https://images.unsplash.com/photo-1506822904562-bb443d3a049d?auto=format&fit=crop&q=80&w=400', isBestSeller: true, description: 'Sweet mango cubes with tapioca pearls.' },
        { id: 'des4', name: 'Brownies / Butterscotch', priceAdj: 0, image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476d?auto=format&fit=crop&q=80&w=400', isBestSeller: false, description: 'Chewy chocolate brownies or butterscotch bars.' }
    ],
    drinks: [
        { id: 'dr1', name: 'Bottomless Iced Tea', priceAdj: 0, image: 'https://images.unsplash.com/photo-1499638673689-79a0b5115d87?auto=format&fit=crop&q=80&w=400', isBestSeller: true, description: 'House blend iced tea.' },
        { id: 'dr2', name: 'Red Tea / Pineapple Orange', priceAdj: 0, image: 'https://images.unsplash.com/photo-1546171753-97d7676e4602?auto=format&fit=crop&q=80&w=400', isBestSeller: false, description: 'Selection of refreshing fruit drinks.' },
        { id: 'dr3', name: 'Brewed Coffee', priceAdj: 0, image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=400', isBestSeller: false, description: 'Hot brewed coffee station.' }
    ]
};

export const HERO_SLIDES = [
    {
        image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=1920',
        title: 'Elegant Weddings',
        subtitle: 'Creating unforgettable moments for your special day.'
    },
    {
        image: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=1920',
        title: 'Corporate Events',
        subtitle: 'Professional catering for your business success.'
    },
    {
        image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=1920',
        title: 'Exquisite Cuisine',
        subtitle: 'A culinary journey tailored to your taste.'
    }
];

export const GALLERY_IMAGES = [
    'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800', // Wedding
    'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=800', // Catering Setup
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=800'  // Food
];
