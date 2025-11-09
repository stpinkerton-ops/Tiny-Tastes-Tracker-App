
import React, { useState, useEffect } from 'react';
import { UserProfile, TriedFoodLog, Food } from '../../types';
import { recommendationData, guidesData, allFoods } from '../../constants';
import Accordion from '../ui/Accordion';
import Icon from '../ui/Icon';

interface IdeasPageProps {
  userProfile: UserProfile | null;
  triedFoods: TriedFoodLog[];
  onSaveProfile: (profile: UserProfile) => void;
  onLogOut: () => void;
  onFoodClick: (food: Food) => void;
  familyId: string | null;
}

const calculateAge = (dateString: string) => {
    const birthDate = new Date(dateString);
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();
    if (days < 0) { months--; days += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); }
    if (months < 0) { years--; months += 12; }
    const totalMonths = (years * 12) + months;
    let ageKey = '12_plus';
    if (totalMonths < 6) ageKey = 'too_young';
    else if (totalMonths === 6) ageKey = '6_months';
    else if (totalMonths >= 7 && totalMonths <= 8) ageKey = '7_8_months';
    else if (totalMonths >= 9 && totalMonths <= 11) ageKey = '9_11_months';
    let ageString = '';
    if (years > 0) ageString += `${years} year${years > 1 ? 's' : ''}, `;
    ageString += `${months} month${months !== 1 ? 's' : ''}, and ${days} day${days !== 1 ? 's' : ''}`;
    return { ageString, ageKey, totalMonths };
};

const FoodCard: React.FC<{ food: Food; isTried: boolean; onClick: () => void }> = ({ food, isTried, onClick }) => {
    const category = allFoods.find(cat => cat.items.some(item => item.name === food.name));
    if (!category) return null;
    const triedClass = isTried ? 'is-tried' : '';
    return (
      <button
        onClick={onClick}
        className={`food-card relative ${category.color} ${category.textColor} p-3 h-24 rounded-lg shadow-sm font-medium text-sm text-center flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 border ${category.borderColor} ${triedClass}`}
        type="button"
      >
        <span className="text-3xl">{food.emoji}</span>
        <span className="mt-1 text-center leading-tight">{food.name}</span>
        <div className="check-overlay absolute inset-0 bg-white/70 flex items-center justify-center rounded-lg">
          <Icon name="check-circle-2" className="w-12 h-12 text-teal-600" />
        </div>
      </button>
    );
  };

const IdeasPage: React.FC<IdeasPageProps> = ({ userProfile, triedFoods, onSaveProfile, onLogOut, onFoodClick, familyId }) => {
    const [name, setName] = useState(userProfile?.babyName || '');
    const [birthDate, setBirthDate] = useState(userProfile?.birthDate || '');
    const [allergies, setAllergies] = useState(userProfile?.knownAllergies || '');
    const [pediatricianApproved, setPediatricianApproved] = useState(userProfile?.pediatricianApproved || false);

    useEffect(() => {
        setName(userProfile?.babyName || '');
        setBirthDate(userProfile?.birthDate || '');
        setAllergies(userProfile?.knownAllergies || '');
        setPediatricianApproved(userProfile?.pediatricianApproved || false);
    }, [userProfile]);

    const handleSave = () => {
        onSaveProfile({
            babyName: name,
            birthDate: birthDate,
            knownAllergies: allergies,
            pediatricianApproved
        });
    };
    
    const handleApproveEarlyStart = () => {
        setPediatricianApproved(true);
        onSaveProfile({ ...userProfile, pediatricianApproved: true });
    }

    const handleExport = () => {
        if (!familyId) {
            alert("No Family ID found. Cannot export data.");
            return;
        }
        try {
            const dataToExport = {
                profile: JSON.parse(localStorage.getItem(`tiny-tastes-tracker-${familyId}-profile`) || 'null'),
                triedFoods: JSON.parse(localStorage.getItem(`tiny-tastes-tracker-${familyId}-triedFoods`) || '[]'),
                recipes: JSON.parse(localStorage.getItem(`tiny-tastes-tracker-${familyId}-recipes`) || '[]'),
                mealPlan: JSON.parse(localStorage.getItem(`tiny-tastes-tracker-${familyId}-mealPlan`) || '{}'),
            };
            const jsonString = JSON.stringify(dataToExport, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const href = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = href;
            link.download = `tiny-tastes-backup-${familyId}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(href);
        } catch (error) {
            console.error("Failed to export data:", error);
            alert("Sorry, there was an error exporting your data.");
        }
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!familyId) {
            alert("No Family ID found. Cannot import data.");
            return;
        }
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') throw new Error("File is not readable");
                const importedData = JSON.parse(text);

                if (!('profile' in importedData && 'triedFoods' in importedData && 'recipes' in importedData && 'mealPlan' in importedData)) {
                    throw new Error("Invalid data file format. The file must be a valid export from Tiny Tastes Tracker.");
                }

                if (window.confirm("This will overwrite all existing data for this Family ID. This action cannot be undone. Are you sure you want to continue?")) {
                    localStorage.setItem(`tiny-tastes-tracker-${familyId}-profile`, JSON.stringify(importedData.profile || null));
                    localStorage.setItem(`tiny-tastes-tracker-${familyId}-triedFoods`, JSON.stringify(importedData.triedFoods || []));
                    localStorage.setItem(`tiny-tastes-tracker-${familyId}-recipes`, JSON.stringify(importedData.recipes || []));
                    localStorage.setItem(`tiny-tastes-tracker-${familyId}-mealPlan`, JSON.stringify(importedData.mealPlan || {}));
                    
                    alert("Data imported successfully! The app will now reload to apply the changes.");
                    window.location.reload();
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                alert(`Error importing data: ${message}`);
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    };
    
    const triggerImport = () => {
        document.getElementById('import-file-input')?.click();
    };


    const renderRecommendations = () => {
        if (!birthDate) {
            return <p className="text-gray-500 text-center py-4">Please enter your baby's birth date to see recommendations.</p>;
        }

        const { ageString, ageKey } = calculateAge(birthDate);
        
        if (ageKey === 'too_young' && !pediatricianApproved) {
            return (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                    <h3 className="text-lg font-semibold text-yellow-800">Note: Baby is Under 6 Months</h3>
                    <p className="text-yellow-700 mt-2">{recommendationData.too_young.message}</p>
                    <p className="text-gray-700 font-medium mt-4">Has your pediatrician specifically approved starting solids early?</p>
                    <div className="mt-3"><button onClick={handleApproveEarlyStart} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">Yes, we are approved</button></div>
                </div>
            );
        }

        const triedFoodSet = new Set(triedFoods.map(f => f.id));
        const currentStageKey = (ageKey === 'too_young' && pediatricianApproved) ? '6_months' : ageKey;

        return (
            <>
                <div className="mt-6 p-4 bg-teal-50 rounded-md">
                    <p className="text-lg font-medium text-teal-800">
                        <span className="font-normal">{name ? `${name}'s Age:` : "Baby's Age:"}</span> <span className="font-bold">{ageString}</span>
                    </p>
                </div>
                <div className="mt-6 space-y-3">
                    {Object.keys(recommendationData).filter(k => k !== 'too_young').map(key => {
                        const stage = recommendationData[key];
                        const stageFoods = stage.foods.map(fname => allFoods.flatMap(c => c.items).find(f => f.name === fname)).filter(Boolean) as Food[];
                        const triedInStage = stageFoods.filter(f => triedFoodSet.has(f.name));
                        const toTryInStage = stageFoods.filter(f => !triedFoodSet.has(f.name));
                        
                        const content = (
                            <>
                                <p className="text-sm text-gray-600 mb-4" dangerouslySetInnerHTML={{ __html: stage.message }}></p>
                                {toTryInStage.length > 0 && (
                                    <>
                                        <h4 className="text-md font-medium text-green-700 mb-3">New Foods to Try:</h4>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                                            {toTryInStage.map(food => <FoodCard key={food.name} food={food} isTried={false} onClick={() => onFoodClick(food)} />)}
                                        </div>
                                    </>
                                )}
                                {triedInStage.length > 0 && (
                                     <>
                                        <h4 className="text-md font-medium text-gray-500 mt-6 mb-3">Foods Tried This Stage:</h4>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                                            {triedInStage.map(food => <FoodCard key={food.name} food={food} isTried={true} onClick={() => onFoodClick(food)} />)}
                                        </div>
                                    </>
                                )}
                            </>
                        );

                        return (
                            <Accordion 
                                key={key} 
                                title={`${stage.title} (${triedInStage.length}/${stageFoods.length} tried)`}
                                icon="star" 
                                defaultOpen={key === currentStageKey}
                            >
                                {content}
                            </Accordion>
                        );
                    })}
                </div>
            </>
        );
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-semibold text-gray-800">My Baby's Profile</h2>
                {name && <span className="text-lg font-semibold text-teal-600">Hi, {name}! 👋</span>}
            </div>
            <p className="text-sm text-gray-600 mt-1 mb-4">Personalize the app with your baby's name, birth date, and any known allergies.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="baby-name-input" className="block text-sm font-medium text-gray-700">Baby's Name:</label>
                    <input type="text" id="baby-name-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Alex" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="birth-date-input" className="block text-sm font-medium text-gray-700">Baby's Birth Date:</label>
                    <input type="date" id="birth-date-input" value={birthDate} onChange={e => setBirthDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm" />
                </div>
            </div>
            <div className="mt-4">
                <label htmlFor="known-allergies-input" className="block text-sm font-medium text-gray-700">Known Allergies:</label>
                <textarea id="known-allergies-input" value={allergies} onChange={e => setAllergies(e.target.value)} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm" placeholder="e.g., Dairy, Soy (for your reference)"></textarea>
            </div>
            <button onClick={handleSave} className="mt-4 w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                Save Profile
            </button>
            
            <hr className="my-6" />

            <h3 className="text-xl font-semibold text-gray-800 mb-4">Account & Data</h3>
            <div className="space-y-3">
                <div className="p-4 bg-gray-50 rounded-lg border">
                    <h4 className="font-medium text-gray-800">Sync Data Between Devices</h4>
                    <p className="text-sm text-gray-600 mt-1">To use your data on another device (like your phone or computer), export it here and then import it on the other device.</p>
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button onClick={handleExport} className="w-full inline-flex justify-center items-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                            <Icon name="download" className="w-4 h-4" /> Export Data
                        </button>
                        <button onClick={triggerImport} className="w-full inline-flex justify-center items-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                            <Icon name="upload" className="w-4 h-4" /> Import Data
                        </button>
                        <input type="file" id="import-file-input" accept=".json" onChange={handleImport} className="hidden" />
                    </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border">
                    <h4 className="font-medium text-gray-800">Log Out</h4>
                    <p className="text-sm text-gray-600 mt-1">Log out or switch to a different Family ID.</p>
                    <div className="mt-3">
                        <button onClick={onLogOut} className="w-full sm:w-auto inline-flex justify-center items-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                            <Icon name="log-out" className="w-4 h-4" /> Log Out / Change Family ID
                        </button>
                    </div>
                </div>
            </div>

            <hr className="my-6" />
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Food Recommendations</h3>
            <div className="mt-6 space-y-3">
                {guidesData.map((guide, index) => (
                    <Accordion key={index} title={guide.title} icon={guide.icon} defaultOpen={true}>
                        <div dangerouslySetInnerHTML={{ __html: guide.content }}></div>
                    </Accordion>
                ))}
            </div>
            {renderRecommendations()}
        </div>
    );
};

export default IdeasPage;
