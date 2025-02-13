import React, { useContext, useEffect, useRef, useState } from 'react'
import { Button, Col, Row, Typography } from 'antd'
import { AssetsCalculatorBox } from '@/common/components/AssetsCalculatorBox'
import { CalculatorPositionBox } from '@/common/components/Views/calculators/CalculatorPositionBox'
import { LiquidatePositionChart } from '@/common/components/Views/calculators/LiquidatePositionChart'
import { useModal } from '@/common/hooks/useModal'
import { ModalCalculatorEmode } from '@/common/components/Modals/points/ModalCalculatorEmode'
import { AssetsContext } from '@/common/context'
import { useAssets } from '@/common/hooks/assets/useAssets'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import appActions from '@/modules/app/actions'
import { useDispatch, useSelector } from 'react-redux'
import useUser from '@/common/hooks/useUser'
import Image from 'next/image'
import { StepCalculator } from '@/common/components/Views/calculators/StepCalculator'
import { getData } from '@/common/hooks/useLocalStoragre'
import { getDiff } from '@/utils'
import { isMobile } from 'react-device-detect'

export enum ASSETS_MODE {
  SUPPLY,
  BORROW,
}

const Page: React.FunctionComponent = () => {
  const { allAssetsData } = useContext(AssetsContext)
  const [supplyAssets, setSupplyAssets] = React.useState<PoolAsset[]>([])
  const [borrowAssets, setBorrowAssets] = React.useState<PoolAsset[]>([])
  const [tokens, setTokens] = React.useState<Token[]>([])
  const [userEMode, setUserEMode] = useState<string>('')
  const { show, setShow, toggle } = useModal()
  const { userEMode: emodePosition } = useUser()
  const app = useSelector((state: any) => state.app)

  const { assetDebts, assetDeposits, isFetchingDeposits, isFetchingDebt } = useAssets()
  const { connected } = useWallet()
  const dispatch = useDispatch()
  const guideRef = useRef<any>(null)

  const loadingMyPosition = isFetchingDeposits || isFetchingDebt

  useEffect(() => {
    const time = Number(getData('hiddeGuideTime'))
    if (getDiff(time * 1000) < 0 && !isMobile) {
      dispatch(appActions.SET_STEP_CALCULATOR(1))
    }
  }, [])

  useEffect(() => {
    if (app.stepCalculator > 0) {
      guideRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [app, guideRef])

  const setTokenDefault = () => {
    const data = []
    for (const item of allAssetsData) {
      data.push({ ...item.token, priceChange: item.token.price })
    }
    setTokens(data)
  }

  useEffect(() => {
    setTokenDefault()
  }, [allAssetsData])

  useEffect(() => {
    if (userEMode) {
      const data = borrowAssets.filter((x) => x.emodeId === userEMode)
      setBorrowAssets(data)
    }
  }, [userEMode])

  const handleAddMyPosition = () => {
    if (!connected) {
      dispatch(appActions.SET_SHOW_CONNECT(true))
      return
    }
    setTokenDefault()
    setUserEMode(emodePosition)
    const userDeposits = []
    const userBorrows = []
    for (const item of assetDeposits) {
      userDeposits.push({ ...item, amountChange: item.amountDeposit })
    }
    for (const item of assetDebts) {
      userBorrows.push({ ...item, amountChange: item.debtAmount })
    }
    setSupplyAssets(userDeposits)
    setBorrowAssets(userBorrows)
  }

  return (
    <>
      {app.stepCalculator > 0 && (
        <div
          className={'backdrop-blur-[4px] top-0 absolute w-full h-full z-50'}
          style={{ background: 'rgba(0, 0, 0, 0.20)' }}
        ></div>
      )}
      <div className={'container calculator-page max-w-[1536px] mt-10 sm:mt-20 mx-auto pb-40 px-3'}>
        <div>
          <div className={'flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between'}>
            <Typography className={'text-[#30374F] text-2xl font-semibold'}>Liquidation Calculator</Typography>
            <Button
              disabled={loadingMyPosition}
              loading={loadingMyPosition}
              onClick={handleAddMyPosition}
              className={'bg-[#7F56D9] border-0 rounded-full font-medium h-10 text-[#fff]'}
            >
              Load my position
            </Button>
          </div>
          <Row ref={guideRef} className={'mt-6 relative flex flex-col-reverse md:flex-row'} gutter={[16, 16]}>
            {app.stepCalculator === 3 && (
              <Row className={'h-full absolute top-0 w-full z-[100]'} gutter={[16, 16]}>
                <Col className={'relative'} xs={24} sm={12} md={24} xl={8}>
                  <Image className={'w-full h-auto'} src={require('@/common/assets/images/collateral.png')} alt={''} />
                  {app.stepCalculator == 3 && (
                    <div className={'absolute right-[-440px] bottom-[50%] translate-y-2/4'}>
                      <StepCalculator />
                    </div>
                  )}
                </Col>
              </Row>
            )}
            <Col sm={24} xl={16}>
              <Row className={'h-full'} gutter={[16, 16]}>
                <Col xs={24} sm={12} md={12} xl={12}>
                  <AssetsCalculatorBox
                    mode={ASSETS_MODE.SUPPLY}
                    assetsSelected={supplyAssets}
                    setAssets={setSupplyAssets}
                    label={'Collateral Assets'}
                    balanceColor={'#0BA5EC'}
                    descriptionNoAssets={'Add your collateral assets'}
                    userEMode={userEMode}
                    tokens={tokens}
                    setTokens={setTokens}
                  />
                </Col>
                <Col xs={24} sm={12} md={12} xl={12}>
                  <AssetsCalculatorBox
                    mode={ASSETS_MODE.BORROW}
                    assetsSelected={borrowAssets}
                    setAssets={setBorrowAssets}
                    label={'Borrowing Assets'}
                    balanceColor={'#FD853A'}
                    descriptionNoAssets={'Add your borrow assets'}
                    userEMode={userEMode}
                    tokens={tokens}
                    setTokens={setTokens}
                  />
                </Col>
              </Row>
            </Col>
            <Col className={'space-y-4'} xs={24} sm={12} md={24} xl={8}>
              <Row className={'relative'} gutter={[16, 16]}>
                {app.stepCalculator === 4 && (
                  <div className={'absolute left-[-440px] bottom-[50%] z-[100] translate-y-2/4'}>
                    <StepCalculator />
                  </div>
                )}
                <Col xs={24} md={12} xl={24}>
                  <CalculatorPositionBox
                    tokens={tokens}
                    supplyAssets={supplyAssets}
                    borrowAssets={borrowAssets}
                    setShow={setShow}
                    userEMode={userEMode}
                  />
                </Col>
                <Col xs={24} md={12} xl={24}>
                  <LiquidatePositionChart
                    supplyAssets={supplyAssets}
                    borrowAssets={borrowAssets}
                    userEMode={userEMode}
                    tokens={tokens}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
        </div>
        <ModalCalculatorEmode
          isModalOpen={!!show}
          handleClose={toggle}
          userEMode={userEMode}
          setUserEMode={setUserEMode}
        />
      </div>
    </>
  )
}
export default Page
