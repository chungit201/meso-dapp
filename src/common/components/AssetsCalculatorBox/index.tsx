import React, { useMemo } from 'react'
import { Button, Card, Typography } from 'antd'
import { CalculatorBox } from '@/common/components/AssetsCalculatorBox/CalculatorBox'
import { BarVector, PlusIcon, ReloadIcon } from '@/common/components/Icons'
import { ModalSelectAssets } from '@/common/components/Modals/ModalSelectAssets'
import { useModal } from '@/common/hooks/useModal'
import { nFormatter } from '@/utils'
import { ASSETS_MODE } from '@/pages/calculator'
import { StepCalculator } from '@/common/components/Views/calculators/StepCalculator'
import { useSelector } from 'react-redux'

interface Props {
  mode?: ASSETS_MODE
  balanceColor?: string
  label?: string
  setAssets: React.Dispatch<PoolAsset[]>
  assetsSelected: PoolAsset[]
  descriptionNoAssets?: string
  userEMode: string
  tokens: Token[]
  setTokens: (val: Token[]) => void
}

export const AssetsCalculatorBox: React.FunctionComponent<Props> = ({
  mode = ASSETS_MODE.SUPPLY,
  balanceColor = '#0BA5EC',
  label = 'Collateral Assets',
  setAssets,
  assetsSelected,
  descriptionNoAssets = 'Add your collateral assets',
  userEMode = '',
  tokens,
  setTokens,
}) => {
  const { show, setShow, toggle } = useModal()
  const app = useSelector((state: any) => state.app)

  const handReset = () => {
    setAssets([])
  }

  const totalCollateralBalance = useMemo(() => {
    let total = 0

    for (const item of assetsSelected) {
      const tokenPrice = tokens.find((x) => x.address === item.token.address)?.priceChange ?? 0
      total += tokenPrice * (item.amountChange ?? 0)
    }
    return total
  }, [assetsSelected, tokens])

  return (
    <Card bordered={false} className={'bg-[#FFF] h-full border border-[#EFF1F5] rounded-[16px]'}>
      <div className={'flex gap-2 absolute right-5 top-4'}>
        <Button
          onClick={handReset}
          style={{ boxShadow: '0px 1px 2px 0px rgba(16, 24, 40, 0.05)' }}
          className={
            'w-[30px] flex items-center justify-center h-[30px] border border-[#D0D5DD] bg-[#FFF] p-0 rounded-[8px]'
          }
        >
          <ReloadIcon />
        </Button>
        <Button
          onClick={() => setShow(true)}
          style={{ boxShadow: '0px 1px 2px 0px rgba(16, 24, 40, 0.05)' }}
          className={
            'w-[30px] flex items-center justify-center h-[30px] border border-[#D0D5DD] bg-[#FFF] p-0 rounded-[8px]'
          }
        >
          <PlusIcon />
        </Button>
      </div>
      <div className={'p-5 border-b border-[#EFF1F5]'}>
        <Typography className={'text-center font-medium text-[#475467]'}>{label}</Typography>
        <div style={{ color: balanceColor }} className={'text-center mt-3 font-semibold text-2xl'}>
          ${nFormatter(totalCollateralBalance)}
        </div>
      </div>
      <div className={'flex items-center justify-center '}>
        {assetsSelected.length > 0 && (
          <div
            className={
              'min-h-[410px] sm:min-h-[610px] space-y-4 p-3 sm:p-4 max-h-[410px] sm:max-h-[610px] overflow-y-auto w-full'
            }
          >
            {assetsSelected.map((item, index) => {
              return (
                <CalculatorBox
                  key={`${index}-${mode}`}
                  asset={item}
                  assetsSelected={assetsSelected}
                  setAssets={setAssets}
                  userEMode={userEMode}
                  tokens={tokens}
                  setTokens={setTokens}
                />
              )
            })}
          </div>
        )}
        {assetsSelected.length === 0 && (
          <div
            className={
              'flex items-center justify-center min-h-[410px] sm:min-h-[610px] space-y-4 p-4 max-h-[410px] sm:max-h-[610px] '
            }
          >
            <div
              style={{
                boxShadow:
                  app.stepCalculator > 0 ? '0px 1px 2px 0px rgba(16, 24, 40, 0.05), 0px 0px 0px 4px #F2F4F7' : 'none',
              }}
              className={`text-center bg-[#FFF] relative ${app.stepCalculator === 2 && mode === ASSETS_MODE.BORROW && 'z-[100]'} ${app.stepCalculator === 1 && mode === ASSETS_MODE.SUPPLY && 'z-[100]'} p-4 rounded-[24px]`}
            >
              {app.stepCalculator == 1 && mode === ASSETS_MODE.SUPPLY && (
                <div className={'absolute right-[-440px] -bottom-14'}>
                  <StepCalculator />
                </div>
              )}
              {app.stepCalculator == 2 && mode === ASSETS_MODE.BORROW && (
                <div className={'absolute right-[-440px] -bottom-14'}>
                  <StepCalculator />
                </div>
              )}
              <div className={'flex justify-center'}>
                <BarVector />
              </div>
              <Typography className={'text-lg font-medium mt-5'}>Let’s get started</Typography>
              <div className={'mt-1'}>{descriptionNoAssets}</div>
              <div className={'flex justify-center mt-5'}>
                <Button
                  disabled={app.stepCalculator > 0}
                  onClick={() => setShow(true)}
                  className={'flex text-[#344054] border-[#D0D5DD] h-9 items-center font-semibold rounded-full'}
                >
                  <PlusIcon /> Add assets
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      <ModalSelectAssets
        mode={mode}
        userEMode={userEMode}
        assetsSelected={assetsSelected}
        setAssets={setAssets}
        isModalOpen={!!show}
        handleClose={toggle}
      />
    </Card>
  )
}
