export const LEARNING_TECHNIQUES = [
  {
    id: 'feynman',
    name: 'Feynman Method',
    emoji: '🎤',
    color: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    description: 'Explain the concept in simple terms as if teaching a child. If you struggle, identify the gap and review.',
    prompt: 'Try explaining what you just learned in 3 simple sentences. Pretend you\'re teaching a 5-year-old.',
    detailedContent: `
The Feynman Technique is a four-step process for deep learning:
1. **Choose a concept**: Write the name of the concept at the top of a blank page.
2. **Teach it to a child**: Explain the concept in simple language. Avoid jargon. Use analogies.
3. **Identify gaps**: Where did you get stuck? Go back to the source material to relearn those parts.
4. **Review and Simplify**: Refine your explanation until it is crystal clear.
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
Spaced Repetition leverages the "Spacing Effect":
1. **The Forgetting Curve**: We forget info quickly after learning.
2. **Interrupted Forgetting**: Reviewing info right before you forget it strengthens the memory.
3. **Increasing Intervals**: Each successful recall allows for a longer gap before the next review.
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
Active Recall is the most effective study method:
1. **Testing, not Reading**: Re-reading notes is passive. Recalling info from memory is active.
2. **Retrieval Strength**: The effort of trying to remember something makes the memory significantly stronger.
3. **Instant Feedback**: You immediately know what you don't know.
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
  },
  {
    id: 'dual-coding',
    name: 'Dual Coding',
    emoji: '🎨',
    color: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    description: 'Combine words and visuals. Draw diagrams, charts, or mind maps alongside your notes.',
    prompt: 'Draw a diagram or mind map of the concept. Use colors and arrows to show relationships.',
  },
  {
    id: 'mnemonics',
    name: 'Mnemonics',
    emoji: '🔑',
    color: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    description: 'Create acronyms, rhymes, or stories to remember key information more easily.',
    prompt: 'Create a memorable acronym or silly sentence to remember the key points.',
  },
  {
    id: 'chunking',
    name: 'Chunking',
    emoji: '🧩',
    color: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    description: 'Break complex information into smaller, manageable groups or patterns.',
    prompt: 'Group related concepts together. Can you reduce this to 3-5 main chunks?',
  },
  {
    id: 'method-of-loci',
    name: 'Method of Loci',
    emoji: '🏛️',
    color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    description: 'Place information along a familiar path (like rooms in your house) to remember sequences.',
    prompt: 'Imagine walking through your house. Place each key concept in a different room.',
  },
  {
    id: 'concrete-examples',
    name: 'Concrete Examples',
    emoji: '🔬',
    color: 'bg-lime-500/10 text-lime-400 border-lime-500/20',
    description: 'Connect abstract concepts to real-world, tangible examples you can relate to.',
    prompt: 'Think of 3 real-world examples where this concept applies in everyday life.',
  },
  {
    id: 'analogies',
    name: 'Analogies',
    emoji: '🪞',
    color: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20',
    description: 'Compare the concept to something you already understand well. "X is like Y because..."',
    prompt: 'Complete this sentence: "This concept is like _____ because _____."',
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
