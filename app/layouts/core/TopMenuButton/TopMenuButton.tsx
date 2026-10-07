import React from "react";
import styles from "./TopMenuButton.module.css";
import { useLocation, useNavigate } from "react-router";
import SvgIcon, { SvgImageList } from "~/components/common/SvgIcon/SvgIcon";
import { trackClientAnalyticsEvent } from "~/hooks/analytics";

const TopMenuButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === "/") {
    return (
      <button
        className={styles.headerButton}
        onClick={() => {
          navigate("/create");
          trackClientAnalyticsEvent("header_click_create_button");
        }}
        type="button"
      >
        <div className={styles.buttonIconContainer}>
          <SvgIcon name={SvgImageList.Plus} />
        </div>
        <div className={styles.buttonTextContainer}>CREATE</div>
      </button>
    );
  }
  // Every other page (create, privacy, not found) links back home
  return (
    <button
      className={styles.headerButton}
      onClick={() => {
        navigate("/");
        trackClientAnalyticsEvent("header_click_home_button");
      }}
      type="button"
    >
      <div className={styles.buttonIconContainer}>
        <SvgIcon name={SvgImageList.Home} />
      </div>
      <div className={styles.buttonTextContainer}>HOME</div>
    </button>
  );
};

export default TopMenuButton;
