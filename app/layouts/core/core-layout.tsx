import React, { useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router";
import styles from "./core-layout.module.css";
import SvgIcon, { SvgImageList } from "~/components/common/SvgIcon/SvgIcon";
import { ToastProvider } from "~/components/common/Toast/ToastProvider";

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
    <ToastProvider>
      <div className={styles.coreLayout_container}>
        <header>
          <SvgIcon name={SvgImageList.CooloursLogo_plain} fill="#e6f456" />
          <TopMenuButton />
        </header>
        <main>
          <Outlet />
        </main>
      </div>
    </ToastProvider>
  );
}
