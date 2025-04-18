// styles.js

export const COLORS = {
    primary: "#2a3493",       // Button and tab backgrounds, badge text
    textLight: "#f8f9fe",     // Tab/button text and general off-white
    badgeBg: "#FFCC68",       // Badge background
    offWhite: "#f8f9fe",      // Backgrounds
    deepRed: "#8e0004",       // Highlight, warnings, or accents
};

export const FONT = {
    heading: "'Negrita Pro', sans-serif",
    body: "'Commissioner', sans-serif",
};

export const BORDER = {
    radius: "10px",
    style: `2px solid ${COLORS.primary}`,
};

export const ZINDEX = {
    topBar: 1000,
    punchBar: 999,
    modal: 2000,
    soundIcon: 1001,
    tabBar: 1000,
    punchEffect: 9999,
};

.jump-tab {
  animation: jumpStretch 0.8s ease-in-out infinite;
}

