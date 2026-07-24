"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import styles from "./SiteHeader.module.css";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [reserveOpen, setReserveOpen] = useState(false);

  return (
    <>
      <header className={styles.header}>
        <Link className={styles.logo} href="/en-us/home" aria-label="Silver Palace home">
          <Image
            src="/silver-palace/en-us.J3q3qYlr.svg"
            alt="Silver Palace"
            width={300}
            height={46}
            priority
          />
        </Link>

        <button
          className={styles.menuButton}
          type="button"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span aria-hidden="true">☰</span>
          <span className={styles.showMore}>Show More</span>
        </button>

        <div className={styles.actions}>
          <button className={styles.iconButton} type="button" aria-label="Language">
            ◎
          </button>
          <button className={styles.iconButton} type="button" aria-label="Share">
            ↥
          </button>
          <button className={styles.iconButton} type="button" aria-label="Account">
            ◒
          </button>
          <button
            className={styles.reserve}
            type="button"
            onClick={() => setReserveOpen(true)}
          >
            Pre-register <span aria-hidden="true">+</span>
          </button>
        </div>
      </header>

      <nav className={`${styles.drawer} ${menuOpen ? styles.drawerOpen : ""}`}>
        <Link href="/en-us/home" onClick={() => setMenuOpen(false)}>
          Home
        </Link>
        <Link href="/en-us/world" onClick={() => setMenuOpen(false)}>
          World
        </Link>
      </nav>

      {reserveOpen ? (
        <div className={styles.modalBackdrop} role="presentation" onClick={() => setReserveOpen(false)}>
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="reserve-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className={styles.close}
              type="button"
              aria-label="Close"
              onClick={() => setReserveOpen(false)}
            >
              ×
            </button>
            <p className={styles.eyebrow}>SILVER PALACE</p>
            <h2 id="reserve-title">Pre-registration</h2>
            <p>Registration for Silvernia investigators will open soon.</p>
            <button className={styles.modalAction} type="button" onClick={() => setReserveOpen(false)}>
              Confirm
            </button>
          </section>
        </div>
      ) : null}
    </>
  );
}

