import React, { useEffect, useMemo } from 'react'
import { Card, Slider, Typography } from 'antd'
import { InputCustom } from '@/common/components/InputCustom'
import { SliderMarks } from 'antd/es/slider'
import { MultiplyIcon } from '@/common/components/Icons'
import { MAX_BPS } from '@/common/consts'
import { formatNumberBalance, nFormatter } from '@/utils'
import cloneDeep from 'lodash.clonedeep'

interface Props {
  asset: PoolAsset
  setAssets: any
  assetsSelected: PoolAsset[]
  userEMode: string
  tokens: Token[]
  setTokens: (val: Token[]) => void
}

export const CalculatorBox: React.FunctionComponent<Props> = ({
  asset,
  setAssets,
  assetsSelected,
  userEMode,
  tokens,
  setTokens,
}) => {
  const [amount, setAmount] = React.useState(0)
  const [price, setPrice] = React.useState(0)

  useEffect(() => {
    const token = tokens.find((x) => x.address === asset.token.address)
    setPrice(token?.priceChange ?? 0)
  }, [tokens])

  const onchangeSlider = (value: any) => {
    const updatedAmount = tokens.map((x) => {
      if (x.address === asset.token.address) {
        return { ...x, priceChange: asset.token.price * (value / 100) }
      } else {
        return x
      }
    })
    const tokensCopy = cloneDeep(updatedAmount)
    setTokens([...tokensCopy])
    setPrice((asset.token.price * value) / 100)
  }

  const handleRemoveAsset = () => {
    setAssets((prev: any) => prev.filter((item: any) => item.token.symbol !== asset.token.symbol))
  }

  const marks: SliderMarks = useMemo(() => {
    return {
      0: `0`,
      50: `${nFormatter((Number(asset.token.price) * 50) / 100)}`,
      100: `${nFormatter((Number(asset.token.price) * 100) / 100)}`,
      150: `${nFormatter((Number(asset.token.price) * 150) / 100)}`,
      200: `${nFormatter((Number(asset.token.price) * 200) / 100)}`,
    }
  }, [asset])

  return (
    <Card
      bordered={false}
      className={
        'border-[1px] hover:border-[2px] border-[#DCDFEA] asset-calculator-box rounded-[16px] bg-[#F9F9FB] hover:border-[#7F56D9] transition'
      }
    >
      <div onClick={handleRemoveAsset} className={'close-icon hidden cursor-pointer'}>
        <div
          className={
            'w-[20px] h-[20px] absolute -right-1 -top-2  flex items-center justify-center bg-[#FFF] border border-[#DCDFEA] rounded-full'
          }
        >
          <MultiplyIcon />
        </div>
      </div>

      <div className={'rounded-[12px] calculate-box bg-transparent p-3'}>
        <div className={'flex flex-col sm:flex-row items-center gap-4 sm:gap-3 calculate-item'}>
          <div className={'input-calculator border flex-1 w-full border-[#F9F9FB] rounded-[12px]'}>
            <InputCustom
              max={1000000000}
              inputAmount={asset.amountChange ? Number(asset.amountChange ?? 0).toString() : ''}
              onInputChange={(value) => {
                setAmount(value)
                const updatedAmount = assetsSelected.map((x) => {
                  if (x._id === asset._id) {
                    return { ...x, amountChange: value ? value : 0 }
                  } else {
                    return x
                  }
                })
                const assetsCopy = cloneDeep(updatedAmount)
                setAssets([...assetsCopy])
              }}
              className={'font-semibold text-xl h-12 text-[#313547] px-0'}
            />
          </div>
          <div className={'min-w-[220px] w-full sm:w-auto flex items-center justify-between sm:justify-end gap-2'}>
            <div className={'flex items-center gap-2'}>
              <div className={'text-[#515D86] text-sm'}>${nFormatter((amount ?? 0) * asset.token.price)}</div>
              <div className={'w-[1px] h-[12px] bg-[#C0CAED]'}></div>
              <div
                className={`${userEMode && userEMode === asset.emodeId ? 'text-[#7F56D9]' : 'text-[#515D86]'} text-sm font-medium`}
              >
                LTV: {((userEMode && userEMode === asset.emodeId ? asset.emodeBps : asset?.normaBps) / MAX_BPS) * 100}%
              </div>
            </div>
            <div className={'flex items-center gap-2'}>
              <img
                className={'w-[24px] rounded-full'}
                src={`https://image.meso.finance/${asset?.token?.symbol.toLowerCase()}.png`}
                alt={''}
              />
              <Typography className={'font-semibold'}>{asset?.token.symbol}</Typography>
            </div>
          </div>
        </div>
        <div className={'mt-4 flex gap-10'}>
          <div className={'flex-1'}>
            <div className={'text-[#515D86] font-medium'}>
              Price: <span className={'text-[#101828] font-medium'}>${formatNumberBalance(price)}</span>{' '}
            </div>
            <div className={'flex items-center w-full'}>
              <div className={'flex-1'}>
                <Slider
                  max={200}
                  className={'mt-1 mb-5'}
                  railStyle={{ background: '#DCDFEA' }}
                  tooltip={{
                    formatter: (value) => {
                      return `$${formatNumberBalance((asset.token.price * Number(value)) / 100, 4)}`
                    },
                  }}
                  value={Number(price / asset.token.price) * 100}
                  marks={marks}
                  onChange={onchangeSlider}
                />
              </div>
            </div>
          </div>
          {/*<div*/}
          {/*  className={*/}
          {/*    'w-[70px] flex items-center justify-center p-2 text-[#313547] border border-[#DCDFEA] font-medium text-base rounded-[16px] bg-[#FFF]'*/}
          {/*  }*/}
          {/*>*/}
          {/*  <span className={'text-base'}>$</span>*/}
          {/*  <InputCustom*/}
          {/*    max={asset.token.price * 2}*/}
          {/*    placeholder={'0'}*/}
          {/*    inputAmount={price === 0 ? '' : price.toString()}*/}
          {/*    className={'font-semibold text-start placeholder:text-[#313547] text-base px-0'}*/}
          {/*    onInputChange={(value) => {*/}
          {/*      setPrice(Number(value ?? 0))*/}
          {/*      const updatedAmount = tokens.map((x) => {*/}
          {/*        if (x.address === asset.token.address) {*/}
          {/*          return { ...x, priceChange: value ? value : 0 }*/}
          {/*        } else {*/}
          {/*          return x*/}
          {/*        }*/}
          {/*      })*/}
          {/*      const tokensCopy = cloneDeep(updatedAmount)*/}
          {/*      setTokens([...tokensCopy])*/}
          {/*    }}*/}
          {/*  />*/}
          {/*</div>*/}
        </div>
      </div>
    </Card>
  )
}
