import path from 'path'
import fs from 'fs'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).send({ message: 'Only POST request are allowed' })
    }
    const filePath = path.resolve('./public', 'data', 'pools.json')
    const data = JSON.parse(fs.readFileSync(filePath) as any) ?? []
    return res.status(200).json({
      success: true,
      data,
    })
  } catch (e) {
    console.log('e', e)
    return res.status(500).send({ message: 'Something went wrong' })
  }
}
