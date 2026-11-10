import { useContext } from 'react';
import { LogisticsContext } from './logisticsContextDef';

export const useLogistics = () => {
  const context = useContext(LogisticsContext);
  if (!context) {
    throw new Error('useLogistics debe ser utilizado dentro de un LogisticsProvider');
  }
  return context;
};
