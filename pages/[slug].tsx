import { createClient } from '@supabase/supabase-js'
import type { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { useState } from 'react'
import { Twitter, Code } from 'lucide-react'

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

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

// https://github.com/leerob/image-gallery-supabase-tailwind-nextjs/blob/main/pages/index.tsx#L43
// https://tailwindcss.com/docs/grayscale
// https://nextjs.org/docs/basic-features/image-optimization#what-if-i-dont-know-the-size-of-my-images
function BlurImage({ url }: { url: string }) {
  const [isLoading, setLoading] = useState(true)

  return (
    <Image
      src={url}
      layout="fill"
      objectFit="contain"
      className={cn(
        'duration-700 ease-in-out',
        isLoading
          ? 'scale-110 blur-2xl grayscale'
          : 'scale-100 blur-0 grayscale-0'
      )}
      onLoadingComplete={() => setLoading(false)}
    />
  )
}

const Chart = ({ datum, publicURL }: { datum: Chart; publicURL: string }) => {
  // console.log(datum, publicURL)

  return (
    // https://tailwindcss.com/docs/min-height
    // https://github.com/leerob/image-gallery-supabase-tailwind-nextjs/blob/main/pages/index.tsx#L31
    // https://tailwindcss.com/docs/max-width
    <div className="mx-auto h-screen max-w-screen-xl py-4 px-4">
      <Head>
        <title>{datum.name} | chART gallery</title>
      </Head>

      {/* https://www.tailwind-tools.com/grid */}
      {/* https://tailwindcss.com/docs/grid-template-columns#arbitrary-values */}
      {/* https://css-tricks.com/things-ive-learned-css-grid-layout/#aa-use-vmin-for-an-equal-sized-box-layout */}
      <main className="grid h-full grid-cols-[48px_1fr_48px] grid-rows-[1fr_48px_4px] gap-0 overflow-hidden">
        <div className="flex flex-col justify-center items-center gap-4">
        <button className="btn btn-ghost btn-square"><Code /></button>
    
          <Twitter />
        </div>
        <div className="relative">
          <BlurImage url={publicURL} />
        </div>
        <div className="col-span-3 flex flex-row items-center justify-end gap-8">
          {/* https://www.dataviz-inspiration.com/ */}
          {/* https://dribbble.com/shots/18095966-Minimaps */}
          <div className="flex flex-row items-center gap-2"><kbd className="kbd kbd-md">◀</kbd><p>Previous chart</p></div>
          <div className="flex flex-row items-center gap-2"><kbd className="kbd kbd-md">▶︎</kbd><p>Next chart</p></div>
        </div>
        <div className="col-span-3 w-[100%] bg-slate-500" />
      </main>
    </div>
  )
}

export default Chart
