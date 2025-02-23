import { formatUnits, parseUnits } from 'viem';

export const formatTokenAmount = (amount: string, decimals: number): string => {
  try {
    return formatUnits(BigInt(amount), decimals);
  } catch (error) {
    console.error('Error formatting token amount:', error);
    return '0';
  }
};

export const parseTokenAmount = (amount: string, decimals: number): string => {
  try {
    return parseUnits(amount, decimals).toString();
  } catch (error) {
    console.error('Error parsing token amount:', error);
    return '0';
  }
};
