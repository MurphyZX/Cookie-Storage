document.addEventListener('DOMContentLoaded', function() {
  // 标签页切换功能
  const tabs = document.querySelectorAll('.tablinks');
  tabs.forEach(tab => {
    tab.addEventListener('click', function(e) {
      // 隐藏所有标签内容
      const tabcontents = document.querySelectorAll('.tabcontent');
      tabcontents.forEach(content => {
        content.style.display = 'none';
      });
      
      // 移除所有标签的active类
      tabs.forEach(t => {
        t.classList.remove('active');
      });
      
      // 显示当前标签内容并添加active类
      let tabName = '';
      if (e.target.id === 'cookieTab') {
        tabName = 'Cookie';
      } else if (e.target.id === 'localStorageTab') {
        tabName = 'LocalStorage';
      } else if (e.target.id === 'sessionStorageTab') {
        tabName = 'SessionStorage';
      }
      
      document.getElementById(tabName).style.display = 'block';
      e.target.classList.add('active');
    });
  });
  
  // 获取Cookie按钮
  document.getElementById('getCookies').addEventListener('click', function() {
    // 获取当前选项卡信息
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      const currentUrl = new URL(tabs[0].url);
      
      // 获取当前域名的cookies
      chrome.cookies.getAll({domain: currentUrl.hostname}, function(cookies) {
        if (cookies.length === 0) {
          document.getElementById('cookieOutput').value = '未找到任何Cookie';
          return;
        }
        
        let cookieText = '';
        cookies.forEach(cookie => {
          cookieText += `${cookie.name}=${cookie.value}\n`;
        });
        
        // 同时以JSON格式提供
        cookieText += '\n\nJSON格式:\n';
        cookieText += JSON.stringify(cookies, null, 2);
        
        document.getElementById('cookieOutput').value = cookieText;
      });
    });
  });
  
  // 获取Local Storage按钮
  document.getElementById('getLocalStorage').addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      // 注入脚本获取Local Storage
      chrome.scripting.executeScript({
        target: {tabId: tabs[0].id},
        function: () => {
          const items = {};
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            items[key] = localStorage.getItem(key);
          }
          return items;
        }
      }, (results) => {
        if (chrome.runtime.lastError) {
          document.getElementById('localStorageOutput').value = '无法访问Local Storage：' + chrome.runtime.lastError.message;
          return;
        }
        
        if (!results || results.length === 0 || !results[0].result) {
          document.getElementById('localStorageOutput').value = '未找到Local Storage数据';
          return;
        }
        
        const storageData = results[0].result;
        document.getElementById('localStorageOutput').value = JSON.stringify(storageData, null, 2);
      });
    });
  });
  
  // 获取Session Storage按钮
  document.getElementById('getSessionStorage').addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      // 注入脚本获取Session Storage
      chrome.scripting.executeScript({
        target: {tabId: tabs[0].id},
        function: () => {
          const items = {};
          for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            items[key] = sessionStorage.getItem(key);
          }
          return items;
        }
      }, (results) => {
        if (chrome.runtime.lastError) {
          document.getElementById('sessionStorageOutput').value = '无法访问Session Storage：' + chrome.runtime.lastError.message;
          return;
        }
        
        if (!results || results.length === 0 || !results[0].result) {
          document.getElementById('sessionStorageOutput').value = '未找到Session Storage数据';
          return;
        }
        
        const storageData = results[0].result;
        document.getElementById('sessionStorageOutput').value = JSON.stringify(storageData, null, 2);
      });
    });
  });
  
  // 复制到剪贴板功能
  document.getElementById('copyCookies').addEventListener('click', function() {
    const text = document.getElementById('cookieOutput').value;
    copyToClipboard(text);
  });
  
  document.getElementById('copyLocalStorage').addEventListener('click', function() {
    const text = document.getElementById('localStorageOutput').value;
    copyToClipboard(text);
  });
  
  document.getElementById('copySessionStorage').addEventListener('click', function() {
    const text = document.getElementById('sessionStorageOutput').value;
    copyToClipboard(text);
  });
  
  function copyToClipboard(text) {
    if (!text) return;
    
    navigator.clipboard.writeText(text)
      .then(() => {
        // 提示复制成功
        const originalText = event.target.textContent;
        event.target.textContent = '已复制！';
        setTimeout(() => {
          event.target.textContent = originalText;
        }, 1500);
      })
      .catch(err => {
        console.error('复制失败:', err);
      });
  }
}); 