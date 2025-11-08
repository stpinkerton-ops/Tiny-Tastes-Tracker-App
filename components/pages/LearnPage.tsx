import React from 'react';
import { researchData } from '../../constants.ts';
import Accordion from '../ui/Accordion.tsx';

const LearnPage: React.FC = () => {
  return (
    <>
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Essential BLW Guidelines</h2>
      <p className="text-sm text-gray-600 mb-6">This information is for educational purposes only. Always consult with your pediatrician for personalized medical advice.</p>
      <div className="space-y-3">
        {researchData.map((item, index) => (
          <Accordion key={item.title} title={item.title} icon={item.icon} defaultOpen={index === 0}>
            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: item.content }} />
          </Accordion>
        ))}
      </div>
    </>
  );
};

export default LearnPage;