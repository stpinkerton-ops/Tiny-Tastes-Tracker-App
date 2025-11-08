import React from 'react';
import { TriedFoodLog } from '../../types.ts';
import { allFoods } from '../../constants.ts';
import Icon from '../ui/Icon.tsx';

interface LogPageProps {
  triedFoods: TriedFoodLog[];
  babyName?: string;
}

const LogPage: React.FC<LogPageProps> = ({ triedFoods, babyName }) => {

    const exportToCSV = () => {
        if (triedFoods.length === 0) {
            alert("No data to export.");
            return;
        }
        const headers = ['Food Name', 'Date', 'Meal', 'Reaction (1-7)', 'More than 1 Bite?', 'Allergy Reaction', 'Notes'];
        const rows = triedFoods.map(log => {
            const safeFoodName = `"${(log.id || '').replace(/"/g, '""')}"`;
            const safeNotes = `"${(log.notes || '').replace(/"/g, '""')}"`;
            return [
                safeFoodName,
                log.date || '',
                log.meal || '',
                log.reaction || '',
                log.moreThanOneBite ? "Yes" : "No",
                log.allergyReaction || 'none',
                safeNotes
            ].join(',');
        });

        let csvContent = "data:text/csv;charset=utf-8," + headers.join(',') + "\r\n" + rows.join("\r\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "tiny_tastes_summary.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const emailPediatrician = () => {
        alert("Please export the CSV and attach it to an email to your pediatrician.");
        const subject = babyName ? `${babyName}'s Food Log Summary` : "Baby's Food Log Summary";
        const body = `Hi Dr. [Name],\n\nI've attached ${babyName ? babyName + "'s" : "our baby's"} food log summary as a .csv file for you to review.\n\nThanks!`;
        const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;
    };


    const getReactionDisplay = (reactionValue: number) => {
        if (reactionValue <= 2) return { emoji: '😩', text: 'Hated it' };
        if (reactionValue <= 4) return { emoji: '😒', text: 'Meh' };
        if (reactionValue >= 7) return { emoji: '😍', text: 'Loved it!' };
        return { emoji: '😋', text: 'Liked it' };
    };

    const getMealEmoji = (meal: string) => {
        const map: { [key: string]: string } = { breakfast: '🍳', lunch: '🥪', dinner: '🍝', snack: '🍎' };
        return map[meal] || '🍽️';
    };

    const sortedFoods = [...triedFoods].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
                <h2 className="text-2xl font-semibold text-gray-800">Summary of Tried Foods</h2>
                <div className="flex-shrink-0 flex gap-2">
                    <button onClick={exportToCSV} className="inline-flex items-center gap-2 px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700">
                        <Icon name="sheet" /> CSV
                    </button>
                    <button onClick={emailPediatrician} className="inline-flex items-center gap-2 px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                        <Icon name="mail" /> Email
                    </button>
                </div>
            </div>
            <div className="space-y-4">
                {sortedFoods.length === 0 ? (
                    <p className="text-center text-gray-500 py-6">No foods logged yet. Start tracking on the 'Tracker' tab!</p>
                ) : (
                    sortedFoods.map(log => {
                        const foodDetails = allFoods.flatMap(c => c.items).find(f => f.name === log.id);
                        const { emoji, text } = getReactionDisplay(log.reaction);
                        return (
                            <div key={log.id} className="bg-white shadow rounded-lg p-4 border-l-4 border-teal-500">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-800">{foodDetails?.emoji || '🍽️'} {log.id}</h3>
                                    <span className="text-sm text-gray-500">{log.date}</span>
                                </div>
                                <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                                    <div className="flex flex-col"><span className="text-gray-500">Meal</span><span className="font-medium text-gray-700">{getMealEmoji(log.meal)} {log.meal}</span></div>
                                    <div className="flex flex-col"><span className="text-gray-500">Reaction</span><span className="font-medium text-gray-700">{emoji} {text} ({log.reaction}/7)</span></div>
                                    <div className="flex flex-col"><span className="text-gray-500">Amount</span><span className="font-medium text-gray-700">{log.moreThanOneBite ? 'More than 1 bite' : 'Just a taste'}</span></div>
                                </div>
                                {log.allergyReaction && log.allergyReaction !== 'none' && (
                                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                                        <p className="text-sm font-medium text-red-700">Possible Reaction: <span className="font-bold">{log.allergyReaction}</span></p>
                                    </div>
                                )}
                                {log.notes && (
                                    <div className="mt-3 pt-3 border-t">
                                        <p className="text-sm text-gray-600"><span className="font-medium text-gray-800">Notes:</span> {log.notes}</p>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </>
    );
};

export default LogPage;