
import React, { useState } from 'react';
import { Food, TriedFoodLog, Filter, FoodCategory } from '../../types';
import { allFoods, totalFoodCount } from '../../constants';
import Icon from '../ui/Icon';

interface TrackerPageProps {
  triedFoods: TriedFoodLog[];
  onFoodClick: (food: Food) => void;
}

const FoodCard: React.FC<{ food: Food; category: FoodCategory; isTried: boolean; onClick: () => void }> = ({ food, category, isTried, onClick }) => {
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

const FilterButton: React.FC<{ filter: Filter, currentFilter: Filter, onClick: (filter: Filter) => void, children: React.ReactNode }> = ({ filter, currentFilter, onClick, children }) => {
    const isActive = filter === currentFilter;
    const baseClasses = "filter-btn flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors duration-150";
    const activeClasses = "bg-teal-600 text-white";
    const inactiveClasses = "bg-gray-200 text-gray-700 hover:bg-gray-300";

    return (
        <button onClick={() => onClick(filter)} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
            {children}
        </button>
    );
};


const TrackerPage: React.FC<TrackerPageProps> = ({ triedFoods, onFoodClick }) => {
  const [filter, setFilter] = useState<Filter>('all');
  const triedFoodSet = new Set(triedFoods.map(f => f.id));
  const triedCount = triedFoods.length;
  const progressPercent = (triedCount / totalFoodCount) * 100;

  const filteredCategories = allFoods.map(category => {
      const items = category.items.filter(food => {
          const isTried = triedFoodSet.has(food.name);
          if (filter === 'all') return true;
          if (filter === 'to_try') return !isTried;
          if (filter === 'tried') return isTried;
          return false;
      });
      return { ...category, items };
  }).filter(category => category.items.length > 0);

  return (
    <>
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">My 100 Foods Tracker</h2>
      <div className="flex space-x-2 mb-4">
        <FilterButton filter="all" currentFilter={filter} onClick={setFilter}>All</FilterButton>
        <FilterButton filter="to_try" currentFilter={filter} onClick={setFilter}>To Try</FilterButton>
        <FilterButton filter="tried" currentFilter={filter} onClick={setFilter}>Tried</FilterButton>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-lg font-semibold text-teal-700">Food Journey Progress</span>
          <span className="text-lg font-bold text-teal-700">{triedCount} / {totalFoodCount}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div className="bg-teal-600 h-4 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
        </div>
      </div>

      {filteredCategories.length > 0 ? (
        filteredCategories.map(category => (
          <div key={category.category}>
            <h2 className={`text-2xl font-semibold ${category.textColor} mt-8 mb-4`}>{category.category}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {category.items.map(food => (
                <FoodCard
                  key={food.name}
                  food={food}
                  category={category}
                  isTried={triedFoodSet.has(food.name)}
                  onClick={() => onFoodClick(food)}
                />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-10 px-4">
          <Icon name="search-x" className="w-12 h-12 text-gray-400 mx-auto" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No Foods Found</h3>
          <p className="mt-1 text-sm text-gray-500">No foods match your current filter.</p>
        </div>
      )}
    </>
  );
};

export default TrackerPage;
