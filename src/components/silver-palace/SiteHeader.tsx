"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties } from "react";
import { useState } from "react";
import styles from "./SiteHeader.module.css";

const navigation = [
  { number: "#01", label: "Home", href: "/en-us/home" },
  { number: "#02", label: "Character Introduction", href: "/en-us/roles" },
  { number: "#03", label: "News", href: "/en-us/news" },
  { number: "#04", label: "Media Gallery", href: "/en-us/features" },
  { number: "#05", label: "Game Features", href: "/en-us/world" },
] as const;

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [reserveOpen, setReserveOpen] = useState(false);
  const pathname = usePathname();

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

      <nav
        aria-hidden={!menuOpen}
        className={`${styles.drawer} ${menuOpen ? styles.drawerOpen : ""}`}
      >
        <div className={styles.drawerWash} aria-hidden="true" />
        <div className={styles.menuRows}>
          {navigation.map((item, index) => {
            const active = pathname === item.href;
            return (
              <Link
                className={`${styles.menuRow} ${active ? styles.menuRowActive : ""}`}
                href={item.href}
                key={item.href}
                onClick={() => setMenuOpen(false)}
                style={{ "--menu-index": index } as CSSProperties}
                tabIndex={menuOpen ? 0 : -1}
              >
                <span className={styles.menuNumber}>{item.number}</span>
                <span className={styles.menuLabel}>{item.label}</span>
                <span className={styles.menuArrow} aria-hidden="true">
                  ↗
                </span>
              </Link>
            );
          })}
        </div>
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
