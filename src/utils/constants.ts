export const LEARNING_TECHNIQUES = [
  {
    id: 'feynman',
    name: 'Feynman Method',
    emoji: '🎤',
    color: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    description: 'Explain the concept in simple terms as if teaching a child. If you struggle, identify the gap and review.',
    prompt: 'Try explaining what you just learned in 3 simple sentences. Pretend you\'re teaching a 5-year-old.',
    detailedContent: `
The Feynman Technique is a powerful mental model for truly mastering a subject. 
**How to Use:**
1. Choose a concept and write its name at the top of a page.
2. Imagine you are teaching it to a 10-year-old child. Use simple language and clear analogies.
3. If you get stuck, go back to the source material to identify exactly where your understanding is weak.
4. Refine your language. If it's still complicated, you haven't mastered it yet.
**Benefits:**
- Reveals hidden gaps in your knowledge.
- Forces you to simplify complex ideas, leading to better long-term retention.
- Develops your ability to communicate difficult concepts clearly to others.
    `
  },
  {
    id: 'spaced-rep',
    name: 'Spaced Repetition',
    emoji: '🔁',
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    description: 'Review material at increasing intervals: 1 day, 3 days, 7 days, 14 days, 30 days.',
    prompt: 'Schedule your next review: tomorrow, then in 3 days, then a week from now.',
    detailedContent: `
Spaced Repetition is a technique that exploits the "Spacing Effect" for long-term memory.
**How to Use:**
1. Review new information immediately after learning.
2. Create a schedule to revisit the material at 1, 3, 7, 14, and 30-day intervals.
3. If recall is easy, stretch the gap; if difficult, shorten the interval.
4. Use flashcards or apps like Anki to track and manage these intervals.
**Benefits:**
- Prevents the "Forgetting Curve" by reinforcing memory at the point of decay.
- Optimizes study time by focusing only on what needs to be reviewed.
- Converts fleeting short-term information into stable, permanent knowledge.
    `
  },
  {
    id: 'active-recall',
    name: 'Active Recall',
    emoji: '🧠',
    color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    description: 'Close your notes and try to recall everything you just studied. Write it down from memory.',
    prompt: 'Close your book. Write down everything you remember about this topic RIGHT NOW.',
    detailedContent: `
Active Recall is the gold standard of study techniques, focusing on retrieval over recognition.
**How to Use:**
1. After reading a chapter or attending a lecture, close your notes immediately.
2. Write down or say out loud everything you can remember without looking back.
3. Check your work against the source and highlight what you missed.
4. Re-test yourself on the missed parts after a short break.
**Benefits:**
- Strengthens neural pathways by forcing the brain to work for the information.
- Provides immediate, honest feedback on your current level of understanding.
- Significantly more effective than passive review like re-reading or highlighting.
    `
  },
  {
    id: 'interleaving',
    name: 'Interleaving',
    emoji: '🔀',
    color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    description: 'Mix different topics or problem types during a study session instead of focusing on one.',
    prompt: 'Switch to a different subject for the next 15 minutes, then come back. This strengthens connections.',
  },
  {
    id: 'elaborative',
    name: 'Elaborative Interrogation',
    emoji: '❓',
    color: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    description: 'Ask yourself "WHY?" and "HOW?" questions about the material to deepen understanding.',
    prompt: 'Ask yourself: "Why does this work this way?" and "How does this connect to what I already know?"',
  },
  {
    id: 'self-explanation',
    name: 'Self-Explanation',
    emoji: '💬',
    color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    description: 'Explain to yourself how new information relates to what you already know, step by step.',
    prompt: 'Explain each step of the solution out loud. Why does each step follow from the previous one?',
    detailedContent: `
Self-Explanation is the process of talking through your logic as you learn.
**How to Use:**
1. While solving a problem, explain each step out loud to yourself.
2. Ask: "What information does this step add?" and "How does it connect to the goal?"
3. If you can't explain a step, you don't fully understand the logic—go back and review.
**Benefits:**
- Improves your ability to solve new, unfamiliar problems.
- Enhances meta-cognition (awareness of your own thinking process).
- Solidifies logical connections that might otherwise be missed.
    `
  },
  {
    id: 'dual-coding',
    name: 'Dual Coding',
    emoji: '🎨',
    color: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    description: 'Combine words and visuals. Draw diagrams, charts, or mind maps alongside your notes.',
    prompt: 'Draw a diagram or mind map of the concept. Use colors and arrows to show relationships.',
    detailedContent: `
Dual Coding uses two different pathways—verbal and visual—to store info.
**How to Use:**
1. Take your written notes and convert them into a visual format (diagram, map).
2. Look at your visuals and try to explain them in words.
3. Ensure the visual and verbal info are synchronized and reinforce each other.
**Benefits:**
- Provides two distinct ways to retrieve the same information from memory.
- Reduces cognitive load by organizing complex info into simple structures.
- Makes abstract ideas concrete and easier to visualize during exams.
    `
  },
  {
    id: 'mnemonics',
    name: 'Mnemonics',
    emoji: '🔑',
    color: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    description: 'Create acronyms, rhymes, or stories to remember key information more easily.',
    prompt: 'Create a memorable acronym or silly sentence to remember the key points.',
    detailedContent: `
Mnemonics are memory aids that use patterns, associations, and stories.
**How to Use:**
1. Create acronyms (e.g., PEMDAS) or acrostics (e.g., Never Eat Soggy Waffles).
2. Build "Memory Palaces" by placing info in a familiar location.
3. Use rhymes, songs, or vivid stories to connect unrelated facts.
**Benefits:**
- Turns boring or hard-to-remember facts into sticky, memorable cues.
- Great for memorizing lists, orders, or complex terminology.
- Reduces the effort needed to recall specific sequential information.
    `
  },
  {
    id: 'chunking',
    name: 'Chunking',
    emoji: '🧩',
    color: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    description: 'Break complex information into smaller, manageable groups or patterns.',
    prompt: 'Group related concepts together. Can you reduce this to 3-5 main chunks?',
    detailedContent: `
Chunking involves grouping separate bits of info into a meaningful whole.
**How to Use:**
1. Take a large amount of info and look for patterns or categories.
2. Group items into "chunks" of 3 to 7 pieces of information.
3. Master each chunk individually before combining them into the full concept.
**Benefits:**
- Overcomes the limits of working memory (which can hold ~7 items).
- Helps you see the "big picture" while still managing the details.
- Makes it easier to organize and retrieve large datasets or complex topics.
    `
  },
  {
    id: 'method-of-loci',
    name: 'Method of Loci',
    emoji: '🏛️',
    color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    description: 'Place information along a familiar path (like rooms in your house) to remember sequences.',
    prompt: 'Imagine walking through your house. Place each key concept in a different room.',
    detailedContent: `
The Method of Loci is a spatial memory technique used by memory champions.
**How to Use:**
1. Visualize a place you know very well (e.g., your childhood home).
2. Create a specific path through that place.
3. "Deposit" key concepts in specific rooms or on specific furniture.
4. Walk through the space in your mind to retrieve the information.
**Benefits:**
- Leverages our powerful evolutionary ability for spatial navigation.
- Allows for the memorization of massive lists in a specific order.
- Highly effective for speeches, presentations, or complex hierarchies.
    `
  },
  {
    id: 'concrete-examples',
    name: 'Concrete Examples',
    emoji: '🔬',
    color: 'bg-lime-500/10 text-lime-400 border-lime-500/20',
    description: 'Connect abstract concepts to real-world, tangible examples you can relate to.',
    prompt: 'Think of 3 real-world examples where this concept applies in everyday life.',
    detailedContent: `
Concrete Examples make abstract concepts tangible and understandable.
**How to Use:**
1. Take a difficult theory and find 2-3 real-world applications.
2. Explain how the theory specifically applies to each example.
3. Compare the examples to see the underlying pattern of the theory.
**Benefits:**
- Bridges the gap between academic theory and practical reality.
- Makes abstract information easier to visualize and remember.
- Improves your ability to apply knowledge in different contexts.
    `
  },
  {
    id: 'analogies',
    name: 'Analogies',
    emoji: '🪞',
    color: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20',
    description: 'Compare the concept to something you already understand well. "X is like Y because..."',
    prompt: 'Complete this sentence: "This concept is like _____ because _____."',
    detailedContent: `
Analogies use something you already know to explain something you don't.
**How to Use:**
1. Identify the core mechanism of the new concept.
2. Think of a familiar system that works in a similar way (e.g., a cell is like a factory).
3. Map the parts of the familiar system to the parts of the new concept.
**Benefits:**
- Speeds up the learning of complex systems and structures.
- Provides a "mental hook" that makes the information sticky.
- Helps you simplify and communicate complex ideas to others.
    `
  },
];

export const MOTIVATIONAL_QUOTES = [
  "The expert in anything was once a beginner.",
  "Don't wish it were easier. Wish you were better.",
  "Small daily improvements lead to stunning results.",
  "Your brain is a muscle. The more you use it, the stronger it gets.",
  "Consistency beats intensity. Show up every day.",
  "The pain of discipline is far less than the pain of regret.",
  "Every hour you spend studying is an investment in your future.",
  "You don't have to be great to start, but you have to start to be great.",
  "Focus on progress, not perfection.",
  "The secret to getting ahead is getting started.",
];
