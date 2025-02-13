import React from 'react'
import { Button, Typography } from 'antd'
import { LeftToRightIcon } from '@/common/components/Icons'
import { useDispatch, useSelector } from 'react-redux'
import appActions from '@/modules/app/actions'
import { setHiddenTimeTutorialCalculator } from '@/utils'

export const StepCalculator: React.FunctionComponent = () => {
  const app = useSelector((state: any) => state.app)
  const dispatch = useDispatch()

  const handleSkip = () => {
    dispatch(appActions.SET_STEP_CALCULATOR(0))
    setHiddenTimeTutorialCalculator()
  }

  const handleNextStep = () => {
    if (app.stepCalculator === 4) {
      dispatch(appActions.SET_STEP_CALCULATOR(0))
      setHiddenTimeTutorialCalculator()
    } else {
      dispatch(appActions.SET_STEP_CALCULATOR(app.stepCalculator + 1))
    }
  }

  return (
    <div className={'max-w-[420px] text-start bg-[#fff] border border-[#E4E7EC] rounded-[16px] p-5'}>
      <Typography className={'text-[#7F56D9]'}>
        {app.stepCalculator === 1 && 'Step 1'}
        {app.stepCalculator === 2 && 'Step 2'}
        {app.stepCalculator === 3 && 'Step 3'}
        {app.stepCalculator === 4 && 'Step 4'}
      </Typography>
      <div className={'text-[#101828] text-lg font-semibold mt-3'}>
        {app.stepCalculator === 1 && 'Add collateral assets'}
        {app.stepCalculator === 2 && 'Add borrowed assets'}
        {app.stepCalculator === 3 && 'Slide to change the Collateral Price'}
        {app.stepCalculator === 4 && 'Check the result'}
      </div>
      <div className={'text-[#667085]'}>
        {app.stepCalculator === 1 &&
          'Select the type of asset you’ve supplied as collateral and enter its current value.'}
        {app.stepCalculator === 2 && 'Choose the asset you’ve borrowed and input the total borrowed amount.'}
        {app.stepCalculator === 3 &&
          'Drag the bar to adjust the price of your collateral asset, and watch how it affects your liquidation position.'}
        {app.stepCalculator === 4 &&
          'The analytics shows the liquidation price and threshold update in real time, allowing you to visualize your position at varying collateral prices.'}
      </div>
      <div className={'flex justify-between mt-5 gap-4 items-center'}>
        <div className={'flex gap-2 '}>
          <div
            className={`${app.stepCalculator >= 1 ? 'bg-[#7F56D9]' : 'bg-[#E4E7EC]'}  rounded-full w-[40px] h-[3px]`}
          ></div>
          <div
            className={`${app.stepCalculator >= 2 ? 'bg-[#7F56D9]' : 'bg-[#E4E7EC]'} rounded-full w-[40px] h-[3px]`}
          ></div>
          <div
            className={`${app.stepCalculator >= 3 ? 'bg-[#7F56D9]' : 'bg-[#E4E7EC]'} rounded-full w-[40px] h-[3px]`}
          ></div>
          <div
            className={`${app.stepCalculator >= 4 ? 'bg-[#7F56D9]' : 'bg-[#E4E7EC]'} rounded-full w-[40px] h-[3px]`}
          ></div>
        </div>
        {app.stepCalculator === 4 ? (
          <Button
            onClick={handleSkip}
            className={'bg-[#7F56D9] flex items-center gap-2 border-0 text-[#fff] rounded-full'}
          >
            Let’s get started
          </Button>
        ) : (
          <div className={'flex gap-3'}>
            <Button onClick={handleSkip} className={'rounded-full'}>
              Skip
            </Button>
            <Button
              onClick={handleNextStep}
              className={'bg-[#7F56D9] flex items-center gap-2 border-0 text-[#fff] rounded-full'}
            >
              Next step <LeftToRightIcon fill={'#fff'} />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
