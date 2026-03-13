export const MeetTheTrainer = () => {
  return (
    <section className="bg-white px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#7ec225]">
          Meet your trainer
        </p>
        <h2 className="mt-2 text-3xl font-black uppercase tracking-tight text-zinc-900 md:text-4xl">
          Dewald Swart
        </h2>

        <div className="mt-10 grid gap-12 md:grid-cols-[1fr_320px] md:items-start">
          {/* Bio text */}
          <div className="space-y-4 text-sm leading-relaxed text-zinc-600 md:text-base">
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

          {/* Photos */}
          <div className="grid grid-cols-2 gap-3">
            <img
              src="https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=800&auto=format&fit=crop"
              alt="Dewald Swart"
              className="col-span-2 h-56 w-full rounded-lg object-cover object-top"
            />
            <img
              src="https://images.unsplash.com/photo-1567013127542-490d757e51fc?q=80&w=800&auto=format&fit=crop"
              alt="Dewald training"
              className="h-40 w-full rounded-lg object-cover"
            />
            <img
              src="https://images.unsplash.com/photo-1605296867304-46d5465a13f1?q=80&w=800&auto=format&fit=crop"
              alt="Dewald competing"
              className="h-40 w-full rounded-lg object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
