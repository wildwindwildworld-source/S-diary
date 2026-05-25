import React, { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  AlertTriangle,
  RotateCcw,
  TrendingUp,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CalendarView, StoolLog } from "./components/CalendarView";
import { WidgetSimulator } from "./components/WidgetSimulator";
import { ApplianceStockManager } from "./components/ApplianceStockManager";
import { NotificationBanner } from "./components/NotificationBanner";
import { StatsView } from "./components/StatsView";

// Setup Initial Helper to generate rich dummy logs from Feb 1 to May 26, 2026
function generateDummyLogs(): StoolLog[] {
  const dummyLogs: StoolLog[] = [];
  const startDate = new Date(2026, 1, 1); // Feb 1, 2026 (Month is 0-indexed, so 1 is Feb)
  const endDate = new Date(2026, 4, 26);   // May 26, 2026 (Month index 4 is May)

  const regularNotes = [
    "朝食後にすっきり出ました。良好です。",
    "水分を意識して多く摂りました。順調。",
    "特にお腹の張りもなく快適な時間帯。",
    "少しガスが多めですが問題ナシ。",
    "軽い散歩をして体を動かし、腸内調律。",
    "消化も良く、普段通りの平穏な一日。",
    "お腹の調子はとても良く安定中。",
    "昼食後に腹鳴があったが、その後は快調。",
    "肌への刺激が少なく、ストーマ周辺快適。",
    "水分バランスが良くスムーズな排出。",
    "規則正しい3食を実践。"
  ];

  const starredNotes = [
    "☆ 夜間に少し皮膚の痒みを感じたため丁寧にしっとり保湿。",
    "☆ 排泄物がやや緩い。冷たい飲料を控えるように注視。",
    "☆ ストーマ周囲に皮膚パウダーを軽く。状態は健全。",
    "☆ 面板の密着度を確認。漏れの気配もなくパーフェクト。",
    "☆ 夕食以降に回数が小刻み。消化に良いお粥を摂取した。",
    "☆ ストーマ外観は綺麗。そろそろ次回注文分の在庫確認を予定。",
    "☆ 軽い腹部圧迫感があったが、排泄後はすぐにすっきり解消。",
    "☆ 皮膚保護ウエハを丁寧に位置調整して優しく装着。"
  ];

  const changeNotes = [
    "定期装具交換を実施しました。皮膚トラブルやかぶれは一切なし。",
    "中2日での定期的な面板交換。ストーマ周囲の洗浄を丹念に実施。",
    "定期的なタイミングで装具交換。剥離剤使用でノーストレス剥ぎ。",
    "装具の定期メンテナンス。ストーマ周囲の皮膚は非常にモチモチ良好。"
  ];

  // Pseudo-random generator with seed to keep it consistent
  let seed = 12345;
  const pseudoRandom = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  const timeDiff = endDate.getTime() - startDate.getTime();
  const dayCount = Math.floor(timeDiff / (24 * 60 * 60 * 1000)) + 1;

  for (let i = 0; i < dayCount; i++) {
    const currentDay = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    
    // 1. 1日の平均排便回数は3回（ばらつきあり）
    const rVal = pseudoRandom();
    let dailyLogCount = 3;
    if (rVal < 0.12) dailyLogCount = 1;
    else if (rVal < 0.35) dailyLogCount = 2;
    else if (rVal < 0.70) dailyLogCount = 3;
    else if (rVal < 0.90) dailyLogCount = 4;
    else dailyLogCount = 5;

    // 6. 装具交換の頻度は中2日で3日ごとの交換 (i % 3 === 0)
    const isApplianceChangeDay = (i % 3 === 0);

    for (let currentNum = 0; currentNum < dailyLogCount; currentNum++) {
      // 2. 1回の排便量の平均は並(2)でばらつきあり (少: 20%, 並: 60%, 多: 20%)
      const amtRand = pseudoRandom();
      let amount = 2;
      if (amtRand < 0.20) amount = 1;
      else if (amtRand < 0.80) amount = 2;
      else amount = 3;

      // 3. 便の柔らかさは並(2)が半分以上でばらつきあり (軟: 20%, 普: 60%, 硬: 20%)
      const hardRand = pseudoRandom();
      let hardness = 2;
      if (hardRand < 0.20) hardness = 1;
      else if (hardRand < 0.80) hardness = 2;
      else hardness = 3;

      // Make the appalince change action tied to the first stool record of that day
      const isChanged = isApplianceChangeDay && (currentNum === 0);

      // Notes
      let note = "";
      if (isChanged) {
        // Tied appliance change memo
        const noteIdx = Math.floor(pseudoRandom() * changeNotes.length);
        note = changeNotes[noteIdx];
      } else {
        // 4. コメントは3日に1度くらいの一言。 
        // 5. 重要コメント(☆)は10日に1度くらいの頻度。
        // trigger check: ~12% probability per record ensures ~33% overall day-level notes.
        const noteTrigger = pseudoRandom();
        if (noteTrigger < 0.12) {
          // ~30% probability of a starred important note
          const isImportant = pseudoRandom() < 0.30;
          if (isImportant) {
            const noteIdx = Math.floor(pseudoRandom() * starredNotes.length);
            note = starredNotes[noteIdx];
          } else {
            const noteIdx = Math.floor(pseudoRandom() * regularNotes.length);
            note = regularNotes[noteIdx];
          }
        }
      }

      // Timing calculations to look highly natural (8:00, 13:00, 19:00 with variance)
      let hour = 8;
      if (dailyLogCount === 1) {
        hour = 9 + Math.floor(pseudoRandom() * 6); // 9 AM - 3 PM
      } else {
        const slots = [8, 13, 19, 11, 16];
        hour = slots[currentNum % 5] + Math.floor(pseudoRandom() * 3) - 1; // offset +/- 1hr
      }
      const minute = Math.floor(pseudoRandom() * 60);

      const logTimestamp = new Date(
        currentDay.getFullYear(),
        currentDay.getMonth(),
        currentDay.getDate(),
        hour,
        minute
      ).getTime();

      dummyLogs.push({
        id: `dummy-log-${i}-${currentNum}`,
        amount,
        hardness,
        isApplianceChanged: isChanged,
        note,
        timestamp: logTimestamp
      });
    }
  }

  // Sort by newest first
  return dummyLogs.sort((a, b) => b.timestamp - a.timestamp);
}

const INITIAL_LOGS: StoolLog[] = generateDummyLogs();

export default function App() {
  // Active dashboard tab: "quick" | "diary" | "stats" | "stock"
  const [activeTab, setActiveTab] = useState<"quick" | "diary" | "stats" | "stock" >("quick");

  // Core App states persisted to localStorage
  const [logs, setLogs] = useState<StoolLog[]>([]);
  const [applianceStock, setApplianceStock] = useState<number>(10);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Alarm and vibration states
  const [showWarningNotification, setShowWarningNotification] = useState<boolean>(false);
  const [shakeDevice, setShakeDevice] = useState<boolean>(false);
  const [lastInsertedLogToast, setLastInsertedLogToast] = useState<string | null>(null);

  // Initialize and load States from LocalStorage
  useEffect(() => {
    const savedLogs = localStorage.getItem("stool_diary_logs");
    const savedStock = localStorage.getItem("stool_diary_stock");
    const hasInitialized = localStorage.getItem("stool_diary_initialized");
    
    if (savedLogs && hasInitialized === "true") {
      setLogs(JSON.parse(savedLogs));
    } else {
      setLogs(INITIAL_LOGS);
      localStorage.setItem("stool_diary_logs", JSON.stringify(INITIAL_LOGS));
      localStorage.setItem("stool_diary_initialized", "true");
    }

    if (savedStock) {
      setApplianceStock(parseInt(savedStock, 10));
    } else {
      setApplianceStock(10);
      localStorage.setItem("stool_diary_stock", "10");
    }
  }, []);

  // Sync state modifications to LocalStorage
  const saveLogsToStorage = (updatedLogs: StoolLog[]) => {
    setLogs(updatedLogs);
    localStorage.setItem("stool_diary_logs", JSON.stringify(updatedLogs));
  };

  const saveStockToStorage = (updatedStock: number) => {
    setApplianceStock(updatedStock);
    localStorage.setItem("stool_diary_stock", updatedStock.toString());
  };

  // Stool Log actions
  const handleAddLog = (newLogFields: Omit<StoolLog, "id" | "timestamp">, customTimestamp?: number) => {
    // Determine target timestamp based on active selected calendar date, or use custom overriding timestamp (e.g., from widget)
    const targetTimestamp = customTimestamp || new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      new Date().getHours(),
      new Date().getMinutes()
    ).getTime();

    const newLog: StoolLog = {
      id: `log-${Math.random().toString(36).substring(3, 9)}`,
      timestamp: targetTimestamp,
      ...newLogFields,
    };

    const nextLogs = [newLog, ...logs];
    saveLogsToStorage(nextLogs);

    // If appliance changed is checked, deduct -1 stock & deploy alerts if necessary
    if (newLogFields.isApplianceChanged) {
      handleApplianceDeduction();
    } else {
      showSuccessLogToast("排便の記録を追加しました。");
    }
  };

  const handleDeleteLog = (id: string) => {
    const nextLogs = logs.filter((l) => l.id !== id);
    saveLogsToStorage(nextLogs);
    showSuccessLogToast("記録を削除しました。");
  };

  const handleEditLog = (updatedLog: StoolLog) => {
    // Find previous state to see if isApplianceChanged transitioned from false to true
    const previousLog = logs.find((l) => l.id === updatedLog.id);
    const wasApplianceChangedBefore = previousLog?.isApplianceChanged || false;

    const nextLogs = logs.map((l) => (l.id === updatedLog.id ? updatedLog : l));
    saveLogsToStorage(nextLogs);

    if (updatedLog.isApplianceChanged && !wasApplianceChangedBefore) {
      handleApplianceDeduction();
    } else {
      showSuccessLogToast("記録を保存しました。");
    }
  };

  // Stock deduction & Warning Trigger logic
  const handleApplianceDeduction = () => {
    const currentStock = applianceStock;
    const nextStock = Math.max(0, currentStock - 1);
    saveStockToStorage(nextStock);

    showSuccessLogToast("装具交換を記録しました。（在庫 -1回分）");

    // Under-stock warning check (Stock <= 5)
    if (nextStock <= 5) {
      triggerVibrationFeedback();
      setShowWarningNotification(true);
    }
  };

  // Trigger web vibration API (fallback to UI screen shake)
  const triggerVibrationFeedback = () => {
    setShakeDevice(true);
    setTimeout(() => setShakeDevice(false), 6000);

    if (navigator.vibrate) {
      // Shakes 3 times quickly (Android warning vibration pattern simulation)
      navigator.vibrate([150, 100, 150, 100, 200]);
    }
  };

  // Handle direct Appliance Quick log from Widget Simulator
  const handleWidgetQuickLog = (amount: number, hardness: number, isApplianceChanged: boolean, note: string) => {
    // Add logger using the true exact current date/time regardless of active selected calendar date
    const logItem: Omit<StoolLog, "id" | "timestamp"> = {
      amount,
      hardness,
      isApplianceChanged,
      note,
    };
    handleAddLog(logItem, new Date().getTime());
    showSuccessLogToast(`クイック記録から ${amount === 1 ? "少" : amount === 2 ? "並" : "多"}${hardness === 1 ? "軟" : hardness === 2 ? "普" : "硬"} の記録を送信しました。`);
  };

  const handleWidgetApplianceChanged = (note: string) => {
    // Add appliance change with the true exact current date/time regardless of active selected calendar date
    const logItem: Omit<StoolLog, "id" | "timestamp"> = {
      amount: null,
      hardness: null,
      isApplianceChanged: true,
      note: note || "クイック記録からの装具交換",
    };
    handleAddLog(logItem, new Date().getTime());
  };

  // Success indicator message toasts
  const showSuccessLogToast = (msg: string) => {
    setLastInsertedLogToast(msg);
    setTimeout(() => {
      setLastInsertedLogToast((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  // Backup handlers
  const handleImportBackup = (importedStock: number, importedLogs: StoolLog[]) => {
    saveStockToStorage(importedStock);
    saveLogsToStorage(importedLogs);
    showSuccessLogToast("バックアップデータを正しく読み込みました。");
  };

  const handleClearAll = () => {
    saveLogsToStorage([]);
    saveStockToStorage(10);
    localStorage.setItem("stool_diary_initialized", "true");
    setShowWarningNotification(false);
    showSuccessLogToast("データを初期化しました。");
  };

  // Swipe tab switching logic for touchscreen/mobile users
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.targetTouches.length === 1) {
      setTouchStartX(e.targetTouches[0].clientX);
      setTouchStartY(e.targetTouches[0].clientY);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || touchStartY === null) return;
    if (e.changedTouches.length !== 1) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    // Horizontal swipe must be greater than vertical and cross 60px distance threshold
    const minSwipeDistance = 60;
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > minSwipeDistance) {
      // Keep user experience smooth by ignoring swipes while typing comments or updating forms
      const activeEl = document.activeElement;
      if (
        activeEl && (
          activeEl.tagName === "INPUT" || 
          activeEl.tagName === "TEXTAREA" || 
          activeEl.getAttribute("contenteditable") === "true"
        )
      ) {
        return;
      }

      const tabOrder: ("quick" | "diary" | "stats" | "stock")[] = ["quick", "diary", "stats", "stock"];
      const currentIndex = tabOrder.indexOf(activeTab);

      if (diffX > 0) {
        // Swiped Right -> Pull Previous/Left Tab
        const prevIndex = (currentIndex - 1 + tabOrder.length) % tabOrder.length;
        setActiveTab(tabOrder[prevIndex]);
      } else {
        // Swiped Left -> Pull Next/Right Tab
        const nextIndex = (currentIndex + 1) % tabOrder.length;
        setActiveTab(tabOrder[nextIndex]);
      }
    }

    setTouchStartX(null);
    setTouchStartY(null);
  };

  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 sm:p-6 lg:p-8 flex flex-col gap-6"
    >
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          10% { transform: translate(-3px, 3px) rotate(-1deg); }
          20% { transform: translate(-3px, -1px) rotate(1deg); }
          30% { transform: translate(3px, 1px) rotate(0deg); }
          40% { transform: translate(1px, -1px) rotate(1deg); }
          50% { transform: translate(-1px, 2px) rotate(-1deg); }
          60% { transform: translate(-3px, 1px) rotate(0deg); }
          70% { transform: translate(2px, 1px) rotate(-1deg); }
          80% { transform: translate(-1px, -1px) rotate(1deg); }
          90% { transform: translate(2px, 2px) rotate(0deg); }
        }
        .vibrate-heavy {
          animation: shake 0.6s infinite;
        }
      `}</style>

      {/* Global alert toaster message layer */}
      <NotificationBanner
        visible={showWarningNotification}
        stockCount={applianceStock}
        onClear={() => setShowWarningNotification(false)}
      />

      {/* Responsive Segmented Tab Control (Visible on all screens) */}
      <div className="max-w-3xl w-full mx-auto flex bg-white p-1.5 rounded-2xl border border-slate-200/60 shadow-sm relative z-10 select-none">
        <button
          onClick={() => setActiveTab("quick")}
          id="btn-tab-quick"
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 px-1 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-150 cursor-pointer ${
            activeTab === "quick"
              ? "bg-slate-900 text-white shadow-md font-black"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-50/50"
          }`}
        >
          <Zap className={`w-4 h-4 ${activeTab === "quick" ? "text-amber-400 fill-amber-400/20" : "text-amber-500"}`} />
          <span className="hidden sm:inline">1タップクイック記録</span>
          <span className="sm:hidden">⚡ クイック</span>
        </button>
        <button
          onClick={() => setActiveTab("diary")}
          id="btn-tab-diary"
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 px-1 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-150 cursor-pointer ${
            activeTab === "diary"
              ? "bg-slate-900 text-white shadow-md font-black"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-50/50"
          }`}
        >
          <CalendarIcon className={`w-4 h-4 ${activeTab === "diary" ? "text-emerald-400" : "text-emerald-600"}`} />
          <span className="hidden sm:inline">カレンダー・日誌</span>
          <span className="sm:hidden">📅 日誌</span>
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          id="btn-tab-stats"
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 px-1 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-150 cursor-pointer ${
            activeTab === "stats"
              ? "bg-slate-900 text-white shadow-md font-black"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-50/50"
          }`}
        >
          <TrendingUp className={`w-4 h-4 ${activeTab === "stats" ? "text-blue-400" : "text-blue-600"}`} />
          <span className="hidden sm:inline">統計分析診断</span>
          <span className="sm:hidden">📊 統計</span>
        </button>
        <button
          onClick={() => setActiveTab("stock")}
          id="btn-tab-stock"
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 px-1 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-150 cursor-pointer ${
            activeTab === "stock"
              ? "bg-slate-900 text-white shadow-md font-black"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-50/50"
          }`}
        >
          <RotateCcw className={`w-4 h-4 ${activeTab === "stock" ? "text-purple-400" : "text-purple-600"}`} />
          <span className="hidden sm:inline">在庫・データ管理</span>
          <span className="sm:hidden">⚙️ 在庫</span>
        </button>
      </div>

      {/* Main viewport Container: Premium Dynamic Tab Content views */}
      <main className="max-w-7xl w-full mx-auto flex-1">
        <AnimatePresence mode="wait">
          {activeTab === "quick" && (
            <motion.div
              key="quick-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="max-w-md mx-auto w-full"
            >
              <WidgetSimulator
                applianceStock={applianceStock}
                onQuickLog={handleWidgetQuickLog}
                onWidgetApplianceChanged={handleWidgetApplianceChanged}
              />
            </motion.div>
          )}

          {activeTab === "diary" && (
            <motion.div
              key="diary-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="max-w-3xl mx-auto w-full font-medium"
            >
              <CalendarView
                logs={logs}
                selectedDate={selectedDate}
                onSelectDate={(d) => setSelectedDate(d)}
                onAddLog={handleAddLog}
                onDeleteLog={handleDeleteLog}
                onEditLog={handleEditLog}
              />
            </motion.div>
          )}

          {activeTab === "stats" && (
            <motion.div
              key="stats-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="max-w-3xl mx-auto w-full"
            >
              <StatsView logs={logs} />
            </motion.div>
          )}

          {activeTab === "stock" && (
            <motion.div
              key="stock-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="max-w-2xl mx-auto w-full"
            >
              <ApplianceStockManager
                stockCount={applianceStock}
                onUpdateStock={(v) => saveStockToStorage(v)}
                logs={logs}
                onImportBackup={handleImportBackup}
                onClearAll={handleClearAll}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>


      {/* App Success Toast message pop-up layer (Fixed bottom of overall browser viewport) */}
      {lastInsertedLogToast && (
        <div className="fixed bottom-6 right-6 bg-slate-900/95 backdrop-blur-xs text-white text-xs text-center py-3 px-5 rounded-2xl shadow-xl border border-white/5 z-50 transition duration-300 animate-slide-up flex items-center gap-2">
          <span>👍</span>
          <span className="font-semibold">{lastInsertedLogToast}</span>
        </div>
      )}

      {/* Page simple footer */}
      <footer className="max-w-7xl w-full mx-auto text-center py-6 text-xs text-slate-400 font-mono flex items-center justify-between border-t border-slate-200/50 mt-12">
        <span>Stool & Appliance Diary • Personal Health Tracker</span>
        <span>Build status: Active Web Application 🟢</span>
      </footer>
    </div>
  );
}

