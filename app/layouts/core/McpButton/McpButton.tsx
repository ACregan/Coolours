import React, { useState } from "react";
import styles from "./McpButton.module.css";
import SvgIcon, { SvgImageList } from "~/components/common/SvgIcon/SvgIcon";
import Modal from "~/components/common/Modal/Modal";
import LittleBigButton from "~/components/common/BigButton/LittleBigButton";
import { useToast } from "~/components/common/Toast/ToastProvider";
import { useTheme } from "~/components/common/DarkMode/DarkModeContext";
import { copyToClipboard } from "~/utilities/utilities";
import { trackClientAnalyticsEvent } from "~/hooks/useGoogleAnalytics";
import { MCP_URL } from "~/constants";

const CLAUDE_CODE_COMMAND = `claude mcp add --transport http coolours ${MCP_URL}`;

// Same config shapes as each editor's mcp.json, as their install-link docs describe
const VSCODE_INSTALL_LINK = `vscode:mcp/install?${encodeURIComponent(
  JSON.stringify({ name: "coolours", type: "http", url: MCP_URL }),
)}`;
const CURSOR_INSTALL_LINK = `cursor://anysphere.cursor-deeplink/mcp/install?name=coolours&config=${btoa(
  JSON.stringify({ url: MCP_URL }),
)}`;

const McpButton = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const { darkMode } = useTheme();
  const { addToast } = useToast();

  const copy = (
    text: string,
    what: string,
    event: "mcp_copy_server_url" | "mcp_copy_command",
  ) => {
    copyToClipboard(text);
    addToast(`${what} Copied To Clipboard`);
    trackClientAnalyticsEvent(event);
  };

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
      <Modal
        title="Use Coolours From Your AI Agent"
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        darkMode={darkMode}
      >
        <div className={styles.modalContent}>
          <p>
            Connect Coolours to an AI agent with MCP. When you ask the agent for
            a colour scheme, it gives you a link to view and edit the palette
            here, with contrast checks and Coolours&apos; colour names.
          </p>

          <h3>Server URL</h3>
          <div className={styles.codeRow}>
            <pre>
              <code>{MCP_URL}</code>
            </pre>
            <LittleBigButton
              size="little"
              onClick={() => copy(MCP_URL, "Server URL", "mcp_copy_server_url")}
              svgIconName={SvgImageList.Copy}
              label="Copy"
              darkMode={darkMode}
            />
          </div>

          <h3>Claude Code</h3>
          <div className={styles.codeRow}>
            <pre>
              <code>{CLAUDE_CODE_COMMAND}</code>
            </pre>
            <LittleBigButton
              size="little"
              onClick={() =>
                copy(CLAUDE_CODE_COMMAND, "Command", "mcp_copy_command")
              }
              svgIconName={SvgImageList.Copy}
              label="Copy"
              darkMode={darkMode}
            />
          </div>

          <h3>Claude (claude.ai and Claude Desktop)</h3>
          <p>
            Go to Settings, then Connectors, choose Add custom connector, and
            paste the server URL.
          </p>

          <h3>VS Code and Cursor</h3>
          <div className={styles.installLinks}>
            <a
              href={VSCODE_INSTALL_LINK}
              onClick={() => trackClientAnalyticsEvent("mcp_install_vscode")}
            >
              Install in VS Code
            </a>
            <a
              href={CURSOR_INSTALL_LINK}
              onClick={() => trackClientAnalyticsEvent("mcp_install_cursor")}
            >
              Install in Cursor
            </a>
          </div>

          <h3>Other agents</h3>
          <p>Add a remote (Streamable HTTP) MCP server with the server URL.</p>
        </div>
      </Modal>
    </>
  );
};

export default McpButton;
