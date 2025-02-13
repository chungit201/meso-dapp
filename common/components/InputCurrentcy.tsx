import { AssetsContext } from '@/common/context';
import { formatNumberBalance } from '@/utils';
import { Button, Popover, Slider, Typography } from 'antd';
import { SliderMarks } from 'antd/es/slider';
import React, {
  ReactNode,
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { NumericFormat } from 'react-number-format';
import { CheckIcon, ChevronDown } from './Icons';

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
  asset?: PoolAsset;
  balance: number;
  keepApt?: boolean;
  setAssetSelected?: (asset: PoolAsset) => void;
  assets?: PoolAsset[];
  showSlider?: boolean;
  disableSelectAssets?: boolean;
  hiddenMax?: boolean;
};

const marks: SliderMarks = {
  0: '0%',
  25: '25%',
  50: '50%',
  75: '75%',
  100: '100%',
};

const MAX_DEFAULT = Number.MAX_SAFE_INTEGER;
const MAX_DECIMALS_DEFAULT = 8;

// eslint-disable-next-line react/display-name
const InputCurrency = forwardRef<HTMLInputElement, PositiveFloatNumInputProps>(
  (
    {
      disableSelectAssets = false,
      inputAmount,
      isDisabled = false,
      label = '',
      max = MAX_DEFAULT,
      maxDecimals = MAX_DECIMALS_DEFAULT,
      onInputChange = () => {},
      className,
      placeholder = '0.0000',
      asset,
      balance,
      keepApt,
      setAssetSelected,
      assets,
      showSlider = true,
      hiddenMax = false,
    },
    ref,
  ) => {
    const { allAssetsData } = useContext(AssetsContext);
    const inputRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => inputRef.current!);
    const [open, setOpen] = useState(false);

    useEffect(() => {
      onInputChange(0);
    }, [asset]);

    const handleMax = () => {
      if (asset?.token.symbol === 'APT' && keepApt) {
        onInputChange(Number(max - 0.01).toFixed(asset?.token.decimals));
      } else {
        onInputChange(max);
      }
    };

    const handleHalf = () => {
      const amount = max / 2;
      onInputChange(Number.isInteger(Number(amount)) ? amount : (Number(amount).toFixed(asset?.token.decimals) as any));
    };

    const onchangeSlider = (value: any) => {
      const amountSlider = Number((balance * value) / 100);
      const amount = Number.isInteger(amountSlider)
        ? amountSlider
        : (amountSlider.toFixed(asset?.token.decimals) as any);
      onInputChange(Number(amount));
    };

    const assetList = useMemo(() => {
      return assets && assets.length > 0 ? assets : allAssetsData;
    }, [assets, allAssetsData]);

    return (
      <>
        <Typography className={'mb-2'}>Amount</Typography>
        <div className={'bg-[#F3F5F8] py-2 px-5  rounded-[8px]'}>
          <div className={'flex items-center'}>
            <div>
              <NumericFormat
                className={`${className} input-format text-[#090909] text-start w-full text-3xl font-medium`}
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
            </div>
            <Popover
              onVisibleChange={(visible) => {
                if (!visible) {
                  setOpen(false);
                }
              }}
              open={open}
              overlayClassName={'popover-setting'}
              placement={'bottomRight'}
              trigger={['click']}
              content={
                <div className={''}>
                  <div className={'max-h-[300px] overflow-y-auto'}>
                    {assetList.map((item, index) => {
                      return (
                        <div
                          onClick={() => {
                            setAssetSelected?.(item);
                            setOpen(false);
                          }}
                          className={`${
                            asset?.poolAddress === item.poolAddress && 'bg-[#5c80ff0d]'
                          } hover:bg-[#5c80ff0d] flex cursor-pointer justify-between items-center min-w-[170px] p-4`}
                          key={index}
                        >
                          <div className={'flex items-center gap-2'}>
                            <div className={'w-[20px] h-[20px]'}>
                              <img
                                className={'w-[20px] h-[20px]'}
                                src={`https://image.meso.finance/${item?.token.symbol.toLowerCase()}.png`}
                                alt=""
                              />
                            </div>
                            <span className={'font-semibold text-[#313547] text-base'}>{item?.token.symbol}</span>
                          </div>
                          {asset?.poolAddress === item.poolAddress && (
                            <div>
                              <CheckIcon fill={'#7F56D9'} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              }
            >
              <div
                onClick={() => {
                  if (!disableSelectAssets) {
                    setOpen(true);
                  }
                }}
                className={`flex gap-2 bg-[#fff] py-2 ${
                  disableSelectAssets ? 'pl-3' : 'pl-5'
                } cursor-pointer pr-3 rounded-full items-center`}
              >
                <div className={'w-[20px] h-[20px]'}>
                  <img
                    className={'w-[20px] h-[20px]'}
                    src={`https://image.meso.finance/${asset?.token?.symbol.toLowerCase()}.png`}
                    alt=""
                  />
                </div>
                <span className={'font-semibold text-[#313547] text-base'}>{asset?.token?.symbol}</span>
                {!disableSelectAssets && <ChevronDown />}
              </div>
            </Popover>
          </div>
          <div className={'flex justify-between mt-2'}>
            <span>${formatNumberBalance(Number(asset?.token?.price) * Number(inputAmount), 2)}</span>
            {!hiddenMax && (
              <Typography className={'text-[#737b94]'}>
                {label}:{' '}
                {formatNumberBalance(
                  asset?.token?.symbol === 'APT' && keepApt ? (balance > 0.01 ? balance - 0.01 : 0) : balance,
                  4,
                )}{' '}
                {asset?.token?.symbol}
              </Typography>
            )}
          </div>
        </div>

        {!hiddenMax && (
          <div className={'flex justify-end mt-3'}>
            <div className={'flex gap-2 items-center'}>
              <Button
                onClick={handleHalf}
                className={'bg-transparent border-[#7F56D9] text-[#7F56D9] px-3 rounded-[4px]'}
                size={'small'}
              >
                half
              </Button>
              <Button
                onClick={handleMax}
                className={'bg-transparent border-[#7F56D9] text-[#7F56D9] px-3 rounded-[4px]'}
                size={'small'}
              >
                max
              </Button>
            </div>
          </div>
        )}
        {showSlider && (
          <div className={'mt-5'}>
            <Slider
              railStyle={{ background: '#DCDFEA' }}
              tooltip={{
                formatter: (value) => `${value}%`,
              }}
              value={(Number(inputAmount) / balance) * 100}
              marks={marks}
              onChange={onchangeSlider}
            />
          </div>
        )}
      </>
    );
  },
);

export default InputCurrency;
