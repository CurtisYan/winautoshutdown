import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { listen } from "@tauri-apps/api/event";
import { motion, AnimatePresence } from "framer-motion";
import { FiPower, FiClock, FiX, FiSettings, FiInfo } from "react-icons/fi";

// 定义关机模式类型
type ShutdownMode = "timer" | "scheduled";

// 格式化时间函数
const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

function App() {
  // 状态管理
  const [currentTime, setCurrentTime] = useState<string>("");
  const [shutdownMode, setShutdownMode] = useState<ShutdownMode>("timer");
  const [timerMinutes, setTimerMinutes] = useState<number>(30);
  const [scheduledTime, setScheduledTime] = useState<string>("23:00");
  const [isCountdownActive, setIsCountdownActive] = useState<boolean>(false);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);
  
  // 获取系统时间
  useEffect(() => {
    const updateTime = async () => {
      try {
        const time = await invoke<string>("get_system_time");
        setCurrentTime(time);
      } catch (error) {
        console.error("获取系统时间失败:", error);
      }
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // 监听倒计时更新
  useEffect(() => {
    const unsubscribe = listen<number>("countdown-update", (event) => {
      setRemainingTime(event.payload);
    });
    
    return () => {
      unsubscribe.then(fn => fn());
    };
  }, []);
  
  // 执行关机
  const handleShutdown = async () => {
    try {
      if (shutdownMode === "timer") {
        // 定时关机
        const message = await invoke<string>("shutdown", { delayMinutes: timerMinutes });
        await invoke("start_countdown", { minutes: timerMinutes });
        setIsCountdownActive(true);
        setRemainingTime(timerMinutes * 60);
        showNotification(message);
      } else {
        // 定点关机
        const [hours, minutes] = scheduledTime.split(":").map(Number);
        const now = new Date();
        const scheduledDate = new Date();
        scheduledDate.setHours(hours, minutes, 0);
        
        // 如果设定时间已过，则设置为明天
        if (scheduledDate <= now) {
          scheduledDate.setDate(scheduledDate.getDate() + 1);
        }
        
        const diffMs = scheduledDate.getTime() - now.getTime();
        const diffMinutes = Math.floor(diffMs / 60000);
        
        const message = await invoke<string>("shutdown", { delayMinutes: diffMinutes });
        await invoke("start_countdown", { minutes: diffMinutes });
        setIsCountdownActive(true);
        setRemainingTime(diffMinutes * 60);
        showNotification(message);
      }
    } catch (error) {
      showNotification(`执行失败: ${error}`);
    }
  };
  
  // 取消关机
  const handleCancelShutdown = async () => {
    try {
      const message = await invoke<string>("cancel_shutdown");
      await invoke("stop_countdown");
      setIsCountdownActive(false);
      setRemainingTime(0);
      showNotification(message);
    } catch (error) {
      showNotification(`取消失败: ${error}`);
    }
  };
  
  // 显示通知
  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* 顶部时间显示 */}
      <div className="absolute top-4 left-4 text-gray-400 flex items-center">
        <FiClock className="mr-2" />
        <span>{currentTime}</span>
      </div>
      
      {/* 设置按钮 */}
      <button 
        onClick={() => setShowSettings(!showSettings)}
        className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-800 transition-colors"
      >
        <FiSettings size={20} />
      </button>
      
      {/* 主卡片 */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card w-full max-w-md"
      >
        <h1 className="text-2xl font-bold text-center mb-6 flex items-center justify-center">
          <FiPower className="mr-2 text-primary-500" />
          Windows 自动关机
        </h1>
        
        {/* 模式选择 */}
        <div className="flex mb-6 bg-gray-700/50 rounded-lg p-1">
          <button
            onClick={() => setShutdownMode("timer")}
            className={`flex-1 py-2 rounded-md transition-colors ${
              shutdownMode === "timer" 
                ? "bg-primary-600 text-white" 
                : "text-gray-300 hover:bg-gray-700"
            }`}
          >
            定时关机
          </button>
          <button
            onClick={() => setShutdownMode("scheduled")}
            className={`flex-1 py-2 rounded-md transition-colors ${
              shutdownMode === "scheduled" 
                ? "bg-primary-600 text-white" 
                : "text-gray-300 hover:bg-gray-700"
            }`}
          >
            定点关机
          </button>
        </div>
        
        {/* 定时关机设置 */}
        {shutdownMode === "timer" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <label className="block text-gray-300 mb-2">关机倒计时 (分钟)</label>
            <div className="flex items-center">
              <input
                type="range"
                min="1"
                max="180"
                value={timerMinutes}
                onChange={(e) => setTimerMinutes(parseInt(e.target.value))}
                disabled={isCountdownActive}
                className="flex-1 mr-4"
              />
              <input
                type="number"
                min="1"
                max="180"
                value={timerMinutes}
                onChange={(e) => setTimerMinutes(parseInt(e.target.value))}
                disabled={isCountdownActive}
                className="input w-20 text-center"
              />
            </div>
          </motion.div>
        )}
        
        {/* 定点关机设置 */}
        {shutdownMode === "scheduled" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <label className="block text-gray-300 mb-2">关机时间</label>
            <input
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              disabled={isCountdownActive}
              className="input w-full"
            />
          </motion.div>
        )}
        
        {/* 倒计时显示 */}
        {isCountdownActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 text-center"
          >
            <p className="text-gray-300 mb-2">剩余时间</p>
            <div className="text-4xl font-mono font-bold text-primary-400 animate-pulse-slow">
              {formatTime(remainingTime)}
            </div>
          </motion.div>
        )}
        
        {/* 操作按钮 */}
        <div className="flex gap-4">
          {!isCountdownActive ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShutdown}
              className="btn-primary flex-1 flex items-center justify-center"
            >
              <FiPower className="mr-2" />
              开始计划
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCancelShutdown}
              className="btn-danger flex-1 flex items-center justify-center"
            >
              <FiX className="mr-2" />
              取消关机
            </motion.button>
          )}
        </div>
      </motion.div>
      
      {/* 设置面板 */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="glass-card w-full max-w-md mt-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">设置</h2>
              <button 
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-white"
              >
                <FiX size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">关机前提醒 (秒)</label>
                <input type="number" min="0" max="60" defaultValue="30" className="input w-full" />
              </div>
              
              <div className="flex items-center">
                <input type="checkbox" id="autostart" className="mr-2" />
                <label htmlFor="autostart" className="text-gray-300">开机自启动</label>
              </div>
              
              <div className="flex items-center">
                <input type="checkbox" id="minimize" className="mr-2" />
                <label htmlFor="minimize" className="text-gray-300">关闭时最小化到托盘</label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 底部信息 */}
      <div className="mt-8 text-gray-500 text-sm flex items-center">
        <FiInfo className="mr-1" />
        <span>WinAutoShutdown v0.1.0</span>
      </div>
      
      {/* 通知 */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 inset-x-0 mx-auto w-auto max-w-md bg-gray-800 border border-primary-600 text-white px-4 py-2 rounded-lg shadow-glow text-center"
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App; 