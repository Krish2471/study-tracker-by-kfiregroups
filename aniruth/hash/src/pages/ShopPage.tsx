import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, AVATAR_SHOP, type AvatarItem } from '../store/useGameStore';
import { Coins, Lock, Check, ShoppingBag } from 'lucide-react';
import { Logo } from '../components/common/Logo';

export const ShopPage = () => {
  const { coins, ownedItems, equippedItems, getLevel, buyItem, equipItem, unequipItem } = useGameStore();
  const level = getLevel();
  const [activeCategory, setActiveCategory] = useState<'hat' | 'face' | 'accessory' | 'background'>('hat');
  const [toast, setToast] = useState<string | null>(null);

  const categories: { key: AvatarItem['category']; label: string; emoji: string }[] = [
    { key: 'hat', label: 'Hats', emoji: '🎩' },
    { key: 'face', label: 'Faces', emoji: '😎' },
    { key: 'accessory', label: 'Accessories', emoji: '⭐' },
    { key: 'background', label: 'Backgrounds', emoji: '🌈' },
  ];

  const filteredItems = AVATAR_SHOP.filter(i => i.category === activeCategory);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleBuy = (item: AvatarItem) => {
    if (ownedItems.includes(item.id)) {
      // Toggle equip
      if (equippedItems[item.category] === item.id) {
        unequipItem(item.category);
        showToast(`Unequipped ${item.name}`);
      } else {
        equipItem(item.id, item.category);
        showToast(`Equipped ${item.name}!`);
      }
      return;
    }
    const success = buyItem(item.id);
    if (success) {
      equipItem(item.id, item.category);
      showToast(`Bought & equipped ${item.name}! 🎉`);
    } else if (level.level < item.levelRequired) {
      showToast(`Reach Level ${item.levelRequired} to unlock this!`);
    } else {
      showToast(`Not enough coins!`);
    }
  };



  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Logo size={48} />
          <div>
            <h1 className="text-2xl md:text-3xl font-black">Avatar Shop</h1>
            <p className="text-text-muted text-sm mt-1">Spend your hard-earned coins</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-coin/10 px-4 py-2 rounded-full border border-coin/20">
          <Coins size={18} className="text-coin" />
          <span className="font-bold text-coin text-lg">{coins}</span>
        </div>
      </header>

      <div className="space-y-4">
          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                  activeCategory === cat.key
                    ? 'bg-brand text-white shadow-glow'
                    : 'bg-surface border border-border text-text-secondary hover:border-brand/30'
                }`}
              >
                <span>{cat.emoji}</span> {cat.label}
              </button>
            ))}
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filteredItems.map((item) => {
              const owned = ownedItems.includes(item.id);
              const equipped = equippedItems[item.category] === item.id;
              const locked = level.level < item.levelRequired;
              const canAfford = coins >= item.cost;

              return (
                <motion.button
                  key={item.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleBuy(item)}
                  className={`glass rounded-2xl p-4 border text-left transition-all relative overflow-hidden ${
                    equipped ? 'border-brand shadow-glow' : locked ? 'border-border opacity-60' : 'border-border hover:border-brand/30'
                  }`}
                >
                  {equipped && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-brand flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                  {locked && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-text-muted/20 flex items-center justify-center">
                      <Lock size={12} className="text-text-muted" />
                    </div>
                  )}
                  <div className="text-3xl mb-3">{item.emoji}</div>
                  <p className="font-bold text-sm">{item.name}</p>
                  <div className="flex items-center justify-between mt-2">
                    {owned ? (
                      <span className="text-xs font-bold text-success">Owned</span>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Coins size={12} className="text-coin" />
                        <span className={`text-xs font-bold ${canAfford ? 'text-coin' : 'text-danger'}`}>{item.cost}</span>
                      </div>
                    )}
                    {locked && <span className="text-[10px] font-bold text-text-muted">Lv.{item.levelRequired}</span>}
                  </div>
                </motion.button>
              );
            })}
          </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 bg-surface border border-border glass px-6 py-3 rounded-2xl shadow-card-dark z-50"
          >
            <p className="font-semibold text-sm flex items-center gap-2"><ShoppingBag size={16} className="text-brand" /> {toast}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
