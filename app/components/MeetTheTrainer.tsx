export const MeetTheTrainer = () => {
  return (
    <section className="bg-white px-6 py-24 border-b border-black">
      <div className="mx-auto max-w-6xl ">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.42fr)] md:items-stretch md:gap-12 lg:gap-16">
          <div>
            <p className="text-3xl font-bold uppercase  text-zinc-900">
              Meet your trainer
            </p>
            <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-zinc-900 md:text-4xl">
              Dewald Swart
            </h2>
            <div className="mt-8 space-y-4 text-sm leading-relaxed text-zinc-600 md:text-base">
              <p>
                Dewald&apos;s journey began on the rugby field, where his passion for sports and
                dedication to physical fitness were first ignited. Transitioning from the high-energy
                world of rugby, Dewald discovered a profound love for bodybuilding. This new passion
                sparked a personal transformation — not just in his physique but in his outlook on
                health and wellness.
              </p>
              <p>
                Driven by his own success and the desire to inspire others, Dewald and his wife now
                run a private gym dedicated to helping individuals achieve their fitness goals. At
                their gym, Dewald offers personalized, focused training sessions designed to motivate
                and empower clients on their own fitness journeys.
              </p>
              <p>
                His hands-on approach and genuine enthusiasm make him a standout coach, committed to
                guiding others through their personal transformations and helping them reach their
                full potential.
              </p>
            </div>
          </div>

          <div className="w-full overflow-hidden border border-black md:h-full md:min-h-0">
            <img
              src="/meet_your_trainer_image.jpg"
              alt="Dewald Swart"
              className="h-[min(72vw,22rem)] w-full object-cover object-top md:h-full md:min-h-0"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
