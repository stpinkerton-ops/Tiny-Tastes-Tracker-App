

import React, { useState, useEffect } from 'https://aistudiocdn.com/react@^19.2.0';
import { Food, TriedFoodLog, FoodLogData } from '../../types.ts';
import Icon from '../ui/Icon.tsx';

interface FoodLogModalProps {
  food: Food;
  existingLog?: TriedFoodLog;
  onClose: () => void;
  onSave: (foodName: string, data: FoodLogData) => void;
  onShowGuide: (food: Food) => void;
}

const reactionButtons = [
    { value: 1, emoji: '😩', text: 'Hated it' },
    { value: 3, emoji: '😒', text: 'Meh' },
    { value: 5, emoji: '😋', text: 'Liked it' },
    { value: 7, emoji: '😍', text: 'Loved it!' }
];

const allergyButtons = ['none', 'hives', 'vomiting', 'swelling', 'gas', 'other'];
const mealButtons = ['breakfast', 'lunch', 'dinner', 'snack'];
const biteButtons = [{ value: 'no', text: 'Just a taste', icon: 'minus-circle'}, { value: 'yes', text: 'More than 1 bite', icon: 'plus-circle' }];

const FoodLogModal: React.FC<FoodLogModalProps> = ({ food, existingLog, onClose, onSave, onShowGuide }) => {
    const [meal, setMeal] = useState(existingLog?.meal || '');
    const [reaction, setReaction] = useState(existingLog?.reaction || 0);
    const [allergy, setAllergy] = useState(existingLog?.allergyReaction || '');
    const [date, setDate] = useState(existingLog?.date || new Date().toISOString().split('T')[0]);
    const [bite, setBite] = useState(existingLog ? (existingLog.moreThanOneBite ? 'yes' : 'no') : '');
    const [notes, setNotes] = useState(existingLog?.notes || '');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!meal || !reaction || !allergy || !bite) {
            alert("Please fill out all fields.");
            return;
        }
        onSave(food.name, {
            meal,
            reaction,
            allergyReaction: allergy,
            date,
            moreThanOneBite: bite === 'yes',
            notes
        });
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto">
                <div className="flex justify-between items-center border-b p-4">
                    <h2 className="text-xl font-semibold">Log Food: <span className="text-teal-600">{food.emoji} {food.name}</span></h2>
                    <div>
                        <button onClick={() => onShowGuide(food)} type="button" className="text-sm text-teal-600 font-medium inline-flex items-center gap-1 hover:text-teal-700">
                            <Icon name="help-circle" className="w-4 h-4" /> How to Serve
                        </button>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 ml-3"><Icon name="x" /></button>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="modal-scroll-content p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">1. Meal</label>
                        <div className="grid grid-cols-4 gap-2">
                            {mealButtons.map(m => <button key={m} type="button" onClick={() => setMeal(m)} className={`text-sm p-2 border border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 ${meal === m ? 'modal-btn-selected' : ''}`}>{m.charAt(0).toUpperCase() + m.slice(1)}</button>)}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">2. How did baby react?</label>
                        <div className="grid grid-cols-4 gap-2">
                            {reactionButtons.map(r => <button key={r.value} type="button" onClick={() => setReaction(r.value)} className={`text-lg p-2 border border-gray-300 rounded-lg flex flex-col items-center text-gray-600 hover:border-gray-400 ${reaction === r.value ? 'modal-btn-selected' : ''}`}><span>{r.emoji}</span><span className="text-xs mt-1">{r.text}</span></button>)}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">3. Any sign of reaction?</label>
                        <div className="grid grid-cols-3 gap-2">
                            {allergyButtons.map(a => <button key={a} type="button" onClick={() => setAllergy(a)} className={`capitalize text-sm p-2 border border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 ${allergy === a ? 'modal-btn-selected' : ''}`}>{a === 'gas' ? 'Gas/Fussy' : a}</button>)}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="feeding-date" className="block text-sm font-medium text-gray-700">4. Date of feeding:</label>
                        <input type="date" id="feeding-date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm" required />
                    </div>
                    <div>
                        <legend className="text-sm font-medium text-gray-700">5. How much did baby eat?</legend>
                        <div className="mt-2 grid grid-cols-2 gap-3">
                            {biteButtons.map(b => <button key={b.value} type="button" onClick={() => setBite(b.value)} className={`p-3 border border-gray-300 rounded-lg flex items-center justify-center gap-2 text-gray-600 hover:border-gray-400 ${bite === b.value ? 'modal-btn-selected' : ''}`}><Icon name={b.icon} className="w-5 h-5" /><span className="text-sm font-medium">{b.text}</span></button>)}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="notes-input" className="block text-sm font-medium text-gray-700">6. Notes (Optional):</label>
                        <textarea id="notes-input" value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm" placeholder="e.g., Gagged a lot at first..."></textarea>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4 border-t sticky bottom-0 bg-white py-4">
                        <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                        <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FoodLogModal;