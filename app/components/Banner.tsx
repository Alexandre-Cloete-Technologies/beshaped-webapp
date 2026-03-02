export const Banner = () => {
  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center bg-green-600 px-6 py-16 text-center text-white">
      <p className="mb-3 text-sm uppercase tracking-[0.2em] text-green-100">
        Build Strength. Build Confidence.
      </p>
      <h1 className="max-w-3xl text-4xl font-extrabold leading-tight md:text-6xl">
        Transform Your Fitness Journey
      </h1>
      <p className="mt-5 max-w-2xl text-base text-green-50 md:text-lg">
        Expert coaching, personalized plans, and a supportive community to help
        you stay consistent and reach your goals.
      </p>
      <button className="mt-8 rounded-full bg-white px-8 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-100">
        Start Today
      </button>
    </section>
  );
};
