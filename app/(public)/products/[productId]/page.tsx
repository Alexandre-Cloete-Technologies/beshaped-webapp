import { Space_Grotesk } from "next/font/google";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { TbArrowLeft, TbCalendar, TbBarbell, TbCheck } from "react-icons/tb";
import { getProductById } from "@/features/products/api/getProducts";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });


interface Props {
    params: Promise<{ productId: string }>;
}

export default async function ProductDetailPage({ params }: Props) {
    const { productId } = await params;

    const product = await getProductById(productId);

    if (!product) {
        notFound();
    }

    const formattedPrice = new Intl.NumberFormat("en-NA", {
        style: "currency",
        currency: product.currency ?? "NAD",
        minimumFractionDigits: 2,
    }).format(product.price);

    const highlights = [
        {
            Icon: TbCalendar,
            label: "Duration",
            value: product.duration,
        },
        {
            Icon: TbBarbell,
            label: "Level",
            value: product.level,
        },
    ];

    return (
        <div className={`${spaceGrotesk.className} w-full bg-white text-zinc-900`}>
            {/* ── Breadcrumb ── */}
            <div className="border-b border-black bg-white px-6 py-3">
                <div className="mx-auto flex max-w-7xl items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-400">
                    <Link href="/" className="transition hover:text-zinc-700">
                        Home
                    </Link>
                    <span>/</span>
                    <Link href="/#programs" className="transition hover:text-zinc-700">
                        Programs
                    </Link>
                    <span>/</span>
                    <span className="text-zinc-900">{product.title}</span>
                </div>
            </div>

            <section className="border-b border-black bg-white">
                <div className="mx-auto grid max-w-7xl grid-cols-1 md:grid-cols-2">
                    {/* Left – product details */}
                    <div className="flex flex-col justify-center border-b border-black px-8 py-14 md:border-b-0 md:border-r md:px-12 md:py-20">
                        {/* Back link */}
                        <Link
                            href="/#programs"
                            className="mb-8 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-400 transition hover:text-zinc-700"
                        >
                            <TbArrowLeft className="h-4 w-4" />
                            Back to programs
                        </Link>

                        {/* Badges */}
                        <div className="mb-6 flex flex-wrap gap-2">
                            <span className="bg-[#00a62c] px-3 py-1.5 text-[10px] font-bold uppercase leading-none tracking-wider text-white">
                                {product.duration}
                            </span>
                            <span className="border border-zinc-300 px-3 py-1.5 text-[10px] font-bold uppercase leading-none tracking-wider text-zinc-600">
                                {product.level}
                            </span>
                        </div>

                        <h1 className="text-2xl font-black uppercase leading-tight tracking-tight text-zinc-900 md:text-4xl lg:text-[2.6rem]">
                            {product.title}
                        </h1>

                        <p className="mt-6 text-sm leading-relaxed text-zinc-500 md:text-base">
                            {product.description}
                        </p>

                        {/* Quick-stats row */}
                        <div className="mt-8 grid grid-cols-2 gap-px border border-zinc-900 bg-zinc-900">
                            {highlights.map(({ Icon, label, value }) => (
                                <div
                                    key={label}
                                    className="flex flex-col gap-1 bg-white p-5"
                                >
                                    <Icon
                                        className="h-5 w-5 text-[#00a62c]"
                                        strokeWidth={1.5}
                                        aria-hidden
                                    />
                                    <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                                        {label}
                                    </span>
                                    <span className="text-sm font-bold uppercase text-zinc-900">
                                        {value}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* What's included list */}
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

                        {/* Price + CTA */}
                        <div className="mt-10 border-t border-zinc-200 pt-8">
                            <p className="text-3xl font-black tracking-tight text-zinc-900 md:text-4xl">
                                {formattedPrice}
                            </p>
                            <p className="mt-1 text-xs text-zinc-400">One-time purchase · instant PDF download</p>

                            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                <Link
                                    href={`/products/${productId}/checkout`}
                                    className="flex flex-1 items-center justify-center bg-[#00a62c] py-4 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-[#6aaa1e]"
                                >
                                    Buy now
                                </Link>
                                <Link
                                    href="/#pricing"
                                    className="flex flex-1 items-center justify-center border-2 border-zinc-900 py-4 text-sm font-bold uppercase tracking-widest text-zinc-900 transition hover:bg-zinc-50"
                                >
                                    Get coaching instead
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Right – cover image */}
                    <div className="relative h-3/4 w-full overflow-hidden md:min-h-0">
                        {product.coverImage ? (
                            <Image
                                src={product.coverImage}
                                alt={product.title}
                                fill
                                priority
                                className="object-cover object-center"
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        ) : (
                            /* Fallback placeholder when no image is stored */
                            <div className="flex h-full w-full items-center justify-center bg-zinc-100">
                                <TbBarbell
                                    className="h-24 w-24 text-zinc-300"
                                    strokeWidth={1}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section className="flex min-h-[min(40vh,340px)] flex-col items-center justify-center bg-black px-6 py-20 text-center text-white">
                <div className="mx-auto max-w-3xl">
                    <h2 className="text-2xl font-black uppercase leading-tight tracking-tight text-white md:text-4xl">
                        Want a fully personalised program?
                    </h2>
                    <p className="mt-4 text-sm leading-relaxed text-zinc-400 md:text-base">
                        Get science-based coaching, custom programming, and weekly check-ins with a dedicated coach.
                    </p>
                    <Link
                        href="/#pricing"
                        className="mt-10 inline-block bg-white px-10 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-zinc-200"
                    >
                        View coaching packages
                    </Link>
                </div>
            </section>
        </div>
    );
}
