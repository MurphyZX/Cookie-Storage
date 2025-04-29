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
  
  // 视图切换功能
  document.getElementById('cookieListView').addEventListener('change', function() {
    toggleCookieView('list');
  });
  
  document.getElementById('cookieRawView').addEventListener('change', function() {
    toggleCookieView('raw');
  });
  
  document.getElementById('localListView').addEventListener('change', function() {
    toggleLocalStorageView('list');
  });
  
  document.getElementById('localRawView').addEventListener('change', function() {
    toggleLocalStorageView('raw');
  });
  
  document.getElementById('sessionListView').addEventListener('change', function() {
    toggleSessionStorageView('list');
  });
  
  document.getElementById('sessionRawView').addEventListener('change', function() {
    toggleSessionStorageView('raw');
  });
  
  function toggleCookieView(view) {
    if (view === 'list') {
      document.getElementById('cookieListContainer').style.display = 'block';
      document.getElementById('cookieOutput').style.display = 'none';
    } else {
      document.getElementById('cookieListContainer').style.display = 'none';
      document.getElementById('cookieOutput').style.display = 'block';
    }
  }
  
  function toggleLocalStorageView(view) {
    if (view === 'list') {
      document.getElementById('localStorageListContainer').style.display = 'block';
      document.getElementById('localStorageOutput').style.display = 'none';
    } else {
      document.getElementById('localStorageListContainer').style.display = 'none';
      document.getElementById('localStorageOutput').style.display = 'block';
    }
  }
  
  function toggleSessionStorageView(view) {
    if (view === 'list') {
      document.getElementById('sessionStorageListContainer').style.display = 'block';
      document.getElementById('sessionStorageOutput').style.display = 'none';
    } else {
      document.getElementById('sessionStorageListContainer').style.display = 'none';
      document.getElementById('sessionStorageOutput').style.display = 'block';
    }
  }
  
  // 初始化视图设置
  toggleCookieView('list');
  toggleLocalStorageView('list');
  toggleSessionStorageView('list');
  
  // 截断长文本
  function truncateText(text, maxLength = 100) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
  
  // 获取Cookie按钮
  document.getElementById('getCookies').addEventListener('click', function() {
    // 获取当前选项卡信息
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      const currentUrl = new URL(tabs[0].url);
      
      // 获取当前域名的cookies
      chrome.cookies.getAll({domain: currentUrl.hostname}, function(cookies) {
        if (cookies.length === 0) {
          document.getElementById('cookieOutput').value = '未找到任何Cookie';
          document.getElementById('cookieListContainer').innerHTML = '未找到任何Cookie';
          return;
        }
        
        let cookieText = '';
        cookies.forEach(cookie => {
          cookieText += `${cookie.name}=${cookie.value}\n`;
        });
        
        // 同时以JSON格式提供
        cookieText += '\n\nJSON格式:\n';
        cookieText += JSON.stringify(cookies, null, 2);
        
        // 更新原始文本区域
        document.getElementById('cookieOutput').value = cookieText;
        
        // 更新列表视图
        const listContainer = document.getElementById('cookieListContainer');
        listContainer.innerHTML = ''; // 清空容器
        
        // 添加名称=值形式的项目
        cookies.forEach(cookie => {
          const item = document.createElement('div');
          item.className = 'data-item';
          
          const content = document.createElement('div');
          content.className = 'data-content';
          
          const keySpan = document.createElement('span');
          keySpan.className = 'data-key';
          keySpan.textContent = cookie.name;
          
          const valueContainer = document.createElement('div');
          valueContainer.className = 'value-container';
          
          const valueSpan = document.createElement('span');
          valueSpan.className = 'data-value';
          
          const truncatedValue = truncateText(cookie.value, 50);
          valueSpan.textContent = ' = ' + truncatedValue;
          valueSpan.title = cookie.value;
          
          // 切换展开/收起的状态标志
          let isExpanded = false;
          
          // 添加可点击切换展开/收起的功能
          if (truncatedValue !== cookie.value) {
            valueContainer.classList.add('expandable');
            // 添加提示图标
            const expandIndicator = document.createElement('span');
            expandIndicator.className = 'expand-indicator';
            expandIndicator.innerHTML = ' 👉';
            expandIndicator.title = '点击展开/收起';
            valueSpan.appendChild(expandIndicator);
            
            valueContainer.addEventListener('click', function(e) {
              // 防止点击复制按钮时触发展开/收起
              if (e.target.classList.contains('copy-btn')) return;
              
              isExpanded = !isExpanded;
              if (isExpanded) {
                valueSpan.textContent = ' = ' + cookie.value;
                const collapseIndicator = document.createElement('span');
                collapseIndicator.className = 'expand-indicator';
                collapseIndicator.innerHTML = ' 👆';
                collapseIndicator.title = '点击收起';
                valueSpan.appendChild(collapseIndicator);
              } else {
                valueSpan.textContent = ' = ' + truncatedValue;
                const expandIndicator = document.createElement('span');
                expandIndicator.className = 'expand-indicator';
                expandIndicator.innerHTML = ' 👉';
                expandIndicator.title = '点击展开';
                valueSpan.appendChild(expandIndicator);
              }
            });
          }
          
          valueContainer.appendChild(valueSpan);
          content.appendChild(keySpan);
          content.appendChild(valueContainer);
          
          const copyButton = document.createElement('button');
          copyButton.className = 'copy-btn';
          copyButton.textContent = '复制';
          copyButton.addEventListener('click', function() {
            copyToClipboard(`${cookie.name}=${cookie.value}`);
            
            // 提示复制成功
            const originalText = copyButton.textContent;
            copyButton.textContent = '已复制！';
            setTimeout(() => {
              copyButton.textContent = originalText;
            }, 1500);
          });
          
          item.appendChild(content);
          item.appendChild(copyButton);
          listContainer.appendChild(item);
        });
        
        // 添加JSON格式的复制选项
        const jsonItem = document.createElement('div');
        jsonItem.className = 'data-item';
        
        const jsonContent = document.createElement('div');
        jsonContent.className = 'data-content';
        jsonContent.innerHTML = '<span class="data-key">完整JSON数据</span>';
        
        const jsonCopyButton = document.createElement('button');
        jsonCopyButton.className = 'copy-btn';
        jsonCopyButton.textContent = '复制JSON';
        jsonCopyButton.addEventListener('click', function() {
          copyToClipboard(JSON.stringify(cookies, null, 2));
          
          // 提示复制成功
          const originalText = jsonCopyButton.textContent;
          jsonCopyButton.textContent = '已复制！';
          setTimeout(() => {
            jsonCopyButton.textContent = originalText;
          }, 1500);
        });
        
        jsonItem.appendChild(jsonContent);
        jsonItem.appendChild(jsonCopyButton);
        listContainer.appendChild(jsonItem);
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
          document.getElementById('localStorageListContainer').innerHTML = '无法访问Local Storage：' + chrome.runtime.lastError.message;
          return;
        }
        
        if (!results || results.length === 0 || !results[0].result) {
          document.getElementById('localStorageOutput').value = '未找到Local Storage数据';
          document.getElementById('localStorageListContainer').innerHTML = '未找到Local Storage数据';
          return;
        }
        
        const storageData = results[0].result;
        
        // 更新原始文本区域
        document.getElementById('localStorageOutput').value = JSON.stringify(storageData, null, 2);
        
        // 更新列表视图
        const listContainer = document.getElementById('localStorageListContainer');
        listContainer.innerHTML = ''; // 清空容器
        
        // 添加每个键值对到列表
        Object.entries(storageData).forEach(([key, value]) => {
          const item = document.createElement('div');
          item.className = 'data-item';
          
          const content = document.createElement('div');
          content.className = 'data-content';
          
          const keySpan = document.createElement('span');
          keySpan.className = 'data-key';
          
          const truncatedKey = truncateText(key, 30);
          keySpan.textContent = truncatedKey;
          keySpan.title = key;
          
          const valueContainer = document.createElement('div');
          valueContainer.className = 'value-container';
          
          const valueSpan = document.createElement('span');
          valueSpan.className = 'data-value';
          
          const truncatedValue = truncateText(value, 50);
          valueSpan.textContent = ' = ' + truncatedValue;
          valueSpan.title = value;
          
          // 切换展开/收起的状态标志
          let isExpanded = false;
          let isKeyExpanded = false;
          
          // 为键添加可展开/收起功能
          if (truncatedKey !== key) {
            keySpan.classList.add('expandable');
            // 添加提示图标
            const expandIndicator = document.createElement('span');
            expandIndicator.className = 'expand-indicator';
            expandIndicator.innerHTML = ' 👉';
            expandIndicator.title = '点击展开/收起';
            keySpan.appendChild(expandIndicator);
            
            keySpan.addEventListener('click', function() {
              isKeyExpanded = !isKeyExpanded;
              if (isKeyExpanded) {
                keySpan.textContent = key;
                const collapseIndicator = document.createElement('span');
                collapseIndicator.className = 'expand-indicator';
                collapseIndicator.innerHTML = ' 👆';
                collapseIndicator.title = '点击收起';
                keySpan.appendChild(collapseIndicator);
              } else {
                keySpan.textContent = truncatedKey;
                const expandIndicator = document.createElement('span');
                expandIndicator.className = 'expand-indicator';
                expandIndicator.innerHTML = ' 👉';
                expandIndicator.title = '点击展开';
                keySpan.appendChild(expandIndicator);
              }
            });
          }
          
          // 为值添加可展开/收起功能
          if (truncatedValue !== value) {
            valueContainer.classList.add('expandable');
            // 添加提示图标
            const expandIndicator = document.createElement('span');
            expandIndicator.className = 'expand-indicator';
            expandIndicator.innerHTML = ' 👉';
            expandIndicator.title = '点击展开/收起';
            valueSpan.appendChild(expandIndicator);
            
            valueContainer.addEventListener('click', function(e) {
              // 防止点击复制按钮时触发展开/收起
              if (e.target.classList.contains('copy-btn')) return;
              
              isExpanded = !isExpanded;
              if (isExpanded) {
                valueSpan.textContent = ' = ' + value;
                const collapseIndicator = document.createElement('span');
                collapseIndicator.className = 'expand-indicator';
                collapseIndicator.innerHTML = ' 👆';
                collapseIndicator.title = '点击收起';
                valueSpan.appendChild(collapseIndicator);
              } else {
                valueSpan.textContent = ' = ' + truncatedValue;
                const expandIndicator = document.createElement('span');
                expandIndicator.className = 'expand-indicator';
                expandIndicator.innerHTML = ' 👉';
                expandIndicator.title = '点击展开';
                valueSpan.appendChild(expandIndicator);
              }
            });
          }
          
          valueContainer.appendChild(valueSpan);
          content.appendChild(keySpan);
          content.appendChild(valueContainer);
          
          const copyKeyButton = document.createElement('button');
          copyKeyButton.className = 'copy-btn';
          copyKeyButton.textContent = '复制键';
          copyKeyButton.addEventListener('click', function() {
            copyToClipboard(key);
            
            const originalText = copyKeyButton.textContent;
            copyKeyButton.textContent = '已复制！';
            setTimeout(() => {
              copyKeyButton.textContent = originalText;
            }, 1500);
          });
          
          const copyValueButton = document.createElement('button');
          copyValueButton.className = 'copy-btn';
          copyValueButton.textContent = '复制值';
          copyValueButton.addEventListener('click', function() {
            copyToClipboard(value);
            
            const originalText = copyValueButton.textContent;
            copyValueButton.textContent = '已复制！';
            setTimeout(() => {
              copyValueButton.textContent = originalText;
            }, 1500);
          });
          
          const copyPairButton = document.createElement('button');
          copyPairButton.className = 'copy-btn';
          copyPairButton.textContent = '复制键值';
          copyPairButton.addEventListener('click', function() {
            copyToClipboard(`${key}=${value}`);
            
            const originalText = copyPairButton.textContent;
            copyPairButton.textContent = '已复制！';
            setTimeout(() => {
              copyPairButton.textContent = originalText;
            }, 1500);
          });
          
          item.appendChild(content);
          item.appendChild(copyKeyButton);
          item.appendChild(copyValueButton);
          item.appendChild(copyPairButton);
          listContainer.appendChild(item);
        });
        
        // 添加JSON格式的复制选项
        const jsonItem = document.createElement('div');
        jsonItem.className = 'data-item';
        
        const jsonContent = document.createElement('div');
        jsonContent.className = 'data-content';
        jsonContent.innerHTML = '<span class="data-key">完整JSON数据</span>';
        
        const jsonCopyButton = document.createElement('button');
        jsonCopyButton.className = 'copy-btn';
        jsonCopyButton.textContent = '复制JSON';
        jsonCopyButton.addEventListener('click', function() {
          copyToClipboard(JSON.stringify(storageData, null, 2));
          
          const originalText = jsonCopyButton.textContent;
          jsonCopyButton.textContent = '已复制！';
          setTimeout(() => {
            jsonCopyButton.textContent = originalText;
          }, 1500);
        });
        
        jsonItem.appendChild(jsonContent);
        jsonItem.appendChild(jsonCopyButton);
        listContainer.appendChild(jsonItem);
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
          document.getElementById('sessionStorageListContainer').innerHTML = '无法访问Session Storage：' + chrome.runtime.lastError.message;
          return;
        }
        
        if (!results || results.length === 0 || !results[0].result) {
          document.getElementById('sessionStorageOutput').value = '未找到Session Storage数据';
          document.getElementById('sessionStorageListContainer').innerHTML = '未找到Session Storage数据';
          return;
        }
        
        const storageData = results[0].result;
        
        // 更新原始文本区域
        document.getElementById('sessionStorageOutput').value = JSON.stringify(storageData, null, 2);
        
        // 更新列表视图
        const listContainer = document.getElementById('sessionStorageListContainer');
        listContainer.innerHTML = ''; // 清空容器
        
        // 添加每个键值对到列表
        Object.entries(storageData).forEach(([key, value]) => {
          const item = document.createElement('div');
          item.className = 'data-item';
          
          const content = document.createElement('div');
          content.className = 'data-content';
          
          const keySpan = document.createElement('span');
          keySpan.className = 'data-key';
          
          const truncatedKey = truncateText(key, 30);
          keySpan.textContent = truncatedKey;
          keySpan.title = key;
          
          const valueContainer = document.createElement('div');
          valueContainer.className = 'value-container';
          
          const valueSpan = document.createElement('span');
          valueSpan.className = 'data-value';
          
          const truncatedValue = truncateText(value, 50);
          valueSpan.textContent = ' = ' + truncatedValue;
          valueSpan.title = value;
          
          // 切换展开/收起的状态标志
          let isExpanded = false;
          let isKeyExpanded = false;
          
          // 为键添加可展开/收起功能
          if (truncatedKey !== key) {
            keySpan.classList.add('expandable');
            // 添加提示图标
            const expandIndicator = document.createElement('span');
            expandIndicator.className = 'expand-indicator';
            expandIndicator.innerHTML = ' 👉';
            expandIndicator.title = '点击展开/收起';
            keySpan.appendChild(expandIndicator);
            
            keySpan.addEventListener('click', function() {
              isKeyExpanded = !isKeyExpanded;
              if (isKeyExpanded) {
                keySpan.textContent = key;
                const collapseIndicator = document.createElement('span');
                collapseIndicator.className = 'expand-indicator';
                collapseIndicator.innerHTML = ' 👆';
                collapseIndicator.title = '点击收起';
                keySpan.appendChild(collapseIndicator);
              } else {
                keySpan.textContent = truncatedKey;
                const expandIndicator = document.createElement('span');
                expandIndicator.className = 'expand-indicator';
                expandIndicator.innerHTML = ' 👉';
                expandIndicator.title = '点击展开';
                keySpan.appendChild(expandIndicator);
              }
            });
          }
          
          // 为值添加可展开/收起功能
          if (truncatedValue !== value) {
            valueContainer.classList.add('expandable');
            // 添加提示图标
            const expandIndicator = document.createElement('span');
            expandIndicator.className = 'expand-indicator';
            expandIndicator.innerHTML = ' 👉';
            expandIndicator.title = '点击展开/收起';
            valueSpan.appendChild(expandIndicator);
            
            valueContainer.addEventListener('click', function(e) {
              // 防止点击复制按钮时触发展开/收起
              if (e.target.classList.contains('copy-btn')) return;
              
              isExpanded = !isExpanded;
              if (isExpanded) {
                valueSpan.textContent = ' = ' + value;
                const collapseIndicator = document.createElement('span');
                collapseIndicator.className = 'expand-indicator';
                collapseIndicator.innerHTML = ' 👆';
                collapseIndicator.title = '点击收起';
                valueSpan.appendChild(collapseIndicator);
              } else {
                valueSpan.textContent = ' = ' + truncatedValue;
                const expandIndicator = document.createElement('span');
                expandIndicator.className = 'expand-indicator';
                expandIndicator.innerHTML = ' 👉';
                expandIndicator.title = '点击展开';
                valueSpan.appendChild(expandIndicator);
              }
            });
          }
          
          valueContainer.appendChild(valueSpan);
          content.appendChild(keySpan);
          content.appendChild(valueContainer);
          
          const copyKeyButton = document.createElement('button');
          copyKeyButton.className = 'copy-btn';
          copyKeyButton.textContent = '复制键';
          copyKeyButton.addEventListener('click', function() {
            copyToClipboard(key);
            
            const originalText = copyKeyButton.textContent;
            copyKeyButton.textContent = '已复制！';
            setTimeout(() => {
              copyKeyButton.textContent = originalText;
            }, 1500);
          });
          
          const copyValueButton = document.createElement('button');
          copyValueButton.className = 'copy-btn';
          copyValueButton.textContent = '复制值';
          copyValueButton.addEventListener('click', function() {
            copyToClipboard(value);
            
            const originalText = copyValueButton.textContent;
            copyValueButton.textContent = '已复制！';
            setTimeout(() => {
              copyValueButton.textContent = originalText;
            }, 1500);
          });
          
          const copyPairButton = document.createElement('button');
          copyPairButton.className = 'copy-btn';
          copyPairButton.textContent = '复制键值';
          copyPairButton.addEventListener('click', function() {
            copyToClipboard(`${key}=${value}`);
            
            const originalText = copyPairButton.textContent;
            copyPairButton.textContent = '已复制！';
            setTimeout(() => {
              copyPairButton.textContent = originalText;
            }, 1500);
          });
          
          item.appendChild(content);
          item.appendChild(copyKeyButton);
          item.appendChild(copyValueButton);
          item.appendChild(copyPairButton);
          listContainer.appendChild(item);
        });
        
        // 添加JSON格式的复制选项
        const jsonItem = document.createElement('div');
        jsonItem.className = 'data-item';
        
        const jsonContent = document.createElement('div');
        jsonContent.className = 'data-content';
        jsonContent.innerHTML = '<span class="data-key">完整JSON数据</span>';
        
        const jsonCopyButton = document.createElement('button');
        jsonCopyButton.className = 'copy-btn';
        jsonCopyButton.textContent = '复制JSON';
        jsonCopyButton.addEventListener('click', function() {
          copyToClipboard(JSON.stringify(storageData, null, 2));
          
          const originalText = jsonCopyButton.textContent;
          jsonCopyButton.textContent = '已复制！';
          setTimeout(() => {
            jsonCopyButton.textContent = originalText;
          }, 1500);
        });
        
        jsonItem.appendChild(jsonContent);
        jsonItem.appendChild(jsonCopyButton);
        listContainer.appendChild(jsonItem);
      });
    });
  });
  
  // 复制到剪贴板功能
  document.getElementById('copyCookies').addEventListener('click', function() {
    const text = document.getElementById('cookieOutput').value;
    copyToClipboard(text);
    
    // 提示复制成功
    const originalText = event.target.textContent;
    event.target.textContent = '已复制！';
    setTimeout(() => {
      event.target.textContent = originalText;
    }, 1500);
  });
  
  document.getElementById('copyLocalStorage').addEventListener('click', function() {
    const text = document.getElementById('localStorageOutput').value;
    copyToClipboard(text);
    
    // 提示复制成功
    const originalText = event.target.textContent;
    event.target.textContent = '已复制！';
    setTimeout(() => {
      event.target.textContent = originalText;
    }, 1500);
  });
  
  document.getElementById('copySessionStorage').addEventListener('click', function() {
    const text = document.getElementById('sessionStorageOutput').value;
    copyToClipboard(text);
    
    // 提示复制成功
    const originalText = event.target.textContent;
    event.target.textContent = '已复制！';
    setTimeout(() => {
      event.target.textContent = originalText;
    }, 1500);
  });
  
  function copyToClipboard(text) {
    if (!text) return;
    
    navigator.clipboard.writeText(text)
      .then(() => {
        console.log('内容已复制到剪贴板');
      })
      .catch(err => {
        console.error('复制失败:', err);
      });
  }
}); 