import { Space_Grotesk } from "next/font/google";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  TbArrowLeft,
  TbCalendar,
  TbBarbell,
  TbCheck,
  TbShieldCheck,
} from "react-icons/tb";
import { getProductById } from "@/features/products/api/getProducts";
import CheckoutForm from "./CheckoutForm";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

interface Props {
  params: Promise<{ productId: string }>;
}

export default async function CheckoutPage({ params }: Props) {
  const { productId } = await params;

  let product;
  try {
    product = await getProductById(productId);
  } catch {
    notFound();
  }

  const formattedPrice = new Intl.NumberFormat("en-NA", {
    style: "currency",
    currency: product.currency ?? "NAD",
    minimumFractionDigits: 2,
  }).format(product.price);

  return (
    <div className={`${spaceGrotesk.className} min-h-screen w-full bg-white text-zinc-900`}>
      {/* Breadcrumb */}
      <div className="border-b border-black bg-white px-6 py-3">
        <div className="mx-auto flex max-w-7xl items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-400">
          <Link href="/" className="transition hover:text-zinc-700">
            Home
          </Link>
          <span>/</span>
          <Link href={`/products/${productId}`} className="transition hover:text-zinc-700">
            {product.title}
          </Link>
          <span>/</span>
          <span className="text-zinc-900">Checkout</span>
        </div>
      </div>

      {/* Main grid */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-2 lg:min-h-[80vh]">

        {/* ─── Left column: Order summary ─── */}
        <aside className="flex flex-col border-b border-black bg-zinc-50 px-8 py-12 lg:border-b-0 lg:border-r lg:px-14 lg:py-20">
          <Link
            href={`/products/${productId}`}
            className="mb-10 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-400 transition hover:text-zinc-700"
          >
            <TbArrowLeft className="h-4 w-4" />
            Back to program
          </Link>

          <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
            Order summary
          </p>

          {/* Product card */}
          <div className="mt-6 border border-black bg-white">
            <div className="relative aspect-[16/7] w-full overflow-hidden bg-zinc-100">
              {product.coverImage ? (
                <Image
                  src={product.coverImage}
                  alt={product.title}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-zinc-100">
                  <TbBarbell className="h-12 w-12 text-zinc-300" strokeWidth={1} />
                </div>
              )}
            </div>

            <div className="p-6">
              {/* Badges */}
              <div className="mb-3 flex flex-wrap gap-2">
                <span className="bg-[#00a62c] px-2.5 py-1 text-[10px] font-bold uppercase leading-none tracking-wider text-white">
                  {product.duration}
                </span>
                <span className="border border-zinc-300 px-2.5 py-1 text-[10px] font-bold uppercase leading-none tracking-wider text-zinc-500">
                  {product.level}
                </span>
              </div>

              <h1 className="text-base font-black uppercase leading-snug tracking-tight text-zinc-900 md:text-lg">
                {product.title}
              </h1>

              <p className="mt-3 text-sm leading-relaxed text-zinc-500">
                {product.description}
              </p>

              {/* Quick stats */}
              <div className="mt-6 grid grid-cols-2 gap-px border border-zinc-200 bg-zinc-200">
                {[
                  { Icon: TbCalendar, label: "Duration", value: product.duration },
                  { Icon: TbBarbell, label: "Level", value: product.level },
                ].map(({ Icon, label, value }) => (
                  <div key={label} className="flex flex-col gap-0.5 bg-white p-4">
                    <Icon className="h-4 w-4 text-[#00a62c]" strokeWidth={1.5} aria-hidden />
                    <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                      {label}
                    </span>
                    <span className="text-xs font-bold uppercase text-zinc-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* What's included */}
          <div className="mt-8">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
              What&apos;s included
            </p>
            <ul className="mt-4 space-y-3">
              {[
                "Full PDF program guide",
                "Exercise video tutorials",
                "Warm-up & cool-down protocols",
                "Progressive overload structure",
                "Nutrition guidelines",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-zinc-700">
                  <TbCheck
                    className="mt-0.5 h-4 w-4 shrink-0 text-[#00a62c]"
                    strokeWidth={2.5}
                    aria-hidden
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Price breakdown */}
          <div className="mt-8 border-t border-zinc-200 pt-6">
            <div className="flex items-center justify-between text-sm text-zinc-600">
              <span>Subtotal</span>
              <span>{formattedPrice}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm text-zinc-600">
              <span>Tax</span>
              <span>Included</span>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-4">
              <span className="text-sm font-black uppercase tracking-wide text-zinc-900">
                Total
              </span>
              <span className="text-2xl font-black tracking-tight text-zinc-900">
                {formattedPrice}
              </span>
            </div>
          </div>

          {/* Trust badges */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <TbShieldCheck className="h-4 w-4 text-[#00a62c]" strokeWidth={1.5} />
              Secure checkout
            </div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <TbCheck className="h-4 w-4 text-[#00a62c]" strokeWidth={2} />
              Instant PDF delivery
            </div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <TbCheck className="h-4 w-4 text-[#00a62c]" strokeWidth={2} />
              One-time payment
            </div>
          </div>
        </aside>

        {/* ─── Right column: Checkout form ─── */}
        <main className="flex flex-col justify-center px-8 py-12 lg:px-14 lg:py-20">
          <h2 className="text-xl font-black uppercase tracking-tight text-zinc-900 md:text-2xl">
            Your details
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            Enter your name and email to complete your purchase.
          </p>

          <div className="mt-10">
            <CheckoutForm
              product={{
                id: product.id,
                title: product.title,
                price: product.price,
                currency: product.currency,
              }}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
