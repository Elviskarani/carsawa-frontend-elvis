import React from 'react';

interface SellCarButtonProps {
  onClick?: () => void;
  className?: string;
  text?: string;
  buttonText?: string;
}

const SellCarButton: React.FC<SellCarButtonProps> = ({
  onClick,
  className = "",
  text = "Looking to sell your car?",
  buttonText = "SELL CAR"
}) => {
  const handleClick = (): void => {
    console.log('Sell car button clicked');
    onClick?.();
  };

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <span className="text-white text-sm font-medium">
        {text}
      </span>
      <button
        onClick={handleClick}
        className="bg-white text-black px-6 py-2 rounded-lg font-semibold text-sm hover:bg-gray-100 active:bg-gray-200 transition-colors duration-200 flex items-center gap-2"
      >
        {buttonText}
        <span className="text-lg">+</span>
      </button>
    </div>
  );
};

export default SellCarButton;