import { showReferralPopup } from "./popups.js";
import { COLORS } from "./styles.js";

let referralBtn;

function createReferralAndRewardsButtons(userId) {
  if (document.getElementById("referral-button")) return;

  // === Refer a Friend Button ===
  referralBtn = document.createElement("button");
  referralBtn.id = "referral-button";
  referralBtn.innerHTML = `
    👥 Refer a Friend
    <span class="task-badge">+1000</span>
  `;
  referralBtn.style.cssText = sharedStyle + `
    bottom: 70px;
    background: ${COLORS.primary};
    color: white;
    font-family: 'Negrita Pro', sans-serif;
  `;
  referralBtn.onclick = () => showReferralPopup(userId);
  document.body.appendChild(referralBtn);
}

const sharedStyle = `
  position: fixed;
  right: 20px;
  padding: 10px 14px;
  font-size: 14px;
  border: none;
  border-radius: 8px;
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 1px 2px 0px 0px #000;
`;

export {
  createReferralAndRewardsButtons
};
