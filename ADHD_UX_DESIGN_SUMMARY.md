# ADHD-Friendly UX Design Summary

This document explains the design decisions made to support users with ADHD and why each matters.

---

## Core ADHD Challenges Addressed

| Challenge | How It Affects Users | Design Response |
|-----------|---------------------|-----------------|
| **Dopamine-seeking** | Delayed rewards feel invisible; hard to stay motivated | Immediate feedback, celebrations, gamification |
| **Time blindness** | Difficulty perceiving time passing; abstract dates don't create urgency | Concrete countdowns, visual timelines |
| **Working memory limits** | Hard to hold multiple things in mind; easy to forget context | Information always visible, no hidden menus |
| **Decision fatigue** | Too many choices = paralysis or avoidance | Smart defaults, progressive disclosure |
| **Emotional sensitivity** | Financial stress is amplified; shame spirals are common | Compassionate copy, celebrate progress over perfection |

---

## Design Decisions & Why They Matter

### 1. Milestone Celebration System
**What:** Visual celebrations when reaching 25%, 50%, 75% paid off, with badges and confetti.

**Why:** ADHD brains need immediate rewards. A goal 4+ months away (May 2026) doesn't activate the brain's motivation system. Breaking it into milestones creates frequent dopamine hits that sustain engagement.

---

### 2. Visual Countdown Timer
**What:** Concrete display of "X months, Y days until debt freedom" with visual progress.

**Why:** People with ADHD often experience "time blindness"—abstract dates like "May 2026" don't feel real or urgent. A countdown makes time tangible and creates appropriate urgency without anxiety.

---

### 3. Focus Mode
**What:** Simplified single-screen view showing only: daily budget remaining, debt progress percentage, and days to goal.

**Why:** Full dashboards are great for analysis but overwhelming for daily check-ins. ADHD users benefit from reduced cognitive load—seeing only what matters *right now* makes the tool usable during distracted moments.

---

### 4. "Money Crushed" Framing
**What:** Emphasize debt paid off ($15,920 CRUSHED) rather than remaining debt ($24,157 left).

**Why:** Focusing on what's accomplished creates momentum and positive reinforcement. Focusing on what remains can feel defeating. ADHD users are particularly sensitive to perceived failure—celebrating wins keeps them engaged.

---

### 5. Compassionate Copy
**What:** "Spending fast this week" instead of "Over budget"; "Needs a push" instead of "Behind target."

**Why:** Financial stress correlates with significantly higher mental health risk for ADHD adults. Shame-based messaging triggers avoidance. Compassionate language keeps users engaged with the tool rather than avoiding it.

---

### 6. Streak Tracking
**What:** Track consecutive weeks under budget with visible counter and celebration of milestones.

**Why:** Streaks leverage loss aversion (not wanting to break the streak) and provide regular dopamine hits. They also create accountability without requiring another person.

---

### 7. Time Until Paycheck Display
**What:** "6 days until payday" with daily budget calculation based on remaining runway.

**Why:** ADHD financial management is often paycheck-to-paycheck. Knowing exactly how much runway remains reduces anxiety and supports better daily decisions. Abstract monthly budgets are hard to translate into daily behavior.

---

### 8. Quick Balance Update Flow
**What:** Floating action button for instant balance updates without navigating through menus.

**Why:** Reducing friction for the most common action increases likelihood of consistent engagement. ADHD users often struggle with "activation energy"—making the key action effortless removes a barrier.

---

### 9. Information Chunking
**What:** Categories grouped into collapsible "Needs Attention" and "On Track" sections.

**Why:** Showing all information at once increases cognitive load. Progressive disclosure (showing problems first, details on demand) lets users focus on what matters without being overwhelmed.

---

### 10. Enhanced Microinteractions
**What:** Animated progress bars, button feedback, celebration animations, shimmer effects.

**Why:** Every action should produce visible, satisfying feedback. ADHD brains are reward-seeking—subtle animations make interactions feel responsive and reinforce continued use. (With `prefers-reduced-motion` support for those who find motion distracting.)

---

### 11. Interest Saved Calculator
**What:** Shows estimated interest saved by paying off early vs. minimum payments.

**Why:** Makes abstract future benefit concrete and immediate. Seeing "$2,340 saved in interest" is more motivating than "pay off faster"—it converts a delayed reward into a visible number.

---

### 12. Next Milestone Indicator
**What:** Shows progress toward the next achievement with "only $X to go" messaging.

**Why:** Creates a near-term goal that feels achievable. "You're $800 away from 50%" is more actionable than "you have $24K to go." Small goals feel doable; big goals feel impossible.

---

## The Underlying Principle

> **"ADHD is not a knowledge problem—it's an activation problem."**

People with ADHD usually know what they should do financially. The challenge is getting their brain to *do it*. These design choices work by:

1. **Making progress feel real and immediate** (not abstract and distant)
2. **Reducing friction** to essential actions
3. **Providing dopamine** through feedback and celebration
4. **Showing only what's needed** to reduce overwhelm
5. **Using encouraging language** that keeps users engaged

---

## Further Reading

- [Microsoft Inclusive Design for Cognition](https://inclusive.microsoft.design/)
- [W3C Cognitive Accessibility Design Patterns](https://www.w3.org/TR/coga-usable/)
- [ADDitude Magazine: Financial Management](https://www.additudemag.com/)

---

*Document created: February 2026*
