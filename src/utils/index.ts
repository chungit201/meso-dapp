import { Wallet } from '@aptos-labs/wallet-adapter-react'
import { isIOS, isMobile } from 'react-device-detect'
import moment from 'moment'
import { setData } from '@/common/hooks/useLocalStoragre'

enum WalletName {
  Petra = 'Petra',
  Pontem = 'Pontem',
  Martian = 'Martian',
  Fewcha = 'Fewcha',
  RiseWallet = 'Rise Wallet',
  OKXWallet = 'OKX Wallet',
  Bitget = 'Bitget',
}

export function ellipseAddress(address: string = '', width: number = 10): string {
  return `${String(address).slice(0, width)}...${String(address).slice(-width)}`
}

export const deepLinkMobile = (wallet: Wallet) => {
  const ua = navigator.userAgent
  const check = /OKApp/i.test(ua)
  const oKxUrl =
    'https://www.okx.com/download?deeplink=' +
    encodeURIComponent('okx://wallet/dapp/url?dappUrl=' + encodeURIComponent(location.href))

  switch (wallet.name) {
    case WalletName.Petra:
      window.location.replace('https://petra.app/explore?link=https://testnet.meso.finance')
      setTimeout(function () {
        window.location.replace(
          isIOS ? 'https://itunes.apple.com/app/id12345678' : 'https://apps.apple.com/us/app/petra-wallet/id6446259840',
        )
      }, 2000)
      break
    case WalletName.Pontem:
      window.location.replace(
        isIOS
          ? 'https://apps.apple.com/us/app/pontem-defi-wallet-for-aptos/id1643525786'
          : 'https://play.google.com/store/apps/details?id=com.pontemmobilewallet',
      )
      break
    case WalletName.RiseWallet:
      window.location.replace(
        isIOS
          ? 'https://apps.apple.com/us/app/rise-aptos-wallet/id6444621713'
          : 'https://play.google.com/store/apps/details?id=com.risewallet.mobile',
      )
      break
    case WalletName.Bitget:
      window.location.replace(
        isIOS
          ? 'https://apps.apple.com/us/app/bitget-wallet-ex-bitkeep/id1395301115'
          : 'https://play.google.com/store/apps/details?id=com.bitkeep.wallet',
      )
      break
    case WalletName.OKXWallet:
      if (isMobile && !check) {
        window.location.href = oKxUrl
      }
      break
    default:
      window.location.replace('https://petra.app/explore?link=https://testnet.meso.finance')
      setTimeout(function () {
        window.location.replace(
          isIOS ? 'https://itunes.apple.com/app/id12345678' : 'https://apps.apple.com/us/app/petra-wallet/id6446259840',
        )
      }, 2000)
      break
  }
}

const getDecimalPartAsString = (num: number) => {
  return num.toString().split('.')[1] || '0'
}

export const formatNumberBalance = (number: number | string = '0', infractionDigit: number = 4) => {
  let formatPrice = ''
  if (Number(number) > 0 && Number(number) < 0.0001) {
    formatPrice = '<0.0001'
  } else if (Number(number) > 0 && Number(number) < 0.001) {
    formatPrice = '<0.001'
  } else if (Number(number) === 0) {
    formatPrice = '0.00'
  } else if (isNaN(Number(number))) {
    formatPrice = '0.00'
  } else if (Number(number) < 0.000001) {
    formatPrice = '< 0.0001'
  } else {
    if (Number.isInteger(Number(number))) {
      formatPrice = Number(Number(number)).toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
      return formatPrice
    }
    const indexOf = String(number).indexOf('.') || -1
    const newNumber = Number(String(number).slice(0, indexOf + infractionDigit + 1))
    const numDecimalPart = getDecimalPartAsString(newNumber)
    formatPrice = Number(Number(newNumber)).toLocaleString('en-US', {
      minimumFractionDigits:
        numDecimalPart.toString().length > infractionDigit ? infractionDigit : numDecimalPart.length,
      maximumFractionDigits:
        numDecimalPart.toString().length > infractionDigit ? infractionDigit : numDecimalPart.length,
    })
  }
  return formatPrice
}

export const formatNumber = (number: number = 0, infractionDigit: number = 2) => {
  let formatPrice = ''
  if (Number(number) > 0 && Number(number) < 0.01) {
    formatPrice = '< 0.01'
  } else if (Number(number) === 0) {
    formatPrice = '0.00'
  } else if (isNaN(Number(number))) {
    formatPrice = '0.00'
  } else {
    formatPrice = roundDown(number, infractionDigit).toLocaleString('en-US') as any
  }
  return formatPrice
}

export function roundDown(number: number, decimals: number) {
  decimals = decimals || 0
  return Math.floor(number * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

export const avatarDefault =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4IDgiIHNoYXBlLXJlbmRlcmluZz0ib3B0aW1pemVTcGVlZCIgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0Ij48cGF0aCBmaWxsPSJoc2woMjggOTQlIDU0JSkiIGQ9Ik0wLDBIOFY4SDB6Ii8+PHBhdGggZmlsbD0iaHNsKDE3OSA4NSUgNDklKSIgZD0iTTAsMGgxdjFoLTF6TTcsMGgxdjFoLTF6TTEsMGgxdjFoLTF6TTYsMGgxdjFoLTF6TTIsMGgxdjFoLTF6TTUsMGgxdjFoLTF6TTEsMWgxdjFoLTF6TTYsMWgxdjFoLTF6TTEsMmgxdjFoLTF6TTYsMmgxdjFoLTF6TTIsMmgxdjFoLTF6TTUsMmgxdjFoLTF6TTMsMmgxdjFoLTF6TTQsMmgxdjFoLTF6TTAsM2gxdjFoLTF6TTcsM2gxdjFoLTF6TTEsM2gxdjFoLTF6TTYsM2gxdjFoLTF6TTIsM2gxdjFoLTF6TTUsM2gxdjFoLTF6TTIsNWgxdjFoLTF6TTUsNWgxdjFoLTF6TTIsNmgxdjFoLTF6TTUsNmgxdjFoLTF6TTMsN2gxdjFoLTF6TTQsN2gxdjFoLTF6Ii8+PHBhdGggZmlsbD0iaHNsKDI3MCA0NSUgNzAlKSIgZD0iTTAsMWgxdjFoLTF6TTcsMWgxdjFoLTF6TTMsMWgxdjFoLTF6TTQsMWgxdjFoLTF6TTMsM2gxdjFoLTF6TTQsM2gxdjFoLTF6TTEsNGgxdjFoLTF6TTYsNGgxdjFoLTF6TTAsNWgxdjFoLTF6TTcsNWgxdjFoLTF6TTEsNmgxdjFoLTF6TTYsNmgxdjFoLTF6TTAsN2gxdjFoLTF6TTcsN2gxdjFoLTF6Ii8+PC9zdmc+'

export const getPoolInfo = (data: Array<any>, poolData: PoolAsset, index: number) => {
  let pool = {} as PoolAsset
  pool = { ...poolData }
  pool.totalDebt = parseInt(data[index].state.total_debt)
  pool.totalReserves = parseInt(data[index].state.total_reserves)
  pool.poolSupply =
    parseInt(data[index].state.total_debt) +
    parseInt(data[index].state.total_reserves) -
    parseInt(data[index].state.total_fees)

  return pool
}

const numberFormat = (formatPrice: number, fractionDigits = 2) => {
  if (formatPrice < 1e3) return formatPrice.toFixed(fractionDigits)
  if (formatPrice >= 1e3 && formatPrice < 1e6) return +(formatPrice / 1e3).toFixed(fractionDigits) + 'K'
  if (formatPrice >= 1e6 && formatPrice < 1e9) return +(formatPrice / 1e6).toFixed(fractionDigits) + 'M'
  if (formatPrice >= 1e9 && formatPrice < 1e12) return +(formatPrice / 1e9).toFixed(fractionDigits) + 'B'
  if (formatPrice >= 1e12) return +(formatPrice / 1e12).toFixed(fractionDigits) + 'T'
}

export const nFormatter = (n: number, fractionDigits = 2) => {
  if (Number.isInteger(Number(n))) {
    if (n > 1000) {
      return numberFormat(n, 2)
    } else {
      return numberFormat(n, fractionDigits)
    }
  } else {
    return numberFormat(n, fractionDigits)
  }
}

export function isINT(value: number) {
  return Number.isInteger(value) && value >= 0
}

export const getRiskFactorColor = (riskFactor: number) => {
  return riskFactor < 80 ? '#52A2FF' : riskFactor > 90 ? '#F04438' : riskFactor > 80 ? '#DC6803' : '#52A2FF'
}

export const getDiff = (withdrawTime: any) => {
  return moment(parseInt(withdrawTime)).diff(Date.now())
}

export const copyToClipboard = (text: string) => {
  const textField = document.createElement('textarea')
  textField.innerText = text
  document.body.appendChild(textField)
  textField.select()
  document.execCommand('copy')
  textField.remove()
}

export const avatarImage =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4IDgiIHNoYXBlLXJlbmRlcmluZz0ib3B0aW1pemVTcGVlZCIgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0Ij48cGF0aCBmaWxsPSJoc2woMjggOTQlIDU0JSkiIGQ9Ik0wLDBIOFY4SDB6Ii8+PHBhdGggZmlsbD0iaHNsKDE3OSA4NSUgNDklKSIgZD0iTTAsMGgxdjFoLTF6TTcsMGgxdjFoLTF6TTEsMGgxdjFoLTF6TTYsMGgxdjFoLTF6TTIsMGgxdjFoLTF6TTUsMGgxdjFoLTF6TTEsMWgxdjFoLTF6TTYsMWgxdjFoLTF6TTEsMmgxdjFoLTF6TTYsMmgxdjFoLTF6TTIsMmgxdjFoLTF6TTUsMmgxdjFoLTF6TTMsMmgxdjFoLTF6TTQsMmgxdjFoLTF6TTAsM2gxdjFoLTF6TTcsM2gxdjFoLTF6TTEsM2gxdjFoLTF6TTYsM2gxdjFoLTF6TTIsM2gxdjFoLTF6TTUsM2gxdjFoLTF6TTIsNWgxdjFoLTF6TTUsNWgxdjFoLTF6TTIsNmgxdjFoLTF6TTUsNmgxdjFoLTF6TTMsN2gxdjFoLTF6TTQsN2gxdjFoLTF6Ii8+PHBhdGggZmlsbD0iaHNsKDI3MCA0NSUgNzAlKSIgZD0iTTAsMWgxdjFoLTF6TTcsMWgxdjFoLTF6TTMsMWgxdjFoLTF6TTQsMWgxdjFoLTF6TTMsM2gxdjFoLTF6TTQsM2gxdjFoLTF6TTEsNGgxdjFoLTF6TTYsNGgxdjFoLTF6TTAsNWgxdjFoLTF6TTcsNWgxdjFoLTF6TTEsNmgxdjFoLTF6TTYsNmgxdjFoLTF6TTAsN2gxdjFoLTF6TTcsN2gxdjFoLTF6Ii8+PC9zdmc+'

export const isAddress = (address: string) => {
  return address.length >= 66
}

export const paginate = (items: any[], page = 1, perPage = 10) => {
  const offset = perPage * (page - 1)
  const totalPages = Math.ceil(items.length / perPage)
  const paginatedItems = items.slice(offset, perPage * page)

  return {
    previousPage: page - 1 ? page - 1 : null,
    nextPage: totalPages > page ? page + 1 : null,
    total: items.length,
    totalPages,
    items: paginatedItems,
  }
}

export const setHiddenTimeTutorialCalculator = () => {
  setData('hiddeGuideTime', moment().add(14, 'days').format('X'))
}

export const setHiddenTimePopupTether = () => {
  setData('hiddePopupTether', moment().add(3, 'days').format('X'))
}

export const setHiddenTimeBannerTether = () => {
  setData('hiddenTimeBannerTether', moment().add(3, 'days').format('X'))
}

// function* chunks(array: any, n: any) {
//   for (let i = 0; i < array.length; i += n) yield array.slice(i, i + n)
// }

export const insert = (arr: any[], index: number, newItem: any) => [
  // part of the array before the specified index
  ...arr.slice(0, index),
  // inserted item
  newItem,
  // part of the array after the specified index
  ...arr.slice(index),
]
