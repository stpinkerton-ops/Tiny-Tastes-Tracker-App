
import { FoodCategory } from './types.ts';

export const allFoods: FoodCategory[] = [
    {
        category: "Vegetables",
        color: "bg-green-100", textColor: "text-green-800", borderColor: "border-green-300",
        items: [
            { name: "ASPARAGUS", emoji: " asparagus " }, { name: "BUTTERNUT SQUASH", emoji: "🎃" }, { name: "CAULIFLOWER", emoji: "🥦" },
            { name: "SWEET POTATO", emoji: "🍠" }, { name: "POTATOES", emoji: "🥔" }, { name: "PARSNIPS", emoji: "🥕" },
            { name: "BELL PEPPERS", emoji: "🫑" }, { name: "BEETS", emoji: " beetroot " }, { name: "CHAYOTE SQUASH", emoji: "🍐" },
            { name: "PUMPKIN", emoji: "🎃" }, { name: "CARROTS", emoji: "🥕" }, { name: "ZUCCHINI", emoji: "🥒" },
            { name: "MUSHROOMS", emoji: "🍄" }, { name: "ONION", emoji: "🧅" }, { name: "BRUSSELS SPROUTS", emoji: "🥬" },
            { name: "CORN", emoji: "🌽" }, { name: "CUCUMBER", emoji: "🥒" }, { name: "CELERY", emoji: "🥬" },
            { name: "PEAS", emoji: "🫛" }, { name: "SNAP PEAS", emoji: "🫛" }, { name: "CILANTRO", emoji: "🌿" },
            { name: "EGGPLANT", emoji: "🍆" }, { name: "GARLIC", emoji: "🧄" }, { name: "PARSLEY", emoji: "🌿" },
            { name: "KALE", emoji: "🥬" }, { name: "ARTICHOKE", emoji: " artichoke " }, { name: "BROCCOLI", emoji: "🥦" }
        ]
    },
    {
        category: "Grains",
        color: "bg-yellow-100", textColor: "text-yellow-800", borderColor: "border-yellow-300",
        items: [
            { name: "KAMUT", emoji: "🌾" }, { name: "CEREALS", emoji: "🥣" }, { name: "MILLET", emoji: "🌾" },
            { name: "OATMEAL", emoji: "🥣" }, { name: "BUCKWHEAT", emoji: "🌾" }, { name: "WAFFLES", emoji: "🧇" },
            { name: "HEALTHY MUFFINS", emoji: "🧁" }, { name: "PASTA", emoji: "🍝" }, { name: "COUSCOUS", emoji: "🍚" },
            { name: "POLENTA", emoji: "🌽" }, { name: "CORNMEAL", emoji: "🌽" }, { name: "BREAD", emoji: "🍞" },
            { name: "GNOCCHI", emoji: "🥔" }, { name: "TORTILLA", emoji: "🌮" }, { name: "FARRO", emoji: "🌾" },
            { name: "BARLEY", emoji: "🌾" }, { name: "BULGUR", emoji: "🌾" }, { name: "BROWN RICE", emoji: "🍚" },
            { name: "QUINOA", emoji: "🍚" }, { name: "FREEKEH", emoji: "🌾" }
        ]
    },
    {
        category: "Fruits",
        color: "bg-pink-100", textColor: "text-pink-800", borderColor: "border-pink-300",
        items: [
            { name: "AVOCADO", emoji: "🥑" }, { name: "TOMATOES", emoji: "🍅" }, { name: "ORANGE", emoji: "🍊" },
            { name: "LEMON & LIME", emoji: "🍋" }, { name: "PAPAYA", emoji: "🥭" }, { name: "PINEAPPLE", emoji: "🍍" },
            { name: "KIWIFRUIT", emoji: "🥝" }, { name: "MANGO", emoji: "🥭" }, { name: "STARFRUIT", emoji: "⭐" },
            { name: "FIGS", emoji: " fig " }, { name: "BANANA", emoji: "🍌" }, { name: "COCONUT", emoji: "🥥" },
            { name: "WATERMELON", emoji: "🍉" }, { name: "HONEYDEW", emoji: "🍈" }, { name: "CANTALOUPE", emoji: "🍈" },
            { name: "APPLESAUCE", emoji: "🍎" }, { name: "RASPBERRIES", emoji: "🍓" }, { name: "BLUEBERRIES", emoji: "🫐" },
            { name: "STRAWBERRIES", emoji: "🍓" }, { name: "GRAPES", emoji: "🍇" }, { name: "PEACHES", emoji: "🍑" },
            { name: "PEARS", emoji: "🍐" }, { name: "APPLES", emoji: "🍎" }
        ]
    },
    {
        category: "Plant Protein",
        color: "bg-blue-100", textColor: "text-blue-800", borderColor: "border-blue-300",
        items: [
            { name: "TOFU", emoji: "🧈" }, { name: "EDAMAME", emoji: "🫛" }, { name: "PEANUTS", emoji: "🥜" },
            { name: "ALMONDS", emoji: "🌰" }, { name: "WHITE BEANS", emoji: "🫘" }, { name: "CHICKPEAS", emoji: "🫘" },
            { name: "BLACK BEANS", emoji: "🫘" }, { name: "KIDNEY BEANS", emoji: "🫘" },
            { name: "LENTILS", emoji: "🍚" }, { name: "ALMOND BUTTER", emoji: "🌰" }, { name: "PEANUT BUTTER", emoji: "🥜" }, { name: "SEEDS", emoji: "🌱" }
        ]
    },
    {
        category: "Meat",
        color: "bg-red-100", textColor: "text-red-800", borderColor: "border-red-300",
        items: [
            { name: "FISH", emoji: "🐟" }, { name: "TUNA", emoji: "🐟" }, { name: "SARDINES", emoji: "🐟" },
            { name: "SALMON", emoji: "🐟" }, { name: "SHRIMP", emoji: "🍤" }, { name: "BEEF, SLICED", emoji: "🥩" },
            { name: "BEEF, GROUND", emoji: "🍔" }, { name: "CHICKEN", emoji: "🍗" }, { name: "LAMB", emoji: "🐑" },
            { name: "TURKEY", emoji: "🦃" }, { name: "PORK", emoji: "🐖" }
        ]
    },
    {
        category: "Dairy & Eggs",
        color: "bg-purple-100", textColor: "text-purple-800", borderColor: "border-purple-300",
        items: [
            { name: "YOGURT", emoji: "🥣" }, { name: "EGGS", emoji: "🥚" }, { name: "MOZZARELLA", emoji: "🧀" },
            { name: "RICOTTA CHEESE", emoji: "🧀" }, { name: "COTTAGE CHEESE", emoji: "🧀" }
        ]
    },
    {
        category: "Other",
        color: "bg-gray-100", textColor: "text-gray-800", borderColor: "border-gray-300",
        items: [
            { name: "WATER", emoji: "💧" },
            { name: "SPICES & HERBS", emoji: "🌿" }
        ]
    }
];

export const flatFoodList = allFoods.flatMap(cat => cat.items.map(item => item.name));
export const totalFoodCount = flatFoodList.length;

export const foodGuideData: { [key: string]: { allergyRisk: string; chokingRisk: string; serve6to8: string; serve9to12: string; } } = {
    "AVOCADO": { allergyRisk: "Low", chokingRisk: "Low", serve6to8: "<h4 class='font-semibold'>6-8 Months:</h4><p>Serve ripe avocado in long, thick spears (about the width of two adult fingers). You can roll the spears in a 'duster' like crushed cereal, hemp seeds, or nutritional yeast to make it less slippery and easier to grip.</p>", serve9to12: "<h4 class='font-semibold mt-4'>9-12 Months:</h4><p>As baby develops a pincer grasp, you can offer ripe avocado in small, pincer-sized cubes. You can also continue to serve spears or mashed on a pre-loaded spoon.</p>" },
    "EGGS": { allergyRisk: "High (Top 9 Allergen)", chokingRisk: "Low", serve6to8: "<h4 class='font-semibold'>6-8 Months:</h4><p>Offer fully-cooked egg only. A great way is to make a simple 'omelet strip' by whisking one egg and cooking it flat in a pan. Cut it into long, 1-inch wide strips for baby to hold.</p><p class='mt-2'><strong>Allergy Info:</strong> Egg is a top allergen. Introduce it on its own and wait 3-5 days before introducing other new allergens. Start with a small amount.</p>", serve9to12: "<h4 class='font-semibold mt-4'>9-12 Months:</h4><p>You can serve scrambled eggs (cooked through) or chopped hard-boiled eggs for pincer grasp practice. Continue offering omelet strips as well.</p>" },
    "PEANUTS": { allergyRisk: "High (Top 9 Allergen)", chokingRisk: "High (When whole or in gobs)", serve6to8: "<h4 class='font-semibold'>6-8 Months:</h4><p><strong>NEVER</strong> serve whole peanuts, peanut pieces, or thick, sticky gobs of peanut butter, as these are severe choking hazards.</p><p class='mt-2'><strong>To serve safely:</strong><br>1. Thin a small amount (1-2 teaspoons) of smooth peanut butter with water, breastmilk, or formula to a thin, 'sauce-like' consistency and offer on a spoon.<br>2. Or, stir a small amount of smooth peanut butter into yogurt or oatmeal.<br>3. Or, spread a *very* thin layer (almost see-through) on a piece of toast, cut into strips.</p><p class='mt-2'><strong>Allergy Info:</strong> Peanuts are a top allergen. Introduce it early and often (after 6 months) to help prevent allergy. Start with a tiny amount.</p>", serve9to12: "<h4 class='font-semibold mt-4'>9-12 Months:</h4><p>Continue serving as above. You can still spread a thin layer on toast or mix into other foods. Avoid whole peanuts until at least age 4-5.</p>" },
    "CARROTS": { allergyRisk: "Low", chokingRisk: "High (When raw or undercooked)", serve6to8: "<h4 class='font-semibold'>6-8 Months:</h4><p><strong>NEVER</strong> serve raw baby carrots or raw carrot sticks. They are a major choking hazard.</p><p class='mt-2'>Carrots must be cooked until <strong>very soft</strong> (you can easily smash it between your thumb and forefinger). Serve in long, 1-inch thick spears (about the size of an adult finger) that have been roasted or steamed until tender.</p>", serve9to12: "<h4 class='font-semibold mt-4'>9-12 Months:</h4><p>Continue serving soft-cooked spears, or offer in small, soft-cooked, pincer-sized pieces. You can also offer shredded raw carrot, as this is much safer than a raw stick, but supervision is key.</p>" },
    "APPLES": { allergyRisk: "Low", chokingRisk: "High (When raw)", serve6to8: "<h4 class='font-semibold'>6-8 Months:</h4><p><strong>NEVER</strong> serve raw, hard apple pieces or whole apples. They are a major choking hazard.</p><p class='mt-2'>Serve in one of two ways:<br>1. Offer unsweetened applesauce on a pre-loaded spoon.<br>2. Cook apple spears (with skin removed) by steaming or roasting them until they are very soft all the way through. They should be easily smushed between your fingers.</p>", serve9to12: "<h4 class='font-semibold mt-4'>9-12 Months:</h4><p>Continue serving soft-cooked apples or applesauce. As baby develops, you can offer shredded raw apple, which is safer than chunks. Do not serve hard, raw apple chunks.</p>" },
    "BANANA": { allergyRisk: "Low", chokingRisk: "Low (when ripe)", serve6to8: "<h4 class='font-semibold'>6-8 Months:</h4><p>Serve a whole, ripe banana, but leave the bottom third of the peel on as a 'handle' for baby to grip. You can also serve it in long spears, rolled in a 'duster' (like crushed cereal or hemp seeds) to make it less slippery.</p>", serve9to12: "<h4 class='font-semibold mt-4'>9-12 Months:</h4><p>As baby develops a pincer grasp, you can offer small, bite-sized pieces of ripe banana. You can also continue to serve it in spears or mashed.</p>" },
    "OATMEAL": { allergyRisk: "Low (Oats are not a top 9 allergen, but check for cross-contamination if Celiac disease is a concern)", chokingRisk: "Low", serve6to8: "<h4 class='font-semibold'>6-8 Months:</h4><p>Make oatmeal thick so it's not runny. Offer it on a pre-loaded spoon (like a Go-O utensil) that you hand to your baby. You can also let them scoop it with their hands. Mix in allergens like thinned peanut butter or yogurt.</p>", serve9to12: "<h4 class='font-semibold mt-4'>9-12 Months:</h4><p>Continue serving as above. You can also bake oatmeal into 'oatmeal fingers' or muffins for an easy-to-hold, portable option.</p>" },
    "CHICKEN": { allergyRisk: "Low", chokingRisk: "Medium (When dry, tough, or in cubes)", serve6to8: "<h4 class='font-semibold'>6-8 Months:</h4><p><strong>NEVER</strong> serve in cubes or chunks. Chicken must be very soft and moist. The safest way is to offer a large, long strip (about the size of two adult fingers) of *dark meat* (like thigh or drumstick), which is more tender and iron-rich. Ensure it's cooked through and any gristle/bone is removed. You can also serve ground chicken in a soft-cooked meatball or patty.</p>", serve9to12: "<h4 class='font-semibold mt-4'>9-12 Months:</h4><p>As baby's grasp improves, you can offer smaller, shredded pieces of moist chicken. Continue to avoid hard, dry cubes. Ground chicken patties or meatballs are still an excellent choice.</p>" },
    "SWEET POTATO": { allergyRisk: "Low", chokingRisk: "Low (when soft-cooked)", serve6to8: "<h4 class='font-semibold'>6-8 Months:</h4><p>Sweet potato must be cooked until very soft (easily smushed between your fingers). Serve as a large, soft-cooked spear (width of 2 fingers) or mashed on a pre-loaded spoon.</p>", serve9to12: "<h4 class='font-semibold mt-4'>9-12 Months:</h4><p>Continue serving as soft spears or mashed. As pincer grasp develops, you can offer small, soft-cooked cubes for baby to practice picking up.</p>" },
    "EGGPLANT": { allergyRisk: "Low (though a rare allergen)", chokingRisk: "Low (when soft-cooked)", serve6to8: "<h4 class='font-semibold'>6-8 Months:</h4><p>Serve eggplant cooked until completely soft and tender. Large, long spears (with skin removed) that are roasted or steamed are perfect. You can also serve it mashed or as part of a dip like baba ganoush (watch the salt!).</p>", serve9to12: "<h4 class='font-semibold mt-4'>9-12 Months:</h4><p>Continue serving soft-cooked spears or offer soft-cooked, pincer-sized cubes. Eggplant is great at soaking up flavors in stews or pasta sauces.</p>" },
    "ZUCCHINI": { allergyRisk: "Low", chokingRisk: "Low (when soft-cooked)", serve6to8: "<h4 class='font-semibold'>6-8 Months:</h4><p>Zucchini must be cooked until very soft. Serve as large, soft-cooked spears (width of 2 fingers) with the skin on (for better grip) or off. Roasting or steaming works well. Avoid raw zucchini.</p>", serve9to12: "<h4 class='font-semibold mt-4'>9-12 Months:</h4><p>Continue serving soft-cooked spears. As pincer grasp develops, you can offer small, soft-cooked cubes (skin on or off). Shredded zucchini (raw or cooked) can also be mixed into muffins, pancakes, or fritters.</p>" },
    "BROCCOLI": { allergyRisk: "Low", chokingRisk: "Medium (when raw or hard)", serve6to8: "<h4 class='font-semibold'>6-8 Months:</h4><p>Broccoli must be steamed or roasted until the stem is very soft (easily smushed between your fingers). Serve a large floret with a long 'handle' of the stem for baby to hold.</p>", serve9to12: "<h4 class='font-semibold mt-4'>9-12 Months:</h4><p>Continue serving soft-cooked florets, or chop the florets into small, pincer-sized pieces (both stem and flower) once soft-cooked.</p>" },
    "YOGURT": { allergyRisk: "High (Top 9 Allergen - Cow's Milk)", chokingRisk: "Low", serve6to8: "<h4 class='font-semibold'>6-8 Months:</h4><p>Serve plain, whole-milk (full-fat) yogurt with no added sugars. Offer it on a pre-loaded spoon for baby to grab. You can also mix in thinned peanut butter or fruit purées (once those are introduced).</p><p class='mt-2'><strong>Allergy Info:</strong> This is a top allergen. Introduce it on its own and wait 3-5 days before other new allergens. Start with a small amount.</p>", serve9to12: "<h4 class='font-semibold mt-4'>9-12 Months:</h4><p>Continue serving plain, whole-milk yogurt. You can start to mix in soft fruits or berries (smashed or quartered).</p>" },
    "WATER": { allergyRisk: "Low", chokingRisk: "Low", serve6to8: "<h4 class='font-semibold'>6-8 Months:</h4><p>Offer a small amount (1-2 oz) of water in an open cup or a straw cup with meals. This is primarily for learning to drink, not for hydration (which still comes from breastmilk/formula).</p>", serve9to12: "<h4 class='font-semibold mt-4'>9-12 Months:</h4><p>Continue offering water with all meals in an open cup or straw cup. Baby will gradually get better at sipping and drinking.</p>" }
};

export const recommendationData: { [key: string]: { title: string; foods: string[]; message: string; } } = {
    'too_young': { title: "Not Quite 6 Months", foods: [], message: "Most pediatricians recommend starting solids around 6 months, when baby shows all signs of readiness. See the 'Learn' tab for more info!" },
    '6_months': { title: "6 Months: First Tastes", foods: ["AVOCADO", "SWEET POTATO", "BANANA", "OATMEAL", "EGGPLANT", "ZUCCHINI", "BROCCOLI", "CARROTS", "EGGS", "YOGURT", "WATER"], message: "Focus on soft, single-ingredient foods. Offer soft-cooked spears or large pieces. This is a great time to safely introduce top allergens like egg and yogurt (see Learn tab!). Offer sips of water with meals." },
    '7_8_months': { title: "7-8 Months: Exploring Textures", foods: ["CHICKEN", "SALMON", "TOFU", "LENTILS", "BREAD", "PEANUT BUTTER", "ALMOND BUTTER", "APPLES", "PEARS", "PASTA", "SPICES & HERBS"], message: "Baby is likely getting better at mashing and moving food. You can offer softer proteins and continue introducing allergens. Now is a great time to add spices (like cinnamon or garlic powder) to foods!" },
    '9_11_months': { title: "9-11 Months: Pincer Grasp Practice", foods: ["PEAS", "BLUEBERRIES", "RASPBERRIES", "CUCUMBER", "COTTAGE CHEESE", "BEEF, GROUND", "BLACK BEANS", "CORN", "GRAPES", "TOMATOES"], message: "Baby may be starting to use their pincer grasp. Offer smaller, soft-cooked foods (e.g., cut grapes in quarters, smash blueberries/peas) to help them practice." },
    '12_plus': { title: "12+ Months: Try Everything!", foods: flatFoodList, message: "By 12 months, your baby can eat most of what you eat (with appropriate modifications for salt, spice, and choking hazards). Work your way through the rest of the 100 foods list!" }
};

export const guidesData = [
    { 
        title: "How Many Meals a Day?", 
        icon: "utensils-crossed",
        content: `<p>Follow your baby's lead! This is a general guide, but every baby is different. Focus on exploration, not volume.</p><ul class="list-disc list-outside space-y-2 pl-5"><li><strong>~6 Months:</strong> Start with <strong>1 meal</strong> a day. This is just for practice. Timing doesn't matter, just pick a time when baby is happy, rested, and not starving.</li><li><strong>~7-8 Months:</strong> When baby seems to be getting the hang of it, you can move to <strong>2 meals</strong> a day.</li><li><strong>~9-11 Months:</strong> Baby is likely a pro by now and can handle <strong>3 meals</strong> a day, often at the same time as the family (breakfast, lunch, dinner).</li></ul><p class="mt-2"><strong>Remember:</strong> Breastmilk or formula is still their primary source of nutrition until age 1.</p>`
    }
];

export const researchData = [
    { 
        title: "1. Key Signs of Readiness", 
        icon: "clipboard-check",
        content: `<p>Age alone isn't the only factor. Before starting any solids (purées or BLW), your baby should meet <strong>all</strong> of these milestones, which typically happen around 6 months:</p><ul class="list-disc list-outside space-y-2 pl-5"><li><strong>Sits Independently:</strong> Baby can sit in a high chair unassisted or with minimal support and has good head and neck control. This is crucial for safely managing food and swallowing.</li><li><strong>Lost Tongue-Thrust Reflex:</strong> Baby no longer automatically pushes food out of their mouth with their tongue. You can test this by offering a (safe) empty spoon; if they push it out, they're likely not ready.</li><li><strong>Interest in Food:</strong> Baby watches you eat with interest, leans forward, and may try to grab food from your plate.</li><li><strong>Can Grab and Hold:</strong> Baby has developed the motor skills to pick up pieces of food and bring them to their mouth.</li></ul>`
    },
    {
        title: "2. Introducing Top Allergens",
        icon: "peanut",
        content: `<p>Current guidelines have changed: experts now recommend introducing top allergenic foods <strong>early and often</strong> (after 6 months and once a few other foods have been tolerated) to help *prevent* allergies.</p><p>The top 9 allergens account for ~90% of food allergies:</p><ol class="list-decimal list-outside space-y-2 pl-5"><li>Cow's Milk (e.g., in yogurt, cheese)</li><li>Egg (fully cooked, e.g., scrambled or in a muffin)</li><li>Peanuts (NEVER whole. Offer as a thin paste on toast or watered down.)</li><li>Tree Nuts (e.g., almond, walnut. Offer as nut butter, same as peanuts.)</li><li>Fish (e.g., soft, flaky salmon)</li><li>Shellfish (e.g., minced shrimp)</li><li>Soy (e.g., tofu, edamame)</li><li>Wheat (e.g., toast, pasta)</li><li>Sesame (e.g., tahini swirled into yogurt)</li></ol><p><strong>SafetyProtocol:</strong> Introduce one allergen at a time. Wait 3-5 days before introducing another new allergen to watch for any reaction (hives, vomiting, swelling, wheezing). Once an allergen is successfully introduced, keep offering it regularly (e.g., 2-3 times a week) to maintain tolerance.</p>`
    },
    {
        title: "3. The Importance of Iron",
        icon: "beef",
        content: `<p>This is a common concern with BLW. At 6 months, a baby's natural iron stores (which they built up in the womb) begin to deplete. Breast milk is naturally low in iron. While formula and iron-fortified cereals are packed with it, BLW babies may not consume large quantities of cereal.</p><p>It is <strong>essential</strong> to offer iron-rich foods at every meal.</p><ul class="list-disc list-outside space-y-2 pl-5"><li><strong>Heme Iron (Easily Absorbed):</strong> Beef (slow-cooked strips, ground beef), chicken (dark meat), turkey (dark meat), salmon, sardines.</li><li><strong>Non-Heme Iron:</strong> Lentils, tofu, chickpeas, black beans, edamame, eggs, iron-fortified oatmeal/cereal (can be used in muffins or pancakes).</li></ul><p><strong>Pro-Tip:</strong> Pair non-heme iron foods with a food high in Vitamin C to dramatically boost absorption! (e.g., lentils with tomatoes, tofu with bell peppers, oatmeal with strawberries).</p>`
    },
    {
        title: "4. Reputable Sources",
        icon: "book-text",
        content: `<p>For more detailed information, you can look up guidelines from these trusted organizations:</p><ul class="list-disc list-outside space-y-2 pl-5"><li>American Academy of Pediatrics (AAP)</li><li>Centers for Disease Control and Prevention (CDC)</li><li>World Health Organization (WHO)</li><li>Solid Starts (A popular, comprehensive app and website)</li></ul>`
    }
];