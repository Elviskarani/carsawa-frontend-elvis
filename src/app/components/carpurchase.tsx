import React from 'react';

const CarPurchaseSteps: React.FC = () => {
  const steps = [
    {
      number: 'ONE',
      title: 'Select Vehicle',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      )
    },
    {
      number: 'TWO',
      title: 'Enquire',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12">
          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
        </svg>
      )
    },
    {
      number: 'THREE',
      title: 'Pay',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
          <line x1="1" y1="10" x2="23" y2="10"></line>
        </svg>
      )
    }
  ];

  return (
    <div className="bg-white py-9">
      <div className="container mx-auto px-7">
        <h2 className="text-center text-3xl font-bold text-gray-800 mb-12">
          Owning a car is as simple as One, Two, Three
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div 
              key={step.number} 
              className="bg-gray-100 rounded-lg shadow-md p-6 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="bg-white rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-md">
                {step.icon}
              </div>
              <h3 className="text-gray-500 text-sm mb-2">{step.number}</h3>
              <p className="text-xl font-semibold text-gray-800">{step.title}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CarPurchaseSteps;