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

#tab-container {
  background: linear-gradient(to top, #2a3493 0%, #2a3493 50%, transparent 100%);
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  overflow: hidden;
  transition: all 0.3s ease;
  height: 56px; /* shorter tabs */
}

/* Default button style */
#tab-container button {
  background: #FFCC68;
  color: #2a3493;
  border: none;
  border-radius: 0;
  font-size: 16px;
  transition: all 0.2s ease-in-out;
  font-family: 'Negrita Pro', sans-serif;
  padding: 6px 0 8px;
  height: 100%;
}

/* Active tab style */
#tab-container button.active-tab {
  background: #FFF2C5;
  box-shadow: inset 0 0 0 3px #000;
  transform: translateY(-2px);
  z-index: 10;
}

/* Earn tab jump animation */
@keyframes jumpStretch {
  0%   { transform: translateY(0) scale(1); }
  50%  { transform: translateY(-6px) scale(1.05, 0.95); }
  100% { transform: translateY(0) scale(1); }
}

.jump-tab {
  animation: jumpStretch 0.8s ease-in-out infinite;
}

