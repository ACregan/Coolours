import React, { useState } from "react";
import { Navigate, Outlet, useNavigate } from "react-router";
import styles from "./core-layout.module.css";

export default function CoreLayout() {
  const navigate = useNavigate();
  return (
    <div className={styles.coreLayout_container}>
      <header>
        <h1 className={styles.headerHeading}>Coolour!</h1>
        <button
          className={styles.createButton}
          onClick={() => navigate("/create")}
          type="button"
        >
          + CREATE
        </button>
      </header>
      <main>
        <Outlet />
      </main>
      {/* <footer>
      </footer> */}
    </div>
  );
}
