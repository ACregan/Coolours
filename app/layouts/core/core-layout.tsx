import React, { useState } from "react";
import { Outlet } from "react-router";
import styles from "./core-layout.module.css";

export default function CoreLayout() {
  return (
    <div className={styles.coreLayout_container}>
      <header>
        <h1 className={styles.headerHeading}>Coolour</h1>
      </header>
      <main>
        <Outlet />
      </main>
      <footer>
      </footer>
    </div>
  );
}
