// import React from 'react'
// import { Card, Typography } from 'antd'
// import { StrategiesThread } from '@/common/components/Views/strategies/ StrategiesThread'
// import { StrategiesRowItem } from '@/common/components/Views/strategies/StrategiesRowItem'
// import { useStrategies } from '@/common/hooks/strategies/useStrategies'
// import { LoadingPage } from '@/common/components/LoadingAssets/LoadingPage'
// import { StrategiesMobile } from '@/common/components/Views/strategies/StrategiesMobile'

const Strategies: React.FunctionComponent = () => {
  // const { strategies, isLoading } = useStrategies()

  return (
    <></>
    // <>
    //   {isLoading && strategies.length === 0 && <LoadingPage />}
    //   {!isLoading && strategies.length > 0 && (
    //     <div className={'w-full px-3'}>
    //       <div className={'container max-w-[1536px] mt-10 sm:mt-20 mx-auto pb-40'}>
    //         <div>
    //           <Typography.Title className={'text-2xl text-center md:text-start'}>Strategies</Typography.Title>
    //           <Card
    //             bordered={false}
    //             className={'border hidden md:block overflow-x-auto border-[#E4E7EC]  bg-[#FCFCFD] mt-5 rounded-[16px]'}
    //           >
    //             <div className={' min-w-[1250px]  '}>
    //               <div>
    //                 <StrategiesThread />
    //                 {strategies.map((item, index) => {
    //                   return <StrategiesRowItem pair={item} key={index} />
    //                 })}
    //               </div>
    //             </div>
    //           </Card>
    //           <StrategiesMobile strategies={strategies} />
    //         </div>
    //       </div>
    //     </div>
    //   )}
    // </>
  )
}
export default Strategies
