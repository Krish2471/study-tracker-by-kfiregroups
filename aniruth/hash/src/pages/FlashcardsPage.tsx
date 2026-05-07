import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFlashcardStore } from '../store/useFlashcardStore';
import { useSubjectsStore } from '../store/useSubjectsStore';
import {
  Plus, Play, ChevronLeft, Trash2, RotateCcw,
  Brain, Layers,
} from 'lucide-react';

export const FlashcardsPage = () => {
  const {
    decks, activeDeckId, isStudying, studyIndex, isFlipped,
    createDeck, deleteDeck, addCard, deleteCard, rateCard,
    startStudy, nextCard, flipCard, stopStudy, getDueCards, getDeckStats,
    startSubjectStudy, getAllDueCards, getSubjectStats,
  } = useFlashcardStore();
  const { subjects, addSubject } = useSubjectsStore();

  const [showNewDeck, setShowNewDeck] = useState(false);
  const [deckTitle, setDeckTitle] = useState('');
  const [deckSubject, setDeckSubject] = useState(subjects[0] || 'General');
  const [addingSubject, setAddingSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [cardFront, setCardFront] = useState('');
  const [cardBack, setCardBack] = useState('');
  const [viewDeck, setViewDeck] = useState<string | null>(null);

  const activeDeck = decks.find((d) => d.id === activeDeckId);
  const viewingDeck = decks.find((d) => d.id === viewDeck);
  const isSubjectStudy = activeDeckId?.startsWith('subject-');
  const activeSubject = isSubjectStudy ? activeDeckId?.replace('subject-', '') : null;

  const dueCards = useMemo(() => {
    if (!activeDeckId) return [];
    if (activeDeckId.startsWith('subject-')) {
      const subject = activeDeckId.replace('subject-', '');
      const now = new Date();
      return decks
        .filter(d => d.subject === subject)
        .flatMap(d => d.cards.filter(c => c.difficulty === 'new' || new Date(c.nextReview) <= now));
    }
    return getDueCards(activeDeckId);
  }, [activeDeckId, decks]);

  const currentCard = isStudying && dueCards[studyIndex] ? dueCards[studyIndex] : null;

  const handleCreateDeck = () => {
    if (!deckTitle.trim()) return;
    createDeck(deckSubject, deckTitle.trim());
    setDeckTitle('');
    setShowNewDeck(false);
  };

  const handleAddCard = () => {
    if (!cardFront.trim() || !cardBack.trim() || !viewDeck) return;
    addCard(viewDeck, cardFront.trim(), cardBack.trim());
    setCardFront('');
    setCardBack('');
  };

  const handleRate = (rating: 0 | 1 | 2 | 3 | 4 | 5) => {
    if (!activeDeckId || !currentCard) return;
    rateCard(activeDeckId, currentCard.id, rating);
    if (studyIndex < dueCards.length - 1) {
      nextCard();
    } else {
      stopStudy();
    }
  };

  // Study Mode
  if (isStudying && (activeDeck || isSubjectStudy)) {
    if (!currentCard) {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center min-h-[60vh]">
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            className="text-6xl mb-4"
          >
            🎉
          </motion.div>
          <h2 className="text-2xl font-black mb-2">Session Complete!</h2>
          <p className="text-text-muted mb-6">You reviewed all {dueCards.length} due cards</p>
          <div className="flex gap-3">
            <button
              onClick={stopStudy}
              className="px-6 py-3 bg-brand text-white font-bold rounded-xl hover:bg-brand-dark transition-colors"
            >
              Back to Decks
            </button>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button onClick={stopStudy} className="flex items-center gap-2 text-text-muted hover:text-text text-sm font-semibold">
            <ChevronLeft size={16} /> Exit
          </button>
          <div className="text-center">
            <p className="text-xs font-bold text-text-muted">{isSubjectStudy ? `Subject: ${activeSubject}` : activeDeck?.title}</p>
            <p className="text-[10px] text-text-muted">{studyIndex + 1} / {dueCards.length}</p>
          </div>
          <div className="w-16" />
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
          <motion.div
            className="level-bar h-full rounded-full"
            animate={{ width: `${((studyIndex + 1) / dueCards.length) * 100}%` }}
          />
        </div>

        {/* Card */}
        <div
          className="relative cursor-pointer"
          style={{ perspective: '1000px' }}
          onClick={flipCard}
        >
          <motion.div
            className="relative w-full min-h-[300px]"
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Front */}
            <div
              className="absolute inset-0 glass rounded-3xl border border-border p-8 flex flex-col items-center justify-center"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <p className="text-[10px] font-bold text-brand uppercase tracking-widest mb-4">Question</p>
              <p className="text-lg md:text-xl font-bold text-center leading-relaxed">{currentCard.front}</p>
              <p className="text-xs text-text-muted mt-6">Tap to reveal answer</p>
            </div>

            {/* Back */}
            <div
              className="absolute inset-0 glass rounded-3xl border border-brand/20 p-8 flex flex-col items-center justify-center bg-gradient-to-br from-brand/5 to-transparent"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <p className="text-[10px] font-bold text-accent uppercase tracking-widest mb-4">Answer</p>
              <p className="text-lg md:text-xl font-bold text-center leading-relaxed">{currentCard.back}</p>
            </div>
          </motion.div>
        </div>

        {/* Rating Buttons (only show when flipped) */}
        <AnimatePresence>
          {isFlipped && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="flex gap-2"
            >
              <button
                onClick={() => handleRate(0)}
                className="flex-1 py-3 rounded-xl bg-danger/10 text-danger font-bold text-sm hover:bg-danger/20 transition-colors border border-danger/20"
              >
                <RotateCcw size={14} className="inline mr-1.5 -mt-0.5" />Again
              </button>
              <button
                onClick={() => handleRate(2)}
                className="flex-1 py-3 rounded-xl bg-warning/10 text-warning font-bold text-sm hover:bg-warning/20 transition-colors border border-warning/20"
              >
                Hard
              </button>
              <button
                onClick={() => handleRate(3)}
                className="flex-1 py-3 rounded-xl bg-success/10 text-success font-bold text-sm hover:bg-success/20 transition-colors border border-success/20"
              >
                Good
              </button>
              <button
                onClick={() => handleRate(5)}
                className="flex-1 py-3 rounded-xl bg-brand/10 text-brand font-bold text-sm hover:bg-brand/20 transition-colors border border-brand/20"
              >
                Easy
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  // Deck Detail View
  if (viewingDeck) {
    const stats = getDeckStats(viewingDeck.id);
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => setViewDeck(null)} className="p-2 rounded-xl hover:bg-surface-hover transition-colors">
            <ChevronLeft size={18} />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-black">{viewingDeck.title}</h1>
            <p className="text-text-muted text-sm">{viewingDeck.subject} · {viewingDeck.cards.length} cards</p>
          </div>
          {stats.due > 0 && (
            <button
              onClick={() => startStudy(viewingDeck.id)}
              className="bg-brand text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-brand-dark transition-colors flex items-center gap-2 shadow-glow"
            >
              <Play size={14} /> Study ({stats.due} due)
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total', value: stats.total, color: 'text-text' },
            { label: 'New', value: stats.newCards, color: 'text-brand' },
            { label: 'Learning', value: stats.learning, color: 'text-warning' },
            { label: 'Mastered', value: stats.mastered, color: 'text-success' },
          ].map((s) => (
            <div key={s.label} className="glass rounded-xl p-3 border border-border text-center">
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-[10px] font-bold text-text-muted uppercase">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Add Card */}
        <div className="glass rounded-2xl p-5 border border-border">
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><Plus size={14} /> Add Card</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <textarea
              value={cardFront}
              onChange={(e) => setCardFront(e.target.value)}
              placeholder="Question (front)"
              rows={3}
              className="px-4 py-3 rounded-xl bg-surface border border-border text-sm outline-none focus:ring-2 focus:ring-brand resize-none"
            />
            <textarea
              value={cardBack}
              onChange={(e) => setCardBack(e.target.value)}
              placeholder="Answer (back)"
              rows={3}
              className="px-4 py-3 rounded-xl bg-surface border border-border text-sm outline-none focus:ring-2 focus:ring-brand resize-none"
            />
          </div>
          <button
            onClick={handleAddCard}
            disabled={!cardFront.trim() || !cardBack.trim()}
            className="mt-3 w-full py-2.5 bg-brand text-white font-bold text-sm rounded-xl hover:bg-brand-dark transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Add Card
          </button>
        </div>

        {/* Card List */}
        <div className="glass rounded-2xl p-5 border border-border">
          <h3 className="font-bold text-sm mb-3">All Cards ({viewingDeck.cards.length})</h3>
          {viewingDeck.cards.length === 0 ? (
            <p className="text-text-muted text-sm text-center py-6">No cards yet. Add some above!</p>
          ) : (
            <ul className="space-y-2 max-h-[400px] overflow-y-auto">
              {viewingDeck.cards.map((card) => (
                <li key={card.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-hover transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{card.front}</p>
                    <p className="text-xs text-text-muted truncate">{card.back}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    card.difficulty === 'new' ? 'bg-brand/10 text-brand' :
                    card.difficulty === 'mastered' ? 'bg-success/10 text-success' :
                    card.difficulty === 'learning' ? 'bg-warning/10 text-warning' :
                    'bg-accent/10 text-accent'
                  }`}>
                    {card.difficulty}
                  </span>
                  <button onClick={() => deleteCard(viewingDeck.id, card.id)} className="p-1.5 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger">
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </motion.div>
    );
  }

  // Deck Grid (default view)
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-black">Flashcards</h1>
          <p className="text-text-muted text-sm mt-1">Spaced repetition for better retention</p>
        </div>
        <div className="flex gap-2">
          {getAllDueCards().length > 0 && (
            <button
              onClick={() => {
                // For "Review All", we can just pick the first subject or implement a global startStudy
                // For now, let's just show a prompt or start with the first subject that has due cards
                const subjectsWithDue = subjects.filter(s => getSubjectStats(s).due > 0);
                if (subjectsWithDue.length > 0) startSubjectStudy(subjectsWithDue[0]);
              }}
              className="bg-brand/10 text-brand px-4 py-2 rounded-xl text-sm font-bold hover:bg-brand/20 transition-colors flex items-center gap-1.5"
            >
              <Brain size={14} /> Review All ({getAllDueCards().length})
            </button>
          )}
          <button
            onClick={() => setShowNewDeck(true)}
            className="bg-brand text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-brand-dark transition-colors flex items-center gap-1.5"
          >
            <Plus size={14} /> New Deck
          </button>
        </div>
      </header>

      {/* Subject Quick Review */}
      {subjects.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {subjects.map(subject => {
            const stats = getSubjectStats(subject);
            if (stats.total === 0) return null;
            return (
              <button
                key={subject}
                onClick={() => startSubjectStudy(subject)}
                className={`flex-shrink-0 px-4 py-2 rounded-2xl border transition-all text-left min-w-[140px] ${stats.due > 0 ? 'bg-brand/5 border-brand/20 hover:bg-brand/10' : 'bg-surface border-border hover:border-text-muted'}`}
              >
                <p className="text-[10px] font-black uppercase text-text-muted mb-1">{subject}</p>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold">{stats.due} Due</p>
                  <p className="text-[10px] text-text-muted">{stats.total} total</p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Decks Grid */}
      {decks.length === 0 ? (
        <div className="glass rounded-3xl p-12 border border-border text-center">
          <Layers size={48} className="mx-auto text-text-muted/30 mb-3" />
          <p className="text-text-muted font-semibold">No flashcard decks yet</p>
          <p className="text-text-muted text-sm mt-1">Create a deck to get started with spaced repetition</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {decks.map((deck) => {
            const stats = getDeckStats(deck.id);
            const progressPct = stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : 0;
            return (
              <motion.div
                key={deck.id}
                whileHover={{ scale: 1.02 }}
                className="glass rounded-2xl p-5 border border-border cursor-pointer group hover:border-brand/30 transition-all"
                onClick={() => setViewDeck(deck.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold">{deck.title}</p>
                    <p className="text-[10px] font-bold text-brand">{deck.subject}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteDeck(deck.id); }}
                    className="p-1.5 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-text-muted">
                    <Layers size={10} />{stats.total} cards
                  </div>
                  {stats.due > 0 && (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-brand">
                      <Brain size={10} />{stats.due} due
                    </div>
                  )}
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                  <div className="level-bar h-full rounded-full" style={{ width: `${progressPct}%` }} />
                </div>
                <p className="text-[10px] text-text-muted mt-1">{progressPct}% mastered</p>

                {stats.due > 0 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); startStudy(deck.id); }}
                    className="mt-3 w-full py-2 bg-brand/10 text-brand font-bold text-xs rounded-xl hover:bg-brand/20 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Play size={12} /> Study Now
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* New Deck Modal */}
      <AnimatePresence>
        {showNewDeck && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowNewDeck(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass rounded-2xl p-6 border border-border max-w-sm w-full space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-bold text-lg">New Flashcard Deck</h3>
              <div>
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1">Title</label>
                <input
                  type="text"
                  value={deckTitle}
                  onChange={(e) => setDeckTitle(e.target.value)}
                  placeholder="e.g. Chemistry Chapter 5"
                  className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-sm outline-none focus:ring-2 focus:ring-brand"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1">Subject</label>
                <select
                  value={deckSubject}
                  onChange={(e) => {
                    if (e.target.value === '__add_new__') {
                      setAddingSubject(true);
                    } else {
                      setDeckSubject(e.target.value);
                    }
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-sm outline-none"
                >
                  {subjects.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                  <option value="__add_new__">+ Add New Subject</option>
                </select>
                {addingSubject && (
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={newSubjectName}
                      onChange={(e) => setNewSubjectName(e.target.value)}
                      placeholder="New subject name..."
                      className="flex-1 px-3 py-2 rounded-xl bg-surface border border-border text-sm outline-none focus:ring-2 focus:ring-brand"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newSubjectName.trim()) {
                          addSubject(newSubjectName.trim());
                          setDeckSubject(newSubjectName.trim());
                          setNewSubjectName('');
                          setAddingSubject(false);
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        if (newSubjectName.trim()) {
                          addSubject(newSubjectName.trim());
                          setDeckSubject(newSubjectName.trim());
                          setNewSubjectName('');
                          setAddingSubject(false);
                        }
                      }}
                      className="px-3 py-2 bg-brand text-white rounded-xl text-sm font-bold"
                    >Add</button>
                  </div>
                )}
              </div>
              <button
                onClick={handleCreateDeck}
                disabled={!deckTitle.trim()}
                className="w-full py-3 bg-brand text-white font-bold text-sm rounded-xl hover:bg-brand-dark transition-colors disabled:opacity-30"
              >
                Create Deck
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
