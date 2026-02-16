# ADHD-Friendly Finance Dashboard

> A personal finance tool built for a family member who needed clarity, not complexity.

## The Story

A family member came to me feeling overwhelmed by her finances. Despite having a budget and tracking her spending, she felt constant anxiety about money. Her main frustration? **Too much information, not enough focus.**

She needed something that would answer simple questions:
- *"Am I on track this week?"*
- *"When is my next bill due?"*
- *"How close am I to my goal?"*

As someone who experiences ADHD, she struggled with traditional finance apps that required digging through tabs, remembering to check multiple screens, and making sense of cluttered dashboards. What she needed was a tool that **shows what matters most, right now**.

So I built this dashboard specifically for her—informed by research on how people with ADHD experience digital interfaces.

---

## What It Does

### **Budget Tracking**
- See at a glance if you're under, on, or over pace for the week
- Track spending by category with simple progress bars
- Weekly budget with rollover (underspend carries forward)

### **Focus Mode**
- Simplified view that shows only essential information
- Perfect for quick daily check-ins without cognitive overload
- Clear visual status: green = good, yellow = watch it, red = needs attention

### **Debt Payoff Progress**
- Shows how much you've **paid off**, not just what's left
- Progress bars and milestone tracking
- Countdown to your target payoff date

### **Transaction Management**
- Drag-and-drop CSV import from your banking app
- Smart categorization with customizable rules
- Easy review and adjustments

### **Helpful Context**
- "Next bill due" reminders
- "Days until payday" countdown
- Visual calendar of income and bills
- Spending trend charts

---

## The Design Approach

> **"ADHD is not a knowledge problem—it's an activation problem."**

My family member knew what she should do financially. The challenge was getting her brain to actually do it. Traditional finance apps made this harder.

After researching UX patterns for ADHD users, I learned about some common challenges:

| Challenge | How I Addressed It |
|-----------|-------------------|
| **Time blindness** (abstract dates don't feel real) | Concrete countdowns like "4 days until payday" |
| **Working memory limits** (hard to remember context) | One-screen views with key info always visible |
| **Need for immediate feedback** (delayed rewards feel invisible) | Visual progress bars, color-coded status, instant updates |
| **Overwhelm from too much information** | Focus Mode that strips away everything but essentials |
| **Emotional sensitivity to financial stress** | Encouraging language ("You're crushing it!") instead of shame-based messaging |

### Key Design Choices

- **Show progress, not just what's left**: Seeing "$5,000 paid off" is more motivating than "$8,000 remaining"
- **One action, one screen**: Minimal navigation required to see your status or update balances
- **Smart defaults**: It should just work without requiring lots of configuration
- **Compassionate messaging**: "Spending fast this week" not "You're over budget"
- **Milestone celebrations**: Breaking big goals into smaller wins that feel achievable

These aren't revolutionary ideas—they're established patterns from accessibility and cognitive design research. I just applied them thoughtfully to a personal finance tool.

---

## The Result

After using this dashboard, my family member reported:

> *"I actually look forward to checking my budget now. I know exactly where I stand without feeling overwhelmed. And seeing how much I've paid off instead of just what's left? That keeps me motivated."*

**That's what human-centered design is about**: understanding your user's real needs and challenges, doing some research, and building something that actually helps.

---

## Why This Matters

When you design with empathy for neurodivergent users, you often create better experiences for everyone:

- **Reduced cognitive load** makes interfaces easier to use when you're tired or distracted
- **Immediate feedback** creates more engaging experiences
- **Clear visual hierarchy** helps anyone understand what's important at a glance
- **Compassionate messaging** reduces anxiety for all users

Designing for challenging use cases often yields solutions that work better for everyone.

---

## Tech Stack

- **React** + **Vite** for fast, modern UI
- **Tailwind CSS** for responsive design
- **Recharts** for charts and visualizations
- **localStorage** for client-side data (privacy-first—your data never leaves your device)

---

## Features

- ✅ CSV transaction import (drag-and-drop)
- ✅ Smart category mapping
- ✅ Weekly budget tracking with rollover
- ✅ Debt payoff progress tracking
- ✅ Focus Mode (simplified daily view)
- ✅ Visual calendar of bills and income
- ✅ Spending trend charts
- ✅ Demo mode (try it without real data)
- ✅ Works offline (PWA-ready)

---

## Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

---

## Takeaway

This project demonstrates that good software comes from:
1. **Empathy** - deeply understanding your user's experience
2. **Research** - learning from established design patterns and accessibility frameworks
3. **Iteration** - adjusting based on what actually helps

You don't need to be a UX expert. You just need to care about your user's real problems and be willing to learn what might help them.

---

## Resources

If you're interested in designing for cognitive accessibility:
- [Microsoft Inclusive Design](https://inclusive.microsoft.design/)
- [W3C Cognitive Accessibility Guidelines](https://www.w3.org/TR/coga-usable/)

---

## License

MIT License - Built with ❤️ for better financial wellness
