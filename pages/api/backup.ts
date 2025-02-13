import path from 'path'
import fs from 'fs'
import type { NextApiRequest, NextApiResponse } from 'next'

import { config } from '@/common/consts'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).send({ message: 'Only POST request are allowed' })
    }
    const filePath = path.resolve('./public', 'data', 'pools.json')
    const resData = await fetch(`${config.API_ENDPOINT_URL}/api/v1/pool`)
    const poolData = await resData.json()
    fs.writeFile(filePath, JSON.stringify(poolData), (err) => {
      if (err) console.log('Error writing file:', err)
    })
    return res.status(200).json({
      success: true,
    })
  } catch (e) {
    console.log('e', e)
    return res.status(500).send({ message: 'Something went wrong' })
  }
}
