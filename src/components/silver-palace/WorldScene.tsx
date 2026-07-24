"use client";
/* eslint-disable @next/next/no-img-element */

import { useState } from "react";

import { SiteHeader } from "./SiteHeader";
import styles from "./WorldScene.module.css";

const ASSET_ROOT = "/silver-palace";

const papers = [
  {
    label: "Silvernia Observer",
    background: "world_paper_1.Bp11zWZ_.jpg",
    copy: "world_paper1_txt_en.Ch_KHRmw.png",
    thumbnail: "world_paper_1.DFyXVgb-.png",
    className: styles.observer,
  },
  {
    label: "The Art of Survival",
    background: "world_paper_2_bg.D-OSo_EA.png",
    copy: "world_paper2_txt_en.BvJ9s0u-.png",
    thumbnail: "world_paper_2.K4Yk8VU_.png",
    className: styles.survival,
  },
  {
    label: "Silvernia in View",
    background: "world_paper_3_bg.YCKr8oUu.png",
    copy: "world_paper3_txt_en.bQX_PPtj.png",
    thumbnail: "world_paper_3.6YiZhceW.png",
    className: styles.view,
  },
  {
    label: "The Science of All Things",
    background: "world_paper_4_bg.0HSQ_FQ9.png",
    copy: "world_paper4_txt_en.DKQyjoiP.png",
    thumbnail: "world_paper_4.BF6yeVwn.png",
    className: styles.science,
  },
] as const;

export function WorldScene() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activePaper = papers[activeIndex];

  return (
    <main className={styles.scene}>
      <SiteHeader />

      <div className={styles.paperViewport}>
        <div className={styles.paperStage}>
          <img
            aria-hidden="true"
            alt=""
            className={`${styles.decorativeSheet} ${styles.decorativeSheetLeft}`}
            src={`${ASSET_ROOT}/world_paper_3_bg.YCKr8oUu.png`}
          />
          <img
            aria-hidden="true"
            alt=""
            className={`${styles.decorativeSheet} ${styles.decorativeSheetRight}`}
            src={`${ASSET_ROOT}/world_baiyin_ele.CKmsAp8R.png`}
          />

          <article
            aria-label={activePaper.label}
            className={`${styles.paper} ${activePaper.className}`}
            key={activePaper.label}
          >
            <img
              alt=""
              className={styles.paperBackground}
              draggable={false}
              src={`${ASSET_ROOT}/${activePaper.background}`}
            />
            <img
              alt={activePaper.label}
              className={styles.paperCopy}
              draggable={false}
              src={`${ASSET_ROOT}/${activePaper.copy}`}
            />
          </article>
        </div>
      </div>

      <nav aria-label="Silver Palace world sections" className={styles.paperNav}>
        {papers.map((paper, index) => {
          const isActive = index === activeIndex;

          return (
            <button
              aria-current={isActive ? "page" : undefined}
              className={`${styles.thumbnailButton} ${
                isActive ? styles.thumbnailButtonActive : ""
              }`}
              key={paper.label}
              onClick={() => setActiveIndex(index)}
              type="button"
            >
              <span className={styles.thumbnailLabel}>{paper.label}</span>
              <img
                alt=""
                className={styles.thumbnailImage}
                draggable={false}
                src={`${ASSET_ROOT}/${paper.thumbnail}`}
              />
            </button>
          );
        })}
      </nav>
    </main>
  );
}

export default WorldScene;
