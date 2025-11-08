import React, { useState, useEffect } from 'react';
import { Recipe, MealPlan } from '../../types.ts';
import { categorizeShoppingList } from '../../services/geminiService.ts';
import Icon from '../ui/Icon.tsx';

interface ShoppingListModalProps {
    recipes: Recipe[];
    mealPlan: MealPlan;
    onClose: () => void;
}

const parseIngredients = (text: string) => {
    if (!text) return [];
    return text.split('\n')
        .map(line => line.trim().replace(/^[\*\-\s]|^(\d+\.\s)/, ''))
        .filter(line => line.length > 0);
};

const ShoppingListModal: React.FC<ShoppingListModalProps> = ({ recipes, mealPlan, onClose }) => {
    const [categorizedList, setCategorizedList] = useState<Record<string, string[]>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const generateList = async () => {
            setLoading(true);
            setError(null);
            
            const allIngredients = new Set<string>();
            const weekStartDate = new Date(); // Assuming current week for simplicity
            weekStartDate.setDate(weekStartDate.getDate() - weekStartDate.getDay() + (weekStartDate.getDay() === 0 ? -6 : 1));

            for (let i = 0; i < 7; i++) {
                const dayDate = new Date(weekStartDate);
                dayDate.setDate(weekStartDate.getDate() + i);
                const dateStr = dayDate.toISOString().split('T')[0];
                const dayPlan = mealPlan[dateStr];

                if (dayPlan) {
                    for (const meal of Object.values(dayPlan)) {
                        // Fix for: Property 'id' does not exist on type 'unknown'.
                        const recipe = recipes.find(r => r.id === (meal as { id: string }).id);
                        if (recipe) {
                            parseIngredients(recipe.ingredients).forEach(ing => allIngredients.add(ing));
                        }
                    }
                }
            }
            
            const ingredientsList = [...allIngredients];
            if (ingredientsList.length === 0) {
                setCategorizedList({ 'Info': ['No meals planned for this week.'] });
                setLoading(false);
                return;
            }

            try {
                const categories = await categorizeShoppingList(ingredientsList);
                setCategorizedList(categories);
            } catch (err) {
                setError("AI categorization failed. Displaying a simple list.");
                setCategorizedList({ 'All Items': ingredientsList });
            } finally {
                setLoading(false);
            }
        };

        generateList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [recipes, mealPlan]);

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-[500]">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto">
                <div className="flex justify-between items-center border-b p-4">
                    <h2 className="text-xl font-semibold text-gray-800">Weekly Shopping List</h2>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600"><Icon name="x" /></button>
                </div>
                <div className="p-6 modal-scroll-content prose-static">
                    {loading ? (
                        <div className="text-center p-6">
                            <div className="spinner mx-auto"></div>
                            <p className="mt-4 text-sm text-gray-600">Categorizing list with AI...</p>
                        </div>
                    ) : (
                        <>
                            {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
                            {Object.entries(categorizedList).map(([category, items]) => (
                                <div key={category}>
                                    <h4 className="text-md font-semibold text-teal-700 mt-3">{category}</h4>
                                    <ul className="list-disc list-outside pl-5 space-y-1">
                                        {/* Fix for: Property 'map' does not exist on type 'unknown'. */}
                                        {(items as string[]).map((item, index) => <li key={index}>{item}</li>)}
                                    </ul>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShoppingListModal;