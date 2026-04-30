import React, { useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router";
import styles from "./core-layout.module.css";
import SvgIcon, { SvgImageList } from "~/components/common/SvgIcon/SvgIcon";

export default function CoreLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const TopMenuButton = () => {
    if (location.pathname === "/") {
      return (
        <button
          className={styles.headerButton}
          onClick={() => navigate("/create")}
          type="button"
        >
          <div className={styles.buttonIconContainer}>
            <SvgIcon name={SvgImageList.Plus} />
          </div>
          <div className={styles.buttonTextContainer}>CREATE</div>
        </button>
      );
    }
    if (location.pathname.includes("/create")) {
      return (
        <button
          className={styles.headerButton}
          onClick={() => navigate("/")}
          type="button"
        >
          <div className={styles.buttonIconContainer}>
            <SvgIcon name={SvgImageList.Home} />
          </div>
          <div className={styles.buttonTextContainer}>HOME</div>
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
