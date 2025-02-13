import React, { ReactNode } from 'react';
import { NumericFormat } from 'react-number-format';

type PositiveFloatNumInputProps = {
  inputAmount?: string;
  className?: string;
  isDisabled?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
  maxDecimals?: number;
  onInputChange?: (e: any) => void;
  onAmountChange?: (a: number) => void;
  prefix?: ReactNode;
  suffix?: string;
  label?: string;
  showCommas?: boolean;
};

const MAX_DEFAULT = Number.MAX_SAFE_INTEGER;
const MAX_DECIMALS_DEFAULT = 8;

export const InputCustom: React.FunctionComponent<PositiveFloatNumInputProps> = ({
  inputAmount,
  isDisabled = false,
  label = '',
  max = MAX_DEFAULT,
  maxDecimals = MAX_DECIMALS_DEFAULT,
  onInputChange = () => {},
  className,
  placeholder = '0.00',
}) => {
  return (
    <NumericFormat
      className={`${className} input-format text-[#090909]  w-full  font-medium`}
      aria-label={label}
      value={inputAmount}
      displayType="input"
      decimalScale={maxDecimals}
      placeholder={placeholder}
      min={0}
      thousandSeparator
      decimalSeparator={'.'}
      isAllowed={(values) => {
        const { formattedValue, floatValue } = values;
        return formattedValue === '' || Number(floatValue) <= max;
      }}
      onValueChange={(values: any) => {
        if (Number(values.floatValue) > max) {
          onInputChange(max);
        } else if (Number(values.floatValue) < 0) {
          onInputChange(0);
        } else {
          onInputChange(values.floatValue);
        }
      }}
      disabled={isDisabled}
    />
  );
};
