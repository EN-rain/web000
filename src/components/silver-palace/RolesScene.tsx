"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

import {
  ScrollRouteTransition,
  type ScrollRouteDestination,
} from "./ScrollRouteTransition";
import { useRouteEntrance } from "./useRouteEntrance";
import { SiteHeader } from "./SiteHeader";
import styles from "./RolesScene.module.css";

const ASSET_ROOT = "/silver-palace";

const NEXT_ROUTE = {
  currentImage: `${ASSET_ROOT}/char_bg.C_73WKtR.jpg`,
  nextImage: `${ASSET_ROOT}/news_bg.LVNfMlKE.jpg`,
  nextFitTop: true,
  nextEdgeMultiplier: 0,
  destination: "/en-us/news",
  routeNumber: "#03",
  routeName: "News",
} satisfies ScrollRouteDestination;

const PREVIOUS_ROUTE = {
  currentImage: `${ASSET_ROOT}/char_bg.C_73WKtR.jpg`,
  nextImage: `${ASSET_ROOT}/home_bg3.wAGjrSHo.jpg`,
  direction: -1,
  destination: "/en-us/home",
  routeNumber: "#01",
  routeName: "Home",
} satisfies ScrollRouteDestination;

const ART_ASSETS = [
  "char_2d_img_0.D6JuRUsV.png",
  "char_2d_img_1.DAmaJ3_o.png",
  "char_2d_img_2.DHefS2Mn.png",
  "char_2d_img_3.BVO2aTFZ.png",
  "char_2d_img_4.BwBHX7Rl.png",
  "char_2d_img_5.7zT1VTg7.png",
  "char_2d_img_6.DyLxpzd5.png",
  "char_2d_img_7.C9p183YM.png",
  "char_2d_img_8.BAOUOA6s.png",
  "char_2d_img_9.BUlLkfWb.png",
  "char_2d_img_10.8SQ7G1qU.png",
  "char_2d_img_11.OMd2oYoS.png",
  "char_2d_img_12.DjHtwDmf.png",
  "char_2d_img_13.YmDSC-f6.png",
  "char_2d_img_14.C_PXraXO.png",
] as const;

const AVATAR_ASSETS = [
  "char_avatar_0.D5gjC9CF.png",
  "char_avatar_1.DC-DxS4p.png",
  "char_avatar_2.CcIJ_T8L.png",
  "char_avatar_3.BuJVHaW_.png",
  "char_avatar_4.DmxszYUP.png",
  "char_avatar_5.b4q62fU7.png",
  "char_avatar_6.D1huW33M.png",
  "char_avatar_7.1UWBWFae.png",
  "char_avatar_8.xU10YK2d.png",
  "char_avatar_9.C3iRV1e6.png",
  "char_avatar_10.bNc7JfhI.png",
  "char_avatar_11.PeqxRCml.png",
  "char_avatar_12.DNBHx-Cz.png",
  "char_avatar_13.DK-5QCZD.png",
  "char_avatar_14.DzqLTBcF.png",
] as const;

const NAME_ASSETS = [
  "char_name_1_en.wN2x7EfZ.png",
  "char_name_1_en.wN2x7EfZ.png",
  "char_name_2_en.BgnMlxBE.png",
  "char_name_3_en.BohLfB8Z.png",
  "char_name_4_en.CREvZTR2.png",
  "char_name_5_en.DYUFo5bA.png",
  "char_name_6_en.BM16dmuJ.png",
  "char_name_7_en.CMnnXIcA.png",
  "char_name_8_en.C4C5I5An.png",
  "char_name_9_en.DXRKR8Eh.png",
  "char_name_10_en.CGOVAMqP.png",
  "char_name_11_en.Cbh_anL6.png",
  "char_name_12_en.DrlcHCCR.png",
  "char_name_13_en.DlwxAtwJ.png",
  "char_name_14_en.B1_5v2sf.png",
] as const;

const CHARACTERS = [
  {
    name: "Detective",
    epithet: "The Raven's Claws",
    quote:
      '"Let\'s cut to the chase. Can\'t have the witness dying before the testimony is taken."',
    biography:
      "The protagonist of this work. The Detective is rational, reliable, clear-minded, and efficient, gifted with powerful skills of observation and analysis. Driven by loss, they search for the truth behind the death of a loved one.\nAfter leaving Silvernia for three years following a disaster, the Detective has returned to the city.\nConspiracies fester beneath the facade of peace. A fragile justice system and opaque noble politics have set the stage for those who seek the truth. This is the golden age of detectives.\n",
  },
  {
    name: "Detective",
    epithet: "The Raven's Beak",
    quote:
      ' "Let\'s cut to the chase. Can\'t have the witness dying before the testimony is taken."',
    biography:
      "The protagonist of this work. The Detective is rational, reliable, clear-minded, and efficient, gifted with powerful skills of observation and analysis. Driven by loss, they search for the truth behind the death of a loved one.\nAfter leaving Silvernia for three years following a disaster, the Detective has returned to the city.\nConspiracies fester beneath the facade of peace. A fragile justice system and opaque noble politics have set the stage for those who seek the truth. This is the golden age of detectives.\n",
  },
  {
    name: "Alf (Maid)",
    epithet: "A Story Truly Yours",
    quote: '"The most important job of a maid is to protect her employer!"',
    biography:
      'A speckless home, a speckless soul.\nAlthough Alf is quite clumsy in all manners of mundane household chores, she is surprisingly dependable during fights.\nAlf usually confronts enemies with her shotgun. Activating the Reactor on her back converts the shotgun into a flamethrower, spewing fires that reduce enemies into cinders.\n"NO WEAPONS in the kitchen." — A memo from the Detective, posted on the fridge door.\n',
  },
  {
    name: "Argos (Bartender)",
    epithet: "The Eye of Argos",
    quote:
      "\"At your service, patron. Whether it's throwin' hands or passin' notes in a test—count me in.\"",
    biography:
      "Memoirs, alumni books, and case files. Words like reflections in wine.\nArgos works in a bar where all sorts of people gather. He carries a cane gun all the time, a helpful tool for deterring inebriated troublemakers.\nOf course, Argos prefers conversing with his shakers. He can support his fellow partners in combat. Those exhausted in battle can always count on Argos to offer a freshly shaken mix with therapeutic properties.\n",
  },
  {
    name: "Cinderella",
    epithet: "The Vengeful Ant",
    quote:
      '"You got what you deserved, and I am guilty as charged... Hahaha, we\'re perfect for each other!"',
    biography:
      'A day where cold gives way to warmth. The glimmer of hope is shining again.\nA lady of secrets and a most meticulous planner of vengeance. Sharp, thrifty, and observant. Her identity has been a cause of her insecurity.\nShe approached the Detective for a common goal, only to drift away once their goals no longer aligned. Now, she is burning away the last vestiges of her life for a final showdown.\nA fiery burst of magma long suppressed, a body as enduring as stone. — Recorded in "Cinderella".',
  },
  {
    name: "Cynthia II (Luna's Scion)",
    epithet: "The Goldbud",
    quote:
      '"A few older noble relatives still have to call me their auntie! Detective, want to join them?"',
    biography:
      "The rising crescent symbolizes the future of The Royal Families and the City.\nThe much-loved scion of House Luna, an innocent young aristocrat, and the Detective's landlady. Cynthia is a naughty prankster, though her acts of mischief are mostly harmless. After all, noble acuity and insight naturally flow within her veins.\nThe bread kitty toys are her most loyal entourage. Any miscreants seeking to do harm to the scion shall face their most unforgiving acts of sanction.",
  },
  {
    name: "Firtho (Doctor)",
    epithet: "The Medical Lancet",
    quote:
      '"Life has not been kind to me. Death, on the other hand... has been a truer friend."',
    biography:
      "Trace the Reaper's steps, and let the deceased spill the truth.\nA cold and mean doctor who conducts medical research in secret chambers within her clinic. She is capable of applying medical expertise in combat to deliver a fatal blow to adversaries.\nDue to her congenital illness, Firtho must wear a life-sustaining device at all times. She wants no pity and hates being a burden. In the endless river of death, life is only a coincidence along the way.",
  },
  {
    name: "Lorin (Chief Inspector)",
    epithet: "The Indispensable",
    quote:
      "\"Let's keep those brats in check, and then we'll get to have our vacation in peace.\"",
    biography:
      "Let the lad stumble, pick out the lapse, and demonstrate proper form.\nChief Inspector of the River Constabulary. A dutiful yet weary nice guy. Lorin fights criminals with his electric boxing glove, which has been set to non-lethal voltage levels.\nThe constabulary is a rather new organization, and enforcing the law has been extremely arduous. Lorin, perplexed by his job, offered the Detective a partnership. Though he is no prodigious detective, the world would eventually not rely on heroes but on a stable and sustainable system.",
  },
  {
    name: "Red Rose (Dancer)",
    epithet: "The Rose as an Engine of War",
    quote:
      '"The curtain falls; thus have I come to thee. Long parted, how brief shall our meeting be?"',
    biography:
      "Master of the Midsummer Night's Ballroom, she is a dancer who never stops. A hunter, and an assassin.\nA crimson rose that flourishes in blood-soaked soil, her brilliance shining through her thorny exterior. Yet wan moonlight and noxious mists pervade, enshrouding her, and scarring her very soul.\nThough red by name, the hand given to her by fate is dark and cruel. Only in love or in death shall she be granted forgiveness.",
  },
  {
    name: "Gratia (Knight)",
    epithet: "Her Majesty's Protégé",
    quote:
      '"Routine training shall make the knights stronger... Thus spake Her Majesty the Queen!"',
    biography:
      "A fiercely loyal knight and a brave (if foolish) follower.\nShe raises her sword and shield in the name of knightly honor and the Queen's grace.\nMany dark secrets fester beneath the throne. Pray that the enlightened shall descend to deliver us unto salvation.",
  },
  {
    name: "Rex (Superintendent)",
    epithet: "The Scales of Black and White",
    quote:
      '"Enforcers of the law must show no leniency to maintain its authority."',
    biography:
      "A young superintendent who is quick to step up in times of crisis, with a belief in order that borders on the fanatical.\nRight and wrong. Black and white. The law knows no compromise.\nTo enforce the law, one must cast out all notions of mercy—\nFor in his eyes, evil has no shades of grey.",
  },
  {
    name: "Bentham (Secretary)",
    epithet: "The Quartz Net",
    quote:
      '"Could this be the pinnacle of power? Is that all there is? Well then, the question now is—how may I break free of this trivial system?"',
    biography:
      "Secretary of the UMI Board Office.\nA kind and well-mannered professional, she holds great power behind the scenes as she pulls the strings.\nHer childhood dreams are now a driving force that propel her to ascend ever higher, and the rot of ambition spares none.\nAnd those who remain strong, marching ever on into the future, are never truly innocent at heart.",
  },
  {
    name: "Grimm (Journalist)",
    epithet: "Silver-tongued Headliner",
    quote:
      "Undocumented truth is really flimsy. Direct confrontation is not my thing. I fight my battles elsewhere.",
    biography:
      "A young journalist born into the lower levels of society, he is an ambitious fellow with a mind just as sharp as his tongue.\nA chronicler of modern society, never hesitating to risk danger when opportunity knocks.\nWhether denouncing scandals or giving a voice to the sadly departed—\nHe believes that the truth is all-powerful, and it must be heard.",
  },
  {
    name: "Captain Kaboom (Technician)",
    epithet: "Of Tinkers and Tunes",
    quote:
      "Captain Kaboom reporting for duty! Repairs, burnt fuse boxes, broken stoves, bad guys, you name it!",
    biography:
      'The Kaboom Team are akin to a hive of industrious bees, buzzing tirelessly around Silvernia\'s Spinotrodes.\nThey never turn down fresh milk and a coin or two for their purses, but most of all, it is the companionship of their beloved Kaboom Team fellows that they treasure.\nChildren without a home, they often gather together, singing their motto as one:\n"Mind for shocks, check the cables; keep things clean, activate once stable!"',
  },
  {
    name: "Gucia (Apprentice)",
    epithet: "From the Ivory Tower",
    quote:
      "My calling rests neither in a school nor in a corporation. My dream lies in the research of unknown organisms.",
    biography:
      "A seeker of knowledge, a gatherer of secrets, and a most eager researcher.\nShe had always distanced herself from others, a quiet and shy girl with a studious air. Only when conversation veered toward mysterious and supernatural happenings and beings, toward that which is spoken in hushed whispers, would she pipe up with eyes a-sparkling.\nFor it is within the unfathomable unknown that she sees a reflection of herself.",
  },
] as const;

type TransitionPhase = "idle" | "exiting" | "entering";

export function RolesScene() {
  const sceneRef = useRef<HTMLElement>(null);
  const routeContentRef = useRef<HTMLDivElement>(null);
  useRouteEntrance(sceneRef, "/en-us/roles");
  const [activeIndex, setActiveIndex] = useState(0);
  const [renderedIndex, setRenderedIndex] = useState(0);
  const [phase, setPhase] = useState<TransitionPhase>("idle");
  const [galleryOpen, setGalleryOpen] = useState(false);
  const timersRef = useRef<number[]>([]);
  const character = CHARACTERS[renderedIndex];
  const visibleStart = Math.min(Math.floor(activeIndex / 4) * 4, 11);

  const clearTimers = () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  };

  const selectCharacter = (nextIndex: number) => {
    const normalizedIndex =
      (nextIndex + CHARACTERS.length) % CHARACTERS.length;

    if (normalizedIndex === activeIndex) {
      return;
    }

    clearTimers();
    setActiveIndex(normalizedIndex);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setRenderedIndex(normalizedIndex);
      setPhase("idle");
      return;
    }

    setPhase("exiting");
    timersRef.current.push(
      window.setTimeout(() => {
        setRenderedIndex(normalizedIndex);
        setPhase("entering");
        timersRef.current.push(
          window.setTimeout(() => setPhase("idle"), 450),
        );
      }, 220),
    );
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setGalleryOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimers();
    };
  }, []);

  return (
    <main ref={sceneRef} className={styles.scene}>
      <SiteHeader />

      <div ref={routeContentRef} className={styles.routeContent}>
        <video
        className={styles.backgroundVideo}
        autoPlay
        loop
        muted
        playsInline
        poster={`${ASSET_ROOT}/char_bg.C_73WKtR.jpg`}
        aria-hidden="true"
      >
        <source src={`${ASSET_ROOT}/char_bg.mp4`} type="video/mp4" />
      </video>
      <div className={styles.technicalOverlay} aria-hidden="true" />
      <div className={styles.haze} aria-hidden="true" />
      <div className={styles.particles} aria-hidden="true">
        {Array.from({ length: 24 }, (_, index) => (
          <i
            key={index}
            style={
              {
                "--particle-x": `${(index * 43) % 97}%`,
                "--particle-y": `${(index * 29) % 88}%`,
                "--particle-size": `${2 + (index % 3)}px`,
                "--particle-opacity": 0.28 + (index % 5) * 0.1,
                "--particle-duration": `${9 + (index % 7) * 1.4}s`,
                "--particle-delay": `${(index % 11) * -1.2}s`,
              } as CSSProperties
            }
          />
        ))}
      </div>

      <section
        className={`${styles.copy} ${styles[phase]}`}
        aria-live="polite"
      >
        <div className={styles.name}>
          <Image
            src={`${ASSET_ROOT}/${NAME_ASSETS[renderedIndex]}`}
            alt={character.name}
            width={1145}
            height={184}
            priority
            unoptimized
            draggable={false}
          />
        </div>
        <div className={styles.identityRow}>
          <span className={styles.epithet}>{character.epithet}</span>
          <button
            className={styles.factionButton}
            type="button"
            onClick={() => setGalleryOpen(true)}
          >
            <span aria-hidden="true">◇</span>
            Faction Gallery
          </button>
        </div>
        <blockquote className={styles.quote}>{character.quote}</blockquote>
        <p className={styles.biography}>{character.biography}</p>
      </section>

      <div
        className={`${styles.characterArt} ${styles[phase]}`}
        aria-hidden="true"
      >
        <Image
          key={renderedIndex}
          src={`${ASSET_ROOT}/${ART_ASSETS[renderedIndex]}`}
          alt=""
          width={1694}
          height={1678}
          priority
          unoptimized
          draggable={false}
        />
      </div>

      <section className={styles.carousel} aria-label="Choose a character">
        <button
          className={`${styles.arrow} ${styles.previous}`}
          type="button"
          onClick={() => selectCharacter(activeIndex - 1)}
          aria-label="Previous character"
        >
          <Image
            src={`${ASSET_ROOT}/char_prev.Bb9C33u2.png`}
            alt=""
            width={87}
            height={87}
            draggable={false}
          />
        </button>
        <div className={styles.avatarViewport}>
          <div
            className={styles.avatarTrack}
            style={{ "--visible-start": visibleStart } as CSSProperties}
            role="tablist"
            aria-label="Characters"
          >
            {CHARACTERS.map((entry, index) => (
              <button
                className={`${styles.avatar} ${
                  activeIndex === index ? styles.activeAvatar : ""
                }`}
                type="button"
                role="tab"
                aria-selected={activeIndex === index}
                aria-label={entry.name}
                key={`${entry.name}-${index}`}
                onClick={() => selectCharacter(index)}
              >
                <Image
                  src={`${ASSET_ROOT}/${AVATAR_ASSETS[index]}`}
                  alt=""
                  width={115}
                  height={115}
                  unoptimized
                  draggable={false}
                />
              </button>
            ))}
          </div>
        </div>
        <button
          className={`${styles.arrow} ${styles.next}`}
          type="button"
          onClick={() => selectCharacter(activeIndex + 1)}
          aria-label="Next character"
        >
          <Image
            src={`${ASSET_ROOT}/char_prev.Bb9C33u2.png`}
            alt=""
            width={87}
            height={87}
            draggable={false}
          />
        </button>
      </section>

      {galleryOpen ? (
        <div
          className={styles.galleryBackdrop}
          role="presentation"
          onClick={() => setGalleryOpen(false)}
        >
          <section
            className={styles.gallery}
            role="dialog"
            aria-modal="true"
            aria-labelledby="faction-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="faction-title" className={styles.srOnly}>
              Faction Gallery
            </h2>
            <div className={styles.galleryTabs} aria-hidden="true">
              <span className={styles.galleryTab}>
                <Image
                  src={`${ASSET_ROOT}/camp_tab_logo4.C9Eck2o2.png`}
                  alt=""
                  width={167}
                  height={167}
                />
              </span>
              <span className={styles.galleryTab}>
                <Image
                  src={`${ASSET_ROOT}/camp_tab_logo5.BDj2Tfym.png`}
                  alt=""
                  width={167}
                  height={167}
                />
              </span>
            </div>
            <div className={styles.galleryCard}>
              <Image
                className={styles.galleryImage}
                src={`${ASSET_ROOT}/camp_img_0_en.CYFwA4Ty.jpg`}
                alt="Silver Palace faction members"
                width={1080}
                height={2748}
                priority
              />
              <Image
                className={styles.galleryFrame}
                src={`${ASSET_ROOT}/camp_card_bg.BaQlEtJ5.png`}
                alt=""
                width={545}
                height={1392}
                aria-hidden="true"
              />
            </div>
            <div className={styles.comingSoon}>
              <Image
                src={`${ASSET_ROOT}/camp_coming_soon.Bzs9pecb.png`}
                alt="More factions coming soon"
                width={534}
                height={1392}
              />
            </div>
            <button
              className={styles.galleryClose}
              type="button"
              onClick={() => setGalleryOpen(false)}
              aria-label="Close faction gallery"
            >
              <Image
                src={`${ASSET_ROOT}/camp_btn_close.DyVe57z7.png`}
                alt=""
                width={121}
                height={121}
              />
            </button>
          </section>
        </div>
      ) : null}
      </div>

      <ScrollRouteTransition
        sceneRef={sceneRef}
        contentRef={routeContentRef}
        forward={NEXT_ROUTE}
        backward={PREVIOUS_ROUTE}
        enabled={!galleryOpen}
      />
    </main>
  );
}

export default RolesScene;
