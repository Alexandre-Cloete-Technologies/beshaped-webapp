export const MeetTheTrainer = () => {
  return (
    <section className="bg-white px-6 py-16">
      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-[220px_1fr] md:items-center">
        <div className="mx-auto flex h-52 w-52 items-center justify-center rounded-full bg-green-100 text-4xl font-bold text-green-700">
          FT
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-green-600">
            Meet The Trainer
          </p>
          <h2 className="mt-2 text-3xl font-bold text-zinc-900">
            Francois Thompson
          </h2>
          <p className="mt-4 text-zinc-600">
            Certified coach with a passion for helping people build habits that
            actually last. The focus is progress over perfection, with practical
            training and nutrition support every step of the way.
          </p>
        </div>
      </div>
    </section>
  );
};
