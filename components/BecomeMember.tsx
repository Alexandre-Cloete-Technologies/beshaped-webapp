const benefits = [
  "Monthly workout roadmap",
  "Weekly accountability check-ins",
  "Nutrition fundamentals guidance",
];

export const BecomeMember = () => {
  return (
    <section className="bg-white px-6 py-16 text-zinc-900">
      <div className="mx-auto flex max-w-5xl flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-green-600">
            Become A Member
          </p>
          <h2 className="mt-2 text-3xl font-bold md:text-4xl">
            Coaching Designed Around You
          </h2>
          <p className="mt-4 text-zinc-600">
            Join a coaching plan built around your current level and lifestyle.
            Everything is structured so you can make progress without burnout.
          </p>
        </div>
        <button className="rounded-full bg-green-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-green-700">
          Join Now
        </button>
      </div>
      <div className="mx-auto mt-10 grid max-w-5xl gap-4 md:grid-cols-3">
        {benefits.map((item) => (
          <div key={item} className="rounded-xl border border-zinc-200 p-4">
            <p className="font-medium">{item}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
