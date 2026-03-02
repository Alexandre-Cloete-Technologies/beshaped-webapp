const testimonials = [
  {
    name: "Nina R.",
    quote: "I finally feel strong and consistent after years of stopping and starting.",
  },
  {
    name: "David M.",
    quote: "The coaching made training simple and practical for my busy schedule.",
  },
  {
    name: "Sarah T.",
    quote: "I gained confidence and energy in just a few months.",
  },
];

export const Testimonials = () => {
  return (
    <section className="bg-zinc-100 px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-bold text-zinc-900">
          Testimonials
        </h2>
        <p className="mt-2 text-center text-zinc-600">
          Real results from real members.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <article key={testimonial.name} className="rounded-xl bg-white p-6 shadow-sm">
              <p className="text-zinc-700">"{testimonial.quote}"</p>
              <p className="mt-4 font-semibold text-zinc-900">{testimonial.name}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
