import React, { useState } from "react";
import styles from "./McpButton.module.css";
import SvgIcon, { SvgImageList } from "~/components/common/SvgIcon/SvgIcon";
import McpInstallModal from "~/components/common/McpInstallModal/McpInstallModal";
import { trackClientAnalyticsEvent } from "~/hooks/useGoogleAnalytics";

const McpButton = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button
        className={styles.mcpButton}
        onClick={() => {
          setModalOpen(true);
          trackClientAnalyticsEvent("header_click_mcp_button");
        }}
        type="button"
        aria-label="Use Coolours from your AI agent (MCP)"
      >
        <div className={styles.buttonIconContainer}>
          <SvgIcon name={SvgImageList.Mcp} />
        </div>
        <div className={styles.buttonTextContainer}>MCP</div>
      </button>
      <McpInstallModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};

export default McpButton;
