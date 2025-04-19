import { renderProfilePage } from "./profile.js";
import { COLORS, FONT, BORDER, ZINDEX } from "./styles.js";

function renderTopBar() {
  const existing = document.getElementById("top-bar");
  if (existing) existing.remove();

  const top = document.createElement("div");
  top.id = "top-bar";
  Object.assign(top.style, {
    position: "fixed",
    top: "0", left: "0", right: "0",
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "10px 12px", zIndex: ZINDEX.topBar,
    background: "transparent", height: "52px",
    fontFamily: FONT.heading,
  });

  // — Username Pill or Avatar —
  const userWrap = document.createElement("div");
  Object.assign(userWrap.style, {
    display: "flex", alignItems: "center", gap: "8px",
    background: "#FFF2C5",
    borderRadius: "999px",
    border: "2px solid #000",
    padding: "5px 12px 5px 6px",
    fontSize: "15px",
    boxShadow: "2px 2px 0 #000",
    cursor: "pointer",
  });

  const avatar = document.createElement("div");
  if (window.avatarUrl) {
    avatar.style.backgroundImage = `url('${window.avatarUrl}')`;
    Object.assign(avatar.style, {
      backgroundSize: "cover",
      backgroundPosition: "center",
      borderRadius: "50%",
      width: "28px", height: "28px",
      border: "1.5px solid #000",
    });
  } else {
    avatar.textContent = (window.storedUsername || "AN").slice(0, 2).toUpperCase();
    Object.assign(avatar.style, {
      background: "#000", color: "#FFF2C5",
      borderRadius: "50%", width: "28px", height: "28px",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "14px",
    });
  }

  const label = document.createElement("div");
  label.textContent = window.storedUsername || "Anonymous";

  userWrap.append(avatar, label);
  userWrap.onclick = () => {
    window.activeTab = "profile";
    renderProfilePage();
  };

  // — Icons —
  const icons = document.createElement("div");
  Object.assign(icons.style, {
    display: "flex", gap: "10px", alignItems: "center",
  });

  const makeIcon = (src, alt, onclick) => {
    const icon = document.createElement("img");
    icon.src = src;
    icon.alt = alt;
    Object.assign(icon.style, {
      width: "18px",          // ↓ smaller than before
      height: "18px",
      borderRadius: "50%",
      background: "#FFF2C5",
      border: "2px solid #000",
      padding: "4px",
      boxShadow: "1.5px 1.5px 0 #000",
      cursor: "pointer",
    });
    icon.onclick = onclick;
    return icon;
  };


  icons.appendChild(makeIcon("drump-images/bell.svg", "Bell", () => {}));
  icons.appendChild(makeIcon("drump-images/info.svg", "Info", () => showInfoPage?.()));
  icons.appendChild(makeIcon(window.soundEnabled ? "drump-images/sound_on.svg" : "drump-images/sound_off.svg", "Sound", () => {
    window.soundEnabled = !window.soundEnabled;
    soundIcon.src = window.soundEnabled ? "drump-images/sound_on.svg" : "drump-images/sound_off.svg";
  }));

  const soundIcon = icons.lastChild;

  top.append(userWrap, icons);
  document.body.appendChild(top);
}

export { renderTopBar };
