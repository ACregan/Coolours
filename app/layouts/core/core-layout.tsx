import React, { useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router";
import styles from "./core-layout.module.css";

export default function CoreLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const TopMenuButton = () => {
    if (location.pathname === "/") {
      return (
        <button
          className={styles.createButton}
          onClick={() => navigate("/create")}
          type="button"
        >
          + CREATE
        </button>
      );
    }
    if (location.pathname === "/create") {
      return (
        <button
          className={styles.createButton}
          onClick={() => navigate("/")}
          type="button"
        >
          HOME
        </button>
      );
    }
  };

  return (
    <div className={styles.coreLayout_container}>
      <header>
        <h1 className={styles.headerHeading}>Coolour!</h1>
        <TopMenuButton />
      </header>
      <main>
        <Outlet />
      </main>
      {/* <footer>
      </footer> */}
    </div>
  );
}
