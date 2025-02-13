import { Html, Head, Main, NextScript } from 'next/document'
const title = 'Meso Finance'
const description =
  'Meso Finance is an Open Source Protocol to create Non-Custodial Liquidity Markets to earn interest on supplying and borrowing assets with a variable or stable interest rate. The protocol is designed for easy integration into your products and services on Aptos.'
export default function Document() {
  return (
    <Html lang="en" suppressHydrationWarning={true}>
      <Head>
        <title>Meso Finance</title>
        <link rel="icon" href="/logo.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/logo.png" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css"
          integrity="sha512-KfkfwYDsLkIlwQp6LFnl8zNdLGxu9YAA1QvwINks4PhcElQSvqcyVLLD9aMhXd13uQjoXtEKNosOWaZqXgel0g=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin={''} />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap"
          rel="stylesheet"
        />
        <meta property="og:title" content={title} />
        <meta name="og:site_name" content={title} />

        <meta name="description" content={description} />
        <meta name="og:description" content={description} />
        <meta name="og:image:alt" content={description} />
        <meta property="og:image" content="https://meso.finance/logo.png" />
        <meta name="twitter:image" content="/logo.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/logo.png" />
        <meta name="og:url" content="https://meso.finance" />
        <meta name="twitter:card" content="summary" />
        <meta name="og:locale" content="en" />
        <meta name="og:type" content="article" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
