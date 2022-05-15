import { createClient } from '@supabase/supabase-js'
import { ChevronLeft, ChevronRight, Code, Twitter } from 'lucide-react'
import type { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import useKeypress from 'react-use-keypress'

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
// https://nextjs.org/docs/api-reference/data-fetching/get-static-paths
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
// https://github.com/timlrx/tailwind-nextjs-starter-blog/blob/master/pages/blog/%5B...slug%5D.js#L21
// https://supabase.com/docs/reference/javascript/select#querying-with-count-option
export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { count } = await supabaseAdmin
    .from<Chart>('charts')
    .select('id', { count: 'exact', head: true })

  const { data: datum } = await supabaseAdmin
    .from<Chart>('charts')
    .select('*')
    .eq('id', params.slug)
    .single()

  // https://supabase.com/docs/reference/javascript/storage-from-getpublicurl
  const { publicURL } = supabaseAdmin.storage
    .from('charts')
    .getPublicUrl(datum.img_name)

  const prev = parseInt(params.slug, 10) - 1
  const next = parseInt(params.slug, 10) + 1

  const prevURL = `/${prev === 0 ? count : prev}`
  const nextURL = `/${next > count ? 1 : next}`

  const percentage = `${(parseInt(params.slug, 10) / count) * 100}%`

  return {
    props: {
      datum,
      publicURL,
      prevURL,
      nextURL,
      percentage,
    },
  }
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

// https://github.com/leerob/image-gallery-supabase-tailwind-nextjs/blob/main/pages/index.tsx#L43
// https://tailwindcss.com/docs/grayscale
// https://nextjs.org/docs/basic-features/image-optimization#what-if-i-dont-know-the-size-of-my-images
// https://nextjs.org/docs/api-reference/next/image#priority
function BlurImage({ url }: { url: string }) {
  const [isLoading, setLoading] = useState(true)

  return (
    <div className="relative h-full w-full">
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
    </div>
  )
}

const Chart = ({
  datum,
  publicURL,
  prevURL,
  nextURL,
  percentage,
}: {
  datum: Chart
  publicURL: string
  prevURL: string
  nextURL: string
  percentage: string
}) => {
  // console.log(datum, publicURL, prevURL, nextURL, percentage)

  // https://nextjs.org/docs/api-reference/next/router#usage
  const router = useRouter()

  // https://www.npmjs.com/package/react-use-keypress
  useKeypress(['ArrowLeft', 'ArrowRight'], (e) => {
    if (e.key === 'ArrowLeft') {
      router.push(prevURL)
    } else {
      router.push(nextURL)
    }
  })

  return (
    // https://tailwindcss.com/docs/min-height
    // https://github.com/leerob/image-gallery-supabase-tailwind-nextjs/blob/main/pages/index.tsx#L31
    // https://tailwindcss.com/docs/max-width
    <div className="h-screen">
      <Head>
        <title>{datum.name} | chART gallery</title>
      </Head>

      {/* https://www.tailwind-tools.com/grid */}
      {/* https://tailwindcss.com/docs/grid-template-columns#arbitrary-values */}
      {/* https://css-tricks.com/things-ive-learned-css-grid-layout/#aa-use-vmin-for-an-equal-sized-box-layout */}
      {/* https://www.instagram.com/p/CdcuaQ4K2C_/ */}
      {/* 64 + 64 / 2 = 96 */}
      <main className="grid h-full grid-cols-[96px_1fr_96px] grid-rows-[6px_1fr] gap-0 overflow-hidden">
        {/* https://tailwindcss.com/docs/content-configuration#class-detection-in-depth */}
        {/* https://tailwindcss.com/docs/content-configuration#dynamic-class-names */}
        <div
          className="col-span-3 bg-neutral"
          style={{
            width: percentage,
          }}
        />
        <div className="flex flex-col items-center justify-center gap-2">
          {/* https://daisyui.com/components/button/ */}
          <a
            href={datum.repo}
            target="_blank"
            className="btn btn-ghost btn-square btn-lg rounded-none"
          >
            <Code />
          </a>
          <a
            href={datum.tweet}
            target="_blank"
            className="btn btn-ghost btn-square btn-lg rounded-none"
          >
            <Twitter />
          </a>
        </div>
        {/* https://tailwindcss.com/docs/padding */}
        {/* p-0, p-16, p-32 */}
        <div className="p-16">
          <BlurImage url={publicURL} />
        </div>
        {/* justify-end, gap-px */}
        <div className="flex flex-col items-center justify-center gap-2">
          {/* https://nextjs.org/docs/api-reference/next/link */}
          {/* https://nextjs.org/docs/api-reference/next/link#if-the-child-is-a-custom-component-that-wraps-an-a-tag */}
          <Link href={prevURL}>
            <a className="btn btn-square btn-lg rounded-none">
              <ChevronLeft />
            </a>
          </Link>
          <Link href={nextURL}>
            <a className="btn btn-square btn-lg rounded-none">
              <ChevronRight />
            </a>
          </Link>
        </div>
      </main>
    </div>
  )
}

export default Chart
