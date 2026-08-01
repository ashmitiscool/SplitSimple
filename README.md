# SplitSimple 💸

> **Fast, equal splits. No bloat.**  
> *Split bills, not friendships.*

[![Deploy with Vercel](https://vercel.com/button)](https://split-simple-money.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-black.svg)](https://opensource.org/licenses/MIT)
[![GitHub main](https://img.shields.io/badge/branch-main-black.svg)](https://github.com/ashmitiscool/SimpleSplit/tree/main)

---

## 📖 Overview

**SplitSimple** is a minimalist, lightning-fast web application designed to solve one common problem: splitting a bill equally among friends without the friction of complex accounting apps. Whether you're paying for dinner, group snacks, or shared subscriptions, SplitSimple gets you from **total bill to settled payments** in seconds.

Unlike traditional expense trackers that require tedious itemization, invites, or complicated ledgers, SplitSimple focuses on **speed, clarity, and ease of use**.

---

## ✨ Features

- **🚀 Instant Equal Splitting:** Enter the total bill amount and the number of people to instantly calculate exact shares.
- **🏷️ Custom Member Names:** Quickly rename individual participants (e.g., *Joe*, *Bert*) for easy identification.
- **✅ Payment Tracking (Paid / Unpaid):** Toggle payment statuses for each participant in real time as they reimburse you.
- **👥 Saved Groups:** Create, save, and manage frequent groups (e.g., roommate squads, study groups) and load them into a new split with a single click.
- **📜 Complete Split History:** Save completed or ongoing splits to your account history with timestamps, participant lists, and total amounts.
- **🔐 Lightweight Account Sync:** Simple login/signup functionality to persist your groups and split history.
- **🎨 Minimalist UI:** Built with a distraction-free, modern aesthetic optimized for both desktop and mobile screens.

---

## 🛠️ Tech Stack

- **Frontend:** Vanilla JavaScript (SPA)
- **Styling:** CSS / Modern Minimalist UI Components
- **Hosting / Deployment:** [Vercel](https://split-simple-money.vercel.app)
- **State & Storage:** Client-side state management with persistent user account storage (Groups & History)

---

## 🚀 Getting Started

Follow these steps to set up and run **SplitSimple** locally on your machine.

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16.x or newer)
- npm, pnpm, or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ashmitiscool/SimpleSplit.git
   cd SimpleSplit
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open in your browser:**  
   Navigate to `http://localhost:3000` (or the port shown in your terminal) to view the app.

---

## 💡 How to Use

1. **Enter Amount & Count:** Type in the total bill amount (e.g., `$100`) and select the number of people dividing the cost.
2. **Load a Saved Group (Optional):** Click **Load Saved Group** to automatically populate your saved friends' names.
3. **Customize Names:** Click on any participant label to assign a specific name.
4. **Track Reimbursements:** Click the `UNPAID` button next to a person's name to mark their share as `PAID`.
5. **Save to History:** Click **Save to History** to archive the split for future reference.

---

## 🗺️ Roadmap

- [ ] Export split summaries as text/image for WhatsApp & group chats
- [ ] Support for custom (unequal) splitting ratios
- [ ] Dark / Light theme toggle
- [ ] Multi-currency formatting support

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!  
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/ashmitiscool">Ashmit</a>
</p>
