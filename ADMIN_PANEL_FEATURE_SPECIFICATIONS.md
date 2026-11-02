# Admin Panel Feature Specifications: Comprehensive Module-by-Module Explanation

This document provides a detailed, comprehensive breakdown of every feature, widget component, user interaction, data field, and validation rule across the 7 core modules corresponding to **Withdraw**, **Bank Details**, and **My Team / Payout Networks**.

---

## Table of Contents
1. [Module 1: Withdraw & Withdrawal History](#1-module-1-withdraw--withdrawal-history)
2. [Module 2: Bank Details Management](#2-module-2-bank-details-management)
3. [Module 3: Direct Referrals System](#3-module-3-direct-referrals-system)
4. [Module 4: Your Performance Dashboard](#4-module-4-your-performance-dashboard)
5. [Module 5: Team Performance & Hierarchy Tree](#5-module-5-team-performance--hierarchy-tree)
6. [Module 6: Payout History Ledger](#6-module-6-payout-history-ledger)
7. [Module 7: Payouts by Teams Analytics](#7-module-7-payouts-by-teams-analytics)

---

## 1. Module 1: Withdraw & Withdrawal History

### 1.1 Withdraw Screen Architecture
The Withdraw screen allows users to submit requests to transfer their earned referral balance directly to their bank account or UPI address.

#### Components & Data Mechanics
1. **Wallet Balance Card**:
   - **Available Balance**: Prominently displays the total withdrawal-eligible balance (`₹12,450.00`).
   - **Minimum Withdrawal Rule**: Enforces a minimum limit (`₹500.00`). If the user has less than ₹500, withdrawal submission is blocked.
   - **History Shortcut**: Quick navigation icon pointing directly to the `Withdraw History` screen.

2. **Destination Account Card**:
   - **Primary Display**: Shows the user's primary linked bank name (`HDFC Bank`), masked account number (`•••• 4829`), and IFSC Code (`HDFC0001234`).
   - **Change Action**: Tapping "Change" redirects the user directly to the `Bank Details` screen to modify their payout account.

3. **Amount Input & Quick Chips**:
   - **Custom Input**: Form field enforcing numeric validation:
     - Cannot be empty or zero.
     - Must be >= `₹500.00`.
     - Cannot exceed `Available Balance`.
   - **Quick Chips**: Interactive preset chips (`₹500`, `₹1,000`, `₹2,500`, `₹5,000`, `MAX`). Tapping `MAX` automatically populates the exact available balance amount.

4. **Transfer Mode Selector**:
   - **Direct Bank (IMPS)**: Instant account credit via IMPS transfer.
   - **UPI Transfer**: Instant credit to linked VPA (e.g. `shubham@okhdfc`).

5. **Withdraw Action Button**:
   - Executes validation check, shows loading indicator, and submits the withdrawal request, generating a confirmation snackbar.

---

### 1.2 Withdraw History Screen
The Withdraw History screen tracks the lifecycle of every withdrawal transaction submitted by the user.

#### Components & Data Mechanics
1. **Summary Header Cards**:
   - **Total Paid Out**: Sum of all `COMPLETED` transactions (e.g., `₹10,700`).
   - **Pending Payout**: Sum of all `PENDING` transactions awaiting disbursal (e.g., `₹1,200`).

2. **Filter Tabs Bar**:
   - Horizontal tab selector (`All`, `Completed`, `Pending`, `Failed`). Tapping a tab filters the transaction list dynamically.

3. **Transaction Item Cards**:
   - **Status Badges**:
     - `COMPLETED`: Green background badge with check icon.
     - `PENDING`: Light yellow background badge with clock icon.
     - `FAILED`: Light red background badge with cancel icon.
   - **Card Meta**: Transaction Amount, Bank Name & Masked Account (`HDFC Bank •••• 4829`), System Reference ID (`TXN9842103981`), and Timestamp (`28 Jul 2026, 04:15 PM`).

---

## 2. Module 2: Bank Details Management

The Bank Details screen allows users to input, store, and view their verified banking information required for receiving automated payout disbursals.

#### Components & Data Mechanics
1. **Digital Bank Card Preview**:
   - Styled digital debit-style card reflecting live changes as the user types:
     - **Bank Name**: Top left branding text (e.g., `HDFC Bank`).
     - **Account Number**: Formatted masked display (`•••• •••• •••• 4829`).
     - **Account Holder Name**: Full legal name as registered with the bank.
     - **IFSC Code**: Bank branch routing code (e.g., `HDFC0001234`).
     - **Verified Status Badge**: Shows `SAVED & VERIFIED` once stored.

2. **Payout Account Details Form Fields**:
   - **Account Holder Name**: Mandatory text input.
   - **Bank Name**: Mandatory text input (e.g., HDFC, SBI, ICICI).
   - **Account Number & Confirm Account Number**: Dual fields ensuring zero typographical errors; form throws error if values mismatch.
   - **IFSC Code**: Exactly 11 alphanumeric characters.
   - **Branch Name**: Bank branch location.
   - **UPI ID (Optional)**: Optional Virtual Payment Address.

3. **Save Action Button**:
   - Validates all form inputs, triggers saving state, updates the card preview, and displays a success notification.

---

## 3. Module 3: Direct Referrals System

The Direct Referrals module provides visibility into the user's immediate Level 1 (Team 1) referred members.

#### Components & Data Mechanics
1. **Header Subtitle**: Clear context label (`"Manage and view your direct team members"`).

2. **Direct Referral Stats Card**:
   - **Total Members**: Count of all direct signups (e.g., `7`).
   - **Active Members**: Count of members who have completed active qualification (e.g., `7`).
   - **Active Rate**: Calculated ratio `(Active Members / Total Members) * 100` displayed as a bold percentage (e.g., `100%`) paired with a linear progress bar indicator.

3. **Direct Referral Data Table**:
   - **Horizontal Scroll Container**: Smooth horizontal scrolling ensuring all columns fit cleanly without clipping.
   - **Columns**:
     - `SN`: Serial number badge in a light blue circle.
     - `NAME`: Initial avatar circle with random background color based on name hash, display name, and email ID.
     - `USER ID`: Interactive copy container (`S1-6547`). Tapping copies the ID to the system clipboard and triggers a toast message (`Copied ID: S1-6547`).
     - `JOINED`: Registration date (`27/12/2025`).
     - `ACTIVE TEAM`: Number of sub-members in that referral's active network.
     - `STATUS`: Styled status pill (`ACTIVE` in green or `INACTIVE` in grey).

4. **Footer Pagination Summary**: Counter label displaying current records vs total (`Showing 7 of 7 members`).

---

## 4. Module 4: Your Performance Dashboard

Your Performance is the comprehensive analytics dashboard summarizing the user's multi-tier referral performance, lifetime earnings, activity metrics, and qualification requirements.

#### Components & Data Mechanics
1. **User Profile Card**:
   - Large letter avatar badge (`B`), Full Name (`Basavarajappa K`), User ID (`S1-7757`), Referral Code (`1386`), and Email Address.

2. **Overview 2x2 Metric Grid**:
   - `Total Referrals`: Total signups across all 15 teams (`163`).
   - `Direct Referrals`: Level 1 signups (`23`).
   - `Active Referrals`: Currently active team members (`23`).
   - `Avg Earnings`: Average revenue earned per referral (`₹125`).

3. **Your Earnings Section**:
   - **Personal Earnings Card**: Total lifetime earnings (`₹1,26,970`) displayed in a gold gradient container.
   - **Available Balance Card**: Current wallet balance ready for withdrawal (`₹100`) displayed in an emerald gradient container.

4. **Referral Team Earnings Card**: Total revenue generated collectively by downstream referral teams (`₹20,420`) in a sky-blue gradient card.

5. **Earnings by Team Card**:
   - Breakdown of earnings for individual team levels (Team 1 through Team 6) with custom color badges (`T1` to `T6`) and exact revenue amounts (`₹11,650`, `₹4,700`, `₹2,650`, etc.).

6. **Activity Rate Card**:
   - Team activity ratio (`14%`), progress bar, and active member ratio text (`23 of 163 referrals are active`).

7. **Team Requirements Checklist**:
   - Displays unlock rules for Teams 1 to 15:
     - `T1` to `T12`: Shown as `Eligible` with green checkmark icon.
     - `T13` to `T15`: Shown as `Locked` with red cross icon and required referral count needed (e.g., `Need 24 referrals`).

8. **Payout Status Card**:
   - Green banner indicating payout eligibility status (`Team 2+ Payouts Enabled - You can receive earnings from all Teams`).

---

## 5. Module 5: Team Performance & Hierarchy Tree

Team Performance visualizes the user's multi-level referral network as a hierarchical tree across **Step 1 (S1)** to **Step 15 (S15)**.

#### Components & Data Mechanics
1. **Step Overview Card**:
   - Summary circle badges: `Total Members (2669)`, `Active Members (2575)`, and `Active Rate (96%)` with `All Levels` pill badge.

2. **Controls Card**:
   - Global `Collapse All` / `Expand All` button. Tapping recursively expands or collapses all downstream tree nodes.

3. **Step Structure Tree View**:
   - **Node Hierarchy Rules**:
     - **Level 1 (S1) Parent Node**: Header styled in Deep Purple (`#6B21A8`).
     - **Level 2+ (S2 - S15) Child Nodes**: Header styled in Emerald Green (`#059669`).
     - **Depth Indentation**: Child nodes are indented vertically (`depth * 12.0`) with `L`-shaped connector lines (`Color(0xFFCBD5E1)`).
   - **Node Information Header**:
     - Step badge (`S1`, `S2`), Team/Member Name (`vds group`, `Khaja Vali M`), Child Count pill (`4`), and Expand/Collapse toggle button (`+` / `-`).
   - **Node Information Body**:
     - `User ID`: Unique user identifier (e.g. `S1-0001`).
     - `Total Deposit`: Cumulative deposit amount (e.g. `₹2,000`).
     - `Joined Date`: Registration date (e.g. `Aug 19, 2025`).
     - `Status Badge`: `ACTIVE` indicator badge.

---

## 6. Module 6: Payout History Ledger

Payout History provides a granular log of every individual referral bonus payout earned across all team levels.

#### Components & Data Mechanics
1. **Payout Summary Card**:
   - **2x2 Metrics**: `Total Earned (₹37,815)`, `Total Payouts (2,509)`, `Pending Amounts (₹120)`, `Pending Payouts (10)`.
   - **Teams Breakdown Section**:
     - Displays circular count badges for active earning teams:
       - `Team 5`: Pink circle (`1`)
       - `Team 8`: Yellow circle (`1`)
       - `Team 9`: Teal circle (`1`)
       - `Team 10`: Slate circle (`1`)
       - `Team 11`: Blue circle (`4`)
       - `Team 13`: Purple circle (`2`)

2. **Payout Record Cards List**:
   - **Top Row**: Bonus amount (`₹10`) paired with Step pill badge (`S11`, `S10`, `S13`).
   - **Second Row**: Referral bonus title (e.g., `Team 11 Referral Bonus`) and `Pending` status pill.
   - **Details Table**:
     - `FROM:` Member name who generated the bonus (e.g., `girish patil`).
     - `USER ID:` Source user ID container (`S1-4538`).
     - `DATE:` Transaction date (`30-Jul-2026`).

---

## 7. Module 7: Payouts by Teams Analytics

Payouts by Teams is the financial analytics module dissecting revenue distribution and step details across all 15 team levels.

#### Components & Data Mechanics
1. **Header & Subtitle**: `"Team Analytics - Detailed breakdown of your referral earnings by step"`.

2. **Overall Performance Card**:
   - Purple accent border (`#6B21A8`).
   - Metrics: `Total Earnings (₹900)`, `Total Payouts (2519)`, `Avg/Payout (₹15)`, `Pending Amounts (₹37,035)`.

3. **Revenue Distribution Card**:
   - Displays percentage and payout breakdown for Teams 1 to 15:
     - **Team Icons & Colors**:
       - `Team 1`: Gold medal 🥇 (`1.3%`, `₹500`, `4 payouts`)
       - `Team 2`: Silver medal 🥈 (`1.1%`, `₹400`, `4 payouts`)
       - `Team 3`: Bronze medal 🥉 (`8.4%`, `₹3,200`, `64 payouts`)
       - `Team 4`: Diamond 💎 (`15.5%`, `₹5,880`, `147 payouts`)
       - `Team 5`: Crown 👑 (`7.8%`, `₹2,940`, `98 payouts`)
       - `Team 6` - `Team 15`: Star ⭐, Orbit 💫, Fire 🔥, Lightning ⚡, Trophy 🏆 badges with custom progress bars.

4. **Step Details Section**:
   - Dedicated team card for each team (Team 1 to Team 15):
     - **Header**: Team Icon, Name, Category (`Direct Team`, `Second Team`, `Third Team`, `Premium Team`), and total payouts pill.
     - **Earnings Row**: `Total Earnings` amount vs `Avg/Step` amount.
     - **Credited vs Pending Box**: Highlights `Credited` count & amount (e.g., `Credited (4) - ₹500`) vs `Pending` count & amount (e.g., `Pending (219) - ₹2,190`).

5. **Footer Banner**: Status bar displaying `Showing data for 15 active Teams`.

---
*End of Detailed Feature Specifications Document.*
