#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::process::Command;
use tauri::{Manager, Window};
use chrono::{Duration, Local};
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration as StdDuration;

// 保存关机任务的状态
struct ShutdownState {
    active: bool,
    remaining_seconds: i64,
}

// 创建一个自定义命令来执行关机操作
#[tauri::command]
fn shutdown(delay_minutes: i32) -> Result<String, String> {
    let result = Command::new("cmd")
        .args(&["/C", &format!("shutdown /s /t {}", delay_minutes * 60)])
        .output();

    match result {
        Ok(_) => Ok(format!("计划在{}分钟后关机", delay_minutes)),
        Err(e) => Err(format!("关机命令执行失败: {}", e)),
    }
}

// 取消关机命令
#[tauri::command]
fn cancel_shutdown() -> Result<String, String> {
    let result = Command::new("cmd")
        .args(&["/C", "shutdown /a"])
        .output();

    match result {
        Ok(_) => Ok("关机计划已取消".to_string()),
        Err(e) => Err(format!("取消关机命令失败: {}", e)),
    }
}

// 获取系统时间
#[tauri::command]
fn get_system_time() -> String {
    Local::now().format("%Y-%m-%d %H:%M:%S").to_string()
}

// 启动倒计时
#[tauri::command]
fn start_countdown(window: Window, minutes: i32) -> Result<(), String> {
    let seconds = minutes * 60;
    let shutdown_state = Arc::new(Mutex::new(ShutdownState {
        active: true,
        remaining_seconds: seconds as i64,
    }));
    
    let shutdown_state_clone = shutdown_state.clone();
    let window_clone = window.clone();
    
    // 启动倒计时线程
    thread::spawn(move || {
        let end_time = Local::now() + Duration::seconds(seconds as i64);
        
        while Local::now() < end_time {
            {
                let mut state = shutdown_state_clone.lock().unwrap();
                if !state.active {
                    break;
                }
                
                state.remaining_seconds = (end_time - Local::now()).num_seconds();
                if state.remaining_seconds < 0 {
                    state.remaining_seconds = 0;
                }
                
                // 发送倒计时更新到前端
                let _ = window_clone.emit("countdown-update", state.remaining_seconds);
            }
            
            thread::sleep(StdDuration::from_secs(1));
        }
    });
    
    Ok(())
}

// 停止倒计时
#[tauri::command]
fn stop_countdown(state: tauri::State<Arc<Mutex<ShutdownState>>>) -> Result<(), String> {
    let mut shutdown_state = state.lock().unwrap();
    shutdown_state.active = false;
    Ok(())
}

fn main() {
    let shutdown_state = Arc::new(Mutex::new(ShutdownState {
        active: false,
        remaining_seconds: 0,
    }));

    tauri::Builder::default()
        .manage(shutdown_state)
        .invoke_handler(tauri::generate_handler![
            shutdown,
            cancel_shutdown,
            get_system_time,
            start_countdown,
            stop_countdown
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
} 