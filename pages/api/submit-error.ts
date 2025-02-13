import { ENV, envNane } from '@/common/consts'
import { googleConfig } from '@/common/consts/google'
import { Network, Provider } from 'aptos'
import { google } from 'googleapis'
import type { NextApiRequest, NextApiResponse } from 'next'

type ErrorFrom = {
  url: string
  wallet: string
  error: string
}

export const authorize = async () => {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: googleConfig.client_email,
      private_key: googleConfig.private_key?.replace('/\\n', '/n'),
    },

    scopes: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/spreadsheets',
    ],
  })
}

const mainnetProvider = new Provider(Network.MAINNET)
const testnetProvider = new Provider(Network.TESTNET)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).send({ message: 'Only POST request are allowed' })
    }
    const body = req.body as ErrorFrom
    const auth = await authorize()

    let mainnetApt = 0
    let testnetApt = 0
    try {
      const resource: any = await mainnetProvider.getAccountResource(
        body.wallet,
        '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>',
      )
      const resourceData: any = resource.data
      mainnetApt = Number(resourceData.coin.value) / 10 ** 8 || 0
    } catch (e) {
      console.log(e)
    }

    try {
      const resource: any = await testnetProvider.getAccountResource(
        body.wallet,
        '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>',
      )
      const resourceData: any = resource.data
      testnetApt = Number(resourceData.coin.value) / 10 ** 8 || 0
    } catch (e) {
      console.log(e)
    }
    await addRow(auth, [body.wallet, body.url, testnetApt, mainnetApt, body.error, new Date().toUTCString()])
    return res.status(200).json({
      success: true,
    })
  } catch (e) {
    console.log('e', e)
    return res.status(500).send({ message: 'Something went wrong' })
  }
}

const addRow = async (auth: any, data: any) => {
  const RANGE = ENV === envNane.MAINNET ? 'MainnetErrors!A:F' : 'TestnetErrors!A:F'
  const sheets = google.sheets({ version: 'v4', auth })
  const values = [data]
  const resource = {
    values,
  }
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: googleConfig.google_sheet_id,
      range: RANGE,
      valueInputOption: 'USER_ENTERED',
      requestBody: resource,
    })
  } catch (error) {
    console.log(error)
  }
}
