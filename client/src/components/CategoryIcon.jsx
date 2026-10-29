import React from 'react';
import { BookOpen, Laptop, Trophy, Wrench, FlaskConical, Package, Zap } from 'lucide-react';

const CategoryIcon = ({ category, size = 18 }) => {
  const norm = (category || '').toLowerCase();

  if (norm.includes('book')) {
    return <BookOpen size={size} />;
  }
  if (norm.includes('electronic') || norm.includes('charger') || norm.includes('projector')) {
    return <Laptop size={size} />;
  }
  if (norm.includes('sport') || norm.includes('bat') || norm.includes('ball')) {
    return <Trophy size={size} />;
  }
  if (norm.includes('tool') || norm.includes('repair') || norm.includes('solder')) {
    return <Wrench size={size} />;
  }
  if (norm.includes('lab') || norm.includes('meter')) {
    return <FlaskConical size={size} />;
  }
  return <Package size={size} />;
};

export default CategoryIcon;
