import { createClient } from '@supabase/supabase-js'
import type { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'

type Chart = {
  id: number
  img_name: string
  name: string
  repo: string
  tweet: string
}

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

// https://supabase.com/docs/reference/javascript/generating-types#usage-with-typescript
// https://nextjs.org/learn/excel/typescript/nextjs-types
export const getStaticPaths: GetStaticPaths = async () => {
  const { data } = await supabaseAdmin.from<Chart>('charts').select('id')

  const paths = data.map(({ id }) => ({
    params: {
      slug: id.toString(),
    },
  }))

  return {
    paths,
    fallback: false,
  }
}

// https://nextjs.org/docs/api-reference/data-fetching/get-static-props#getstaticprops-with-typescript
export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { data: datum } = await supabaseAdmin
    .from<Chart>('charts')
    .select('*')
    .eq('id', params.slug)
    .single()

  // https://supabase.com/docs/reference/javascript/storage-from-getpublicurl
  const { publicURL } = supabaseAdmin.storage
    .from('charts')
    .getPublicUrl(datum.img_name)

  return {
    props: {
      datum,
      publicURL,
    },
  }
}

const Chart = ({ datum, publicURL }: { datum: Chart; publicURL: string }) => {
  // console.log(datum, publicURL)

  return (
    // https://tailwindcss.com/docs/min-height
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <Head>
        <title>{datum.name} | chART gallery</title>
      </Head>

      <main>
        <img src={publicURL} />
      </main>
    </div>
  )
}

export default Chart
