import React, { useState } from 'react';
import { SITE } from '../../data/site';
import Reveal from '../Reveal';

interface ProfileProps {
  onTarget: (id: string | null) => void;
}

/**
 * About. Full-bleed image behind a single statement and two short paragraphs.
 * No portrait card, no chips, no accent colour. The only ornament is the
 * hairline fact row at the bottom.
 */
const Profile: React.FC<ProfileProps> = ({ onTarget }) => {
  const [imageOk, setImageOk] = useState(Boolean(SITE.about.backgroundImage));
  const hasImage = Boolean(SITE.about.backgroundImage) && imageOk;

  return (
    <section id="profile" className="relative overflow-hidden px-6 py-28 md:px-12 md:py-44">
      {/* ---- background image layer ---- */}
      {hasImage ? (
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <img
            src={SITE.about.backgroundImage}
            alt=""
            loading="lazy"
            onError={() => setImageOk(false)}
            className="h-full w-full object-cover"
            style={{ opacity: 0.3, filter: 'grayscale(1) contrast(1.05)' }}
          />
          {/* scrims: keep the centre legible and fade the edges into the page */}
          <div className="absolute inset-0 bg-obsidian/55" />
          <div className="absolute inset-0 bg-gradient-to-b from-obsidian via-transparent to-obsidian" />
          <div className="absolute inset-0 bg-gradient-to-r from-obsidian/85 via-transparent to-obsidian/85" />
        </div>
      ) : null}

      <div className="relative mx-auto w-full max-w-[1180px]">
        <Reveal from="up">
          <p className="mb-14 font-mono text-[10px] uppercase tracking-[0.34em] text-bone/30 md:mb-20">
            About
          </p>
        </Reveal>

        <Reveal delay={80} from="up">
          <h2
            data-target-id="about-statement"
            data-shape="rail"
            onPointerEnter={() => onTarget('about-statement')}
            onPointerLeave={() => onTarget(null)}
            className="max-w-4xl font-display font-light leading-[1.12] tracking-tight text-bone"
            style={{ fontSize: 'clamp(1.7rem, 3.6vw, 3.1rem)' }}
          >
            I sit where the model meets the interface, and I own every layer in between.
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-10 md:mt-20 md:grid-cols-2 md:gap-20">
          {SITE.about.body.map((para, i) => (
            <Reveal key={i} delay={160 + i * 110} from="up">
              <p className="max-w-xl text-[15px] leading-[1.75] text-bone/45">{para}</p>
            </Reveal>
          ))}
        </div>

        {/* ---- fact row ---- */}
        <Reveal delay={400} from="up">
          <dl className="mt-20 grid grid-cols-2 gap-x-8 gap-y-10 border-t border-bone/[0.07] pt-10 md:mt-28 md:grid-cols-4">
            {[
              { k: 'Currently', v: SITE.about.now },
              { k: 'Based in', v: SITE.location.split('—')[0].trim() },
              { k: 'Focus', v: SITE.roles[0] },
              { k: 'Also', v: SITE.roles[1] },
            ].map((item) => (
              <div key={item.k}>
                <dt className="font-mono text-[9px] uppercase tracking-[0.24em] text-bone/25">
                  {item.k}
                </dt>
                <dd className="mt-2.5 font-display text-[15px] font-light tracking-tight text-bone/85">
                  {item.v}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
};

export default Profile;
