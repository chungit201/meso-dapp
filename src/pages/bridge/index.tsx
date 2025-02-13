import { wormholeConnectHosted } from '@wormhole-foundation/wormhole-connect'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { Card } from 'antd'

// Existing DOM element where you want to mount Connect

const Page = () => {
  const router = useRouter()

  useEffect(() => {
    const container: any = document.getElementById('bridge-container')
    if (container) {+
      wormholeConnectHosted(container, {
        theme: {
          mode: 'light',
          primary: '#7F56D9',
          input: '#F3F5F8',
        },
      })
    }
  }, [router])

  return (
    <div className={'flex justify-center w-full pb-20'}>
      <div className={'flex justify-center w-full mt-20 pb-20'}>
        <Card className={'bg-[#fff] p-4 rounded-[12px]'}>
          <div id="bridge-container" className={''}></div>
        </Card>
      </div>
    </div>
  )
}

export default Page
