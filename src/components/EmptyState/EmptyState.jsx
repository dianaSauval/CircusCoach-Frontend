import React from 'react';
import './EmptyState.css';
import { LuMoonStar, LuSquareBottomDashedScissors } from 'react-icons/lu';
import { PiMagicWandLight } from 'react-icons/pi';
import { TbMoonStars } from 'react-icons/tb';


const EmptyState = ({ title, subtitle }) => {
  return (
    <div className="empty-wrapper">
    <div className="empty-state-container">
      <h2 className="titulo-principal">{title}</h2>
      <p className="subtitulo">{subtitle}</p>
    </div>
    </div>
  );
};

export default EmptyState;
