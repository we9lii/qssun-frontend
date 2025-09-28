

import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  count?: number;
  rating: number;
  onRatingChange: (rating: number) => void;
  size?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({
  count = 5,
  rating,
  onRatingChange,
  size = 24,
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const onMouseEnter = (index: number) => {
    setHoverRating(index);
  };

  const onMouseLeave = () => {
    setHoverRating(0);
  };

  const onSaveRating = (index: number) => {
    onRatingChange(index);
  };

  return (
    <div className="flex items-center" dir="ltr">
      {Array.from({ length: count }, (_, i) => i + 1).map((index) => (
        <Star
          key={index}
          size={size}
          className={`cursor-pointer transition-colors ${
            (hoverRating || rating) >= index ? 'text-yellow-400' : 'text-slate-300 dark:text-slate-600'
          }`}
          fill={(hoverRating || rating) >= index ? 'currentColor' : 'none'}
          onMouseEnter={() => onMouseEnter(index)}
          onMouseLeave={onMouseLeave}
          onClick={() => onSaveRating(index)}
        />
      ))}
    </div>
  );
};